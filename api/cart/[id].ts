import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Cart item ID is required' });
    }

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
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
