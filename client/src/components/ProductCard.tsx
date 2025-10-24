import { useState } from "react";
import { Heart, Star, Eye, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (productId: string) => void;
  isWishlisted?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isWishlisted = false,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const discountPercentage = product.discount || 0;
  const hasDiscount = discountPercentage > 0;

  return (
    <div
      className="group relative bg-card rounded-lg overflow-hidden border border-card-border hover-elevate transition-all"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <div
          className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-muted flex items-center justify-center"
          onLoad={() => setImageLoaded(true)}
        >
          <Package className="w-16 h-16 text-primary/40" />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && (
            <Badge className="text-xs font-semibold px-2 py-1">
              {product.badge}
            </Badge>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs font-semibold px-2 py-1">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.freeShipping && (
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-1">
              Free Shipping
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onToggleWishlist(product.id)}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : ""}`}
          />
        </Button>

        {/* Quick View Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
          onClick={() => onQuickView(product.id)}
          data-testid={`button-quickview-${product.id}`}
        >
          <Eye className="w-4 h-4" />
          Quick View
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && Number(product.rating) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(Number(product.rating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg md:text-xl font-bold text-foreground">
            ₹{Number(product.price).toLocaleString()}
          </span>
          {hasDiscount && product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{Number(product.originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status & Add to Cart */}
        {product.inStock && (!product.stockCount || product.stockCount > 10) ? (
          <Button
            className="w-full gap-2"
            onClick={() => onAddToCart(product.id)}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        ) : product.inStock && product.stockCount && product.stockCount <= 10 ? (
          <div>
            <p className="text-xs text-destructive font-semibold mb-2">
              Only {product.stockCount} left!
            </p>
            <Button
              className="w-full gap-2"
              onClick={() => onAddToCart(product.id)}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <Button className="w-full" disabled>
            Out of Stock
          </Button>
        )}
      </div>
    </div>
  );
}
