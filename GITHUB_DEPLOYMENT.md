# Deploying PrimePickz to Vercel via GitHub

This guide walks you through deploying your PrimePickz e-commerce application to Vercel using GitHub as your source control.

## Prerequisites

Before you begin, make sure you have:
- A GitHub account ([sign up here](https://github.com/join))
- A Vercel account ([sign up here](https://vercel.com/signup))
- A Neon database or PostgreSQL database with connection URL

---

## Step 1: Set Up Your Neon Database

1. **Create a Neon Account**
   - Go to [Neon](https://neon.tech)
   - Sign up for a free account

2. **Create a New Database**
   - Click "Create Project"
   - Choose a region close to your users
   - Copy the connection URL (it will look like: `postgresql://user:pass@host.neon.tech/dbname`)
   - Save this URL - you'll need it for Vercel environment variables

3. **Initialize Your Database**
   - Once deployed, you'll need to run the database migrations
   - This will be covered in Step 6

---

## Step 2: Create a GitHub Repository

1. **Create New Repository**
   - Go to [GitHub](https://github.com) and sign in
   - Click the "+" icon in the top right → "New repository"
   - Name it `primepickz` (or your preferred name)
   - Make it **Public** or **Private** (your choice)
   - Do NOT initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Copy the Repository URL**
   - You'll see a URL like: `https://github.com/yourusername/primepickz.git`
   - Keep this page open - you'll need these commands

---

## Step 3: Push Your Code to GitHub

Open Terminal and navigate to your PrimePickz project folder:

```bash
cd /Users/nagababu/Desktop/got/PrimePickz
```

Initialize Git and push to GitHub:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit the changes
git commit -m "Initial commit - PrimePickz e-commerce app"

# Add your GitHub repository as remote
# Replace with YOUR repository URL from Step 2
git remote add origin https://github.com/yourusername/primepickz.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: If you get an error about remote already exists, run:
```bash
git remote remove origin
git remote add origin https://github.com/yourusername/primepickz.git
git push -u origin main
```

---

## Step 4: Connect GitHub Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - If this is your first time, click "Connect GitHub Account"
   - Authorize Vercel to access your GitHub repositories

3. **Select Your Repository**
   - Find `primepickz` in the list
   - Click "Import"

---

## Step 5: Configure Environment Variables in Vercel

Before deploying, you MUST set up environment variables:

1. **In the Vercel Project Setup**
   - You should see "Configure Project" page
   - Scroll down to "Environment Variables" section

2. **Add These Required Variables** (one at a time):

   **DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string from Step 1
   - Example: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`

   **SESSION_SECRET**
   - Name: `SESSION_SECRET`
   - Value: Generate a random secure string
   - You can generate one by running in terminal: `openssl rand -base64 32`
   - Or use any random 32+ character string

   **NODE_ENV**
   - Name: `NODE_ENV`
   - Value: `production`

   **PORT** (optional - Vercel handles this automatically)
   - Name: `PORT`
   - Value: `5000`

   **OPENAI_API_KEY** (optional - only if you want chat functionality)
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)

3. **Click "Deploy"**

---

## Step 6: Initialize Your Database

After your first deployment:

1. **Go to Vercel Dashboard**
   - Find your project
   - Click on it to open project details

2. **Open the Vercel Terminal** (or use your local terminal)
   ```bash
   # Install dependencies first if needed
   npm install
   
   # Push database schema to Neon
   npm run db:push
   ```

   This creates all the necessary tables in your database.

3. **Verify Deployment**
   - Vercel will provide you a URL like: `https://primepickz.vercel.app`
   - Click the URL to visit your live site!

---

## Step 7: Test Your Deployment

1. **Visit Your Live URL**
   - Go to your Vercel deployment URL
   - Example: `https://primepickz.vercel.app`

2. **Check These Features**
   - ✅ Homepage loads with products
   - ✅ Navigation works
   - ✅ Product categories display
   - ✅ Search functionality works
   - ✅ Chat agent responds (if you added OpenAI key)

---

## Updating Your App

Whenever you make changes to your code:

```bash
# Make your changes to the code

# Commit the changes
git add .
git commit -m "Description of your changes"

# Push to GitHub
git push

# Vercel will automatically deploy the new version!
```

Vercel automatically deploys every push to your `main` branch.

---

## Important Notes

### Authentication
The Replit authentication system has been kept in the code but may not work initially. For now, the app will function without user authentication. If you need authentication, you'll need to implement an alternative auth system (like Auth0, Clerk, or NextAuth).

### Database Seeding
To populate your database with initial product data, you can run:
```bash
# This needs to be done after db:push
npx tsx server/seed.ts
```

### Environment Variables
Never commit your `.env` file to GitHub! It's already in `.gitignore`, but double-check that sensitive credentials are never pushed.

---

## Troubleshooting

### Build Fails
- Check the Vercel build logs for specific errors
- Make sure all environment variables are set correctly
- Try running `npm run build` locally to test

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Make sure it includes `?sslmode=require` at the end
- Check that your Neon database is active

### App Not Loading
- Check browser console for errors
- Verify the deployment completed successfully in Vercel dashboard
- Check if environment variables are set correctly

---

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **GitHub Documentation**: [docs.github.com](https://docs.github.com)

---

**Congratulations!** 🎉 Your PrimePickz app is now live on Vercel!

Your deployment URL: `https://[your-project].vercel.app`
