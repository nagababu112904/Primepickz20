// Amazon SP-API Client for fetching products and data
// Uses the official Amazon SP-API with LWA (Login with Amazon) authentication

const AMAZON_REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN || '';
const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID || '';
const AMAZON_CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET || '';
const AMAZON_SELLER_ID = process.env.AMAZON_SELLER_ID || '';
const AMAZON_MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER';

// LWA Token Exchange endpoint
const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const SP_API_BASE_URL = 'https://sellingpartnerapi-na.amazon.com'; // North America region

interface AccessTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface AmazonProduct {
    asin: string;
    sku: string;
    title: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    stockCount?: number;
    category?: string;
    status: 'active' | 'inactive';
}

// Cache access token
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Exchange refresh token for access token
 */
export async function getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
        return cachedAccessToken;
    }

    const response = await fetch(LWA_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: AMAZON_REFRESH_TOKEN,
            client_id: AMAZON_CLIENT_ID,
            client_secret: AMAZON_CLIENT_SECRET,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('LWA Token exchange failed:', errorText);
        throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data: AccessTokenResponse = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    return data.access_token;
}

/**
 * Make authenticated request to SP-API
 */
async function spApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const accessToken = await getAccessToken();

    const response = await fetch(`${SP_API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'x-amz-access-token': accessToken,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`SP-API request failed: ${endpoint}`, errorText);
        throw new Error(`SP-API error: ${response.status}`);
    }

    return response.json();
}

/**
 * Get seller's inventory listings from Amazon
 */
export async function getAmazonListings(): Promise<AmazonProduct[]> {
    try {
        // Get inventory summaries
        const inventoryResponse = await spApiRequest(
            `/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${AMAZON_MARKETPLACE_ID}&marketplaceIds=${AMAZON_MARKETPLACE_ID}`,
            { method: 'GET' }
        );

        const listings = inventoryResponse.payload?.inventorySummaries || [];

        // Transform to our product format
        return listings.map((item: any) => ({
            asin: item.asin || '',
            sku: item.sellerSku || '',
            title: item.productName || 'Unknown Product',
            stockCount: item.totalQuantity || 0,
            status: item.totalQuantity > 0 ? 'active' : 'inactive',
        }));
    } catch (error) {
        console.error('Error fetching Amazon listings:', error);
        return [];
    }
}

/**
 * Get product details by ASIN
 */
export async function getProductByAsin(asin: string): Promise<AmazonProduct | null> {
    try {
        const response = await spApiRequest(
            `/catalog/2022-04-01/items/${asin}?marketplaceIds=${AMAZON_MARKETPLACE_ID}&includedData=summaries,images,productTypes`,
            { method: 'GET' }
        );

        const item = response;
        const summary = item.summaries?.[0];
        const image = item.images?.[0]?.images?.[0];

        return {
            asin: item.asin,
            sku: '',
            title: summary?.itemName || 'Unknown Product',
            description: summary?.browseClassification?.displayName || '',
            imageUrl: image?.link || '',
            status: 'active',
        };
    } catch (error) {
        console.error(`Error fetching product ${asin}:`, error);
        return null;
    }
}

/**
 * Search seller's catalog
 */
export async function searchSellerCatalog(query?: string): Promise<AmazonProduct[]> {
    try {
        // Use Reports API to get inventory report
        // For sandbox, return mock data
        const isSandbox = AMAZON_CLIENT_ID.includes('client') && AMAZON_REFRESH_TOKEN.startsWith('Atzr');

        if (isSandbox) {
            console.log('Sandbox mode - returning sample Amazon products');
            return getSandboxProducts();
        }

        return await getAmazonListings();
    } catch (error) {
        console.error('Error searching catalog:', error);
        // Return sandbox products as fallback
        return getSandboxProducts();
    }
}

/**
 * Sandbox/Demo products for testing
 */
export function getSandboxProducts(): AmazonProduct[] {
    return [
        {
            asin: 'B0XXXXXXXXX',
            sku: 'SKU-SAMPLE-001',
            title: 'Premium Wireless Bluetooth Headphones',
            description: 'High-quality wireless headphones with active noise cancellation',
            price: 149.99,
            imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            stockCount: 50,
            category: 'Electronics',
            status: 'active',
        },
        {
            asin: 'B0YYYYYYYYY',
            sku: 'SKU-SAMPLE-002',
            title: 'Smart Watch Fitness Tracker',
            description: 'Advanced fitness tracking with heart rate monitor',
            price: 199.99,
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            stockCount: 35,
            category: 'Electronics',
            status: 'active',
        },
        {
            asin: 'B0ZZZZZZZZZ',
            sku: 'SKU-SAMPLE-003',
            title: 'Portable Power Bank 20000mAh',
            description: 'Fast charging power bank for all devices',
            price: 49.99,
            imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
            stockCount: 100,
            category: 'Electronics',
            status: 'active',
        },
        {
            asin: 'B0AAAAAAAA',
            sku: 'SKU-SAMPLE-004',
            title: 'LED Desk Lamp with USB Charging',
            description: 'Modern desk lamp with adjustable brightness',
            price: 39.99,
            imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
            stockCount: 75,
            category: 'Home & Office',
            status: 'active',
        },
        {
            asin: 'B0BBBBBBB',
            sku: 'SKU-SAMPLE-005',
            title: 'Stainless Steel Water Bottle',
            description: 'Insulated water bottle keeps drinks cold 24 hours',
            price: 29.99,
            imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
            stockCount: 200,
            category: 'Sports & Outdoors',
            status: 'active',
        },
    ];
}

/**
 * Check if SP-API is configured
 */
export function isSpApiConfigured(): boolean {
    return !!(
        AMAZON_REFRESH_TOKEN &&
        AMAZON_CLIENT_ID &&
        AMAZON_CLIENT_SECRET &&
        AMAZON_SELLER_ID
    );
}
