/**
 * Catalog Sync Processor Service
 * 
 * Handles the core sync logic between PrimePickz and Meta Catalog
 * - Queue-based processing for reliability
 * - Idempotent operations using retailer_id
 * - Automatic retry with dead letter queue
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, lt, isNull, or, desc, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import { metaCatalogSync, metaSyncLogs, metaSyncDeadLetter } from '../../shared/meta-catalog-schema';
import { getMetaCatalogClient } from './meta-catalog-client';
import { transformToMetaProduct, validateForMeta } from './meta-catalog-transformer';
import { sendSyncAlert } from './alerting';

// Initialize database
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { ...schema, metaCatalogSync, metaSyncLogs, metaSyncDeadLetter } });

const MAX_RETRIES = 5;
const SYNC_ENABLED = process.env.SYNC_ENABLED !== 'false';

export interface SyncResult {
    success: boolean;
    productId: string;
    retailerId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    metaProductId?: string;
    error?: string;
    errorCode?: string;
    durationMs: number;
}

/**
 * Sync a single product to Meta Catalog
 */
export async function syncProduct(
    productId: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
): Promise<SyncResult> {
    const startTime = Date.now();

    if (!SYNC_ENABLED) {
        console.log(`[CatalogSync] Sync disabled, skipping ${operation} for product ${productId}`);
        return {
            success: true,
            productId,
            retailerId: productId,
            operation,
            durationMs: Date.now() - startTime,
        };
    }

    const client = getMetaCatalogClient();

    // Validate configuration
    const configCheck = client.validateConfig();
    if (!configCheck.valid) {
        const error = `Missing Meta API configuration: ${configCheck.missing.join(', ')}`;
        console.error(`[CatalogSync] ${error}`);
        await logSyncOperation(productId, productId, operation, 'FAILED', null, null, error, 'CONFIG_ERROR');
        return {
            success: false,
            productId,
            retailerId: productId,
            operation,
            error,
            errorCode: 'CONFIG_ERROR',
            durationMs: Date.now() - startTime,
        };
    }

    try {
        if (operation === 'DELETE') {
            return await handleDelete(productId, startTime);
        }

        // Fetch product from database
        const [product] = await db.select()
            .from(schema.products)
            .where(eq(schema.products.id, productId))
            .limit(1);

        if (!product) {
            const error = 'Product not found in database';
            await logSyncOperation(productId, productId, operation, 'FAILED', null, null, error, 'NOT_FOUND');
            return {
                success: false,
                productId,
                retailerId: productId,
                operation,
                error,
                errorCode: 'NOT_FOUND',
                durationMs: Date.now() - startTime,
            };
        }

        // Validate product has required fields
        const validation = validateForMeta(product);
        if (!validation.valid) {
            const error = `Validation failed: ${validation.errors.join(', ')}`;
            await logSyncOperation(productId, productId, operation, 'FAILED', null, null, error, 'VALIDATION_ERROR');
            return {
                success: false,
                productId,
                retailerId: productId,
                operation,
                error,
                errorCode: 'VALIDATION_ERROR',
                durationMs: Date.now() - startTime,
            };
        }

        // Transform to Meta format
        const metaProduct = transformToMetaProduct(product);

        // Upsert to Meta Catalog
        const response = await client.upsertProduct(metaProduct);

        if (!response.success) {
            const error = response.error?.message || 'Unknown Meta API error';
            const errorCode = response.error?.code?.toString() || 'UNKNOWN';

            // Update sync status
            await updateSyncStatus(productId, metaProduct.retailer_id, 'failed', error);
            await logSyncOperation(productId, metaProduct.retailer_id, operation, 'FAILED', metaProduct, response, error, errorCode);

            // Check if we should add to dead letter queue
            await handleSyncFailure(productId, metaProduct.retailer_id, operation, metaProduct, error, errorCode);

            return {
                success: false,
                productId,
                retailerId: metaProduct.retailer_id,
                operation,
                error,
                errorCode,
                durationMs: Date.now() - startTime,
            };
        }

        // Success - update sync status
        const metaProductId = response.data?.id;
        await updateSyncStatus(productId, metaProduct.retailer_id, 'synced', null, metaProductId);
        await logSyncOperation(productId, metaProduct.retailer_id, operation, 'SUCCESS', metaProduct, response.data);

        console.log(`[CatalogSync] Successfully synced product ${productId} to Meta (${metaProductId})`);

        return {
            success: true,
            productId,
            retailerId: metaProduct.retailer_id,
            operation,
            metaProductId,
            durationMs: Date.now() - startTime,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logSyncOperation(productId, productId, operation, 'FAILED', null, null, errorMessage, 'EXCEPTION');

        return {
            success: false,
            productId,
            retailerId: productId,
            operation,
            error: errorMessage,
            errorCode: 'EXCEPTION',
            durationMs: Date.now() - startTime,
        };
    }
}

/**
 * Handle product deletion from Meta Catalog
 */
async function handleDelete(productId: string, startTime: number): Promise<SyncResult> {
    const client = getMetaCatalogClient();

    // Get retailer_id from sync table
    const [syncRecord] = await db.select()
        .from(metaCatalogSync)
        .where(eq(metaCatalogSync.productId, productId))
        .limit(1);

    const retailerId = syncRecord?.retailerId || productId;

    try {
        const response = await client.deleteProduct(retailerId);

        if (!response.success) {
            const error = response.error?.message || 'Failed to delete from Meta';
            await logSyncOperation(productId, retailerId, 'DELETE', 'FAILED', null, response, error, response.error?.code?.toString());
            return {
                success: false,
                productId,
                retailerId,
                operation: 'DELETE',
                error,
                durationMs: Date.now() - startTime,
            };
        }

        // Mark as deleted in sync table
        if (syncRecord) {
            await db.update(metaCatalogSync)
                .set({ isDeleted: true, syncStatus: 'deleted', updatedAt: new Date() })
                .where(eq(metaCatalogSync.productId, productId));
        }

        await logSyncOperation(productId, retailerId, 'DELETE', 'SUCCESS');

        console.log(`[CatalogSync] Successfully deleted product ${productId} from Meta`);

        return {
            success: true,
            productId,
            retailerId,
            operation: 'DELETE',
            durationMs: Date.now() - startTime,
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logSyncOperation(productId, retailerId, 'DELETE', 'FAILED', null, null, errorMessage, 'EXCEPTION');

        return {
            success: false,
            productId,
            retailerId,
            operation: 'DELETE',
            error: errorMessage,
            errorCode: 'EXCEPTION',
            durationMs: Date.now() - startTime,
        };
    }
}

/**
 * Update sync status in database
 */
async function updateSyncStatus(
    productId: string,
    retailerId: string,
    status: 'pending' | 'synced' | 'failed' | 'deleted',
    error?: string | null,
    metaProductId?: string
): Promise<void> {
    const existing = await db.select()
        .from(metaCatalogSync)
        .where(eq(metaCatalogSync.productId, productId))
        .limit(1);

    if (existing.length > 0) {
        await db.update(metaCatalogSync)
            .set({
                syncStatus: status,
                lastError: error || null,
                lastSyncedAt: status === 'synced' ? new Date() : undefined,
                metaProductId: metaProductId || existing[0].metaProductId,
                retryCount: status === 'failed' ? drizzleSql`retry_count + 1` : 0,
                updatedAt: new Date(),
            })
            .where(eq(metaCatalogSync.productId, productId));
    } else {
        await db.insert(metaCatalogSync).values({
            productId,
            retailerId,
            metaProductId,
            syncStatus: status,
            lastError: error || null,
            lastSyncedAt: status === 'synced' ? new Date() : null,
            retryCount: status === 'failed' ? 1 : 0,
        });
    }
}

/**
 * Log sync operation
 */
async function logSyncOperation(
    productId: string,
    retailerId: string,
    operation: string,
    status: string,
    requestPayload?: unknown,
    responsePayload?: unknown,
    errorMessage?: string,
    errorCode?: string
): Promise<void> {
    try {
        await db.insert(metaSyncLogs).values({
            productId,
            retailerId,
            operation,
            status,
            requestPayload: requestPayload ? JSON.stringify(requestPayload) : null,
            responsePayload: responsePayload ? JSON.stringify(responsePayload) : null,
            errorMessage,
            errorCode,
        });
    } catch (error) {
        console.error('[CatalogSync] Failed to log sync operation:', error);
    }
}

/**
 * Handle sync failure - add to dead letter queue after max retries
 */
async function handleSyncFailure(
    productId: string,
    retailerId: string,
    operation: string,
    payload: unknown,
    errorMessage: string,
    errorCode: string
): Promise<void> {
    // Check current retry count
    const [syncRecord] = await db.select()
        .from(metaCatalogSync)
        .where(eq(metaCatalogSync.productId, productId))
        .limit(1);

    const retryCount = (syncRecord?.retryCount || 0) + 1;

    if (retryCount >= MAX_RETRIES) {
        // Add to dead letter queue
        await db.insert(metaSyncDeadLetter).values({
            productId,
            retailerId,
            operation,
            payload: JSON.stringify(payload),
            errorMessage,
            errorCode,
            retryCount,
        });

        // Send alert
        await sendSyncAlert({
            type: 'sync_failure',
            productId,
            retailerId,
            error: errorMessage,
            retryCount,
        });

        console.log(`[CatalogSync] Product ${productId} added to dead letter queue after ${retryCount} failures`);
    }
}

/**
 * Get sync status for dashboard
 */
export async function getSyncStatus(limit: number = 100): Promise<{
    total: number;
    synced: number;
    failed: number;
    pending: number;
    items: Array<{
        productId: string;
        retailerId: string;
        status: string;
        lastSyncedAt: Date | null;
        lastError: string | null;
    }>;
}> {
    const items = await db.select({
        productId: metaCatalogSync.productId,
        retailerId: metaCatalogSync.retailerId,
        status: metaCatalogSync.syncStatus,
        lastSyncedAt: metaCatalogSync.lastSyncedAt,
        lastError: metaCatalogSync.lastError,
    })
        .from(metaCatalogSync)
        .where(eq(metaCatalogSync.isDeleted, false))
        .orderBy(desc(metaCatalogSync.updatedAt))
        .limit(limit);

    const counts = await db.select({
        status: metaCatalogSync.syncStatus,
        count: drizzleSql<number>`count(*)::int`,
    })
        .from(metaCatalogSync)
        .where(eq(metaCatalogSync.isDeleted, false))
        .groupBy(metaCatalogSync.syncStatus);

    const statusCounts = counts.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
    }, {} as Record<string, number>);

    return {
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        synced: statusCounts['synced'] || 0,
        failed: statusCounts['failed'] || 0,
        pending: statusCounts['pending'] || 0,
        items,
    };
}

