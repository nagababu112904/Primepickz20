import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import type { Product } from "@shared/schema";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  wishlistedProducts?: Set<string>;
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  wishlistedProducts = new Set(),
}: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => scroll("left")}
              data-testid={`carousel-prev-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => scroll("right")}
              data-testid={`carousel-next-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-56 lg:w-64 snap-start"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  isWishlisted={wishlistedProducts.has(product.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
