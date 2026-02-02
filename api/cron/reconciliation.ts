/**
 * Nightly Catalog Reconciliation Job
 * 
 * Runs as a Vercel Cron job at 2:00 AM UTC daily
 * - Fetches all products from PrimePickz database
 * - Fetches all products from Meta Catalog
 * - Detects mismatches:
 *   - Missing in Meta (not synced)
 *   - Orphaned in Meta (deleted from PrimePickz)
 *   - Stale data (different values)
 * - Queues corrections
 * - Sends summary report
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, inArray, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema';
import { metaCatalogSync, metaSyncLogs } from '../../shared/meta-catalog-schema';
import { getMetaCatalogClient } from '../../server/lib/meta-catalog-client';
import { transformToMetaProduct, hasProductChanged } from '../../server/lib/meta-catalog-transformer';
import { syncProduct } from '../../server/lib/catalog-sync-processor';
import { sendDailySyncSummary, sendSyncAlert } from '../../server/lib/alerting';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { ...schema, metaCatalogSync, metaSyncLogs } });

// Cron secret for Vercel
const CRON_SECRET = process.env.CRON_SECRET;
const SYNC_ENABLED = process.env.SYNC_ENABLED !== 'false';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify cron secret (for Vercel Cron)
    const authHeader = req.headers.authorization;
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        console.log('[Reconciliation] Unauthorized request, missing or invalid CRON_SECRET');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!SYNC_ENABLED) {
        console.log('[Reconciliation] Sync is disabled, skipping reconciliation');
        return res.status(200).json({ message: 'Sync disabled' });
    }

    console.log('[Reconciliation] Starting nightly catalog reconciliation...');

    const startTime = Date.now();
    const results = {
        startedAt: new Date().toISOString(),
        totalProducts: 0,
        totalInMeta: 0,
        missingInMeta: 0,
        orphanedInMeta: 0,
        staleInMeta: 0,
        fixed: 0,
        errors: 0,
        durationMs: 0,
    };

    try {
        const client = getMetaCatalogClient();

        // Validate configuration
        const configCheck = client.validateConfig();
        if (!configCheck.valid) {
            console.error('[Reconciliation] Missing Meta API configuration:', configCheck.missing);
            return res.status(500).json({
                error: 'Meta API not configured',
                missing: configCheck.missing,
            });
        }

        // 1. Fetch all products from PrimePickz database
        const localProducts = await db.select()
            .from(schema.products);

        results.totalProducts = localProducts.length;
        console.log(`[Reconciliation] Found ${localProducts.length} products in PrimePickz`);

        // 2. Fetch all products from Meta Catalog
        const metaResponse = await client.listAllProducts(250);

        if (!metaResponse.success || !metaResponse.data) {
            console.error('[Reconciliation] Failed to fetch Meta catalog:', metaResponse.error);
            return res.status(500).json({
                error: 'Failed to fetch Meta catalog',
                details: metaResponse.error,
            });
        }

        const metaProducts = metaResponse.data.products;
        results.totalInMeta = metaProducts.length;
        console.log(`[Reconciliation] Found ${metaProducts.length} products in Meta Catalog`);

        // Create lookup maps
        const localProductMap = new Map(localProducts.map(p => [p.id, p]));
        const metaProductMap = new Map(metaProducts.map(p => [p.retailer_id, p]));

        // 3. Find products missing in Meta (exist in PrimePickz but not in Meta)
        const missingInMeta: string[] = [];
        for (const product of localProducts) {
            if (!metaProductMap.has(product.id)) {
                missingInMeta.push(product.id);
            }
        }
        results.missingInMeta = missingInMeta.length;
        console.log(`[Reconciliation] ${missingInMeta.length} products missing in Meta`);

        // 4. Find orphaned products in Meta (exist in Meta but not in PrimePickz)
        const orphanedInMeta: string[] = [];
        for (const metaProduct of metaProducts) {
            if (!localProductMap.has(metaProduct.retailer_id)) {
                orphanedInMeta.push(metaProduct.retailer_id);
            }
        }
        results.orphanedInMeta = orphanedInMeta.length;
        console.log(`[Reconciliation] ${orphanedInMeta.length} orphaned products in Meta`);

        // 5. Find stale products (data mismatch)
        const staleProducts: string[] = [];
        for (const product of localProducts) {
            const metaProduct = metaProductMap.get(product.id);
            if (metaProduct) {
                const transformedProduct = transformToMetaProduct(product);
                if (hasProductChanged(transformedProduct, metaProduct)) {
                    staleProducts.push(product.id);
                }
            }
        }
        results.staleInMeta = staleProducts.length;
        console.log(`[Reconciliation] ${staleProducts.length} products have stale data in Meta`);

        // 6. Fix issues
        const productsToSync = [...new Set([...missingInMeta, ...staleProducts])];
        console.log(`[Reconciliation] Syncing ${productsToSync.length} products...`);

        // Sync missing and stale products (in batches)
        const BATCH_SIZE = 10;
        for (let i = 0; i < productsToSync.length; i += BATCH_SIZE) {
            const batch = productsToSync.slice(i, i + BATCH_SIZE);

            await Promise.all(batch.map(async (productId) => {
                const result = await syncProduct(productId, 'UPDATE');
                if (result.success) {
                    results.fixed++;
                } else {
                    results.errors++;
                }
            }));
        }

        // Delete orphaned products from Meta
        console.log(`[Reconciliation] Deleting ${orphanedInMeta.length} orphaned products from Meta...`);
        for (const retailerId of orphanedInMeta) {
            try {
                await client.deleteProduct(retailerId);
                results.fixed++;
            } catch (error) {
                results.errors++;
                console.error(`[Reconciliation] Failed to delete orphaned product ${retailerId}:`, error);
            }
        }

        // Log reconciliation operation
        await db.insert(metaSyncLogs).values({
            productId: null,
            retailerId: null,
            operation: 'RECONCILE',
            status: results.errors > 0 ? 'PARTIAL' : 'SUCCESS',
            requestPayload: JSON.stringify(results),
            responsePayload: null,
            errorMessage: results.errors > 0 ? `${results.errors} errors during reconciliation` : null,
        });

        results.durationMs = Date.now() - startTime;
        console.log(`[Reconciliation] Completed in ${results.durationMs}ms`);

        // 7. Send daily summary
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Count syncs from today
        const todayLogs = await db.select({
            status: metaSyncLogs.status,
            count: drizzleSql<number>`count(*)::int`,
        })
            .from(metaSyncLogs)
            .where(and(
                drizzleSql`created_at >= ${yesterday.toISOString()}`,
                drizzleSql`operation != 'RECONCILE'`
            ))
            .groupBy(metaSyncLogs.status);

        const statusCounts = todayLogs.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {} as Record<string, number>);

        // Count dead letter items
        const deadLetterCount = await db.select({
            count: drizzleSql<number>`count(*)::int`,
        })
            .from(schema.products)
            .limit(1);

        await sendDailySyncSummary({
            totalProducts: results.totalProducts,
            syncedToday: statusCounts['SUCCESS'] || 0,
            failedToday: statusCounts['FAILED'] || 0,
            deadLetterCount: 0, // Will be updated when we add the query
            reconciliationResults: {
                missingInMeta: results.missingInMeta,
                orphanedInMeta: results.orphanedInMeta,
                fixed: results.fixed,
            },
        });

        // Send alert if significant mismatches detected
        const mismatchThreshold = Math.max(5, results.totalProducts * 0.05);
        if (results.missingInMeta + results.orphanedInMeta > mismatchThreshold) {
            await sendSyncAlert({
                type: 'reconciliation_mismatch',
                details: {
                    missingInMeta: results.missingInMeta,
                    orphanedInMeta: results.orphanedInMeta,
                    staleInMeta: results.staleInMeta,
                },
            });
        }

        return res.status(200).json({
            success: true,
            ...results,
        });

    } catch (error) {
        console.error('[Reconciliation] Error:', error);
        results.durationMs = Date.now() - startTime;

        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            ...results,
        });
    }
}

// Vercel Cron configuration
export const config = {
    // Run at 2:00 AM UTC daily
    cron: '0 2 * * *',
};
