import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check for API key
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({
            error: 'RESEND_API_KEY not configured',
            configured: false
        });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address required in body' });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const result = await resend.emails.send({
            from: 'PrimePickz <onboarding@resend.dev>',
            to: email,
            subject: 'Test Email from PrimePickz',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1 style="color: #1a365d;">🎉 Email Test Successful!</h1>
                    <p>This is a test email from PrimePickz.</p>
                    <p>If you received this, the email system is working correctly.</p>
                    <p style="color: #666; margin-top: 20px;">Sent at: ${new Date().toISOString()}</p>
                </div>
            `,
        });

        console.log('Test email result:', JSON.stringify(result));

        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error.message,
                details: result.error
            });
        }

        return res.status(200).json({
            success: true,
            emailId: result.data?.id,
            message: `Test email sent to ${email}`
        });
    } catch (error: any) {
        console.error('Test email error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
