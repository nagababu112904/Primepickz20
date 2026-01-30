# 🛒 PrimePickz - Full-Stack E-Commerce Platform

&gt; A modern, scalable e-commerce marketplace with Amazon SP-API integration, real-time inventory management, and Stripe payment processing.

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)

**Live Site:** [primepickz.org](https://primepickz.org)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [License](#-license)

---

## ✨ Features

### Customer-Facing
- 🏠 **Responsive Marketplace** - Mobile-first design with category browsing
- 🔍 **Advanced Search** - Real-time product search with filters
- 🛒 **Shopping Cart** - Persistent cart with quantity management
- ❤️ **Wishlist** - Save favorite products for later
- 💳 **Stripe Checkout** - Secure payment processing with webhooks
- 📦 **Order Tracking** - Track shipment status in real-time
- 🔐 **Firebase Authentication** - Google OAuth + Email/Password login

### Admin Dashboard
- 📊 **Analytics Dashboard** - Real-time sales metrics and charts
- 📦 **Product Management** - CRUD operations with image upload
- 🏷️ **Category Management** - Organize products by categories
- 📋 **Order Management** - View, update, and fulfill orders
- 📈 **Inventory Tracking** - Low stock alerts and inventory sync
- 🔄 **Amazon SP-API Integration** - Import products from Amazon Seller Central
- 📧 **Email Notifications** - Resend API for transactional emails
- ↩️ **Returns Management** - Process customer return requests

### Technical Features
- ⚡ **Vite** - Lightning-fast HMR and optimized builds
- 🎨 **Radix UI + Tailwind** - Accessible, customizable components
- 📱 **PWA Ready** - Mobile app-like experience
- 🔄 **React Query** - Efficient data fetching and caching
- 🗃️ **Drizzle ORM** - Type-safe database queries
- 🌐 **Serverless Deployment** - Vercel Edge Functions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Radix UI | Accessible Components |
| React Query | Data Fetching |
| React Hook Form | Form Management |
| Zod | Schema Validation |
| Recharts | Analytics Charts |
| Framer Motion | Animations |
| wouter | Client-side Routing |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API Server |
| PostgreSQL (Neon) | Database |
| Drizzle ORM | Database Queries |
| Firebase Admin | Authentication |
| Stripe | Payment Processing |
| Amazon SP-API | Product Import |
| Resend | Transactional Email |

### DevOps
| Technology | Purpose |
|------------|---------|
| Vercel | Hosting & Serverless Functions |
| GitHub Actions | CI/CD |
| Neon | Serverless PostgreSQL |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Pages   │  │Components│  │  Hooks   │  │  Stores  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Functions                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Products │  │  Orders  │  │ Payments │  │  Admin   │     │
│  │   API    │  │   API    │  │   API    │  │   API    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌──────────┐    ┌──────────┐    ┌──────────┐
       │   Neon   │    │  Stripe  │    │ Firebase │
       │PostgreSQL│    │ Payments │    │   Auth   │
       └──────────┘    └──────────┘    └──────────┘
```

---

## 📁 Project Structure

```
PrimePickz/
├── api/                    # Serverless API functions
│   ├── admin/              # Admin endpoints
│   ├── payment/            # Stripe webhook & checkout
│   ├── products/           # Product CRUD
│   └── orders.ts           # Order management
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── marketplace/# E-commerce components
│   │   │   └── ui/         # Shadcn/Radix components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities & configs
│   │   └── pages/          # Route pages
│   │       └── Admin/      # Admin dashboard pages
├── server/                 # Express server
│   ├── db.ts               # Database connection
│   ├── schema.ts           # Drizzle schema
│   └── storage.ts          # Data access layer
└── shared/                 # Shared types
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Stripe account
- Firebase project

### Local Development

```bash
# Clone the repository
git clone https://github.com/nagababu112904/Primepickz20.git
cd Primepickz20

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

---

## 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Amazon SP-API
AMAZON_CLIENT_ID=amzn1.application-oa2-client...
AMAZON_CLIENT_SECRET=amzn1.oa2-cs...
AMAZON_REFRESH_TOKEN=Atzr|...
AMAZON_SELLER_ID=A2B3C4D5E6
AMAZON_MARKETPLACE_ID=ATVPDKIKX0DER

# Email
RESEND_API_KEY=re_...
```

---

## 📡 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/:id` | Update product (Admin) |
| DELETE | `/api/products/:id` | Delete product (Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user's orders |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order status |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-checkout` | Create Stripe session |
| POST | `/api/payment/webhook` | Stripe webhook handler |
| GET | `/api/payment/verify-session` | Verify payment |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get analytics data |
| GET | `/api/admin/amazon-products` | Fetch Amazon products |
| POST | `/api/admin/amazon-import` | Import Amazon products |

---

## 🗄️ Database Schema

```sql
-- Products Table
products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  imageUrl TEXT,
  category VARCHAR(100),
  stockCount INTEGER,
  asin VARCHAR(20),
  createdAt TIMESTAMP
)

-- Orders Table
orders (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(128),
  email VARCHAR(255),
  total DECIMAL(10,2),
  status VARCHAR(50),
  shippingAddress JSONB,
  items JSONB,
  stripeSessionId VARCHAR(255),
  createdAt TIMESTAMP
)

-- Categories Table
categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  slug VARCHAR(100) UNIQUE,
  imageUrl TEXT,
  productCount INTEGER
)
```

---

## 🌐 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to `main`

```bash
# Manual deployment
npm run build
vercel --prod
```

### Build Commands
```bash
npm run build      # Build frontend + API
npm run start      # Start production server
npm run db:push    # Push schema to database
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Naga Babu**

- GitHub: [@nagababu112904](https://github.com/nagababu112904)
- LinkedIn: [Your LinkedIn]
- Email: primepickz2025@gmail.com

---

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Radix UI](https://www.radix-ui.com/) for accessibility
- [Vercel](https://vercel.com/) for hosting
- [Neon](https://neon.tech/) for serverless PostgreSQL
# Trigger rebuild
