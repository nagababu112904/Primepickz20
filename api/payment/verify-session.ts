import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import Stripe from 'stripe';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { session_id, order } = req.query;

    try {
        if (session_id && typeof session_id === 'string') {
            // Verify session with Stripe
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (session.payment_status === 'paid') {
                const orderNumber = session.metadata?.orderNumber || order;

                // Get order details
                const orders = await db.select()
                    .from(schema.orders)
                    .where(eq(schema.orders.orderNumber, orderNumber as string))
                    .limit(1);

                if (orders.length === 0) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                const orderData = orders[0];

                // Get order items
                const items = await db.select()
                    .from(schema.orderItems)
                    .where(eq(schema.orderItems.orderId, orderData.id));

                // Get shipping address
                const addresses = await db.select()
                    .from(schema.addresses)
                    .where(eq(schema.addresses.id, orderData.shippingAddressId))
                    .limit(1);

                return res.status(200).json({
                    success: true,
                    order: {
                        ...orderData,
                        items,
                        shippingAddress: addresses[0] || null,
                    },
                    payment: {
                        status: 'paid',
                        amount: session.amount_total ? session.amount_total / 100 : parseFloat(orderData.totalAmount),
                        currency: session.currency?.toUpperCase() || 'USD',
                    }
                });
            } else {
                return res.status(400).json({
                    error: 'Payment not completed',
                    paymentStatus: session.payment_status
                });
            }
        }

        // If no session_id, try to get order by orderNumber
        if (order && typeof order === 'string') {
            const orders = await db.select()
                .from(schema.orders)
                .where(eq(schema.orders.orderNumber, order))
                .limit(1);

            if (orders.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            const orderData = orders[0];
            const items = await db.select()
                .from(schema.orderItems)
                .where(eq(schema.orderItems.orderId, orderData.id));

            const addresses = await db.select()
                .from(schema.addresses)
                .where(eq(schema.addresses.id, orderData.shippingAddressId))
                .limit(1);

            return res.status(200).json({
                success: true,
                order: {
                    ...orderData,
                    items,
                    shippingAddress: addresses[0] || null,
                }
            });
        }

        return res.status(400).json({ error: 'Session ID or order number required' });

    } catch (error) {
        console.error('Verify session error:', error);
        return res.status(500).json({ error: 'Failed to verify payment' });
    }
}
