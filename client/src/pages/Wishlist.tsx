import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItemWithProduct } from "@shared/schema";
import { useState } from "react";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MiniCart } from "@/components/MiniCart";
import { Footer } from "@/components/Footer";

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
}

export default function Wishlist() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const sessionId = "default-session";

  const { data: wishlistItems = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: string) =>
      apiRequest(`/api/wishlist/${productId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      apiRequest("POST", "/api/cart", { 
        productId, 
        quantity: 1,
        sessionId: "default-session" 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      return await apiRequest("PATCH", `/api/cart/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest("DELETE", `/api/cart/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const wishlistedProducts = allProducts.filter((product) =>
    wishlistItems.some((item) => item.productId === product.id)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">
            Please log in to view your wishlist
          </p>
          <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        cartCount={cartItems.length}
        wishlistCount={wishlistedProducts.length}
        onCartClick={() => setIsCartOpen(true)}
        language="en"
        onLanguageChange={() => {}}
      />
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">Your wishlist is empty</p>
            <Link href="/">
              <Button data-testid="button-browse">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.badge && (
                      <Badge className="absolute top-2 left-2" variant="destructive">
                        {product.badge}
                      </Badge>
                    )}
                    {product.discount && product.discount > 0 && (
                      <Badge className="absolute top-2 right-2" variant="default">
                        {product.discount}% OFF
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeFromWishlistMutation.mutate(product.id)}
                      disabled={removeFromWishlistMutation.isPending}
                      data-testid={`button-remove-${product.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2 text-sm md:text-base">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-muted-foreground">({product.reviewCount})</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => addToCartMutation.mutate(product.id)}
                    disabled={addToCartMutation.isPending}
                    data-testid={`button-add-cart-${product.id}`}
                  >
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <MobileBottomNav
        cartCount={cartItems.length}
        activeTab="account"
        onCartClick={() => setIsCartOpen(true)}
      />
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity })}
        onRemoveItem={(itemId) => removeItemMutation.mutate(itemId)}
        onCheckout={() => window.location.href = "/checkout"}
      />
    </div>
  );
}
