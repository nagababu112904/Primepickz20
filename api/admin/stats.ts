import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get total products count
        const productsResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(schema.products);
        const totalProducts = Number(productsResult[0]?.count || 0);

        // Get total orders count
        const ordersResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(schema.orders);
        const totalOrders = Number(ordersResult[0]?.count || 0);

        // Get total revenue
        const revenueResult = await db.select({
            sum: drizzleSql<string>`COALESCE(SUM(total_amount), 0)`
        }).from(schema.orders);
        const totalRevenue = parseFloat(revenueResult[0]?.sum || '0');

        // Get pending syncs count (products with pending status)
        const pendingSyncsResult = await db.select({ count: drizzleSql<number>`count(*)` })
            .from(schema.products)
            .where(drizzleSql`amazon_sync_status = 'pending'`);
        const pendingSyncs = Number(pendingSyncsResult[0]?.count || 0);

        // Get recent sync logs
        const recentLogs = await db.select()
            .from(schema.amazonSyncLogs)
            .orderBy(drizzleSql`created_at DESC`)
            .limit(10);

        return res.status(200).json({
            totalProducts,
            totalOrders,
            totalRevenue,
            pendingSyncs,
            recentSyncLogs: recentLogs,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
}
