/**
 * Alerting Service for Catalog Sync
 * 
 * Sends email alerts for sync failures and issues via Resend
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ALERT_EMAIL = process.env.ALERT_EMAIL || process.env.ADMIN_EMAIL || 'admin@primepickz.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'PrimePickz Catalog Sync <noreply@primepickz.com>';

export interface SyncAlertData {
    type: 'sync_failure' | 'auth_error' | 'reconciliation_mismatch' | 'rate_limit';
    productId?: string;
    retailerId?: string;
    error?: string;
    retryCount?: number;
    details?: Record<string, unknown>;
}

/**
 * Send a sync alert email
 */
export async function sendSyncAlert(alert: SyncAlertData): Promise<boolean> {
    if (!resend) {
        console.log('[Alerting] Resend not configured, skipping alert:', alert);
        return false;
    }

    const subject = getAlertSubject(alert);
    const html = getAlertHtml(alert);

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ALERT_EMAIL,
            subject,
            html,
        });

        console.log(`[Alerting] Alert sent: ${alert.type}`);
        return true;

    } catch (error) {
        console.error('[Alerting] Failed to send alert:', error);
        return false;
    }
}

/**
 * Get email subject based on alert type
 */
function getAlertSubject(alert: SyncAlertData): string {
    switch (alert.type) {
        case 'sync_failure':
            return `⚠️ [PrimePickz] Catalog Sync Failed - Product ${alert.productId}`;
        case 'auth_error':
            return `🚨 [PrimePickz] Meta API Authentication Error`;
        case 'reconciliation_mismatch':
            return `⚠️ [PrimePickz] Catalog Reconciliation Mismatch Detected`;
        case 'rate_limit':
            return `⏳ [PrimePickz] Meta API Rate Limit Warning`;
        default:
            return `[PrimePickz] Catalog Sync Alert`;
    }
}

/**
 * Generate HTML email content
 */
function getAlertHtml(alert: SyncAlertData): string {
    const timestamp = new Date().toISOString();

    let content = '';

    switch (alert.type) {
        case 'sync_failure':
            content = `
        <h2>Product Sync Failed</h2>
        <p><strong>Product ID:</strong> ${alert.productId}</p>
        <p><strong>Retailer ID:</strong> ${alert.retailerId}</p>
        <p><strong>Retry Count:</strong> ${alert.retryCount} (max reached, added to Dead Letter Queue)</p>
        <p><strong>Error:</strong></p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${alert.error}</pre>
        <p><a href="${process.env.SITE_URL}/admin/catalog-sync" style="color: #007bff;">View in Admin Dashboard →</a></p>
      `;
            break;

        case 'auth_error':
            content = `
        <h2>Meta API Authentication Error</h2>
        <p>The Meta Graph API access token may be expired or invalid.</p>
        <p><strong>Error:</strong></p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${alert.error}</pre>
        <h3>Action Required:</h3>
        <ol>
          <li>Go to Meta Business Manager</li>
          <li>Navigate to Business Settings → System Users</li>
          <li>Generate a new access token</li>
          <li>Update META_ACCESS_TOKEN in Vercel environment variables</li>
          <li>Redeploy the application</li>
        </ol>
      `;
            break;

        case 'reconciliation_mismatch':
            content = `
        <h2>Catalog Reconciliation Mismatch</h2>
        <p>The nightly reconciliation detected significant differences between PrimePickz and Meta Catalog.</p>
        ${alert.details ? `
          <p><strong>Missing in Meta:</strong> ${(alert.details as { missingInMeta?: number }).missingInMeta || 0} products</p>
          <p><strong>Orphaned in Meta:</strong> ${(alert.details as { orphanedInMeta?: number }).orphanedInMeta || 0} products</p>
          <p><strong>Stale in Meta:</strong> ${(alert.details as { staleInMeta?: number }).staleInMeta || 0} products</p>
        ` : ''}
        <p><a href="${process.env.SITE_URL}/admin/catalog-sync" style="color: #007bff;">View Details →</a></p>
      `;
            break;

        case 'rate_limit':
            content = `
        <h2>Meta API Rate Limit Warning</h2>
        <p>The Meta Graph API rate limit is being approached. Sync operations may be delayed.</p>
        <p><strong>Details:</strong></p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px;">${JSON.stringify(alert.details, null, 2)}</pre>
      `;
            break;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px; }
        pre { overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
        a { display: inline-block; margin-top: 15px; }
      </style>
    </head>
    <body>
      ${content}
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Timestamp: ${timestamp}<br>
        This is an automated alert from PrimePickz Catalog Sync.
      </p>
    </body>
    </html>
  `;
}

/**
 * Send daily sync summary (for nightly reconciliation)
 */
export async function sendDailySyncSummary(summary: {
    totalProducts: number;
    syncedToday: number;
    failedToday: number;
    deadLetterCount: number;
    reconciliationResults?: {
        missingInMeta: number;
        orphanedInMeta: number;
        fixed: number;
    };
}): Promise<boolean> {
    if (!resend) {
        console.log('[Alerting] Resend not configured, skipping daily summary');
        return false;
    }

    const subject = `📊 [PrimePickz] Daily Catalog Sync Summary - ${new Date().toLocaleDateString()}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #1976d2; }
        .stat { display: inline-block; background: #f5f5f5; padding: 15px 25px; margin: 5px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #1976d2; }
        .stat-label { font-size: 12px; color: #666; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
        .error { color: #f44336; }
      </style>
    </head>
    <body>
      <h2>📊 Daily Catalog Sync Summary</h2>
      
      <div>
        <div class="stat">
          <div class="stat-number">${summary.totalProducts}</div>
          <div class="stat-label">Total Products</div>
        </div>
        <div class="stat">
          <div class="stat-number success">${summary.syncedToday}</div>
          <div class="stat-label">Synced Today</div>
        </div>
        <div class="stat">
          <div class="stat-number ${summary.failedToday > 0 ? 'error' : ''}">${summary.failedToday}</div>
          <div class="stat-label">Failed Today</div>
        </div>
        <div class="stat">
          <div class="stat-number ${summary.deadLetterCount > 0 ? 'warning' : ''}">${summary.deadLetterCount}</div>
          <div class="stat-label">In Dead Letter Queue</div>
        </div>
      </div>

      ${summary.reconciliationResults ? `
        <h3>Reconciliation Results</h3>
        <ul>
          <li>Missing in Meta: ${summary.reconciliationResults.missingInMeta}</li>
          <li>Orphaned in Meta: ${summary.reconciliationResults.orphanedInMeta}</li>
          <li>Fixed automatically: ${summary.reconciliationResults.fixed}</li>
        </ul>
      ` : ''}

      <p><a href="${process.env.SITE_URL}/admin/catalog-sync" style="color: #1976d2;">View Dashboard →</a></p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Generated: ${new Date().toISOString()}<br>
        PrimePickz Catalog Sync
      </p>
    </body>
    </html>
  `;

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: ALERT_EMAIL,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('[Alerting] Failed to send daily summary:', error);
        return false;
    }
}
