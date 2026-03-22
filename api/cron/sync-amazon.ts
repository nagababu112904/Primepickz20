import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { getAmazonListings, getAmazonPrices, isSpApiConfigured } from '../../server/lib/amazonSpApi.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Verify the request is from Vercel Cron (security)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[CRON] Starting daily Amazon inventory + price sync...');

    try {
        if (!isSpApiConfigured()) {
            console.log('[CRON] Amazon SP-API not configured, skipping sync');
            return res.status(200).json({ message: 'SP-API not configured, skipping' });
        }

        // Fetch inventory from Amazon
        const amazonListings = await getAmazonListings();
        console.log(`[CRON] Fetched ${amazonListings.length} items from Amazon`);

        if (amazonListings.length === 0) {
            return res.status(200).json({ message: 'No Amazon inventory data', synced: 0 });
        }

        // Fetch prices
        const asins = amazonListings.map(item => item.asin).filter(Boolean);
        const amazonPrices = await getAmazonPrices(asins);
        console.log(`[CRON] Fetched prices for ${amazonPrices.size} products`);

        // Get products with ASINs
        const allProducts = await db.select()
            .from(schema.products)
            .where(drizzleSql`amazon_asin IS NOT NULL AND amazon_asin != ''`);

        let syncedCount = 0;

        for (const amazonItem of amazonListings) {
            const matchedProduct = allProducts.find(p =>
                (p.amazonAsin && p.amazonAsin === amazonItem.asin) ||
                (p.amazonSku && p.amazonSku === amazonItem.sku)
            );

            if (matchedProduct) {
                const oldStock = matchedProduct.stockCount || 0;
                const newStock = amazonItem.stockCount || 0;
                const amazonPrice = amazonPrices.get(amazonItem.asin);

                const updateData: any = {
                    stockCount: newStock,
                    inStock: newStock > 0,
                    amazonSyncStatus: 'synced',
                    lastSyncedAt: new Date(),
                    updatedAt: new Date(),
                };

                if (amazonPrice && amazonPrice > 0) {
                    updateData.price = amazonPrice.toFixed(2);
                }

                await db.update(schema.products)
                    .set(updateData)
                    .where(eq(schema.products.id, matchedProduct.id));

                // Log
                const priceMsg = amazonPrice ? `, Price: $${amazonPrice.toFixed(2)}` : '';
                await db.insert(schema.amazonSyncLogs).values({
                    productId: matchedProduct.id,
                    syncType: 'inventory',
                    status: 'success',
                    message: `[AUTO] ${matchedProduct.name}: ${oldStock} → ${newStock} units${priceMsg}`,
                });

                syncedCount++;
            }
        }

        console.log(`[CRON] Sync complete: ${syncedCount} products updated`);

        return res.status(200).json({
            success: true,
            synced: syncedCount,
            amazonItems: amazonListings.length,
        });

    } catch (error: any) {
        console.error('[CRON] Sync failed:', error);

        await db.insert(schema.amazonSyncLogs).values({
            syncType: 'inventory',
            status: 'failed',
            message: '[AUTO] DAILY SYNC FAILED',
            errorDetails: error.message || 'Unknown error',
        });

        return res.status(500).json({ error: error.message });
    }
}
