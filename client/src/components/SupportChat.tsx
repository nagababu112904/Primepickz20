import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

// Knowledge base for smart responses
const getSmartResponse = (
  query: string,
  products: Product[],
  categories: Category[]
): string => {
  const q = query.toLowerCase();

  // Greeting
  if (q.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return "Hello! Welcome to PrimePickz. How can I help you today? I can assist with products, orders, shipping, returns, and more!";
  }

  // Product search
  if (q.includes('product') || q.includes('find') || q.includes('search') || q.includes('looking for')) {
    const productNames = products.slice(0, 5).map(p => p.name).join(', ');
    return `We have a great selection! Some popular items: ${productNames || 'electronics, fashion, home goods and more'}. Use the search bar to find specific products, or browse our categories!`;
  }

  // Categories
  if (q.includes('category') || q.includes('categories') || q.includes('what do you sell')) {
    const catNames = categories.map(c => c.name).join(', ');
    return `We offer: ${catNames || 'Electronics, Fashion, Home & Kitchen, Beauty, Sports & Fitness, and more'}. Click on any category to browse!`;
  }

  // Shipping
  if (q.includes('ship') || q.includes('delivery') || q.includes('arrive')) {
    return "📦 Shipping Info:\n• FREE shipping on orders over $99\n• Standard: 5-7 business days ($9.99)\n• Express: 2-3 business days ($19.99)\n• We ship to all US addresses!";
  }

  // Returns
  if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
    return "↩️ Returns Policy:\n• 30-day return window\n• Items must be in original condition\n• Free return shipping\n• Refunds processed in 5-7 days\n\nStart a return at /return-request";
  }

  // Order tracking
  if (q.includes('track') || q.includes('order status') || q.includes('where is my order')) {
    return "📍 To track your order:\n1. Go to 'Track Order' in the menu\n2. Enter your order number and email\n3. View real-time tracking\n\nCheck your email for tracking updates!";
  }

  // Payment
  if (q.includes('pay') || q.includes('card') || q.includes('visa') || q.includes('mastercard')) {
    return "💳 We accept:\n• Visa, Mastercard, American Express\n• PayPal\n• Apple Pay\n\nAll transactions are secured with SSL encryption through Stripe.";
  }

  // Contact
  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('help')) {
    return "📞 Contact us:\n• Phone: 475-239-6334\n• Email: support@primepickz.com\n• Address: 9121 Avalon Gates, Trumbull, CT 06611\n\nWe're available 24/7!";
  }

  // Price/discount
  if (q.includes('price') || q.includes('discount') || q.includes('sale') || q.includes('deal')) {
    return "💰 We offer great deals!\n• Check our 'Deals' category for discounts\n• Free shipping on orders $99+\n• Sign up for email to get exclusive offers!";
  }

  // Account
  if (q.includes('account') || q.includes('login') || q.includes('sign up') || q.includes('password')) {
    return "👤 Account Help:\n• Click 'Account' in the menu to manage your profile\n• View order history, wishlist, and saved addresses\n• Update your password in Account Settings";
  }

  // Thank you
  if (q.includes('thank') || q.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with? 😊";
  }

  // Default response
  return "I can help you with:\n• 🛍️ Product information\n• 📦 Shipping & delivery\n• ↩️ Returns & refunds\n• 📍 Order tracking\n• 💳 Payment methods\n• 👤 Account help\n\nWhat would you like to know?";
};

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Hey! 👋 I'm your PrimePickz assistant. Ask me about products, shipping, returns, or anything else!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch products and categories for smart responses
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = input;
    setInput("");
    setIsLoading(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getSmartResponse(userQuery, products, categories);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Button - Smaller, positioned above mobile nav */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full w-12 h-12 md:w-14 md:h-14 shadow-xl bg-[#1a2332] hover:bg-[#0f1419] text-white transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            </div>
          )}
        </Button>
      </div>

      {/* Chat Window - Better mobile handling */}
      {isOpen && (
        <div
          className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col
          bottom-36 md:bottom-24 right-4 left-4 md:left-auto md:w-80 lg:w-96 
          max-h-[60vh] md:max-h-[28rem]"
        >
          {/* Header */}
          <div className="bg-[#1a2332] text-white p-4 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">PrimePickz Support</h2>
                <p className="text-xs text-gray-300">Always here to help</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${msg.type === "user"
                      ? "bg-[#1a2332] text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-3 rounded-b-2xl flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#1a2332] bg-white"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-[#1a2332] text-white rounded-full w-9 h-9 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
