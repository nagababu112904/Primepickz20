import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql, ilike, or } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            case 'PUT':
                return handlePut(req, res);
            case 'DELETE':
                return handleDelete(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Admin products error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
    const { search, category, syncStatus } = req.query;

    let query = db.select().from(schema.products);

    // Apply filters would need dynamic query building
    // For now, return all products sorted by creation date
    const products = await db.select()
        .from(schema.products)
        .orderBy(drizzleSql`created_at DESC`);

    return res.status(200).json(products);
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
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

    // Log the product creation
    await db.insert(schema.amazonSyncLogs).values({
        productId: newProduct[0].id,
        syncType: 'product',
        status: 'pending',
        message: `Product "${body.name}" created - pending Amazon sync`,
    });

    return res.status(201).json(newProduct[0]);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
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
            rating: body.rating?.toString(),
            reviewCount: body.reviewCount,
            inStock: body.inStock,
            stockCount: body.stockCount,
            tags: body.tags,
            badge: body.badge,
            freeShipping: body.freeShipping,
            variants: body.variants,
            amazonAsin: body.amazonAsin,
            amazonSku: body.amazonSku,
            amazonSyncStatus: 'pending', // Mark as pending after update
            updatedAt: new Date(),
        })
        .where(eq(schema.products.id, id))
        .returning();

    if (!updatedProduct.length) {
        return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(updatedProduct[0]);
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
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

    return res.status(200).json({ success: true, message: 'Product deleted' });
}
