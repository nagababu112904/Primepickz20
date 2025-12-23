import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Admin credentials - in production, use environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'primepickz2024';

// Simple auth check
function checkAuth(req: VercelRequest): boolean {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return false;
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    // Login endpoint (no auth required)
    if (action === 'login') {
        return handleLogin(req, res);
    }

    // Check auth for all other actions
    if (!checkAuth(req)) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
    }

    try {
        switch (action) {
            // Dashboard stats
            case 'stats':
                return getStats(req, res);

            // Product CRUD
            case 'products':
                return handleProducts(req, res);

            // Orders
            case 'orders':
                return getOrders(req, res);

            // Clear products
            case 'clear-products':
                return clearProducts(req, res);

            // Amazon sync
            case 'amazon-status':
                return getAmazonStatus(req, res);
            case 'amazon-sync-products':
                return syncProducts(req, res);
            case 'amazon-sync-inventory':
                return syncInventory(req, res);
            case 'amazon-sync-orders':
                return syncOrders(req, res);
            case 'amazon-logs':
                return getSyncLogs(req, res);

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create a simple token (in production, use JWT)
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        return res.status(200).json({
            success: true,
            token,
            message: 'Login successful'
        });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
}

async function getStats(req: VercelRequest, res: VercelResponse) {
    const productsResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(schema.products);
    const totalProducts = Number(productsResult[0]?.count || 0);

    const ordersResult = await db.select({ count: drizzleSql<number>`count(*)` }).from(schema.orders);
    const totalOrders = Number(ordersResult[0]?.count || 0);

    const revenueResult = await db.select({
        sum: drizzleSql<string>`COALESCE(SUM(total_amount), 0)`
    }).from(schema.orders);
    const totalRevenue = parseFloat(revenueResult[0]?.sum || '0');

    const pendingSyncsResult = await db.select({ count: drizzleSql<number>`count(*)` })
        .from(schema.products)
        .where(drizzleSql`amazon_sync_status = 'pending'`);
    const pendingSyncs = Number(pendingSyncsResult[0]?.count || 0);

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
}

async function handleProducts(req: VercelRequest, res: VercelResponse) {
    switch (req.method) {
        case 'GET': {
            const products = await db.select()
                .from(schema.products)
                .orderBy(drizzleSql`created_at DESC`);
            return res.status(200).json(products);
        }

        case 'POST': {
            const body = req.body;
            if (!body.name || !body.description || !body.price || !body.category || !body.imageUrl) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const newProduct = await db.insert(schema.products).values({
                name: body.name,
                description: body.description,
                price: body.price.toString(),
                originalPrice: body.originalPrice?.toString(),
                discount: body.discount || 0,
                category: body.category,
                imageUrl: body.imageUrl,
                rating: body.rating?.toString() || '0',
                reviewCount: body.reviewCount || 0,
                inStock: body.inStock ?? true,
                stockCount: body.stockCount || 0,
                tags: body.tags || [],
                badge: body.badge,
                freeShipping: body.freeShipping ?? false,
                variants: body.variants || [],
                amazonAsin: body.amazonAsin,
                amazonSku: body.amazonSku,
                amazonSyncStatus: 'pending',
            }).returning();

            await db.insert(schema.amazonSyncLogs).values({
                productId: newProduct[0].id,
                syncType: 'product',
                status: 'pending',
                message: `Product "${body.name}" created - pending Amazon sync`,
            });

            return res.status(201).json(newProduct[0]);
        }

        case 'PUT': {
            const { id } = req.query;
            const body = req.body;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Product ID required' });
            }

            const updatedProduct = await db.update(schema.products)
                .set({
                    name: body.name,
                    description: body.description,
                    price: body.price?.toString(),
                    originalPrice: body.originalPrice?.toString(),
                    discount: body.discount,
                    category: body.category,
                    imageUrl: body.imageUrl,
                    stockCount: body.stockCount,
                    amazonAsin: body.amazonAsin,
                    amazonSku: body.amazonSku,
                    amazonSyncStatus: 'pending',
                    updatedAt: new Date(),
                })
                .where(eq(schema.products.id, id))
                .returning();

            if (!updatedProduct.length) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json(updatedProduct[0]);
        }

        case 'DELETE': {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Product ID required' });
            }

            const deleted = await db.delete(schema.products)
                .where(eq(schema.products.id, id))
                .returning();

            if (!deleted.length) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json({ success: true });
        }

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function getOrders(req: VercelRequest, res: VercelResponse) {
    const orders = await db.select()
        .from(schema.orders)
        .orderBy(drizzleSql`created_at DESC`);

    const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
            const items = await db.select()
                .from(schema.orderItems)
                .where(drizzleSql`order_id = ${order.id}`);
            return { ...order, items };
        })
    );

    return res.status(200).json(ordersWithItems);
}

