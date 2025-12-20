import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { seed } from "./seed";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Only setup Replit auth if running on Replit
  if (process.env.REPLIT_DOMAINS) {
    await setupAuth(app);
  }

  // Initialize OpenAI only if API key is available
  const openai = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    ? new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
    : null;

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

  // AI Customer Support Chat - With Dynamic Database Knowledge
  app.post("/api/support/chat", async (req, res) => {
    try {
      // Check if OpenAI is configured
      if (!openai) {
        return res.status(503).json({
          error: "Chat functionality is currently unavailable. Please call us at 475-239-6334 for support."
        });
      }

      const { message, conversationHistory = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Fetch real products and categories for dynamic context
      const products = await storage.getAllProducts();
      const categories = await storage.getAllCategories();

      // Build product knowledge section
      const categoryNames = categories.map(c => c.name).join(", ");
      const topProducts = products.slice(0, 15).map(p => `${p.name} ($${Number(p.price).toFixed(2)}) - ${p.category}`).join("\n");
      const avgPrice = products.length > 0
        ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(2)
        : "0";

      const systemPrompt = `You are an expert customer support agent for Prime Pickz, a premium USA-based e-commerce store in Trumbull, Connecticut. You have access to our REAL product database and inventory. Your job is to help customers with anything about our actual products, services, and policies.

🏢 COMPANY INFO:
- Name: Prime Pickz | Phone: 475-239-6334
- Address: 9121 Avalon Gates, Trumbull, CT 06611
- Email: support@primepickz.com

📦 OUR PRODUCTS & INVENTORY:
We have ${products.length} products across ${categories.length} categories:
Categories: ${categoryNames}

Sample Products Available:
${topProducts}

Average Price: $${avgPrice}

KEY POLICIES & FAQs:
SHIPPING: Free on $99+, standard 3-5 days, express 1-2 days (FedEx/UPS/USPS)
RETURNS: 7-day policy, unused items, free return shipping on $50+ orders
PAYMENTS: Credit/Debit, PayPal, Apple Pay, Google Pay - 100% secure SSL
CONTACT: Available 24/7 via chat, 10am-6pm EST by phone, email anytime
SATISFACTION: 98.5% customer satisfaction rate

PRODUCT RECOMMENDATIONS:
If customer asks "What should I buy?", recommend from: ${products.slice(0, 5).map(p => p.name).join(", ")}

RESPONSE GUIDELINES:
- Be friendly, warm, and professional like Amazon/Flipkart agents
- Answer based on ACTUAL product database knowledge
- For inventory questions, check if items are in our database
- Always mention phone number 475-239-6334 for urgent issues
- Keep responses concise and solution-focused
- If you don't know something specific, offer to escalate or provide phone number`;

      // Log the chat for debugging
      console.log(`[CHAT] User: "${message.substring(0, 50)}..."`);

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

      const reply = completion.choices[0]?.message?.content;

      if (!reply) {
        console.error("[CHAT ERROR] Empty response from OpenAI");
        return res.status(500).json({ error: "Failed to generate response" });
      }

      console.log(`[CHAT] Bot: "${reply.substring(0, 50)}..."`);
      res.json({ reply });
    } catch (error) {
      console.error("[CHAT ERROR]", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";

      // Return helpful error response instead of generic error
      if (errorMsg.includes("API") || errorMsg.includes("auth")) {
        res.status(500).json({
          error: "I'm having connection issues. Please try again or call 475-239-6334 for immediate help.",
          details: process.env.NODE_ENV === "development" ? errorMsg : undefined
        });
      } else {
        res.status(500).json({
          error: "Sorry, I couldn't process your request. Please try a simpler question or contact us at 475-239-6334.",
          details: process.env.NODE_ENV === "development" ? errorMsg : undefined
        });
      }
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
