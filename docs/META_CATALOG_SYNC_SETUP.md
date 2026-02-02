# Complete Setup Guide: Meta Catalog + WhatsApp Integration

## Overview

This guide walks you through setting up everything from scratch to sync your PrimePickz products to WhatsApp.

**Time Required:** 30-45 minutes

---

## Part 1: Create Meta Business Manager Account

### Step 1.1: Go to Meta Business Suite
1. Open browser and go to: **https://business.facebook.com**
2. Click **"Create Account"** or **"Get Started"**

### Step 1.2: Fill Business Details
1. **Business Name:** Enter "PrimePickz" (or your business name)
2. **Your Name:** Your full name
3. **Business Email:** Use a business email (e.g., admin@primepickz.com)
4. Click **"Submit"**

### Step 1.3: Verify Your Email
1. Check your email inbox
2. Click the verification link from Meta
3. You'll be redirected back to Business Manager

**✅ Checkpoint:** You should now see the Business Suite dashboard.

---

## Part 2: Create a Product Catalog

### Step 2.1: Open Commerce Manager
1. In Business Suite, click the **hamburger menu (☰)** on the left
2. Click **"All Tools"**
3. Under "Sell products and services", click **"Commerce Manager"**

### Step 2.2: Create New Catalog
1. Click **"Add catalog"** or **"Get Started"**
2. Select **"E-commerce"** as catalog type
3. Click **"Next"**

### Step 2.3: Configure Catalog
1. **Catalog Name:** "PrimePickz Products"
2. **Upload Method:** Select **"Connect a partner platform"** → **"Other"**
   - OR select **"Upload product info"** (we'll use API instead)
3. Click **"Create"**

### Step 2.4: Get Your Catalog ID
1. After creation, you'll be in Commerce Manager
2. Look at the URL in your browser - it will look like:
   ```
   https://business.facebook.com/commerce/catalogs/123456789012345
   ```
3. The number (e.g., `123456789012345`) is your **Catalog ID**
4. **Save this number** - you'll need it later as `META_CATALOG_ID`

**✅ Checkpoint:** You have a catalog created and noted the Catalog ID.

---

## Part 3: Create a System User

System Users are special accounts for API access.

### Step 3.1: Open Business Settings
1. Go to: **https://business.facebook.com/settings**
2. Or click **Settings (⚙️)** → **Business Settings**

### Step 3.2: Navigate to System Users
1. In the left sidebar, click **"Users"**
2. Click **"System Users"**

### Step 3.3: Create New System User
1. Click **"Add"** button
2. **System Username:** "CatalogSync"
3. **System User Role:** Select **"Admin"**
4. Click **"Create System User"**

### Step 3.4: Assign Catalog Access
1. Click on your new "CatalogSync" user
2. Click **"Add Assets"**
3. Select **"Catalogs"** from the asset type
4. Find and select **"PrimePickz Products"** (your catalog)
5. Enable **"Full Control"** permission
6. Click **"Save Changes"**

**✅ Checkpoint:** System user created with catalog access.

---

## Part 4: Generate Access Token

### Step 4.1: Generate Token
1. Still in System Users, click on **"CatalogSync"**
2. Click **"Generate New Token"**
3. You'll see a list of permissions - select:
   - ✅ `catalog_management`
   - ✅ `business_management` (optional, but recommended)
4. Click **"Generate Token"**

### Step 4.2: Copy and Save Token
1. A token will appear (starts with `EAA...`)
2. **IMPORTANT:** Copy this token immediately!
3. Save it somewhere secure - you won't see it again
4. This is your `META_ACCESS_TOKEN`

> ⚠️ **Warning:** Never share this token. It grants full access to your catalog.

**✅ Checkpoint:** You have the access token saved.

---

## Part 5: Get Your Business ID

### Step 5.1: Find Business ID
1. In Business Settings, click **"Business Info"** in the left sidebar
2. You'll see **"Business ID"** displayed
3. Copy this number (e.g., `987654321098765`)
4. This is your `META_BUSINESS_ID`

**✅ Checkpoint:** You have all three Meta values:
- `META_CATALOG_ID`
- `META_ACCESS_TOKEN`
- `META_BUSINESS_ID`

---

## Part 6: Set Up Resend for Email Alerts

### Step 6.1: Create Resend Account
1. Go to: **https://resend.com**
2. Click **"Start for free"**
3. Sign up with your email

### Step 6.2: Verify Domain (Optional but recommended)
1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `primepickz.com`)
4. Add the DNS records shown to your domain provider
5. Click **"Verify"**

> If you skip domain verification, you can still send from `onboarding@resend.dev`

### Step 6.3: Get API Key
1. In Resend dashboard, go to **"API Keys"**
2. Click **"Create API Key"**
3. **Name:** "PrimePickz Alerts"
4. **Permission:** "Sending access"
5. Click **"Add"**
6. Copy the API key (starts with `re_...`)
7. This is your `RESEND_API_KEY`

