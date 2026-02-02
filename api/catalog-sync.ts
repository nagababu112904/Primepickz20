/**
 * Catalog Sync API Endpoints
 * 
 * Handles:
 * - Manual sync triggers
 * - Sync status queries
 * - Dead letter queue management
 * - Reconciliation triggers
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, desc, gt, gte, lte, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import { metaCatalogSync, metaSyncLogs, metaSyncDeadLetter } from '../../shared/meta-catalog-schema.js';
import { verifyToken, extractToken } from '../../server/lib/auth.js';
import {
    syncProduct,
    getSyncStatus,
    getDeadLetterItems,
    retryDeadLetterItem,
    getProductSyncLogs,
} from '../../server/lib/catalog-sync-processor.js';
import { getMetaCatalogClient } from '../../server/lib/meta-catalog-client.js';
import { transformToMetaProduct } from '../../server/lib/meta-catalog-transformer.js';
import type { MetaCatalogProduct } from '../../shared/meta-catalog-schema.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { ...schema, metaCatalogSync, metaSyncLogs, metaSyncDeadLetter } });

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'primepickz-secret';

/**
 * Verify admin authentication
 */
function checkAdminAuth(req: VercelRequest): { authorized: boolean; error?: string } {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
        return { authorized: false, error: 'Missing authorization header' };
    }

    const payload = verifyToken(token);
    if (!payload) {
        return { authorized: false, error: 'Invalid or expired token' };
    }

    if (payload.role !== 'admin') {
        return { authorized: false, error: 'Admin access required' };
    }

    return { authorized: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check admin auth
    const auth = checkAdminAuth(req);
    if (!auth.authorized) {
        return res.status(401).json({ error: auth.error });
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'status':
                return handleGetStatus(req, res);
            case 'sync':
                return handleSyncProduct(req, res);
            case 'sync-all':
                return handleSyncAll(req, res);
            case 'dead-letter':
                return handleDeadLetter(req, res);
            case 'retry':
                return handleRetry(req, res);
            case 'logs':
                return handleGetLogs(req, res);
            case 'verify':
                return handleVerifyConnection(req, res);
            case 'export-csv':
                return handleExportCsv(req, res);
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('[CatalogSync API] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * GET /api/catalog-sync?action=status
 * Get overall sync status and recent items
 */
async function handleGetStatus(req: VercelRequest, res: VercelResponse) {
    const limit = parseInt(req.query.limit as string) || 100;
    const status = await getSyncStatus(limit);
    return res.status(200).json(status);
}

/**
 * POST /api/catalog-sync?action=sync
 * Sync a single product
 */
async function handleSyncProduct(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { productId, operation = 'UPDATE' } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
    }

    const result = await syncProduct(productId, operation as 'CREATE' | 'UPDATE' | 'DELETE');

    return res.status(result.success ? 200 : 500).json(result);
}

/**
 * POST /api/catalog-sync?action=sync-all
 * Sync all products (for initial sync or full reconciliation)
 */
async function handleSyncAll(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { batchSize = 50 } = req.body;

    // Fetch all products
    const products = await db.select()
        .from(schema.products)
        .orderBy(desc(schema.products.createdAt));

    const results = {
        total: products.length,
        success: 0,
        failed: 0,
        errors: [] as Array<{ productId: string; error: string }>,
    };

    // Process in batches
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        await Promise.all(batch.map(async (product) => {
            const result = await syncProduct(product.id, 'UPDATE');
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({ productId: product.id, error: result.error || 'Unknown error' });
            }
        }));
    }

    return res.status(200).json(results);
}

/**
 * GET /api/catalog-sync?action=dead-letter
 * Get items in dead letter queue
 */
async function handleDeadLetter(req: VercelRequest, res: VercelResponse) {
    const limit = parseInt(req.query.limit as string) || 50;
    const items = await getDeadLetterItems(limit);
    return res.status(200).json({ items, total: items.length });
}

/**
 * POST /api/catalog-sync?action=retry
 * Retry a dead letter item
 */
async function handleRetry(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, productId } = req.body;

    if (id) {
        // Retry by dead letter ID
        const result = await retryDeadLetterItem(parseInt(id));
        if (!result) {
            return res.status(404).json({ error: 'Dead letter item not found' });
        }
        return res.status(result.success ? 200 : 500).json(result);
    }

    if (productId) {
        // Retry by product ID
        const result = await syncProduct(productId, 'UPDATE');
        return res.status(result.success ? 200 : 500).json(result);
    }

    return res.status(400).json({ error: 'id or productId is required' });
}

/**
 * GET /api/catalog-sync?action=logs&productId=xxx
 * Get sync logs for a product
 */
async function handleGetLogs(req: VercelRequest, res: VercelResponse) {
    const { productId } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (productId && typeof productId === 'string') {
        const logs = await getProductSyncLogs(productId, limit);
        return res.status(200).json({ logs });
    }

    // Get recent logs across all products
    const logs = await db.select()
        .from(metaSyncLogs)
        .orderBy(desc(metaSyncLogs.createdAt))
        .limit(limit);

    return res.status(200).json({ logs });
}

/**
 * GET /api/catalog-sync?action=verify
 * Verify Meta API connection and permissions
 */
async function handleVerifyConnection(req: VercelRequest, res: VercelResponse) {
    const client = getMetaCatalogClient();

    // Check configuration
    const configCheck = client.validateConfig();
    if (!configCheck.valid) {
        return res.status(400).json({
            connected: false,
            error: `Missing configuration: ${configCheck.missing.join(', ')}`,
        });
    }

    // Try to access catalog
    const result = await client.verifyCatalogAccess();

    if (!result.success) {
        return res.status(400).json({
            connected: false,
            error: result.error?.message || 'Failed to connect to Meta API',
            errorCode: result.error?.code,
        });
    }

    return res.status(200).json({
        connected: true,
        catalog: result.data,
    });
}

/**
 * GET /api/catalog-sync?action=export-csv
 * Export catalog as CSV for manual fallback
 */
async function handleExportCsv(req: VercelRequest, res: VercelResponse) {
    // Fetch all products
    const products = await db.select()
        .from(schema.products)
        .orderBy(desc(schema.products.createdAt));

    // Transform to Meta format
    const metaProducts = products.map(transformToMetaProduct);

    // Generate CSV
    const headers = [
        'retailer_id',
        'name',
        'description',
        'price',
        'currency',
        'availability',
        'image_url',
        'url',
        'condition',
        'category',
    ];

    const rows = metaProducts.map(p => [
        p.retailer_id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        (p.price / 100).toFixed(2),
        p.currency,
        p.availability,
        p.image_url,
        p.url,
        p.condition || 'new',
        p.category || '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="primepickz-catalog-${new Date().toISOString().split('T')[0]}.csv"`);

    return res.status(200).send(csv);
}
