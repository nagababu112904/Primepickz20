import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import Stripe from 'stripe';
import { sendOrderConfirmation, notifyAdminNewOrder } from '../lib/email.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Stripe webhook: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
        return res.status(503).json({ error: 'Webhook not configured' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: Stripe.Event;

    try {
        // Get raw body for signature verification
        const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const orderId = session.metadata?.orderId;
                const orderNumber = session.metadata?.orderNumber;

                if (orderId) {
                    // Update order status
                    await db.update(schema.orders)
                        .set({
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            paymentMethod: `stripe:${session.id}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(schema.orders.id, orderId));

                    // Reduce stock for ordered items
                    const orderItems = await db.select()
                        .from(schema.orderItems)
                        .where(eq(schema.orderItems.orderId, orderId));

                    for (const item of orderItems) {
                        await db.update(schema.products)
                            .set({
                                stockCount: drizzleSql`GREATEST(0, stock_count - ${item.quantity})`,
                                updatedAt: new Date(),
                            })
                            .where(eq(schema.products.id, item.productId));
                    }

                    // Send order confirmation and admin notification emails
                    if (session.customer_email) {
                        const orderData = await db.select()
                            .from(schema.orders)
                            .where(eq(schema.orders.id, orderId))
                            .limit(1);

                        if (orderData[0]) {
                            const items = orderItems.map(item => ({
                                name: item.productName || 'Product',
                                quantity: item.quantity,
                                price: item.price?.toString() || '0',
                            }));

                            const emailOrder = {
                                orderNumber: orderNumber || orderData[0].orderNumber,
                                customerEmail: session.customer_email,
                                customerName: session.customer_details?.name || 'Valued Customer',
                                items,
                                subtotal: ((session.amount_total || 0) / 100).toFixed(2),
                                shipping: '0',
                                total: ((session.amount_total || 0) / 100).toFixed(2),
                            };

                            // Send order confirmation to customer
                            await sendOrderConfirmation(emailOrder);

                            // Notify admin of new order
                            await notifyAdminNewOrder(emailOrder);
                        }
                    }

                    console.log(`Order ${orderNumber} payment completed successfully`);
                }
                break;
            }

            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.orderId;

                if (orderId) {
                    await db.update(schema.orders)
                        .set({
                            status: 'cancelled',
                            paymentStatus: 'expired',
                            updatedAt: new Date(),
                        })
                        .where(eq(schema.orders.id, orderId));

                    console.log(`Order ${session.metadata?.orderNumber} payment expired`);
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log(`Payment failed: ${paymentIntent.id}`);
                // Could update order status here if needed
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                console.log(`Charge refunded: ${charge.id}`);
                // TODO: Update order status and process refund
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}

// Configure for raw body parsing
export const config = {
    api: {
        bodyParser: false,
    },
};
