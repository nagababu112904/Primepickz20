import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow GET for easy testing
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Use GET request' });
    }

    const testEmail = req.query.email as string || 'sales@primepickz.org';

    console.log('=== TEST EMAIL ENDPOINT ===');
    console.log('Test email to:', testEmail);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY first 10 chars:', process.env.RESEND_API_KEY?.substring(0, 10));

    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({
            success: false,
            error: 'RESEND_API_KEY not configured',
            envCheck: {
                hasKey: false,
            }
        });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        console.log('Calling resend.emails.send()...');

        const { data, error } = await resend.emails.send({
            from: 'PrimePickz <sales@primepickz.org>',
            to: testEmail,
            subject: 'Test Email from PrimePickz - ' + new Date().toISOString(),
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1>🎉 Test Email Successful!</h1>
                    <p>This is a test email from PrimePickz.</p>
                    <p>Sent at: ${new Date().toISOString()}</p>
                    <p>If you received this, email is working!</p>
                </div>
            `,
        });

        console.log('Resend response:', { data, error });

        if (error) {
            console.error('Resend error:', error);
            return res.status(400).json({
                success: false,
                error: error,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email sent successfully!',
            emailId: data?.id,
            sentTo: testEmail,
        });

    } catch (err: any) {
        console.error('Exception:', err);
        return res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack,
        });
    }
}