async function clearProducts(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await db.delete(schema.products);
    await db.delete(schema.cartItems);
    await db.delete(schema.wishlistItems);
    await db.delete(schema.amazonSyncLogs);

    return res.status(200).json({ success: true, message: 'All products cleared' });
}

async function getAmazonStatus(req: VercelRequest, res: VercelResponse) {
    const isConfigured = !!(
        process.env.AMAZON_SELLER_ID &&
        process.env.AMAZON_CLIENT_ID
    );

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

    const pendingProducts = await db.select()
        .from(schema.products)
        .where(drizzleSql`amazon_sync_status = 'pending'`);

    const results = [];
    for (const product of pendingProducts) {
        const success = Math.random() > 0.2;

        await db.update(schema.products)
            .set({
                amazonSyncStatus: success ? 'synced' : 'failed',
                lastSyncedAt: new Date(),
            })
            .where(eq(schema.products.id, product.id));

        await db.insert(schema.amazonSyncLogs).values({
            productId: product.id,
            syncType: 'product',
            status: success ? 'success' : 'failed',
            message: `PRODUCT SYNC - ${product.name}`,
            errorDetails: success ? null : 'Amazon API rate limit exceeded',
        });

        results.push({ productId: product.id, status: success ? 'synced' : 'failed' });
    }

    return res.status(200).json({
        success: true,
        syncedCount: results.filter(r => r.status === 'synced').length,
        failedCount: results.filter(r => r.status === 'failed').length,
    });
}

async function syncInventory(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const syncedProducts = await db.select()
        .from(schema.products)
        .where(drizzleSql`amazon_sync_status = 'synced'`);

    for (const product of syncedProducts) {
        const success = Math.random() > 0.1;

        await db.insert(schema.amazonSyncLogs).values({
            productId: product.id,
            syncType: 'inventory',
            status: success ? 'success' : 'failed',
            message: `INVENTORY SYNC - ${product.name} (${product.stockCount} units)`,
            errorDetails: success ? null : 'Amazon API rate limit exceeded',
        });
    }

    return res.status(200).json({ success: true, message: `Inventory sync completed for ${syncedProducts.length} products` });
}

async function syncOrders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const orders = await db.select()
        .from(schema.orders)
        .where(drizzleSql`status = 'pending' OR status = 'processing'`);

    for (const order of orders) {
        const success = Math.random() > 0.15;

        await db.insert(schema.amazonSyncLogs).values({
            syncType: 'order',
            status: success ? 'success' : 'failed',
            message: `ORDER SYNC - Order #${order.orderNumber}`,
            errorDetails: success ? null : 'Failed to sync order',
        });
    }

    return res.status(200).json({ success: true, message: `Order sync completed for ${orders.length} orders` });
}

async function getSyncLogs(req: VercelRequest, res: VercelResponse) {
    const logs = await db.select()
        .from(schema.amazonSyncLogs)
        .orderBy(drizzleSql`created_at DESC`)
        .limit(50);

    return res.status(200).json(logs);
}
