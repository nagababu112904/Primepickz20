import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';
import { insertCartItemSchema } from '../shared/schema.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Handle specific cart item operations (PATCH/DELETE with id)
    const { id, sessionId } = req.query;

    if (id && typeof id === 'string') {
        if (req.method === 'PATCH') {
            // Update cart item quantity
            try {
                const { quantity } = req.body;

                if (typeof quantity !== 'number' || quantity < 1) {
                    return res.status(400).json({ error: 'Invalid quantity' });
                }

                const updatedItem = await storage.updateCartItemQuantity(id, quantity);

                if (!updatedItem) {
                    return res.status(404).json({ error: 'Cart item not found' });
                }

                return res.status(200).json(updatedItem);
            } catch (error) {
                console.error('Error updating cart item:', error);
                return res.status(500).json({ error: 'Failed to update cart item' });
            }
        } else if (req.method === 'DELETE') {
            // Remove from cart
            try {
                const deleted = await storage.removeFromCart(id);

                if (!deleted) {
                    return res.status(404).json({ error: 'Cart item not found' });
                }

                return res.status(200).json({ success: true });
            } catch (error) {
                console.error('Error removing from cart:', error);
                return res.status(500).json({ error: 'Failed to remove cart item' });
            }
        }
    }

    // Handle cart collection operations
    if (req.method === 'GET') {
        // Get cart items
        try {
            const session = (sessionId as string) || 'default-session';
            const cartItems = await storage.getCartItems(session);
            return res.status(200).json(cartItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
            return res.status(500).json({ error: 'Failed to fetch cart items' });
        }
    } else if (req.method === 'POST') {
        // Add to cart
        try {
            const validatedData = insertCartItemSchema.parse(req.body);
            const session = validatedData.sessionId || 'default-session';
            const cartItem = await storage.addToCart({
                ...validatedData,
                sessionId: session,
            });
            return res.status(200).json(cartItem);
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            } else {
                return res.status(400).json({ error: 'Invalid request data' });
            }
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
// Trigger rebuild Mon Feb  9 16:29:09 IST 2026
