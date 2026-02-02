/**
 * Meta Graph API Client for Product Catalog Management
 * 
 * Handles all interactions with Meta Commerce Manager's Product Catalog API
 * - Product upsert/delete operations
 * - Batch operations with rate limiting
 * - Retry logic with exponential backoff
 */

import type { MetaCatalogProduct } from '../../shared/meta-catalog-schema';

// Meta API Configuration
const META_API_VERSION = 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 60000;
const RATE_LIMIT_CALLS_PER_HOUR = 200;

// Error codes that warrant retry
const RETRYABLE_ERROR_CODES = [
    1, // Unknown error
    2, // Service temporarily unavailable
    4, // Application rate limit hit
    17, // User rate limit hit
    341, // Temporary issue - try again
    368, // Spam prevention
];

interface MetaApiConfig {
    accessToken: string;
    catalogId: string;
    businessId: string;
}

interface MetaApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        type: string;
        code: number;
        fbtrace_id?: string;
    };
}

interface BatchRequestItem {
    method: 'CREATE' | 'UPDATE' | 'DELETE';
    retailer_id: string;
    data?: Partial<MetaCatalogProduct>;
}

interface BatchResponse {
    handles: string[];
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = Math.min(
        BASE_DELAY_MS * Math.pow(2, attempt),
        MAX_DELAY_MS
    );
    // Add jitter (±25%)
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Meta Catalog API Client
 */
export class MetaCatalogClient {
    private config: MetaApiConfig;
    private rateLimitRemaining: number = RATE_LIMIT_CALLS_PER_HOUR;
    private rateLimitResetAt: number = Date.now() + 3600000;

    constructor(config?: Partial<MetaApiConfig>) {
        this.config = {
            accessToken: config?.accessToken || process.env.META_ACCESS_TOKEN || '',
            catalogId: config?.catalogId || process.env.META_CATALOG_ID || '',
            businessId: config?.businessId || process.env.META_BUSINESS_ID || '',
        };
    }

    /**
     * Validate that configuration is complete
     */
    validateConfig(): { valid: boolean; missing: string[] } {
        const missing: string[] = [];
        if (!this.config.accessToken) missing.push('META_ACCESS_TOKEN');
        if (!this.config.catalogId) missing.push('META_CATALOG_ID');
        if (!this.config.businessId) missing.push('META_BUSINESS_ID');
        return { valid: missing.length === 0, missing };
    }

    /**
     * Make a request to Meta Graph API with retry logic
     */
    private async request<T = unknown>(
        endpoint: string,
        method: 'GET' | 'POST' | 'DELETE' = 'GET',
        body?: object,
        attempt: number = 0
    ): Promise<MetaApiResponse<T>> {
        // Check rate limit
        if (this.rateLimitRemaining <= 0 && Date.now() < this.rateLimitResetAt) {
            const waitTime = this.rateLimitResetAt - Date.now();
            console.log(`[MetaAPI] Rate limit reached, waiting ${waitTime}ms`);
            await sleep(waitTime);
            this.rateLimitRemaining = RATE_LIMIT_CALLS_PER_HOUR;
            this.rateLimitResetAt = Date.now() + 3600000;
        }

        const url = endpoint.startsWith('http')
            ? endpoint
            : `${META_API_BASE}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`,
        };

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            // Update rate limit info from headers
            const rateLimitHeader = response.headers.get('x-business-use-case-usage');
            if (rateLimitHeader) {
                try {
                    const usage = JSON.parse(rateLimitHeader);
                    // Meta returns usage per business case, extract if available
                    if (usage[this.config.businessId]) {
                        const callCount = usage[this.config.businessId][0]?.call_count || 0;
                        this.rateLimitRemaining = Math.max(0, RATE_LIMIT_CALLS_PER_HOUR - callCount);
                    }
                } catch {
                    // Ignore parsing errors
                }
            }

            this.rateLimitRemaining--;

            const data = await response.json();

            if (!response.ok) {
                const errorCode = data?.error?.code;

                // Check if error is retryable
                if (RETRYABLE_ERROR_CODES.includes(errorCode) && attempt < MAX_RETRIES) {
                    const delay = calculateBackoffDelay(attempt);
                    console.log(`[MetaAPI] Retryable error ${errorCode}, attempt ${attempt + 1}/${MAX_RETRIES}, waiting ${delay}ms`);
                    await sleep(delay);
                    return this.request<T>(endpoint, method, body, attempt + 1);
                }

                return {
                    success: false,
                    error: data.error || { message: 'Unknown error', type: 'UnknownError', code: -1 },
                };
            }

