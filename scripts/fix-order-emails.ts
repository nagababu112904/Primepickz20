import { neon } from '@neondatabase/serverless';

// Read DATABASE_URL from environment (set in .env file, loaded by shell)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not set. Run with: source .env && npx tsx scripts/fix-order-emails.ts');
}
const sql = neon(DATABASE_URL);

async function fixOrderEmails() {
    console.log('Fixing order emails...');

    // Update existing orders with email from email_logs
    const result = await sql`
        UPDATE orders o
        SET email = LOWER(e.customer_email)
        FROM email_logs e
        WHERE o.order_number = e.order_number
        AND o.email IS NULL
        AND e.customer_email IS NOT NULL
    `;
    console.log('Fixed order emails:', result);

    // Show current orders with emails
    const orders = await sql`SELECT id, order_number, email, status FROM orders ORDER BY created_at DESC LIMIT 10`;
    console.log('Recent orders:', orders);
}

fixOrderEmails().then(() => console.log('Done')).catch(console.error);
