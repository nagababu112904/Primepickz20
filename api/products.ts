import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    const { id } = req.query;

    // Get single product if ID provided
    if (id && typeof id === 'string') {
        try {
            const product = await storage.getProduct(id);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    // Get all products
    try {
        const products = await storage.getAllProducts();
        return res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Failed to fetch products' });
    }
}
