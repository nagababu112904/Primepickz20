import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

/**
 * Test endpoint for email configuration
 * Usage: GET /api/test-email?to=your@email.com
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const diagnostics: Record<string, any> = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
    };

    // Check required environment variables
    diagnostics.envVars = {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set (hidden)' : 'NOT SET ❌',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set (hidden)' : 'NOT SET ❌',
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'Set (hidden)' : 'NOT SET ❌',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET ❌',
    };

    // Check if we should send test email
    const testEmail = req.query.to as string;

    if (!process.env.RESEND_API_KEY) {
        diagnostics.emailStatus = 'Cannot send - RESEND_API_KEY not configured';
        diagnostics.instructions = [
            '1. Sign up for Resend at https://resend.com',
            '2. Get your API key from the dashboard',
            '3. Add RESEND_API_KEY to Vercel environment variables',
            '4. Redeploy the application',
        ];
        return res.status(503).json(diagnostics);
    }

    if (!testEmail) {
        diagnostics.emailStatus = 'Ready to send';
        diagnostics.usage = 'Add ?to=your@email.com to send a test email';
        return res.status(200).json(diagnostics);
    }

    // Try to send test email
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: 'PrimePickz <noreply@primepickz.org>',
            to: testEmail,
            subject: '✅ PrimePickz Email Test - Success!',
            html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a365d; text-align: center;">✅ Email Test Successful!</h1>
        <p style="color: #666; line-height: 1.6; text-align: center;">
            If you're reading this, email delivery from PrimePickz is working correctly.
        </p>
        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">Test Details</p>
            <p style="margin: 4px 0; color: #333;">
                <strong>Time:</strong> ${new Date().toISOString()}<br>
                <strong>To:</strong> ${testEmail}
            </p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            © 2024 Prime Pickz
        </p>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            diagnostics.emailStatus = 'Failed to send';
            diagnostics.error = error;
            return res.status(500).json(diagnostics);
        }

        diagnostics.emailStatus = 'Sent successfully!';
        diagnostics.emailId = data?.id;
        diagnostics.sentTo = testEmail;
        return res.status(200).json(diagnostics);

    } catch (error: any) {
        diagnostics.emailStatus = 'Exception during send';
        diagnostics.error = error.message;
        return res.status(500).json(diagnostics);
    }
}
