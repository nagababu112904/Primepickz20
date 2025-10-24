import { Button } from "@/components/ui/button";
import { Truck, RotateCcw, Shield, Headphones, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [liveStats, setLiveStats] = useState({
    orders: 2847,
    shoppers: 156,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        orders: prev.orders + Math.floor(Math.random() * 3),
        shoppers: 150 + Math.floor(Math.random() * 20),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const trustBadges = [
    { icon: Truck, text: "Free Delivery on $999+" },
    { icon: RotateCcw, text: "7 Days Easy Returns" },
    { icon: Shield, text: "100% Secure Payments" },
    { icon: Headphones, text: "24/7 Support" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="min-h-[500px] md:min-h-[600px] flex flex-col justify-center py-12 md:py-20">
          <div className="max-w-3xl">
            {/* Main Headline */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                Discover Your Style,
                <br />
                <span className="text-primary">Define Your Look</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Shop the latest in ethnic and contemporary fashion. From traditional sarees to modern western wear - find your perfect match.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button 
                size="lg" 
                className="h-12 px-8 text-base font-semibold"
                data-testid="button-shop-now"
              >
                Shop Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 text-base font-semibold"
                data-testid="button-explore-deals"
              >
                Explore Deals
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm"
                  data-testid={`trust-badge-${index}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <badge.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground leading-tight">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Live Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">
                  <span className="font-bold text-foreground" data-testid="live-orders">{liveStats.orders.toLocaleString()}</span> orders delivered today
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground">
                  <span className="font-bold text-foreground" data-testid="live-shoppers">{liveStats.shoppers}</span> people shopping now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
    </div>
  );
}
