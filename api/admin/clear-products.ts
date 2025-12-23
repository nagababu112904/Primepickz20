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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Delete all products
        await db.delete(schema.products);

        // Also clear related data
        await db.delete(schema.cartItems);
        await db.delete(schema.wishlistItems);
        await db.delete(schema.amazonSyncLogs);

        return res.status(200).json({
            success: true,
            message: 'All products and related data cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing products:', error);
        return res.status(500).json({ error: 'Failed to clear products' });
    }
}
