import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seed } from "./seed";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Initialize OpenAI with Replit AI Integrations
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Deals
  app.get("/api/deals", async (_req, res) => {
    try {
      const deals = await storage.getAllDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (_req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || "default-session";
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const sessionId = validatedData.sessionId || "default-session";
      const cartItem = await storage.addToCart({
        ...validatedData,
        sessionId,
      });
      res.json(cartItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid request data" });
      }
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItemQuantity(
        req.params.id,
        quantity
      );

      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Purchase Notifications
  app.get("/api/notifications", async (_req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // Wishlist (protected routes)
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ error: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertWishlistItemSchema.parse({
        ...req.body,
        userId,
      });

      const wishlistItem = await storage.addToWishlist(validatedData);
      res.json(wishlistItem);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to add to wishlist" });
      }
    }
  });

  app.delete("/api/wishlist/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.params;
      
      const deleted = await storage.removeFromWishlist(userId, productId);
      if (!deleted) {
        return res.status(404).json({ error: "Wishlist item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/check/:productId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId } = req.params;
      
      const isInWishlist = await storage.isInWishlist(userId, productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ error: "Failed to check wishlist" });
    }
  });

  // AI Customer Support Chat - Comprehensive Knowledge Base (Amazon/Flipkart Style)
  app.post("/api/support/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemPrompt = `You are an expert customer support agent for Prime Pickz, a premium USA-based e-commerce store in Trumbull, Connecticut. You're trained like Amazon & Flipkart agents with comprehensive product knowledge and exceptional service.

COMPANY INFO:
- Name: Prime Pickz | Phone: 475-239-6334
- Address: 9121 Avalon Gates, Trumbull, CT 06611
- Categories: Fashion, Beauty & Wellness, Electronics, Furniture, Food & Spices, Toys & Handicrafts, Pet Products

SHIPPING & DELIVERY:
Q: What's your delivery time?
A: Standard delivery: 3-5 business days. Express: 1-2 days (available in most areas).
Q: Do you offer free shipping?
A: Yes! Free shipping on orders over $99. Orders below $99 have $9.99 shipping fee.
Q: Which carriers do you use?
A: FedEx, UPS, and USPS depending on location for fastest delivery.
Q: Can I track my order?
A: Absolutely! You'll get a tracking link via email immediately after shipment. Track in real-time.
Q: What if my package doesn't arrive on time?
A: We offer full refund or replacement. Contact us with tracking info and we'll resolve within 24 hours.

RETURNS & REFUNDS:
Q: What's your return policy?
A: 7-day returns on all items (purchase date). Items must be unused/undamaged. Free return shipping on orders over $50.
Q: How do refunds work?
A: Refunded to original payment method within 5-7 business days after we receive the item.
Q: Can I return opened items?
A: Yes, if unused. Some items like beauty/wellness products must be sealed.
Q: What about defective items?
A: Free replacement or refund immediately. No questions asked.

PAYMENTS & SECURITY:
Q: What payment methods do you accept?
A: Credit cards (Visa, Mastercard, Amex), Debit cards, PayPal, Apple Pay, Google Pay.
Q: Is my payment secure?
A: 100% secure! We use 256-bit SSL encryption and PCI DSS compliance.
Q: Do you have pay-later options?
A: Not currently, but we're working on it!
Q: Can I use gift cards?
A: We don't have gift cards yet, but this is coming soon!

PRODUCT & INVENTORY:
Q: Is this product in stock?
A: Check the product page for live inventory. Out-of-stock items show "Coming Soon" with notification option.
Q: Can I see product reviews?
A: Yes! Every product page has verified customer reviews, ratings, and photos.
Q: Do you have size guides?
A: Yes, check the "Size Guide" in footer. Each product has specific measurements.
Q: Can you recommend a product?
A: Tell me your preferences (category, budget, style) and I'll suggest perfect items!

ORDERS & ACCOUNT:
Q: How do I track my order?
A: Log in to your account → "My Orders" → Click order → See tracking link.
Q: Can I modify/cancel my order?
A: If not shipped yet, yes! Contact us within 2 hours of order.
Q: Do you offer order history?
A: Yes! Your account shows all past orders with receipts and reorder option.
Q: What if I forgot my password?
A: Click "Forgot Password" on login. We'll send reset link to your email.

CUSTOMER SERVICE:
Q: How can I contact support?
A: Use this chat 24/7, call 475-239-6334, or email support@primepickz.com
Q: What's your customer satisfaction rate?
A: 98.5%! We pride ourselves on excellent service.
Q: Do you have a physical store?
A: Yes! Visit us at 9121 Avalon Gates, Trumbull, CT 06611
Q: Are you available on holidays?
A: Chat support: 24/7. Phone: 10am-6pm EST (closed major holidays).

PRICING & DISCOUNTS:
Q: Do you have sales or promotions?
A: Yes! Check "Deals" section for daily flash sales and seasonal promotions.
Q: Can I price match?
A: We offer best value guarantee. If you find lower, let us know!
Q: Are there loyalty rewards?
A: Coming soon! Sign up for newsletter for early access.
Q: How often do you update prices?
A: Daily! Prices automatically adjust for best deals.

WISHLIST & NOTIFICATIONS:
Q: How do I save items?
A: Click heart icon on product → added to wishlist. Get notified of price drops!
Q: Can I share my wishlist?
A: Yes, generate share link from wishlist page.
Q: Do you notify me of restocks?
A: Yes! Click "Notify Me" on out-of-stock items.

TECHNICAL ISSUES:
Q: The website is slow?
A: We use advanced caching. Try: Clear browser cache, refresh page, use different browser.
Q: Can't add to cart?
A: Try refreshing. If persists, clear cookies or use incognito mode.
Q: Mobile app available?
A: Coming soon! Website works perfectly on all devices.

GENERAL POLICIES:
Q: What's your privacy policy?
A: We never share data. See full policy in footer.
Q: Do you sell data?
A: Absolutely not! Your privacy is sacred.
Q: Can I update my account info?
A: Yes, anytime in Account Settings.

Response style: Be friendly, concise, and solution-focused. Always ask clarifying questions. Use emojis sparingly (max 1 per message). If question not in knowledge base, offer to escalate to specialist team. For complex issues, provide phone number: 475-239-6334.

TONE: Professional, warm, helpful - like best Amazon/Flipkart agents. Solve problems, don't pass buck.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.slice(-6),
        { role: "user" as const, content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300,
      });

      const reply = completion.choices[0]?.message?.content || "I'm unable to respond at the moment.";

      res.json({ reply });
    } catch (error) {
      console.error("Error in support chat:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // ADMIN: One-time database seed endpoint (remove after use)
  app.post("/api/admin/seed-database", async (_req, res) => {
    try {
      console.log("🌱 Starting database seed from admin endpoint...");
      await seed();
      res.json({ success: true, message: "Database seeded successfully!" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
