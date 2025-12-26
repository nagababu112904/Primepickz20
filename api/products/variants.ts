import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../../shared/schema.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { productId, variantId } = req.query;

    try {
        switch (req.method) {
            case 'GET': {
                // Get variants for a product
                if (!productId || typeof productId !== 'string') {
                    return res.status(400).json({ error: 'Product ID required' });
                }

                const variants = await db.select()
                    .from(schema.productVariants)
                    .where(eq(schema.productVariants.productId, productId))
                    .orderBy(drizzleSql`size, color`);

                return res.status(200).json(variants);
            }

            case 'POST': {
                // Create a new variant
                const { productId: pid, size, color, colorHex, price, comparePrice, stock, sku } = req.body;

                if (!pid || !price) {
                    return res.status(400).json({ error: 'Product ID and price are required' });
                }

                const newVariant = await db.insert(schema.productVariants).values({
                    productId: pid,
                    size: size || null,
                    color: color || null,
                    colorHex: colorHex || null,
                    price: price.toString(),
                    comparePrice: comparePrice?.toString() || null,
                    stock: stock || 0,
                    sku: sku || null,
                }).returning();

                // Update product to indicate it has variants
                await db.update(schema.products)
                    .set({ hasVariants: true, updatedAt: new Date() })
                    .where(eq(schema.products.id, pid));

                return res.status(201).json(newVariant[0]);
            }
            case 'PUT': {
                // Update a variant
                if (!variantId || typeof variantId !== 'string') {
                    return res.status(400).json({ error: 'Variant ID required' });
                }

                const { size, color, colorHex, price, comparePrice, stock, sku } = req.body;

                const updatedVariant = await db.update(schema.productVariants)
                    .set({
                        size,
                        color,
                        colorHex,
                        price: price?.toString(),
                        comparePrice: comparePrice?.toString(),
                        stock,
                        sku,
                    })
                    .where(eq(schema.productVariants.id, variantId))
                    .returning();

                if (!updatedVariant.length) {
                    return res.status(404).json({ error: 'Variant not found' });
                }

                return res.status(200).json(updatedVariant[0]);
            }

            case 'DELETE': {
                // Delete a variant
                if (!variantId || typeof variantId !== 'string') {
                    return res.status(400).json({ error: 'Variant ID required' });
                }

                // Get the variant to find its product ID
                const variant = await db.select()
                    .from(schema.productVariants)
                    .where(eq(schema.productVariants.id, variantId))
                    .limit(1);

                if (variant.length === 0) {
                    return res.status(404).json({ error: 'Variant not found' });
                }

                await db.delete(schema.productVariants)
                    .where(eq(schema.productVariants.id, variantId));

                // Check if product still has variants
                const remainingVariants = await db.select()
                    .from(schema.productVariants)
                    .where(eq(schema.productVariants.productId, variant[0].productId));

                if (remainingVariants.length === 0) {
                    await db.update(schema.products)
                        .set({ hasVariants: false, updatedAt: new Date() })
                        .where(eq(schema.products.id, variant[0].productId));
                }

                return res.status(200).json({ success: true });
            }

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Variants API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
