import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import Stripe from 'stripe';
import { Resend } from 'resend';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// Using Resend HTTP API (works on Vercel serverless, SMTP is blocked)
async function sendOrderConfirmationEmail(order: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: string }>;
    total: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price}</td>
        </tr>
    `).join('');

    try {
        console.log('Sending email via Resend to:', order.customerEmail);
        const { data, error } = await resend.emails.send({
            from: 'PrimePickz <sales@primepickz.org>',
            to: order.customerEmail,
            subject: `Order Confirmed - ${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #1a365d;">🎉 Order Confirmed!</h1>
                    <p>Hi ${order.customerName},</p>
                    <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        ${itemsHtml}
                        <tr>
                            <td style="padding: 12px 8px; font-weight: bold;">Total</td>
                            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #1a365d;">$${order.total}</td>
                        </tr>
                    </table>
                    <p>Thank you for shopping with PrimePickz!</p>
                    <p style="color: #666; font-size: 14px;">Questions? Reply to this email or contact sales@primepickz.org</p>
                </div>
            `,
            replyTo: 'sales@primepickz.org',
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        console.log('Email sent successfully via Resend:', data?.id);
        return { success: true, emailId: data?.id };
    } catch (error: any) {
        console.error('Resend Error:', error.message);
        return { success: false, error: error.message };
    }
}

// Log Order Notification to Database
async function logOrderNotification(order: any) {
    try {
        await db.insert(schema.emailLogs).values({
            type: 'order_notification',
            orderId: order.orderNumber,
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            subject: `🛒 New Order: ${order.orderNumber} - $${order.total}`,
            items: order.items,
            total: order.total,
            status: 'unread',
            metadata: { subtotal: order.subtotal, shipping: order.shipping },
        });
        return { success: true };
    } catch (error: any) {
        console.error('Failed to log order:', error);
        return { success: false, error: error.message };
    }
}

// Helper to get raw body from Vercel request
async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        req.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        req.on('end', () => {
            resolve(Buffer.concat(chunks));
        });

        req.on('error', reject);
    });
}

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
        const rawBody = await getRawBody(req);
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
                    // Update order status and save email from Stripe
                    await db.update(schema.orders)
                        .set({
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            email: session.customer_email?.toLowerCase(),
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
                    console.log('Customer email from Stripe:', session.customer_email);
                    console.log('Order ID:', orderId);

                    if (session.customer_email) {
                        console.log('Fetching order data for email...');
                        const orderData = await db.select()
                            .from(schema.orders)
                            .where(eq(schema.orders.id, orderId))
                            .limit(1);

                        console.log('Order data found:', orderData.length > 0 ? 'YES' : 'NO');
                        console.log('Order items count:', orderItems.length);

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

                            console.log('Email order prepared:', JSON.stringify(emailOrder));
                            console.log('Calling sendOrderConfirmationEmail...');

                            // Send order confirmation to customer
                            const emailResult = await sendOrderConfirmationEmail(emailOrder);
                            console.log('Email send result:', JSON.stringify(emailResult));

                            if (!emailResult.success) {
                                console.error('Failed to send confirmation email:', emailResult.error);
                            }

                            // Log order notification for admin dashboard (instead of emailing admin)
                            const logResult = await logOrderNotification(emailOrder);
                            console.log('Admin notification log result:', JSON.stringify(logResult));
                        } else {
                            console.error('Order data not found for orderId:', orderId);
                        }
                    } else {
                        console.error('No customer email in Stripe session');
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
