# Environment Variables Setup Guide

This document explains all environment variables required for PrimePickz and how to obtain them.

## Required Variables

### DATABASE_URL
**Purpose**: Connection string for your PostgreSQL database

**Where to get it**: 
1. Sign up at [Neon](https://neon.tech) for a free PostgreSQL database
2. Create a new project
3. Copy the connection string from the dashboard
4. It will look like: `postgresql://username:password@hostname.neon.tech/database?sslmode=require`

**Example**:
```
DATABASE_URL=postgresql://myuser:mypass123@ep-cool-cloud-123456.us-east-1.aws.neon.tech/primepickz?sslmode=require
```

---

### SESSION_SECRET
**Purpose**: Encrypts user session data for security

**Where to get it**:
Generate a secure random string. You can use one of these methods:

**Method 1: Using OpenSSL (Mac/Linux)**
```bash
openssl rand -base64 32
```

**Method 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Online Generator**
Visit a password generator and create a 32+ character random string

**Example**:
```
SESSION_SECRET=x8jK3m9pL2qN7rT4vW6yZ1aC5dF8hJ0k
```

---

### NODE_ENV
**Purpose**: Tells the application which environment it's running in

**For Vercel/Production**:
```
NODE_ENV=production
```

**For Local Development**:
```
NODE_ENV=development
```

---

### PORT
**Purpose**: Which port the server runs on

**Note**: Vercel handles this automatically, you usually don't need to set this

**For Local Development**:
```
PORT=5000
```

---

## Optional Variables

### OPENAI_API_KEY
**Purpose**: Enables AI-powered chat functionality

**Where to get it**:
1. Sign up at [OpenAI](https://platform.openai.com)
2. Go to [API Keys](https://platform.openai.com/api-keys)
3. Create a new secret key
4. Copy and save it immediately (you won't be able to see it again)

**Example**:
```
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu
```

**Cost**: OpenAI charges per API call. The chat feature uses GPT models which cost ~$0.002 per 1000 tokens. Monitor your usage in the OpenAI dashboard.

---

## Setting Up Environment Variables

### For Local Development

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` with your actual values:
```bash
DATABASE_URL=postgresql://your-actual-connection-string
SESSION_SECRET=your-generated-secret-here
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=sk-your-key-here
```

3. **Never commit .env to Git!** (It's already in .gitignore)

### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string
   - Environment: Production (and optionally Preview/Development)
   - Click "Save"
4. Repeat for all required variables

### For Testing

After setting up environment variables:

**Local Testing**:
```bash
npm run dev
# Visit http://localhost:5000
```

**Production Build Test**:
```bash
npm run build
npm start
```

---

## Security Best Practices

1. **Never share** your `.env` file or commit it to GitHub
2. **Rotate secrets** periodically, especially if they may have been exposed
3. **Use different values** for development and production
4. **Limit API key permissions** where possible
5. **Monitor usage** of paid services (OpenAI, database)

---

## Troubleshooting

### Error: "Cannot connect to database"
- Verify your `DATABASE_URL` is correct
- Check that the database is active in Neon dashboard
- Ensure `?sslmode=require` is at the end of the URL

### Error: "Invalid session secret"
- Make sure `SESSION_SECRET` is at least 32 characters
- Verify there are no spaces or special characters that might be escaped

### OpenAI API not working
- Check your API key is valid
- Verify you have credits in your OpenAI account
- Check the OpenAI service status page

---

## Environment Variable Checklist

Before deploying, verify you have:
- [ ] `DATABASE_URL` - From Neon
- [ ] `SESSION_SECRET` - Generated securely
- [ ] `NODE_ENV` - Set to `production`
- [ ] `OPENAI_API_KEY` - Optional, for chat feature

---

**Need Help?**
- Neon Docs: https://neon.tech/docs
- Vercel Docs: https://vercel.com/docs/environment-variables
- OpenAI Docs: https://platform.openai.com/docs
