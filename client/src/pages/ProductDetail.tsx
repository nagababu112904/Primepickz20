import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id || "";
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const { toast } = useToast();

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = allProducts?.find(p => p.id === productId);

  const handleAddToCart = async () => {
    try {
      await apiRequest("POST", "/api/cart", { productId: product!.id, quantity });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart!",
        description: `${product!.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleToggleWishlist = async () => {
    try {
      await apiRequest("POST", "/api/wishlist", { productId: product!.id });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist!",
        description: `${product!.name} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to wishlist",
        variant: "destructive",
      });
    }
  };

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Product not found</p>
        </div>
        <Footer />
      </>
    );
  }

  const discountPercentage = product.discount || 0;
  const hasDiscount = discountPercentage > 0;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-detail-image"
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
              {/* Category */}
              <p className="text-sm text-muted-foreground mb-2" data-testid="product-category">
                {product.category}
              </p>

              {/* Product Name */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="product-name">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && Number(product.rating) > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
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
                <span className="text-4xl font-bold text-foreground" data-testid="product-price">
                  ${Number(product.price).toLocaleString()}
                </span>
                {hasDiscount && product.originalPrice && (
                  <>
                    <span className="text-2xl text-muted-foreground line-through">
                      ${Number(product.originalPrice).toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      Save ${(Number(product.originalPrice) - Number(product.price)).toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed" data-testid="product-description">
                {product.description}
              </p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant}
                        variant={selectedVariant === variant ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVariant(variant)}
                        data-testid={`variant-${variant}`}
                      >
                        {variant}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-testid="button-decrease-quantity"
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center" data-testid="quantity-display">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    data-testid="button-increase-quantity"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Stock Status */}
              {product.stockCount && product.stockCount <= 10 && (
                <p className="text-sm text-destructive font-semibold mb-4">
                  Only {product.stockCount} left in stock!
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-8">
                {product.inStock ? (
                  <Button
                    className="flex-1 gap-2 h-12 text-base"
                    onClick={handleAddToCart}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                ) : (
                  <Button className="flex-1 h-12" disabled>
                    Out of Stock
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                  onClick={handleToggleWishlist}
                  data-testid="button-add-to-wishlist"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over $999</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">7 Days Returns</p>
                    <p className="text-xs text-muted-foreground">Easy returns policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Secure Payments</p>
                    <p className="text-xs text-muted-foreground">100% secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Quality Assured</p>
                    <p className="text-xs text-muted-foreground">Premium quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
