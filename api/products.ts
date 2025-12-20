import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    try {
        const products = await storage.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}
