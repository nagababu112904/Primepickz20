import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const { productId } = req.query;

    try {
        if (productId && typeof productId === 'string') {
            // Get reviews for specific product
            const reviews = await storage.getReviewsByProduct(productId);
            return res.status(200).json(reviews);
        } else {
            // Get all reviews
            const reviews = await storage.getAllReviews();
            return res.status(200).json(reviews);
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
}
