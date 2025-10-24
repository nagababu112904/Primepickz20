import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Chat message:", message);
      setMessage("");
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 w-80 sm:w-96 bg-card border border-card-border rounded-lg shadow-2xl z-50 flex flex-col"
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
          <div className="flex-1 p-4 space-y-3 max-h-80 overflow-y-auto">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-xs font-semibold">
                PP
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3 text-sm">
                  Hello! Welcome to Prime Pickz. How can we help you today?
                </div>
                <p className="text-xs text-muted-foreground mt-1">Support Team</p>
              </div>
            </div>
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
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        data-testid="button-toggle-chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}
