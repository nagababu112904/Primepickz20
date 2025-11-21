import { useState } from "react";
import { X, ShoppingCart, Heart, Star, Truck, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface QuickViewDialogProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted?: boolean;
}

export function QuickViewDialog({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: QuickViewDialogProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discountPercentage = product.discount || 0;
  const hasDiscount = discountPercentage > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        data-testid="quickview-backdrop"
      >
        {/* Dialog */}
        <div
          className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="quickview-dialog"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 hover-elevate"
            data-testid="button-close-quickview"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            {/* Product Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-full h-full object-contain ${
                  ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : ''
                }`}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <Badge className="text-sm font-semibold">
                    {product.badge}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="destructive" className="text-sm font-semibold">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col">
              <div className="flex-1">
                {/* Category */}
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>

                {/* Product Name */}
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h2>

                {/* Rating */}
                {product.rating && Number(product.rating) > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(Number(product.rating))
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    ${Number(product.price).toLocaleString()}
                  </span>
                  {hasDiscount && product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${Number(product.originalPrice).toLocaleString()}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        Save {discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6">{product.description}</p>

                {/* Stock Status */}
                {product.inStock ? (
                  product.stockCount && product.stockCount <= 10 ? (
                    <p className="text-sm text-destructive font-semibold mb-4">
                      ⚠️ Only {product.stockCount} left in stock!
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 font-semibold mb-4">
                      ✓ In Stock
                    </p>
                  )
                ) : (
                  <p className="text-sm text-destructive font-semibold mb-4">
                    Out of Stock
                  </p>
                )}

                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                  {product.freeShipping && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-primary" />
                      <span>Free Shipping</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <RotateCcw className="w-4 h-4 text-primary" />
                    <span>7 Days Return</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                {product.inStock && (
                  <div className="mb-6">
                    <label className="text-sm font-semibold mb-2 block">Quantity</label>
                    <div className="flex items-center border rounded-lg w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover-elevate"
                        data-testid="button-decrease-quantity"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 font-semibold" data-testid="quickview-quantity">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 hover-elevate"
                        data-testid="button-increase-quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 h-12 gap-2"
                  onClick={() => {
                    onAddToCart(product.id);
                    onClose();
                  }}
                  disabled={!product.inStock}
                  data-testid="button-quickview-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-12 w-12"
                  onClick={() => onToggleWishlist(product.id)}
                  data-testid="button-quickview-wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? "fill-destructive text-destructive" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
