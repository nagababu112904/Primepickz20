import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';
import { insertCartItemSchema } from '../shared/schema.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method === 'GET') {
        // Get cart items
        try {
            const sessionId = (req.query.sessionId as string) || 'default-session';
            const cartItems = await storage.getCartItems(sessionId);
            res.status(200).json(cartItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ error: 'Failed to fetch cart items' });
        }
    } else if (req.method === 'POST') {
        // Add to cart
        try {
            const validatedData = insertCartItemSchema.parse(req.body);
            const sessionId = validatedData.sessionId || 'default-session';
            const cartItem = await storage.addToCart({
                ...validatedData,
                sessionId,
            });
            res.status(200).json(cartItem);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(400).json({ error: 'Invalid request data' });
            }
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
