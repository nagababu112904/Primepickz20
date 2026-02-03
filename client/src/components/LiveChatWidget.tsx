import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hello! Welcome to PrimePickz. How can we help you today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage: ChatMessage = {
        text: message,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Auto-reply
      setTimeout(() => {
        const reply = generateReply(message);
        const botMessage: ChatMessage = {
          text: reply,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }, 800);

      setMessage("");
    }
  };

  const generateReply = (msg: string): string => {
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes("track") || lowerMsg.includes("order")) {
      return "You can track your order from your account page. Please login and go to 'My Orders' section.";
    }
    if (lowerMsg.includes("return") || lowerMsg.includes("refund")) {
      return "We offer 30-day returns on most items. Please visit our Returns & Refunds page for more details.";
    }
    if (lowerMsg.includes("shipping") || lowerMsg.includes("delivery")) {
      return "We offer free shipping on orders over $50. Standard delivery takes 5-7 business days.";
    }
    if (lowerMsg.includes("payment") || lowerMsg.includes("pay")) {
      return "We accept all major credit cards, debit cards, UPI, and net banking.";
    }
    if (lowerMsg.includes("help") || lowerMsg.includes("support")) {
      return "I'm here to help! You can ask about orders, shipping, returns, or browse our products. What would you like to know?";
    }
    if (lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
      return "Hello! How can I assist you today?";
    }

    return "Thank you for your message! Our support team will get back to you shortly. Is there anything else I can help you with?";
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 md:bottom-24 right-4 w-80 sm:w-96 bg-card border border-card-border rounded-lg shadow-2xl z-40 flex flex-col"
          data-testid="chat-window"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Customer Support</h3>
                <p className="text-xs opacity-90">We typically reply in minutes</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground"
              data-testid="button-close-chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto" data-testid="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                  }`}>
                  {msg.isUser ? 'U' : 'PP'}
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-3 text-sm ${msg.isUser ? 'bg-primary text-primary-foreground ml-8' : 'bg-muted mr-8'
                    }`}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.isUser ? 'You' : 'Support Team'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-4 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-40"
        data-testid="button-toggle-chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}
