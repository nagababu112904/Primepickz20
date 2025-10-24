import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package } from "lucide-react";

export default function TrackOrder() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Tracking order: ${orderNumber}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={0}
        wishlistCount={0}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-1 max-w-screen-md mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-8">
          <Package className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter your order number to see real-time tracking information
          </p>
        </div>

        <form onSubmit={handleTrack} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Order Number</label>
            <Input
              type="text"
              placeholder="e.g., ORD123456789"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              data-testid="input-order-number"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-track-order">
            Track Order
          </Button>
        </form>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg max-w-md mx-auto">
          <h3 className="font-semibold mb-2">Where to find your order number?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Check your order confirmation email</li>
            <li>Check your SMS notifications</li>
            <li>Login to your account and view "My Orders"</li>
          </ul>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
