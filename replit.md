# Prime Pickz E-Commerce Landing Page

## Project Overview
Prime Pickz is a premium e-commerce landing page for an Indian fashion and lifestyle brand. The application showcases modern web development practices with a focus on conversion optimization, mobile-first design, and exceptional user experience.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Data**: In-memory storage (MemStorage)
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Styling**: Tailwind CSS with custom Indian-fusion design system

## Key Features

### Header & Navigation
- Sticky header with search, cart, wishlist, and account icons
- Voice search capability
- Category mega-menu with visual icons
- Multilingual support (English/Hindi)
- Mobile hamburger menu with full-screen overlay

### Hero Section
- Bold value proposition and animated CTAs
- Trust badges (Free Delivery ₹999+, 7 Days Returns, Secure Payments, 24/7 Support)
- Live order statistics with real-time updates
- Responsive gradient background with decorative elements

### Product Discovery
- Multiple product carousels:
  - Trending Now
  - Recommended for You
  - New Arrivals
  - Best Sellers
- Horizontal scrolling with snap points
- Navigation arrows (desktop)

### Category Showcase
- Large clickable category tiles
- Gradient overlays for readability
- Hover effects and animations
- Shop Now CTAs

### Flash Deals
- Countdown timer with hours, minutes, seconds
- Real-time view counters
- Urgency indicators (limited stock)
- Promotional badges

### Product Cards
- High-resolution product displays with emoji icons
- Wishlist toggle functionality
- Quick-view modal
- Star ratings and review counts
- Price display with original price strikethrough
- Discount percentage badges
- Free shipping tags
- Stock status indicators
- Add to cart functionality

### Social Proof
- Customer reviews with ratings
- Verified purchase badges
- Customer photos and locations
- Trust statistics (satisfaction rate, delivery, returns)
- Media mentions
- "Join 10M+ Happy Customers" messaging

### E-Commerce Features
- **Mini Cart**: Slide-out sidebar with:
  - Product thumbnails
  - Quantity controls
  - Remove item functionality
  - Subtotal calculation
  - Free shipping progress bar
  - Checkout button
- **Quick View**: Modal for product details without page navigation
- **Wishlist**: Toggle favorite products
- **Promotional Banners**: 3 full-width banners with vibrant gradients and stock images throughout homepage

### Engagement & Support
- **Live Chat Widget**: Floating chat button with message interface

### Footer
- Company information and contact details
- Newsletter subscription
- Quick links (About, Contact, Careers, Blog, Press)
- Customer service links (Track Order, Returns, Shipping, FAQ, Size Guide)
- Mobile app download buttons (Google Play, App Store)
- Social media links (Facebook, Instagram, Twitter, YouTube)
- Payment method icons (Visa, Mastercard, RuPay, UPI, GPay, PhonePe, Paytm, COD, EMI)
- Security certifications (SSL, PCI Compliant, ISO)
- Policy links (Privacy, Terms, Cookie Policy)

### Mobile Optimization
- Fully responsive design
- Mobile-first approach
- Bottom navigation bar (Home, Categories, Cart, Account)
- Thumb-friendly touch targets (min 44x44px)
- Optimized search and navigation
- Swipeable product carousels

## Design System

### Colors (Bold Festival Palette)
- **Primary**: Vibrant Purple (HSL 280 85% 60%) - electric, energetic
- **Accent**: Bold Pink (HSL 340 90% 65%) - festive, eye-catching
- **Background**: Pure white for maximum color pop
- **Destructive**: Bright Red (HSL 0 90% 55%) for urgency/discounts
- **Gradients**: Pink-to-purple, purple-to-pink dual gradients throughout

### Typography
- **Primary Font**: Poppins, Inter (friendly, modern)
- **Scale**: Responsive from mobile (text-sm) to desktop (text-6xl)
- **Weights**: Regular, Medium, Semibold, Bold

### Spacing
- Consistent Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24
- Section padding: py-12 (mobile) to py-24 (desktop)
- Component gaps: gap-4 to gap-6

### Components
- Shadcn UI base components
- Custom hover effects (hover-elevate, active-elevate-2)
- Smooth transitions and animations
- Skeleton loading states

## Data Models

### Products
- name, description, price, originalPrice, discount
- category, imageUrl, rating, reviewCount
- inStock, stockCount, tags, badge, freeShipping

### Categories
- name, slug, imageUrl, description

### Deals
- productId, title, endsAt, viewCount, isActive

### Reviews
- productId, customerName, customerLocation
- rating, comment, imageUrl, date, verified

### Cart Items
- productId, quantity, sessionId

### Purchase Notifications
- customerName, location, productName, timestamp

## Project Structure
```
client/
  src/
    components/
      Header.tsx - Main navigation
      FlashSaleBanner.tsx - Top promotional banner
      HeroSection.tsx - Above-the-fold hero
      ProductCard.tsx - Reusable product display
      ProductCarousel.tsx - Horizontal scrolling products
      CategoryTiles.tsx - Category grid
      FlashDeals.tsx - Deals with countdown
      SocialProof.tsx - Reviews and testimonials
      MiniCart.tsx - Sidebar cart
      QuickViewDialog.tsx - Product modal
      NewsletterPopup.tsx - Email subscription
      LiveChatWidget.tsx - Support chat
      PurchaseNotification.tsx - Social proof toasts
      Footer.tsx - Site footer
      MobileBottomNav.tsx - Mobile navigation
    pages/
      Home.tsx - Main landing page
    ui/ - Shadcn components
server/
  routes.ts - API endpoints
  storage.ts - In-memory data store
shared/
  schema.ts - TypeScript types and Drizzle schemas
```

## Development Status

### Phase 1: Schema & Frontend ✅
- Complete data schema defined
- All React components built
- Bold, vibrant design system with festival energy
- SEO meta tags added
- Mobile-responsive layouts
- Accessibility features
- 3 promotional banners with stock images
- Removed newsletter and purchase notification popups

### Phase 2: Backend ✅
- API endpoints for products, categories, deals
- Cart operations
- In-memory data storage with realistic Indian fashion products

### Phase 3: Integration (Future)
- Connect frontend to backend
- Real-time features
- Error handling and loading states
- End-to-end testing

## Running the Project
```bash
npm run dev
```
The application runs on a single port with Vite serving the frontend and Express handling the backend.

## Future Enhancements
- User authentication and accounts
- Real payment gateway integration (Razorpay/PayU)
- Order management system
- Email/SMS/WhatsApp notifications
- Admin dashboard
- Product filtering and search
- Personalization engine
- Analytics integration
- PWA capabilities

## Performance Goals
- Page load time: <3 seconds
- Mobile responsiveness: >95%
- Accessibility: WCAG 2.1 AA compliant
- SEO optimized with structured data

---

**Version**: 1.1  
**Last Updated**: October 24, 2025  
**Status**: Bold Design Update - Festival Energy Applied
