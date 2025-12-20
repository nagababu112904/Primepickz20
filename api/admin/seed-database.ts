import type { VercelRequest, VercelResponse } from '@vercel/node';
import { seed } from '../../server/seed.js';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('🌱 Starting database seed from admin endpoint...');
        await seed();
        res.status(200).json({ success: true, message: 'Database seeded successfully!' });
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).json({ error: 'Failed to seed database' });
    }
}
