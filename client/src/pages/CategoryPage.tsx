import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product, Category, CartItemWithProduct } from "@shared/schema";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MiniCart } from "@/components/MiniCart";
import { Footer } from "@/components/Footer";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("featured");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const sessionId = "default-session";

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts } = useQuery<Product[]>({
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

  const category = categories?.find(cat => cat.slug === slug);
  const products = allProducts?.filter(p => {
    if (!category) return false;
    return p.category === category.name;
  }) || [];

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return 0;
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/">
            <Button data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        cartCount={cartItems.length}
        wishlistCount={0}
        onCartClick={() => setIsCartOpen(true)}
        language="en"
        onLanguageChange={() => {}}
      />
      {/* Category Header */}
      <div className="bg-card border-b">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground">{category.description}</p>
              <p className="text-sm text-muted-foreground mt-2">{products.length} products</p>
            </div>
            
            {/* Sort & Filter */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]" data-testid="select-sort">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" data-testid="button-filter">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products available in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {sortedProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="overflow-hidden hover-elevate flex flex-col cursor-pointer" data-testid={`card-product-${product.id}`}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className={`w-full h-full object-contain ${
                          ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : 'object-cover'
                        }`}
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
                    </div>
                    <div className="p-3 md:p-4 flex flex-col h-full">
                      <h3 className="font-semibold line-clamp-2 mb-2 text-sm md:text-base min-h-[2.5rem] md:min-h-[3rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                        <span className="text-lg font-bold">${Number(product.price).toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${Number(product.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs mt-auto">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm" 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCartMutation.mutate(product.id);
                      }}
                      disabled={addToCartMutation.isPending}
                      data-testid={`button-add-cart-${product.id}`}
                    >
                      {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-wishlist-${product.id}`}>
                      ♡
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <MobileBottomNav
        cartCount={cartItems.length}
        activeTab="categories"
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
