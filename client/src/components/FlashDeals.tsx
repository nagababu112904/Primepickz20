import { useState, useEffect } from "react";
import { Clock, Flame, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import type { DealWithProduct } from "@shared/schema";

interface FlashDealsProps {
  deals: DealWithProduct[];
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  wishlistedProducts?: Set<string>;
}

export function FlashDeals({
  deals,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistedProducts = new Set(),
}: FlashDealsProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 23,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (deals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-destructive/5 via-background to-primary/5">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full">
              <Flame className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                Flash Deals
                <Badge variant="destructive" className="text-xs">HOT</Badge>
              </h2>
              <p className="text-muted-foreground">Limited time offers - Grab them fast!</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-3 bg-card border border-card-border rounded-lg p-4">
            <Clock className="w-5 h-5 text-primary" />
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Ends in:</span>
              <div className="flex items-center gap-1 ml-2">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground" data-testid="deal-timer-hours">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground">HRS</span>
                </div>
                <span className="text-xl font-bold text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground" data-testid="deal-timer-minutes">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground">MIN</span>
                </div>
                <span className="text-xl font-bold text-muted-foreground">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground" data-testid="deal-timer-seconds">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground">SEC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="relative">
              <ProductCard
                product={deal.product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
                isWishlisted={wishlistedProducts.has(deal.product.id)}
              />
              
              {/* View Counter */}
              {deal.viewCount > 0 && (
                <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1 z-10">
                  <Eye className="w-3 h-3" />
                  <span data-testid={`view-count-${deal.id}`}>{deal.viewCount} viewing</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Urgency Banner */}
        <div className="mt-8 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-sm md:text-base font-semibold text-destructive">
            ⚡ Hurry! Deals selling out fast - Limited stock available
          </p>
        </div>
      </div>
    </section>
  );
}