            return { success: true, data };

        } catch (error) {
            // Network errors are retryable
            if (attempt < MAX_RETRIES) {
                const delay = calculateBackoffDelay(attempt);
                console.log(`[MetaAPI] Network error, attempt ${attempt + 1}/${MAX_RETRIES}, waiting ${delay}ms`);
                await sleep(delay);
                return this.request<T>(endpoint, method, body, attempt + 1);
            }

            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Network error',
                    type: 'NetworkError',
                    code: -1,
                },
            };
        }
    }

    /**
     * Upsert a single product to the catalog
     * Uses allow_upsert=true to create or update based on retailer_id
     */
    async upsertProduct(product: MetaCatalogProduct): Promise<MetaApiResponse<{ id: string }>> {
        const endpoint = `/${this.config.catalogId}/products`;

        return this.request<{ id: string }>(endpoint, 'POST', {
            ...product,
            allow_upsert: true,
        });
    }

    /**
     * Delete a product from the catalog by retailer_id
     */
    async deleteProduct(retailerId: string): Promise<MetaApiResponse<{ success: boolean }>> {
        const endpoint = `/${this.config.catalogId}/products`;

        return this.request<{ success: boolean }>(endpoint, 'DELETE', {
            retailer_id: retailerId,
        });
    }

    /**
     * Batch upsert/update/delete multiple products
     * Max 5000 items per batch, but recommended <3000 for optimal performance
     */
    async batchOperation(items: BatchRequestItem[]): Promise<MetaApiResponse<BatchResponse>> {
        const endpoint = `/${this.config.catalogId}/items_batch`;

        const requests = items.map(item => {
            if (item.method === 'DELETE') {
                return {
                    method: 'DELETE',
                    data: { retailer_id: item.retailer_id },
                };
            }
            return {
                method: item.method,
                data: {
                    ...item.data,
                    retailer_id: item.retailer_id,
                },
            };
        });

        return this.request<BatchResponse>(endpoint, 'POST', {
            allow_upsert: true,
            requests: JSON.stringify(requests),
        });
    }

    /**
     * Get a product from the catalog by retailer_id
     */
    async getProduct(retailerId: string): Promise<MetaApiResponse<MetaCatalogProduct | null>> {
        const endpoint = `/${this.config.catalogId}/products?filter={"retailer_id":{"eq":"${retailerId}"}}&fields=id,retailer_id,name,description,price,currency,availability,image_url,url`;

        const response = await this.request<{ data: MetaCatalogProduct[] }>(endpoint, 'GET');

        if (response.success && response.data?.data?.length) {
            return { success: true, data: response.data.data[0] };
        }

        return { success: true, data: null };
    }

    /**
     * List all products in the catalog
     * Used for reconciliation
     */
    async listAllProducts(limit: number = 250): Promise<MetaApiResponse<{ products: MetaCatalogProduct[], hasMore: boolean, cursor?: string }>> {
        let products: MetaCatalogProduct[] = [];
        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
            const endpoint = cursor
                ? `/${this.config.catalogId}/products?limit=${limit}&after=${cursor}&fields=id,retailer_id,name,description,price,currency,availability,image_url,url`
                : `/${this.config.catalogId}/products?limit=${limit}&fields=id,retailer_id,name,description,price,currency,availability,image_url,url`;

            const response = await this.request<{
                data: MetaCatalogProduct[],
                paging?: { cursors?: { after?: string }, next?: string }
            }>(endpoint, 'GET');

            if (!response.success) {
                return { ...response, data: undefined } as MetaApiResponse<never>;
            }

            products = products.concat(response.data?.data || []);
            cursor = response.data?.paging?.cursors?.after;
            hasMore = !!response.data?.paging?.next;

            // Safety limit
            if (products.length >= 10000) {
                break;
            }
        }

        return {
            success: true,
            data: { products, hasMore: false },
        };
    }

    /**
     * Verify catalog access and permissions
     */
    async verifyCatalogAccess(): Promise<MetaApiResponse<{ id: string, name: string }>> {
        const endpoint = `/${this.config.catalogId}?fields=id,name,product_count`;
        return this.request<{ id: string, name: string }>(endpoint, 'GET');
    }
}

// Singleton instance
let clientInstance: MetaCatalogClient | null = null;

export function getMetaCatalogClient(): MetaCatalogClient {
    if (!clientInstance) {
        clientInstance = new MetaCatalogClient();
    }
    return clientInstance;
}

export function resetMetaCatalogClient(): void {
    clientInstance = null;
}
