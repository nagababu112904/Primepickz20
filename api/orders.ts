import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // PATCH: Cancel an order
    if (req.method === 'PATCH') {
        const { orderId, action } = req.body;
        if (action !== 'cancel' || !orderId) {
            return res.status(400).json({ error: 'Invalid request. Provide orderId and action=cancel.' });
        }
        try {
            const orders = await db.select()
                .from(schema.orders)
                .where(eq(schema.orders.id, orderId))
                .limit(1);
            if (orders.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            const order = orders[0];
            if (!['pending', 'confirmed'].includes(order.status)) {
                return res.status(400).json({ error: `Cannot cancel order with status: ${order.status}` });
            }
            await db.update(schema.orders)
                .set({ status: 'cancelled', updatedAt: new Date() })
                .where(eq(schema.orders.id, orderId));
            return res.status(200).json({ success: true, message: 'Order cancelled' });
        } catch (error) {
            console.error('Error cancelling order:', error);
            return res.status(500).json({ error: 'Failed to cancel order' });
        }
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
