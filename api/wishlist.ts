import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const ALLOWED_ORIGINS = ['https://primepickz.org', 'https://www.primepickz.org'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS - locked to production domain
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Get userId from query params (primary) or Authorization header (fallback)
    let userId = (req.query.userId as string) || '';
    if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                userId = payload.user_id || payload.sub || '';
            } catch {
                // fallback - userId stays empty
            }
        }
    }

    // GET: Fetch user's wishlist
    if (req.method === 'GET') {
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const items = await db.select()
                .from(schema.wishlistItems)
                .where(eq(schema.wishlistItems.userId, userId));

            // Fetch product details for each wishlist item
            const itemsWithProducts = await Promise.all(
                items.map(async (item) => {
                    const products = await db.select()
                        .from(schema.products)
                        .where(eq(schema.products.id, item.productId))
                        .limit(1);
                    return {
                        ...item,
                        product: products[0] || null,
                    };
                })
            );

            return res.status(200).json(itemsWithProducts);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            return res.status(500).json({ error: 'Failed to fetch wishlist' });
        }
    }

    // POST: Add to wishlist
    if (req.method === 'POST') {
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }
        try {
            // Check if already in wishlist
            const existing = await db.select()
                .from(schema.wishlistItems)
                .where(and(
                    eq(schema.wishlistItems.userId, userId),
                    eq(schema.wishlistItems.productId, productId)
                ))
                .limit(1);

            if (existing.length > 0) {
                return res.status(200).json({ message: 'Already in wishlist', item: existing[0] });
            }

            const newItem = await db.insert(schema.wishlistItems).values({
                userId,
                productId,
            }).returning();

            return res.status(201).json(newItem[0]);
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return res.status(500).json({ error: 'Failed to add to wishlist' });
        }
    }

    // DELETE: Remove from wishlist
    if (req.method === 'DELETE') {
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Accept productId from query param ?id= or ?productId=
        const productId = (req.query.id as string) || (req.query.productId as string) || '';
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required (use ?id= or ?productId= query param)' });
        }
        try {
            await db.delete(schema.wishlistItems)
                .where(and(
                    eq(schema.wishlistItems.userId, userId),
                    eq(schema.wishlistItems.productId, productId)
                ));
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return res.status(500).json({ error: 'Failed to remove from wishlist' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
