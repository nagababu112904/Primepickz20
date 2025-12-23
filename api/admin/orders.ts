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
        // Get all orders with items
        const orders = await db.select()
            .from(schema.orders)
            .orderBy(drizzleSql`created_at DESC`);

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await db.select()
                    .from(schema.orderItems)
                    .where(drizzleSql`order_id = ${order.id}`);

                return {
                    ...order,
                    items,
                };
            })
        );

        return res.status(200).json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
