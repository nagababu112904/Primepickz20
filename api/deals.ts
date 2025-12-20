import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    try {
        const deals = await storage.getAllDeals();
        res.status(200).json(deals);
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
}
