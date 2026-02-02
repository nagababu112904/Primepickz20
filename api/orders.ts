import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

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

    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email parameter is required' });
    }

    try {
        // Get orders for this email
        const orders = await db.select()
            .from(schema.orders)
            .where(eq(schema.orders.email, email.toLowerCase()))
            .orderBy(drizzleSql`created_at DESC`);

        // Get items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await db.select()
                    .from(schema.orderItems)
                    .where(eq(schema.orderItems.orderId, order.id));

                return {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    createdAt: order.createdAt,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    total: order.totalAmount,
                    items: items.map(item => ({
                        id: item.id,
                        name: item.productName,
                        quantity: item.quantity,
                        price: item.price,
                        imageUrl: item.productImageUrl,
                    })),
                };
            })
        );

        return res.status(200).json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
