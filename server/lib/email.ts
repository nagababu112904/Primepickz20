import { Resend } from 'resend';

// Initialize Resend client
const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured');
        return null;
    }
    return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = 'PrimePickz <noreply@primepickz.org>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@primepickz.org';

interface OrderDetails {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    items: Array<{
        name: string;
        quantity: number;
        price: string;
        imageUrl?: string;
    }>;
    subtotal: string;
    shipping: string;
    total: string;
    shippingAddress?: {
        name: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
}

// Order Confirmation Email
export async function sendOrderConfirmation(order: OrderDetails) {
    const resend = getResend();
    if (!resend) {
        console.log('Email skipped: Resend not configured');
        return { success: false, error: 'Email service not configured' };
    }

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong><br>
                <span style="color: #666;">Qty: ${item.quantity}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                $${item.price}
            </td>
        </tr>
    `).join('');

    const addressHtml = order.shippingAddress ? `
        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-top: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #333;">Shipping Address</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                ${order.shippingAddress.country}
            </p>
        </div>
    ` : '';

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: `Order Confirmed - ${order.orderNumber}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Thank you for shopping with Prime Pickz</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
            <p style="color: #333; font-size: 16px; margin: 0 0 24px 0;">
                Hi <strong>${order.customerName}</strong>,
            </p>
            <p style="color: #666; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! Your order has been confirmed and is being processed. 
                You'll receive another email when your order ships.
            </p>

            <!-- Order Number -->
            <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #1a365d;">${order.orderNumber}</p>
            </div>

            <!-- Order Items -->
            <h3 style="margin: 0 0 16px 0; color: #333;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">Subtotal</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${order.subtotal}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">Shipping</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${order.shipping === '0' ? 'Free' : '$' + order.shipping}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: bold; font-size: 18px;">Total</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #1a365d;">$${order.total}</td>
                </tr>
            </table>

            ${addressHtml}

            <!-- CTA -->
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://primepickz.org/orders" 
                   style="display: inline-block; background: #d97706; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Track Your Order
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 24px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@primepickz.org" style="color: #d97706;">support@primepickz.org</a>
            </p>
            <p style="margin: 12px 0 0 0; color: #999; font-size: 12px;">
                © 2024 Prime Pickz. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
            `,
        });

        if (error) {
            console.error('Failed to send order confirmation:', error);
            return { success: false, error: error.message };
        }

        console.log('Order confirmation sent:', data?.id);
        return { success: true, emailId: data?.id };
    } catch (error: any) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

// Shipping Update Email
export async function sendShippingUpdate(order: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
}) {
    const resend = getResend();
    if (!resend) return { success: false, error: 'Email service not configured' };

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: order.customerEmail,
            subject: `Your Order Has Shipped! - ${order.orderNumber}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #1a365d; text-align: center;">📦 Your Order Has Shipped!</h1>
        
        <p style="color: #666; line-height: 1.6;">Hi ${order.customerName},</p>
        <p style="color: #666; line-height: 1.6;">
            Great news! Your order <strong>${order.orderNumber}</strong> is on its way to you.
        </p>

        ${order.trackingNumber ? `
        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">Tracking Number</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #1a365d;">${order.trackingNumber}</p>
            ${order.carrier ? `<p style="margin: 4px 0 0 0; color: #666;">Carrier: ${order.carrier}</p>` : ''}
        </div>
        ` : ''}

        ${order.trackingUrl ? `
        <div style="text-align: center; margin-top: 24px;">
            <a href="${order.trackingUrl}" style="display: inline-block; background: #d97706; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Track Package
            </a>
        </div>
        ` : ''}

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
            © 2024 Prime Pickz
        </p>
    </div>
</body>
</html>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, emailId: data?.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Admin Notification for New Order
export async function notifyAdminNewOrder(order: OrderDetails) {
    const resend = getResend();
    if (!resend) return { success: false, error: 'Email service not configured' };

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `🛒 New Order: ${order.orderNumber} - $${order.total}`,
            html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
    <h2>New Order Received!</h2>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
    <p><strong>Total:</strong> $${order.total}</p>
    <p><strong>Items:</strong></p>
    <ul>
        ${order.items.map(i => `<li>${i.name} x ${i.quantity} - $${i.price}</li>`).join('')}
    </ul>
    <a href="https://primepickz.org/admin" style="display: inline-block; background: #1a365d; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
        View in Admin Dashboard
    </a>
</body>
</html>
            `,
        });

        if (error) return { success: false, error: error.message };
        return { success: true, emailId: data?.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
