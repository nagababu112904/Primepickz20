import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';
import Stripe from 'stripe';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://primepickz.org';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, customerEmail, shippingAddress, sessionId } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Shipping address is required' });
        }

        // Fetch product details for each cart item
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        let totalAmount = 0;

        for (const item of items) {
            const products = await db.select()
                .from(schema.products)
                .where(eq(schema.products.id, item.productId))
                .limit(1);

            if (products.length === 0) {
                return res.status(400).json({ error: `Product not found: ${item.productId}` });
            }

            const product = products[0];
            const price = parseFloat(product.price);
            const quantity = item.quantity || 1;

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description.substring(0, 500),
                        images: product.imageUrl ? [product.imageUrl] : [],
                    },
                    unit_amount: Math.round(price * 100), // Stripe uses cents
                },
                quantity,
            });

            totalAmount += price * quantity;
        }

        // Create order in database (pending payment)
        const orderNumber = `PP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // First, create or get the shipping address
        let addressId = shippingAddress.id;

        if (!addressId) {
            const newAddress = await db.insert(schema.addresses).values({
                userId: sessionId || 'guest',
                fullName: shippingAddress.fullName,
                phone: shippingAddress.phone,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city,
                state: shippingAddress.state,
                pincode: shippingAddress.pincode || shippingAddress.zipCode,
            }).returning();
            addressId = newAddress[0].id;
        }

        // Create the order
        const newOrder = await db.insert(schema.orders).values({
            userId: sessionId || 'guest',
            orderNumber,
            status: 'pending',
            totalAmount: totalAmount.toFixed(2),
            shippingAddressId: addressId,
            paymentMethod: 'stripe',
            paymentStatus: 'pending',
        }).returning();

        // Create order items
        for (const item of items) {
            const products = await db.select()
                .from(schema.products)
                .where(eq(schema.products.id, item.productId))
                .limit(1);

            if (products.length > 0) {
                const product = products[0];
                await db.insert(schema.orderItems).values({
                    orderId: newOrder[0].id,
                    productId: item.productId,
                    quantity: item.quantity || 1,
                    price: product.price,
                    productName: product.name,
                    productImageUrl: product.imageUrl,
                });
            }
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${FRONTEND_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order=${orderNumber}`,
            cancel_url: `${FRONTEND_URL}/checkout?canceled=true`,
            customer_email: customerEmail || undefined,
            metadata: {
                orderId: newOrder[0].id,
                orderNumber,
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'IN'],
            },
            billing_address_collection: 'required',
        });

        // Update order with Stripe session ID
        await db.update(schema.orders)
            .set({
                paymentMethod: `stripe:${session.id}`,
            })
            .where(eq(schema.orders.id, newOrder[0].id));

        return res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
            orderNumber,
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);

        if (error instanceof Stripe.errors.StripeError) {
            return res.status(400).json({
                error: 'Payment error',
                message: error.message
            });
        }

        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
}
