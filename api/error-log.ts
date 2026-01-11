import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

interface ErrorLogEntry {
    error: string;
    stack?: string;
    componentStack?: string;
    url: string;
    timestamp: string;
    userAgent?: string;
    level?: string;
    data?: unknown;
}

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

    try {
        const errorData: ErrorLogEntry = req.body;

        // Log to console for Vercel logs
        console.error('=== CLIENT ERROR REPORT ===');
        console.error(`URL: ${errorData.url}`);
        console.error(`Time: ${errorData.timestamp}`);
        console.error(`Error: ${errorData.error}`);
        if (errorData.level) {
            console.error(`Level: ${errorData.level}`);
        }
        if (errorData.stack) {
            console.error(`Stack: ${errorData.stack}`);
        }
        if (errorData.componentStack) {
            console.error(`Component Stack: ${errorData.componentStack}`);
        }
        if (errorData.userAgent) {
            console.error(`User Agent: ${errorData.userAgent}`);
        }
        console.error('=== END ERROR REPORT ===');

        // Store in database if needed (optional - you can add an error_logs table)
        // For now, just log to Vercel's logging system

        // Try to store in database if the table exists
        try {
            await db.execute(`
                INSERT INTO error_logs (error_message, error_stack, url, user_agent, created_at)
                VALUES ($1, $2, $3, $4, NOW())
            `, [
                errorData.error || 'Unknown error',
                (errorData.stack || '') + (errorData.componentStack || ''),
                errorData.url || 'Unknown',
                errorData.userAgent || 'Unknown'
            ]);
        } catch (dbError) {
            // Table might not exist, that's ok - we still logged to console
            console.warn('Could not store error in database:', dbError);
        }

        return res.status(200).json({
            success: true,
            message: 'Error logged successfully'
        });

    } catch (error) {
        console.error('Error logging failed:', error);
        // Still return 200 to not cascade errors
        return res.status(200).json({
            success: false,
            message: 'Error logging failed but acknowledged'
        });
    }
}
