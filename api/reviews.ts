import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql, avg } from 'drizzle-orm';
import * as schema from '../shared/schema.js';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { productId } = req.query;

    try {
        if (req.method === 'GET') {
            if (productId && typeof productId === 'string') {
                // Get reviews for specific product
                const reviews = await db.select()
                    .from(schema.reviews)
                    .where(eq(schema.reviews.productId, productId))
                    .orderBy(drizzleSql`created_at DESC`);
                return res.status(200).json(reviews);
            } else {
                // Get all reviews
                const reviews = await db.select()
                    .from(schema.reviews)
                    .orderBy(drizzleSql`created_at DESC`)
                    .limit(50);
                return res.status(200).json(reviews);
            }
        }

        if (req.method === 'POST') {
            const {
                productId: pid,
                rating,
                title,
                comment,
                customerName,
                customerLocation,
                photos = []
            } = req.body;

            // Validate required fields
            if (!pid || !rating || !comment || !customerName) {
                return res.status(400).json({
                    error: 'Missing required fields: productId, rating, comment, customerName'
                });
            }

            // Validate rating
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }

            // Create the review
            const newReview = await db.insert(schema.reviews).values({
                productId: pid,
                rating,
                title: title || null,
                comment,
                customerName,
                customerLocation: customerLocation || null,
                photos: photos || [],
                date: new Date().toISOString().split('T')[0],
                verified: false,
                createdAt: new Date(),
            }).returning();

            // Update product's average rating
            const productReviews = await db.select({ rating: schema.reviews.rating })
                .from(schema.reviews)
                .where(eq(schema.reviews.productId, pid));

            const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
            const reviewCount = productReviews.length;

            await db.update(schema.products)
                .set({
                    rating: avgRating.toFixed(1),
                    reviewCount: reviewCount,
                    updatedAt: new Date()
                })
                .where(eq(schema.products.id, pid));

            return res.status(201).json({
                success: true,
                review: newReview[0],
                productRating: avgRating.toFixed(1),
                productReviewCount: reviewCount
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error handling reviews:', error);
        res.status(500).json({ error: 'Failed to process review request' });
    }
}
