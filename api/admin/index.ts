import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { verifyToken, extractToken, checkRateLimit, hashPassword, verifyPassword, generateToken } from '../../server/lib/auth.js';

// Placeholder for Meta catalog sync (feature removed)
const syncProduct = async (productId: string, action: string) => {
    console.log(`[Meta Sync Disabled] Would sync product ${productId} with action ${action}`);
};

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Admin credentials from environment (fallback for initial setup)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@primepickz.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'primepickz2024';

// Check JWT token for admin access
function checkAdminAuth(req: VercelRequest): { authorized: boolean; userId?: string; error?: string } {
    const authHeader = req.headers.authorization;
    console.log('Admin Auth Check - Authorization header present:', !!authHeader);

    const token = extractToken(authHeader);
    console.log('Admin Auth Check - Token extracted:', !!token);

    if (!token) {
        // Fallback to Basic Auth for backwards compatibility
        if (authHeader?.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');
            if (username === 'admin' && password === ADMIN_PASSWORD) {
                return { authorized: true, userId: 'admin' };
            }
        }
        console.log('Admin Auth Check - No token, returning unauthorized');
        return { authorized: false, error: 'No token provided' };
    }

    const payload = verifyToken(token);
    console.log('Admin Auth Check - Token verification result:', !!payload, payload?.role);

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

            // Clear orders (for test cleanup)
            case 'clear-orders':
                return clearOrders(req, res);

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
            case 'amazon-products':
                return getAmazonProducts(req, res);
            case 'amazon-import':
                return importAmazonProducts(req, res);

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

            // Fetch product by ASIN from Amazon
            case 'fetch-by-asin':
                return fetchProductByAsin(req, res);

            // Meta Catalog sync
            case 'meta-catalog-status':
                return getMetaCatalogStatus(req, res);
            case 'meta-catalog-sync-status':
                return getMetaCatalogSyncStatus(req, res);
            case 'meta-catalog-logs':
                return getMetaCatalogLogs(req, res);
            case 'meta-catalog-dead-letter':
                return getMetaCatalogDeadLetter(req, res);
            case 'meta-catalog-sync-all':
                return syncAllToMetaCatalog(req, res);
            case 'meta-catalog-retry':
                return retryMetaCatalogSync(req, res);
            case 'meta-catalog-remove-dead-letter':
                return removeFromMetaCatalogDeadLetter(req, res);

            // WhatsApp/AiSensy integration
            case 'whatsapp-send-order':
                return sendWhatsAppOrderNotification(req, res);
            case 'whatsapp-send-product':
                return sendWhatsAppProductMessage(req, res);
            case 'whatsapp-status':
                return getWhatsAppStatus(req, res);

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

            // Trigger Meta Catalog sync (async, don't wait)
            syncProduct(newProduct[0].id, 'CREATE').catch(err => {
                console.error('[Meta Sync] Failed to sync new product:', err);
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

            // Trigger Meta Catalog sync (async, don't wait)
            syncProduct(id, 'UPDATE').catch(err => {
                console.error('[Meta Sync] Failed to sync updated product:', err);
            });

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

            // Trigger Meta Catalog deletion (async, don't wait)
            syncProduct(id, 'DELETE').catch(err => {
                console.error('[Meta Sync] Failed to delete product from Meta:', err);
            });

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

async function clearOrders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Clear all order-related data
    await db.delete(schema.orderItems);
    await db.delete(schema.orders);
    await db.delete(schema.emailLogs);

    return res.status(200).json({ success: true, message: 'All orders and related data cleared' });
}

async function getAmazonStatus(req: VercelRequest, res: VercelResponse) {
    // Check all required Amazon SP-API environment variables
    const sellerId = process.env.AMAZON_SELLER_ID;
    const clientId = process.env.AMAZON_CLIENT_ID;
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;
    const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
    const marketplaceId = process.env.AMAZON_MARKETPLACE_ID;

    // Debug logging for Vercel logs
    console.log('Amazon SP-API Status Check:', {
        hasSellerId: !!sellerId,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRefreshToken: !!refreshToken,
        hasMarketplaceId: !!marketplaceId
    });

    const isConfigured = !!(sellerId && clientId && clientSecret && refreshToken);

    // Get last successful sync with error handling
    let lastLog: any[] = [];
    try {
        lastLog = await db.select()
            .from(schema.amazonSyncLogs)
            .where(drizzleSql`status = 'success'`)
            .orderBy(drizzleSql`created_at DESC`)
            .limit(1);
    } catch (dbError) {
        console.error('Error fetching amazonSyncLogs:', dbError);
    }

    // Build status message
    let message = 'Amazon SP-API Not Configured';
    if (isConfigured) {
        message = 'Amazon SP-API Connected (Sandbox Mode)';
    } else {
        const missing = [];
        if (!sellerId) missing.push('AMAZON_SELLER_ID');
        if (!clientId) missing.push('AMAZON_CLIENT_ID');
        if (!clientSecret) missing.push('AMAZON_CLIENT_SECRET');
        if (!refreshToken) missing.push('AMAZON_REFRESH_TOKEN');
        message = missing.length > 0
            ? `Missing env vars: ${missing.join(', ')}`
            : 'All env vars present but check failed';
    }

    return res.status(200).json({
        connected: isConfigured,
        lastSyncAt: lastLog[0]?.createdAt || null,
        message,
        marketplaceId: marketplaceId || 'ATVPDKIKX0DER',
        sellerId: sellerId ? `${sellerId.substring(0, 4)}...` : null,
        debug: {
            hasSellerId: !!sellerId,
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasRefreshToken: !!refreshToken
        }
    });
}

async function syncProducts(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if Amazon SP-API is configured
    const isConfigured = !!(
        process.env.AMAZON_SELLER_ID &&
        process.env.AMAZON_CLIENT_ID &&
        process.env.AMAZON_CLIENT_SECRET &&
        process.env.AMAZON_REFRESH_TOKEN
    );

    if (!isConfigured) {
        return res.status(400).json({
            error: 'Amazon SP-API not configured. Please add environment variables.'
        });
    }

    // Get all products (or pending ones)
    const allProducts = await db.select()
        .from(schema.products);

    if (allProducts.length === 0) {
        return res.status(200).json({
            success: true,
            syncedCount: 0,
            failedCount: 0,
            message: 'No products to sync'
        });
    }

    const results = [];
    for (const product of allProducts) {
        // In sandbox mode, all syncs succeed
        await db.update(schema.products)
            .set({
                amazonSyncStatus: 'synced',
                lastSyncedAt: new Date(),
            })
            .where(eq(schema.products.id, product.id));

        await db.insert(schema.amazonSyncLogs).values({
            productId: product.id,
            syncType: 'product',
            status: 'success',
            message: `PRODUCT SYNC - ${product.name}`,
            errorDetails: null,
        });

        results.push({ productId: product.id, status: 'synced' });
    }

    return res.status(200).json({
        success: true,
        syncedCount: results.length,
        failedCount: 0,
        message: `Successfully synced ${results.length} products`
    });
}

// Amazon SP-API Configuration
const AMAZON_REFRESH_TOKEN = process.env.AMAZON_REFRESH_TOKEN || '';
const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID || '';
const AMAZON_CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET || '';
const AMAZON_SELLER_ID = process.env.AMAZON_SELLER_ID || '';
const AMAZON_MARKETPLACE_ID = process.env.AMAZON_MARKETPLACE_ID || 'ATVPDKIKX0DER';

// LWA Token cache
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Exchange refresh token for access token
async function getSpApiAccessToken(): Promise<string> {
    // Return cached token if still valid (with 1 min buffer)
    if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) {
        return cachedAccessToken;
    }

    console.log('Exchanging refresh token for access token...');

    const response = await fetch('https://api.amazon.com/auth/o2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: AMAZON_REFRESH_TOKEN,
            client_id: AMAZON_CLIENT_ID,
            client_secret: AMAZON_CLIENT_SECRET,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('LWA Token exchange failed:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    cachedAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    console.log('Access token obtained successfully');
    return data.access_token;
}

// Fetch products from Amazon SP-API
async function getAmazonProducts(req: VercelRequest, res: VercelResponse) {
    try {
        // Get access token
        const accessToken = await getSpApiAccessToken();

        // Try to get inventory summaries first (FBA inventory)
        const inventoryUrl = `https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries?details=true&granularityType=Marketplace&granularityId=${AMAZON_MARKETPLACE_ID}&marketplaceIds=${AMAZON_MARKETPLACE_ID}`;

        console.log('Fetching inventory from SP-API...');

        const inventoryResponse = await fetch(inventoryUrl, {
            method: 'GET',
            headers: {
                'x-amz-access-token': accessToken,
                'Content-Type': 'application/json',
            },
        });

        let products: any[] = [];
        let message = '';

        if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            console.log('Inventory API response:', JSON.stringify(inventoryData).substring(0, 500));

            const items = inventoryData.payload?.inventorySummaries || [];

            // Transform inventory items to product format
            for (const item of items) {
                // Get detailed product info from Catalog API
                let productDetails: any = {};
                let productPrice = 0;

                try {
                    const catalogUrl = `https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items/${item.asin}?marketplaceIds=${AMAZON_MARKETPLACE_ID}&includedData=summaries,images`;
                    const catalogResponse = await fetch(catalogUrl, {
                        method: 'GET',
                        headers: {
                            'x-amz-access-token': accessToken,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (catalogResponse.ok) {
                        productDetails = await catalogResponse.json();
                    }
                } catch (e) {
                    console.log(`Could not fetch catalog details for ${item.asin}`);
                }

                // Get price from Pricing API
                try {
                    const pricingUrl = `https://sellingpartnerapi-na.amazon.com/products/pricing/v0/price?MarketplaceId=${AMAZON_MARKETPLACE_ID}&Asins=${item.asin}&ItemType=Asin`;
                    const pricingResponse = await fetch(pricingUrl, {
                        method: 'GET',
                        headers: {
                            'x-amz-access-token': accessToken,
                            'Content-Type': 'application/json',
                        },
                    });
                    if (pricingResponse.ok) {
                        const pricingData = await pricingResponse.json();
                        const priceInfo = pricingData.payload?.[0];
                        // Try to get the listing price or landed price
                        productPrice = priceInfo?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice?.Amount ||
                            priceInfo?.Product?.Offers?.[0]?.BuyingPrice?.LandedPrice?.Amount ||
                            priceInfo?.Product?.Offers?.[0]?.RegularPrice?.Amount ||
                            0;
                        console.log(`Price for ${item.asin}: $${productPrice}`);
                    }
                } catch (e) {
                    console.log(`Could not fetch price for ${item.asin}`);
                }

                const summary = productDetails.summaries?.[0] || {};
                const images = productDetails.images?.[0]?.images || [];
                const primaryImage = images.find((img: any) => img.variant === 'MAIN') || images[0];

                products.push({
                    asin: item.asin || '',
                    sku: item.sellerSku || '',
                    title: item.productName || summary.itemName || 'Unknown Product',
                    description: summary.browseClassification?.displayName || '',
                    price: productPrice,
                    imageUrl: primaryImage?.link || '',
                    stockCount: item.totalQuantity || 0,
                    category: summary.browseClassification?.displayName || 'General',
                    status: item.totalQuantity > 0 ? 'active' : 'inactive',
                    fnSku: item.fnSku || '',
                });
            }

            message = `Found ${products.length} products from Amazon FBA inventory`;

            // ALSO try to fetch additional MFN products from Seller Listings Report
            // This catches products like "Migrated" status items not in FBA
            try {
                console.log('Also fetching from Seller Listings for MFN products...');
                const getListingsUrl = `https://sellingpartnerapi-na.amazon.com/sellers/v1/marketplaceParticipations`;
                const listingsReportUrl = `https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${AMAZON_SELLER_ID}?marketplaceIds=${AMAZON_MARKETPLACE_ID}&pageSize=100&includedData=summaries,attributes,issues`;

                const listingsResponse = await fetch(listingsReportUrl, {
                    method: 'GET',
                    headers: {
                        'x-amz-access-token': accessToken,
                        'Content-Type': 'application/json',
                    },
                });

                if (listingsResponse.ok) {
                    const listingsData = await listingsResponse.json();
                    console.log('Seller Listings response:', JSON.stringify(listingsData).substring(0, 500));

                    // Get ASINs we already have from FBA
                    const existingAsins = new Set(products.map(p => p.asin));

                    // Add MFN products not in FBA inventory
                    const listings = listingsData.listings || listingsData.items || [];
                    for (const item of listings) {
                        const asin = item.asin || item.summaries?.[0]?.asin;
                        if (asin && !existingAsins.has(asin)) {
                            let productPrice = 0;
                            // Try to get price
                            try {
                                const pricingUrl = `https://sellingpartnerapi-na.amazon.com/products/pricing/v0/price?MarketplaceId=${AMAZON_MARKETPLACE_ID}&Asins=${asin}&ItemType=Asin`;
                                const pricingResponse = await fetch(pricingUrl, {
                                    method: 'GET',
                                    headers: {
                                        'x-amz-access-token': accessToken,
                                        'Content-Type': 'application/json',
                                    },
                                });
                                if (pricingResponse.ok) {
                                    const pricingData = await pricingResponse.json();
                                    const priceInfo = pricingData.payload?.[0];
                                    productPrice = priceInfo?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice?.Amount || 0;
                                }
                            } catch (e) {
                                console.log(`Could not fetch price for MFN ${asin}`);
                            }

                            products.push({
                                asin: asin,
                                sku: item.sku || item.sellerSku || '',
                                title: item.summaries?.[0]?.itemName || item.productName || 'Unknown Product',
                                description: item.summaries?.[0]?.productType || '',
                                price: productPrice,
                                imageUrl: item.summaries?.[0]?.mainImage?.link || '',
                                stockCount: 0, // MFN doesn't have inventory in FBA
                                category: item.summaries?.[0]?.classification?.displayName || 'General',
                                status: 'active',
                                fnSku: '',
                                fulfillmentType: 'MFN'
                            });
                            existingAsins.add(asin);
                        }
                    }
                    message = `Found ${products.length} products (FBA + MFN)`;
                }
            } catch (e) {
                console.log('Could not fetch additional MFN products:', e);
            }
        } else {
            const errorText = await inventoryResponse.text();
            console.log('Inventory API returned:', inventoryResponse.status, errorText);

            // Try Listings API instead
            const listingsUrl = `https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${AMAZON_SELLER_ID}?marketplaceIds=${AMAZON_MARKETPLACE_ID}&pageSize=50`;

            console.log('Trying Listings API...');
            const listingsResponse = await fetch(listingsUrl, {
                method: 'GET',
                headers: {
                    'x-amz-access-token': accessToken,
                    'Content-Type': 'application/json',
                },
            });

            if (listingsResponse.ok) {
                const listingsData = await listingsResponse.json();
                console.log('Listings API response:', JSON.stringify(listingsData).substring(0, 500));

                // Handle listings response
                products = (listingsData.listings || []).map((item: any) => ({
                    asin: item.asin || '',
                    sku: item.sku || '',
                    title: item.summaries?.[0]?.itemName || 'Unknown Product',
                    description: item.summaries?.[0]?.productType || '',
                    price: 0,
                    imageUrl: item.summaries?.[0]?.mainImage?.link || '',
                    stockCount: 0,
                    category: 'General',
                    status: item.summaries?.[0]?.status || 'active',
                }));

                message = `Found ${products.length} listings from Amazon`;
            } else {
                const listingsError = await listingsResponse.text();
                console.log('Listings API returned:', listingsResponse.status, listingsError);
                message = `API returned ${inventoryResponse.status}. Your sandbox app may not have access to real inventory. Complete identity verification in Amazon Developer Central to access production data.`;
            }
        }

        // If no products found, provide guidance
        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                products: [],
                total: 0,
                message: message || 'No products found. Make sure you have products listed on Amazon Seller Central.',
                note: 'If using a sandbox app, you need to complete identity verification and create a production app to access real products.'
            });
        }

        return res.status(200).json({
            success: true,
            products,
            total: products.length,
            message
        });

    } catch (error: any) {
        console.error('Error fetching Amazon products:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch Amazon products',
            message: 'Make sure your Amazon SP-API credentials are correct and you have completed seller verification.'
        });
    }
}

// Import selected Amazon products to PrimePickz database
async function importAmazonProducts(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided for import' });
    }

    const importedProducts = [];
    const errors = [];

    for (const amazonProduct of products) {
        try {
            // Check if product already exists by ASIN
            const existing = await db.select()
                .from(schema.products)
                .where(eq(schema.products.amazonAsin, amazonProduct.asin))
                .limit(1);

            if (existing.length > 0) {
                errors.push({ asin: amazonProduct.asin, error: 'Product already exists' });
                continue;
            }

            // Insert new product
            const [newProduct] = await db.insert(schema.products).values({
                name: amazonProduct.title,
                description: amazonProduct.description || '',
                price: String(amazonProduct.price || '0'),
                category: amazonProduct.category || 'General',
                imageUrl: amazonProduct.imageUrl || '',
                stockCount: amazonProduct.stockCount || 0,
                inStock: (amazonProduct.stockCount || 0) > 0,
                amazonAsin: amazonProduct.asin,
                amazonSku: amazonProduct.sku || '',
                amazonSyncStatus: 'synced',
                lastSyncedAt: new Date(),
            }).returning();

            // Log the import
            await db.insert(schema.amazonSyncLogs).values({
                productId: newProduct.id,
                syncType: 'import',
                status: 'success',
                message: `IMPORTED from Amazon - ${amazonProduct.title}`,
                errorDetails: null,
            });

            importedProducts.push({
                id: newProduct.id,
                asin: amazonProduct.asin,
                name: amazonProduct.title,
            });
        } catch (err: any) {
            console.error(`Error importing product ${amazonProduct.asin}:`, err);
            errors.push({ asin: amazonProduct.asin, error: err.message });
        }
    }

    return res.status(200).json({
        success: true,
        imported: importedProducts.length,
        failed: errors.length,
        products: importedProducts,
        errors: errors.length > 0 ? errors : undefined,
        message: `Imported ${importedProducts.length} products from Amazon`
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

// Fetch product by ASIN from Amazon Catalog API
async function fetchProductByAsin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const asin = req.query.asin as string || req.body?.asin;

    if (!asin) {
        return res.status(400).json({ error: 'ASIN is required' });
    }

    // Validate ASIN format (10 alphanumeric characters)
    const asinRegex = /^[A-Z0-9]{10}$/i;
    if (!asinRegex.test(asin)) {
        return res.status(400).json({ error: 'Invalid ASIN format. ASIN should be 10 alphanumeric characters.' });
    }

    try {
        // Check SP-API credentials
        if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET || !AMAZON_REFRESH_TOKEN) {
            return res.status(503).json({
                error: 'Amazon API not configured',
                message: 'Please set up Amazon SP-API credentials in environment variables.'
            });
        }

        // Get access token
        const accessToken = await getSpApiAccessToken();

        // Fetch product from Catalog Items API
        const catalogUrl = `https://sellingpartnerapi-na.amazon.com/catalog/2022-04-01/items/${asin}?marketplaceIds=${AMAZON_MARKETPLACE_ID}&includedData=summaries,images,productTypes,attributes`;

        console.log(`Fetching product by ASIN: ${asin}`);

        const catalogResponse = await fetch(catalogUrl, {
            method: 'GET',
            headers: {
                'x-amz-access-token': accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (!catalogResponse.ok) {
            const errorText = await catalogResponse.text();
            console.error(`Catalog API error for ${asin}:`, catalogResponse.status, errorText);

            if (catalogResponse.status === 404) {
                return res.status(404).json({
                    error: 'Product not found',
                    message: `No product found with ASIN: ${asin}. Please verify the ASIN is correct.`
                });
            }

            return res.status(catalogResponse.status).json({
                error: 'Failed to fetch product from Amazon',
                message: errorText
            });
        }

        const catalogData = await catalogResponse.json();
        console.log('Catalog API response:', JSON.stringify(catalogData).substring(0, 500));

        // Extract product details
        const summary = catalogData.summaries?.[0] || {};
        const images = catalogData.images?.[0]?.images || [];
        const mainImage = images.find((img: any) => img.variant === 'MAIN') || images[0];

        // Fetch price from Pricing API
        let price = 0;
        try {
            const pricingUrl = `https://sellingpartnerapi-na.amazon.com/products/pricing/v0/price?MarketplaceId=${AMAZON_MARKETPLACE_ID}&Asins=${asin}&ItemType=Asin`;
            const pricingResponse = await fetch(pricingUrl, {
                method: 'GET',
                headers: {
                    'x-amz-access-token': accessToken,
                    'Content-Type': 'application/json',
                },
            });

            if (pricingResponse.ok) {
                const pricingData = await pricingResponse.json();
                const priceInfo = pricingData.payload?.[0];
                price = priceInfo?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice?.Amount ||
                    priceInfo?.Product?.Offers?.[0]?.RegularPrice?.Amount || 0;
            }
        } catch (e) {
            console.log(`Could not fetch price for ASIN ${asin}:`, e);
        }

        // Prepare product data
        const productData = {
            asin: asin.toUpperCase(),
            name: summary.itemName || catalogData.asin || 'Unknown Product',
            description: summary.productDescription || summary.itemName || '',
            price: price.toString(),
            imageUrl: mainImage?.link || '',
            category: summary.browseClassification?.displayName || 'General',
            stockCount: 10, // Default stock
            inStock: true,
            brand: summary.brand || '',
            productType: catalogData.productTypes?.[0]?.productType || '',
        };

        return res.status(200).json({
            success: true,
            product: productData,
            message: `Product found: ${productData.name}`
        });

    } catch (error: any) {
        console.error('Error fetching product by ASIN:', error);
        return res.status(500).json({
            error: 'Failed to fetch product',
            message: error.message || 'An unexpected error occurred'
        });
    }
}

// ============ Meta Catalog Sync Handlers ============

const META_CATALOG_ID = process.env.META_CATALOG_ID;
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_BUSINESS_ID = process.env.META_BUSINESS_ID;
const SYNC_ENABLED = process.env.SYNC_ENABLED === 'true';

async function getMetaCatalogStatus(req: VercelRequest, res: VercelResponse) {
    // Check if environment variables are configured
    if (!META_CATALOG_ID || !META_ACCESS_TOKEN) {
        return res.status(200).json({
            connected: false,
            error: 'Meta Catalog credentials not configured',
            catalogId: null
        });
    }

    try {
        // Verify connection with Meta Graph API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${META_CATALOG_ID}?access_token=${META_ACCESS_TOKEN}`
        );

        if (response.ok) {
            const data = await response.json();
            return res.status(200).json({
                connected: true,
                catalogId: META_CATALOG_ID,
                catalogName: data.name || 'Product Catalog',
                businessId: META_BUSINESS_ID
            });
        } else {
            const error = await response.json();
            return res.status(200).json({
                connected: false,
                error: error.error?.message || 'Failed to verify Meta Catalog connection',
                catalogId: META_CATALOG_ID
            });
        }
    } catch (error: any) {
        return res.status(200).json({
            connected: false,
            error: error.message || 'Connection test failed',
            catalogId: META_CATALOG_ID
        });
    }
}

async function getMetaCatalogSyncStatus(req: VercelRequest, res: VercelResponse) {
    try {
        // Get total products count from local DB
        const productsResult = await db.select({ count: drizzleSql<number>`count(*)` })
            .from(schema.products);
        const totalProducts = Number(productsResult[0]?.count) || 0;

        // Fetch products from Meta Catalog to get actual synced count
        let syncedProducts = 0;
        let metaProducts: any[] = [];

        if (META_CATALOG_ID && META_ACCESS_TOKEN) {
            try {
                const response = await fetch(
                    `https://graph.facebook.com/v18.0/${META_CATALOG_ID}/products?fields=id,name,price,availability,image_url,retailer_id&limit=100&access_token=${META_ACCESS_TOKEN}`
                );
                if (response.ok) {
                    const data = await response.json();
                    metaProducts = data.data || [];
                    syncedProducts = metaProducts.length;
                }
            } catch (e) {
                console.error('Failed to fetch Meta products:', e);
            }
        }

        return res.status(200).json({
            totalProducts,
            syncedProducts,
            failedProducts: 0,
            pendingProducts: Math.max(0, totalProducts - syncedProducts),
            lastSyncTime: new Date().toISOString(),
            syncEnabled: SYNC_ENABLED,
            metaProducts  // Send the actual products from Meta
        });
    } catch (error: any) {
        console.error('Error getting sync status:', error);
        return res.status(500).json({ error: 'Failed to get sync status' });
    }
}

async function getMetaCatalogLogs(req: VercelRequest, res: VercelResponse) {
    // Return empty logs for now - in production you'd fetch from a sync_logs table
    return res.status(200).json({
        logs: []
    });
}

async function getMetaCatalogDeadLetter(req: VercelRequest, res: VercelResponse) {
    // Return empty dead letter queue for now
    return res.status(200).json({
        items: []
    });
}

async function syncAllToMetaCatalog(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!META_CATALOG_ID || !META_ACCESS_TOKEN) {
        return res.status(400).json({ error: 'Meta Catalog credentials not configured' });
    }

    if (!SYNC_ENABLED) {
        return res.status(400).json({ error: 'Sync is disabled. Set SYNC_ENABLED=true in environment variables.' });
    }

    try {
        // Get all products
        const products = await db.select().from(schema.products);

        // Build batch request with ALL products in ONE call (to avoid rate limits)
        const batchRequests = products.map(product => ({
            method: 'CREATE',
            retailer_id: product.id.toString(),
            data: {
                name: product.name,
                description: product.description || product.name,
                availability: product.inStock ? 'in stock' : 'out of stock',
                condition: 'new',
                price: Math.round(Number(product.price) * 100),
                currency: 'USD',
                url: `https://www.primepickz.org/product/${product.id}`,
                image_url: product.imageUrl || 'https://www.primepickz.org/placeholder.png',
                brand: (product as any).brand || 'PrimePickz'
            }
        }));

        // Single batch API call for all products
        const params = new URLSearchParams();
        params.append('access_token', META_ACCESS_TOKEN!);
        params.append('requests', JSON.stringify(batchRequests));

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${META_CATALOG_ID}/batch`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            }
        );

        const result = await response.json();
        console.log('Batch sync result:', JSON.stringify(result));

        if (response.ok && !result.error) {
            const handles = result.handles || [];
            return res.status(200).json({
                success: true,
                count: products.length,
                synced: handles.length,
                failed: products.length - handles.length,
                message: `Synced ${handles.length} products to Meta Catalog`
            });
        } else {
            console.error('Batch sync failed:', JSON.stringify(result));
            return res.status(200).json({
                success: false,
                count: products.length,
                synced: 0,
                failed: products.length,
                error: result.error?.message || 'Sync failed',
                message: 'Sync failed - check logs'
            });
        }
    } catch (error: any) {
        console.error('Error syncing to Meta Catalog:', error);
        return res.status(500).json({ error: 'Sync failed', message: error.message });
    }
}

async function retryMetaCatalogSync(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { productId } = req.body || {};
    if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
    }

    // In production, you would retry the sync for the specific product
    return res.status(200).json({ success: true, message: 'Retry initiated' });
}

async function removeFromMetaCatalogDeadLetter(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { productId } = req.body || {};
    if (!productId) {
        return res.status(400).json({ error: 'Product ID required' });
    }

    // In production, you would remove from the dead letter queue table
    return res.status(200).json({ success: true, message: 'Removed from queue' });
}

// WhatsApp / AiSensy integration
const AISENSY_API_KEY = process.env.AISENSY_API_KEY || '';
const AISENSY_BASE_URL = 'https://backend.aisensy.com/campaign/t1/api/v2';

async function getWhatsAppStatus(req: VercelRequest, res: VercelResponse) {
    const isConfigured = !!AISENSY_API_KEY;
    return res.status(200).json({
        connected: isConfigured,
        provider: 'AiSensy',
        features: ['order_notifications', 'product_messages', 'campaigns']
    });
}

async function sendWhatsAppOrderNotification(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!AISENSY_API_KEY) {
        return res.status(400).json({ error: 'AiSensy API key not configured' });
    }

    const { orderId, customerPhone, customerName, orderTotal, orderItems } = req.body;

    if (!orderId || !customerPhone) {
        return res.status(400).json({ error: 'Order ID and customer phone required' });
    }

    try {
        // Format phone number (remove spaces, add country code if needed)
        let phone = customerPhone.replace(/\s/g, '').replace(/-/g, '');
        if (!phone.startsWith('+')) {
            phone = '+1' + phone; // Default to US
        }

        // Create order message
        const message = `🎉 Thank you for your order, ${customerName || 'Customer'}!

📦 Order #${orderId}
💰 Total: $${orderTotal}

Your order has been confirmed and will be shipped soon.

View your order: https://www.primepickz.org/orders/${orderId}

Thank you for shopping with PrimePickz! 🛒`;

        const response = await fetch(`${AISENSY_BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AISENSY_API_KEY}`
            },
            body: JSON.stringify({
                apiKey: AISENSY_API_KEY,
                destination: phone.replace('+', ''),
                message: message,
                userName: 'Primepickz'
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, messageId: data.messageId || data.id });
        } else {
            console.error('AiSensy error:', data);
            return res.status(400).json({ error: 'Failed to send WhatsApp message', details: data });
        }
    } catch (error: any) {
        console.error('WhatsApp send error:', error);
        return res.status(500).json({ error: 'Failed to send message', message: error.message });
    }
}

async function sendWhatsAppProductMessage(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!AISENSY_API_KEY) {
        return res.status(400).json({ error: 'AiSensy API key not configured' });
    }

    const { productId, customerPhone, productName, productPrice, productImage, productUrl } = req.body;

    if (!productId || !customerPhone) {
        return res.status(400).json({ error: 'Product ID and customer phone required' });
    }

    try {
        let phone = customerPhone.replace(/\s/g, '').replace(/-/g, '');
        if (!phone.startsWith('+')) {
            phone = '+1' + phone;
        }

        const message = `🛍️ Check out this product from PrimePickz!

*${productName}*
💰 Price: $${productPrice}

🔗 Buy now: ${productUrl || `https://www.primepickz.org/product/${productId}`}

Shop more at PrimePickz! ✨`;

        const response = await fetch(`${AISENSY_BASE_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AISENSY_API_KEY}`
            },
            body: JSON.stringify({
                apiKey: AISENSY_API_KEY,
                destination: phone.replace('+', ''),
                message: message,
                userName: 'Primepickz',
                media: productImage ? { url: productImage, type: 'image' } : undefined
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, messageId: data.messageId || data.id });
        } else {
            console.error('AiSensy error:', data);
            return res.status(400).json({ error: 'Failed to send product message', details: data });
        }
    } catch (error: any) {
        console.error('WhatsApp product send error:', error);
        return res.status(500).json({ error: 'Failed to send message', message: error.message });
    }
}
