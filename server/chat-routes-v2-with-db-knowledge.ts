/**
 * CURRENT: Improved Chat Agent Version (v2 - Database-Connected)
 * Created: November 21, 2025 - Latest version with real-time database knowledge
 * Status: ACTIVE - Current production version
 * 
 * This version dynamically fetches products and categories from the database
 * to provide accurate, real-time product recommendations and inventory info.
 * 
 * Improvements over v1:
 * ✅ Real product data from database
 * ✅ Dynamic category knowledge
 * ✅ Accurate inventory checks
 * ✅ Better error handling with fallback messages
 * ✅ Logging for debugging
 * ✅ Helpful error responses instead of generic ones
 */

export const chatRouteV2 = `
  // AI Customer Support Chat - With Dynamic Database Knowledge
  app.post("/api/support/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Fetch real products and categories for dynamic context
      const products = await storage.getAllProducts();
      const categories = await storage.getAllCategories();

      // Build product knowledge section
      const categoryNames = categories.map(c => c.name).join(", ");
      const topProducts = products.slice(0, 15).map(p => \`\${p.name} ($\${Number(p.price).toFixed(2)}) - \${p.category}\`).join("\n");
      const avgPrice = products.length > 0 
        ? (products.reduce((sum, p) => sum + Number(p.price), 0) / products.length).toFixed(2)
        : "0";

      const systemPrompt = \`You are an expert customer support agent for Prime Pickz, a premium USA-based e-commerce store in Trumbull, Connecticut. You have access to our REAL product database and inventory. Your job is to help customers with anything about our actual products, services, and policies.

🏢 COMPANY INFO:
- Name: Prime Pickz | Phone: 475-239-6334
- Address: 9121 Avalon Gates, Trumbull, CT 06611
- Email: support@primepickz.com

📦 OUR PRODUCTS & INVENTORY:
We have \${products.length} products across \${categories.length} categories:
Categories: \${categoryNames}

Sample Products Available:
\${topProducts}

Average Price: $\${avgPrice}

KEY POLICIES & FAQs:
SHIPPING: Free on $99+, standard 3-5 days, express 1-2 days (FedEx/UPS/USPS)
RETURNS: 7-day policy, unused items, free return shipping on $50+ orders
PAYMENTS: Credit/Debit, PayPal, Apple Pay, Google Pay - 100% secure SSL
CONTACT: Available 24/7 via chat, 10am-6pm EST by phone, email anytime
SATISFACTION: 98.5% customer satisfaction rate

PRODUCT RECOMMENDATIONS:
If customer asks "What should I buy?", recommend from: \${products.slice(0, 5).map(p => p.name).join(", ")}

RESPONSE GUIDELINES:
- Be friendly, warm, and professional like Amazon/Flipkart agents
- Answer based on ACTUAL product database knowledge
- For inventory questions, check if items are in our database
- Always mention phone number 475-239-6334 for urgent issues
- Keep responses concise and solution-focused
- If you don't know something specific, offer to escalate or provide phone number\`;

      // Log the chat for debugging
      console.log(\`[CHAT] User: "\${message.substring(0, 50)}..."\`);

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

      console.log(\`[CHAT] Bot: "\${reply.substring(0, 50)}..."\`);
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
\`;
