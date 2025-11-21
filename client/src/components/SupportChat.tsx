import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
}

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Hey there! Welcome to Prime Pickz Support. I'm here to help with product info, shipping, returns, and anything else. What can I assist with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setInput("");
    setIsLoading(true);

    try {
      const response = (await apiRequest("POST", "/api/support/chat", {
        message: input,
        conversationHistory: messages.map((m) => ({
          role: m.type === "user" ? "user" : "assistant",
          content: m.text,
        })),
      })) as unknown as { reply: string };

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: response.reply || "I'm having trouble responding. Please try again!",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: "bot",
        text: "Sorry, I couldn't process that. Please try again or reach out to us directly.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button - Floating with Pulse */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl hover-elevate z-40 bg-[#B8860B] text-[#1f1f1f] border-0 transition-all duration-300 font-semibold"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-support-chat"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-28 right-6 w-96 max-h-[32rem] rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
          data-testid="chat-window"
        >
          {/* Header - Luxury Gold & Dark */}
          <div className="bg-gradient-to-r from-[#1f1f1f] to-[#2a2a2a] text-[#B8860B] p-5 rounded-t-2xl border-b-2 border-[#B8860B]/30">
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className="w-5 h-5" />
              <h2 className="font-serif font-bold text-lg tracking-tight">Prime Pickz Support</h2>
            </div>
            <p className="text-xs text-[#B8860B]/80 font-medium">Dedicated concierge service • 24/7</p>
          </div>

          {/* Messages - Luxury Dark Background */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1a1a1a] dark:bg-[#1a1a1a]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                data-testid={`message-${msg.type}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium transition-all duration-200 ${
                    msg.type === "user"
                      ? "bg-[#B8860B] text-[#1f1f1f] rounded-br-none shadow-lg font-semibold"
                      : "bg-[#252525] text-[#E8E8E8] rounded-bl-none border border-[#B8860B]/20"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-[#252525] px-4 py-3 rounded-2xl rounded-bl-none border border-[#B8860B]/20">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-bounce"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#B8860B] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Luxury Dark */}
          <div className="border-t border-[#B8860B]/20 bg-[#1a1a1a] p-4 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border-2 border-[#B8860B]/30 rounded-xl text-sm focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#B8860B]/20 bg-[#252525] text-white placeholder-[#888] font-medium transition-all duration-200"
                disabled={isLoading}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-[#B8860B] text-[#1f1f1f] border-0 rounded-xl hover-elevate disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
