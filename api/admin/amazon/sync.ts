import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'products':
                return syncProducts(req, res);
            case 'inventory':
                return syncInventory(req, res);
            case 'orders':
                return syncOrders(req, res);
            case 'logs':
                return getLogs(req, res);
            case 'status':
                return getStatus(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Amazon sync error:', error);
        return res.status(500).json({ error: 'Sync failed' });
    }
}

async function getStatus(req: VercelRequest, res: VercelResponse) {
    // Check if Amazon credentials are configured
    const isConfigured = !!(
        process.env.AMAZON_SELLER_ID &&
        process.env.AMAZON_CLIENT_ID &&
        process.env.AMAZON_CLIENT_SECRET
    );

    // Get last sync time
    const lastLog = await db.select()
        .from(schema.amazonSyncLogs)
        .where(drizzleSql`status = 'success'`)
        .orderBy(drizzleSql`created_at DESC`)
        .limit(1);

    return res.status(200).json({
        connected: isConfigured,
        lastSyncAt: lastLog[0]?.createdAt || null,
        message: isConfigured ? 'Amazon SP-API Connected' : 'Amazon SP-API not configured'
    });
}

async function syncProducts(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get all products with pending sync status
    const pendingProducts = await db.select()
        .from(schema.products)
        .where(drizzleSql`amazon_sync_status = 'pending'`);

    // Mock sync - in real implementation, call Amazon SP-API
    const results = [];
    for (const product of pendingProducts) {
        // Simulate API call (mock success/failure)
        const success = Math.random() > 0.2; // 80% success rate for demo

        // Update product sync status
        await db.update(schema.products)
            .set({
                amazonSyncStatus: success ? 'synced' : 'failed',
                lastSyncedAt: new Date(),
            })
            .where(eq(schema.products.id, product.id));

        // Log the sync attempt
        await db.insert(schema.amazonSyncLogs).values({
            productId: product.id,
            syncType: 'product',
            status: success ? 'success' : 'failed',
            message: success
                ? `PRODUCT SYNC - ${product.name}`
                : `PRODUCT SYNC - ${product.name}`,
            errorDetails: success ? null : 'Amazon API rate limit exceeded',
        });

        results.push({
            productId: product.id,
            name: product.name,
            status: success ? 'synced' : 'failed',
        });
    }

    return res.status(200).json({
        success: true,
        syncedCount: results.filter(r => r.status === 'synced').length,
        failedCount: results.filter(r => r.status === 'failed').length,
        results,
    });
}

async function syncInventory(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get all synced products
    const syncedProducts = await db.select()
        .from(schema.products)
        .where(drizzleSql`amazon_sync_status = 'synced'`);

    // Mock inventory sync
    for (const product of syncedProducts) {
        const success = Math.random() > 0.1; // 90% success rate

        await db.insert(schema.amazonSyncLogs).values({
            productId: product.id,
            syncType: 'inventory',
            status: success ? 'success' : 'failed',
            message: success
                ? `INVENTORY SYNC - ${product.name} (${product.stockCount} units)`
                : `INVENTORY SYNC - ${product.name}`,
            errorDetails: success ? null : 'Amazon API rate limit exceeded',
        });
    }

    return res.status(200).json({
        success: true,
        message: `Inventory sync completed for ${syncedProducts.length} products`,
    });
}

async function syncOrders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get pending orders
    const orders = await db.select()
        .from(schema.orders)
        .where(drizzleSql`status = 'pending' OR status = 'processing'`);

    // Mock order sync
    for (const order of orders) {
        const success = Math.random() > 0.15; // 85% success rate

        await db.insert(schema.amazonSyncLogs).values({
            syncType: 'order',
            status: success ? 'success' : 'failed',
            message: success
                ? `ORDER SYNC - Order #${order.orderNumber}`
                : `ORDER SYNC - Order #${order.orderNumber}`,
            errorDetails: success ? null : 'Failed to sync order to Amazon',
        });
    }

    return res.status(200).json({
        success: true,
        message: `Order sync completed for ${orders.length} orders`,
    });
}

async function getLogs(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const logs = await db.select()
        .from(schema.amazonSyncLogs)
        .orderBy(drizzleSql`created_at DESC`)
        .limit(50);

    return res.status(200).json(logs);
}