/**
 * Get dead letter queue items
 */
export async function getDeadLetterItems(limit: number = 50): Promise<Array<{
    id: number;
    productId: string;
    retailerId: string | null;
    operation: string;
    errorMessage: string | null;
    retryCount: number;
    createdAt: Date | null;
    resolved: boolean | null;
}>> {
    return db.select({
        id: metaSyncDeadLetter.id,
        productId: metaSyncDeadLetter.productId,
        retailerId: metaSyncDeadLetter.retailerId,
        operation: metaSyncDeadLetter.operation,
        errorMessage: metaSyncDeadLetter.errorMessage,
        retryCount: metaSyncDeadLetter.retryCount,
        createdAt: metaSyncDeadLetter.createdAt,
        resolved: metaSyncDeadLetter.resolved,
    })
        .from(metaSyncDeadLetter)
        .where(eq(metaSyncDeadLetter.resolved, false))
        .orderBy(desc(metaSyncDeadLetter.createdAt))
        .limit(limit);
}

/**
 * Retry a dead letter item
 */
export async function retryDeadLetterItem(id: number): Promise<SyncResult | null> {
    const [item] = await db.select()
        .from(metaSyncDeadLetter)
        .where(eq(metaSyncDeadLetter.id, id))
        .limit(1);

    if (!item) {
        return null;
    }

    // Reset retry count in sync table
    await db.update(metaCatalogSync)
        .set({ retryCount: 0, syncStatus: 'pending' })
        .where(eq(metaCatalogSync.productId, item.productId));

    // Attempt sync
    const result = await syncProduct(item.productId, item.operation as 'CREATE' | 'UPDATE' | 'DELETE');

    if (result.success) {
        // Mark as resolved
        await db.update(metaSyncDeadLetter)
            .set({ resolved: true, resolvedAt: new Date() })
            .where(eq(metaSyncDeadLetter.id, id));
    }

    return result;
}

/**
 * Get sync logs for a product
 */
export async function getProductSyncLogs(productId: string, limit: number = 20) {
    return db.select()
        .from(metaSyncLogs)
        .where(eq(metaSyncLogs.productId, productId))
        .orderBy(desc(metaSyncLogs.createdAt))
        .limit(limit);
}
