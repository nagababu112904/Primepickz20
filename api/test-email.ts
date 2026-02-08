import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { to } = req.body;
    
    if (!to) {
        return res.status(400).json({ error: 'Missing "to" email address' });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ 
            error: 'SMTP not configured',
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASS: !!process.env.SMTP_PASS
        });
    }

    try {
        console.log('Creating transporter with:', process.env.SMTP_USER);
        
        const transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified!');

        console.log('Sending test email to:', to);
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: '✅ PrimePickz Test Email',
            html: `
                <h1>Test Email Successful!</h1>
                <p>If you're seeing this, SMTP is working correctly.</p>
                <p>Sent at: ${new Date().toISOString()}</p>
            `,
        });

        console.log('Email sent:', info.messageId);
        
        return res.status(200).json({ 
            success: true, 
            messageId: info.messageId,
            response: info.response
        });

    } catch (error: any) {
        console.error('SMTP Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code,
            command: error.command
        });
    }
}
