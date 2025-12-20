import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage.js';
import OpenAI from 'openai';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Check if OpenAI is configured
        const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(503).json({
                error: 'Chat functionality is currently unavailable. Please call us at 475-239-6334 for support.'
            });
        }

        const openai = new OpenAI({
            apiKey,
            baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        });

        // Fetch real products and categories for dynamic context
        const products = await storage.getAllProducts();
        const categories = await storage.getAllCategories();

        const categoryNames = categories.map(c => c.name).join(', ');
        const topProducts = products.slice(0, 15).map(p => `${p.name} ($${Number(p.price).toFixed(2)}) - ${p.category}`).join('\n');
        const avgPrice = products.length > 0
            ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(2)
            : '0';

        const systemPrompt = `You are an expert customer support agent for Prime Pickz, a premium USA-based e-commerce store in Trumbull, Connecticut.

🏢 COMPANY INFO:
- Name: Prime Pickz | Phone: 475-239-6334
- Email: support@primepickz.com

📦 OUR PRODUCTS:
We have ${products.length} products across ${categories.length} categories: ${categoryNames}

Sample Products:
${topProducts}

Average Price: $${avgPrice}

KEY POLICIES:
SHIPPING: Free on $99+, 3-5 days standard
RETURNS: 7-day policy, free return shipping on $50+
CONTACT: 24/7 chat, 10am-6pm EST phone

Be friendly, warm, and solution-focused.`;

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...conversationHistory.slice(-6),
            { role: 'user' as const, content: message },
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 300,
        });

        const reply = completion.choices[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({ error: 'Failed to generate response' });
        }

        res.status(200).json({ reply });
    } catch (error) {
        console.error('[CHAT ERROR]', error);
        res.status(500).json({
            error: 'Sorry, I couldn\'t process your request. Please try again or call 475-239-6334.'
        });
    }
}