**✅ Checkpoint:** You have the Resend API key.

---

## Part 7: Add Environment Variables to Vercel

### Step 7.1: Open Vercel Project
1. Go to: **https://vercel.com**
2. Sign in and open your PrimePickz project

### Step 7.2: Navigate to Environment Variables
1. Click on your project
2. Go to **"Settings"** tab
3. Click **"Environment Variables"** in the sidebar

### Step 7.3: Add Each Variable
Add these one by one:

| Name | Value | Environment |
|------|-------|-------------|
| `META_ACCESS_TOKEN` | Your token (EAA...) | Production |
| `META_CATALOG_ID` | Your catalog ID | Production |
| `META_BUSINESS_ID` | Your business ID | Production |
| `RESEND_API_KEY` | Your Resend key (re_...) | Production |
| `ALERT_EMAIL` | admin@primepickz.com | Production |
| `FROM_EMAIL` | noreply@primepickz.com | Production |
| `SYNC_ENABLED` | true | Production |
| `SITE_URL` | https://primepicklz.com | Production |
| `CRON_SECRET` | (generate random string) | Production |

> **Tip:** For CRON_SECRET, use a random string generator or type random characters.

### Step 7.4: Save All Variables
1. After adding each variable, click **"Save"**
2. Make sure all variables are added

**✅ Checkpoint:** All environment variables added to Vercel.

---

## Part 8: Deploy Your Changes

### Step 8.1: Push Code to GitHub
Run these commands in your terminal:

```bash
cd /Users/nagababu/Desktop/got/PrimePickz
git add .
git commit -m "Add Meta Catalog Sync integration"
git push origin main
```

### Step 8.2: Verify Deployment
1. Go to Vercel dashboard
2. Watch the deployment progress
3. Wait for "Ready" status

### Step 8.3: Run Database Migration
In your terminal:

```bash
cd /Users/nagababu/Desktop/got/PrimePickz
npx drizzle-kit push
```

This creates the new database tables.

**✅ Checkpoint:** Code deployed and database updated.

---

## Part 9: Test the Integration

### Step 9.1: Open Admin Dashboard
1. Go to your site: **https://primepicklz.com/admin** (or your domain)
2. Log in with admin credentials

### Step 9.2: Navigate to Meta Catalog
1. In the admin sidebar, click **"Meta Catalog"** under Tools

### Step 9.3: Verify Connection
1. Click the **"Verify"** button
2. You should see: "Connected to catalog: PrimePickz Products"

### Step 9.4: Sync Products
1. Click **"Sync All Products"**
2. Watch the status update
3. Products should show as "Synced"

**✅ Checkpoint:** Products are syncing to Meta!

---

## Part 10: Set Up AiSensy for WhatsApp

### Step 10.1: Create AiSensy Account
1. Go to: **https://aisensy.com**
2. Click **"Start Free Trial"** or **"Sign Up"**
3. Fill in your details

### Step 10.2: Complete WhatsApp Business Verification
1. AiSensy will guide you through WhatsApp Business API setup
2. You'll need to verify your business phone number
3. Follow their onboarding wizard

### Step 10.3: Link Meta Catalog
1. In AiSensy dashboard, go to **"Settings"** → **"Catalog"**
2. Click **"Connect Meta Catalog"**
3. Enter your **Catalog ID** (same as `META_CATALOG_ID`)
4. Authorize the connection

### Step 10.4: Test Product Message
1. In AiSensy, create a test broadcast
2. Select **"Product Message"** type
3. Choose a product from your catalog
4. Send to your own WhatsApp number

**✅ Checkpoint:** Products visible in WhatsApp!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid token" | Regenerate System User token in Meta Business Manager |
| "Catalog not found" | Double-check Catalog ID in Commerce Manager URL |
| Products not syncing | Check SYNC_ENABLED=true in Vercel |
| No email alerts | Verify Resend API key and domain |
| Connection failed | Check all environment variables are saved |

---

## Summary of Values You Collected

Copy this template and fill in your values:

```env
META_ACCESS_TOKEN=EAA...
META_CATALOG_ID=123456789012345
META_BUSINESS_ID=987654321098765
RESEND_API_KEY=re_...
ALERT_EMAIL=your-email@primepickz.com
FROM_EMAIL=noreply@primepickz.com
SYNC_ENABLED=true
SITE_URL=https://primepicklz.com
CRON_SECRET=your-random-string-here
```

---

## You're Done! 🎉

Your PrimePickz products will now automatically sync to Meta's Product Catalog, and customers can browse them directly in WhatsApp through AiSensy.

Any time you add, update, or delete a product in your admin panel, it will automatically update in Meta and WhatsApp!
