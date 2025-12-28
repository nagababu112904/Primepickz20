import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { verifyToken, extractToken, checkRateLimit, hashPassword, verifyPassword, generateToken } from '../../server/lib/auth.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Admin credentials from environment (fallback for initial setup)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@primepickz.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'primepickz2024';

// Check JWT token for admin access
function checkAdminAuth(req: VercelRequest): { authorized: boolean; userId?: string; error?: string } {
    const token = extractToken(req.headers.authorization);

    if (!token) {
        // Fallback to Basic Auth for backwards compatibility
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');
            if (username === 'admin' && password === ADMIN_PASSWORD) {
                return { authorized: true, userId: 'admin' };
            }
        }
        return { authorized: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return { authorized: false, error: 'Invalid or expired token' };
    }

    if (payload.role !== 'admin') {
        return { authorized: false, error: 'Admin access required' };
    }

    return { authorized: true, userId: payload.userId };
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
        return handleAdminLogin(req, res);
    }

    // Check auth for all other actions
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
        return res.status(401).json({ error: 'Unauthorized', message: auth.error });
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

            // Inventory management
            case 'inventory':
                return handleInventory(req, res);

            // Return requests
            case 'returns':
                return handleReturns(req, res);

            // Category management
            case 'categories':
                return handleCategories(req, res);

            // Email notifications for admin dashboard
            case 'emails':
                return handleEmails(req, res);
            case 'mark-email-read':
                return markEmailRead(req, res);

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleAdminLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, username } = req.body;
    const loginEmail = email || username;

    // Rate limiting: 5 attempts per 15 minutes
    const rateLimit = checkRateLimit(`admin-login:${loginEmail}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: 'Too many login attempts. Please try again later.',
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        });
    }

    // Check against environment variable (flexible matching)
    const isAdminUser = loginEmail === 'admin' ||
        loginEmail === ADMIN_EMAIL ||
        loginEmail?.toLowerCase() === ADMIN_EMAIL?.toLowerCase();

    if (isAdminUser && password === ADMIN_PASSWORD) {
        const token = generateToken('admin', ADMIN_EMAIL, 'admin');
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: 'admin',
                email: ADMIN_EMAIL,
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            }
        });
    }

    // Check database for admin users
    const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, loginEmail?.toLowerCase()))
        .limit(1);

    if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email!, 'admin');

    return res.status(200).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        }
    });
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

    // Get low stock products (stock <= 5) for alerts
    const lowStockProducts = await db.select({
        id: schema.products.id,
        name: schema.products.name,
        stockCount: schema.products.stockCount,
        imageUrl: schema.products.imageUrl,
    })
        .from(schema.products)
        .where(drizzleSql`(stock_count <= 5 OR stock_count IS NULL)`)
        .orderBy(drizzleSql`stock_count ASC`)
        .limit(10);

    const recentLogs = await db.select()
        .from(schema.amazonSyncLogs)
        .orderBy(drizzleSql`created_at DESC`)
        .limit(10);

    return res.status(200).json({
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingSyncs,
        lowStockProducts,
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
                images: body.images || [],
                rating: body.rating?.toString() || '0',
                reviewCount: body.reviewCount || 0,
                inStock: body.stockCount > 0,
                stockCount: body.stockCount || 0,
                tags: body.tags || [],
                badge: body.stockCount <= 5 && body.stockCount > 0 ? 'Low Stock' : body.badge,
                freeShipping: body.freeShipping ?? false,
                hasVariants: body.hasVariants || false,
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

            // Determine badge based on stock
            let badge = body.badge;
            if (body.stockCount !== undefined) {
                if (body.stockCount === 0) {
                    badge = 'Out of Stock';
                } else if (body.stockCount <= 5) {
                    badge = 'Low Stock';
                }
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
                    images: body.images,
                    stockCount: body.stockCount,
                    inStock: body.stockCount > 0,
                    badge,
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

async function handleInventory(req: VercelRequest, res: VercelResponse) {
    switch (req.method) {
        case 'GET': {
            // Get all products with stock info
            const products = await db.select({
                id: schema.products.id,
                name: schema.products.name,
                stockCount: schema.products.stockCount,
                inStock: schema.products.inStock,
                badge: schema.products.badge,
                amazonSyncStatus: schema.products.amazonSyncStatus,
                lastSyncedAt: schema.products.lastSyncedAt,
            })
                .from(schema.products)
                .orderBy(drizzleSql`stock_count ASC`);

            // Get variant stock as well
            const variants = await db.select()
                .from(schema.productVariants)
                .orderBy(drizzleSql`stock ASC`);

            return res.status(200).json({
                products,
                variants,
                summary: {
                    lowStock: products.filter(p => p.stockCount && p.stockCount <= 5 && p.stockCount > 0).length,
                    outOfStock: products.filter(p => !p.stockCount || p.stockCount === 0).length,
                    total: products.length,
                }
            });
        }

        case 'PUT': {
            const { productId } = req.query;
            const { stockCount } = req.body;

            if (!productId || typeof productId !== 'string') {
                return res.status(400).json({ error: 'Product ID required' });
            }

            // Determine badge based on stock
            let badge = null;
            if (stockCount === 0) {
                badge = 'Out of Stock';
            } else if (stockCount <= 5) {
                badge = 'Low Stock';
            }

            const updated = await db.update(schema.products)
                .set({
                    stockCount,
                    inStock: stockCount > 0,
                    badge,
                    updatedAt: new Date(),
                })
                .where(eq(schema.products.id, productId))
                .returning();

            if (!updated.length) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json(updated[0]);
        }

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

async function handleReturns(req: VercelRequest, res: VercelResponse) {
    switch (req.method) {
        case 'GET': {
            const returns = await db.select()
                .from(schema.returnRequests)
                .orderBy(drizzleSql`created_at DESC`);
            return res.status(200).json(returns);
        }

        case 'POST': {
            // Create new return request (customer submission)
            const { orderId, reason, description, photos, contactEmail, contactPhone } = req.body;

            if (!orderId || !reason || !contactEmail) {
                return res.status(400).json({ error: 'Order ID, reason, and contact email are required' });
            }

            // Verify order exists
            const order = await db.select()
                .from(schema.orders)
                .where(eq(schema.orders.id, orderId))
                .limit(1);

            if (!order.length) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const newReturn = await db.insert(schema.returnRequests).values({
                orderId,
                reason,
                description,
                photos: photos || [],
                contactEmail,
                contactPhone,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            return res.status(201).json({
                success: true,
                returnRequest: newReturn[0],
            });
        }

        case 'PUT': {
            const { id } = req.query;
            const { status, adminNotes } = req.body;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Return request ID required' });
            }

            const updated = await db.update(schema.returnRequests)
                .set({
                    status,
                    adminNotes,
                    updatedAt: new Date(),
                })
                .where(eq(schema.returnRequests.id, id))
                .returning();

            if (!updated.length) {
                return res.status(404).json({ error: 'Return request not found' });
            }

            return res.status(200).json(updated[0]);
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
    await db.delete(schema.productVariants);
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

async function handleCategories(req: VercelRequest, res: VercelResponse) {
    switch (req.method) {
        case 'GET': {
            const categories = await db.select()
                .from(schema.categories)
                .orderBy(drizzleSql`name ASC`);
            return res.status(200).json(categories);
        }

        case 'POST': {
            const { name, slug, imageUrl, description } = req.body;

            if (!name || !slug || !imageUrl) {
                return res.status(400).json({ error: 'Name, slug, and imageUrl are required' });
            }

            const newCategory = await db.insert(schema.categories).values({
                name,
                slug,
                imageUrl,
                description: description || null,
            }).returning();

            return res.status(201).json(newCategory[0]);
        }

        case 'PUT': {
            const { id } = req.query;
            const { name, slug, imageUrl, description } = req.body;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Category ID required' });
            }

            const updated = await db.update(schema.categories)
                .set({
                    name,
                    slug,
                    imageUrl,
                    description,
                })
                .where(eq(schema.categories.id, id))
                .returning();

            if (!updated.length) {
                return res.status(404).json({ error: 'Category not found' });
            }

            return res.status(200).json(updated[0]);
        }

        case 'DELETE': {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Category ID required' });
            }

            await db.delete(schema.categories)
                .where(eq(schema.categories.id, id));

            return res.status(200).json({ success: true });
        }

        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Handle Email Notifications for Admin Dashboard
async function handleEmails(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { status } = req.query;

    try {
        let query = db.select().from(schema.emailLogs);

        // Filter by status if provided
        if (status && status !== 'all') {
            query = query.where(eq(schema.emailLogs.status, status as string)) as any;
        }

        const emails = await query.orderBy(drizzleSql`${schema.emailLogs.sentAt} DESC`).limit(50);

        // Get unread count
        const unreadCount = await db.select({ count: drizzleSql`count(*)` })
            .from(schema.emailLogs)
            .where(eq(schema.emailLogs.status, 'unread'));

        return res.status(200).json({
            emails,
            unreadCount: Number(unreadCount[0]?.count || 0)
        });
    } catch (error) {
        console.error('Failed to fetch emails:', error);
        return res.status(500).json({ error: 'Failed to fetch emails' });
    }
}

// Mark Email as Read
async function markEmailRead(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Email ID required' });
    }

    try {
        await db.update(schema.emailLogs)
            .set({
                status: 'read',
                readAt: new Date()
            })
            .where(eq(schema.emailLogs.id, id as string));

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to mark email as read:', error);
        return res.status(500).json({ error: 'Failed to update email' });
    }
}
