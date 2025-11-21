import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CategoryTiles } from "@/components/CategoryTiles";
import { SocialProof } from "@/components/SocialProof";
import { MiniCart } from "@/components/MiniCart";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import type { Product, Category, DealWithProduct, Review, CartItemWithProduct, PurchaseNotification as PurchaseNotificationType } from "@shared/schema";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistedProducts, setWishlistedProducts] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const sessionId = "default-session";

  // Fetch data
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });


  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
  });


  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        sessionId,
      });
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      const product = products.find(p => p.id === productId);
      toast({
        title: "Added to cart",
        description: product ? `${product.name} has been added to your cart` : "Product added successfully",
      });
      setIsCartOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest("DELETE", `/api/cart/${itemId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  // Organize products by type
  const trendingProducts = products.filter(p => p.tags?.includes("trending")).slice(0, 10);
  const recommendedProducts = products.filter(p => p.tags?.includes("recommended")).slice(0, 10);
  const newArrivals = products.filter(p => p.badge === "New").slice(0, 10);

  // Handlers
  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        toast({
          title: "Removed from wishlist",
          description: "Product removed from your wishlist",
        });
      } else {
        newSet.add(productId);
        toast({
          title: "Added to wishlist",
          description: "Product added to your wishlist",
        });
      }
      return newSet;
    });
  };

  const handleQuickView = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
    }
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header
        cartCount={cartItems.length}
        wishlistCount={wishlistedProducts.size}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Editorial Grid Layout with Sidebar */}
        <section className="px-4 md:px-8 py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Featured Products Grid - Left/Center (takes 3 columns) */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-max">
                {/* Large Featured Product - Takes 2x2 grid cells */}
                {products.length > 0 && (
                  <div className="col-span-1 md:col-span-2 md:row-span-2" data-testid="featured-large-product">
                    <div className="bg-secondary/30 rounded-lg overflow-hidden h-full hover-elevate transition-all">
                      <div className="relative aspect-square md:aspect-auto md:h-80 bg-muted overflow-hidden">
                        <img
                          src={products[0].imageUrl}
                          alt={products[0].name}
                          className={`w-full h-full object-contain p-4 ${
                            ["Electronics", "Furniture"].includes(products[0].category) ? 'blur-lg' : ''
                          }`}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm md:text-base mb-2">{products[0].name}</h3>
                        <p className="text-foreground font-bold text-lg">
                          from ${Number(products[0].price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medium Featured Products - Top right */}
                {products.length > 1 && (
                  <div className="col-span-1 md:col-span-1 md:row-span-1" data-testid="featured-medium-product">
                    <div className="bg-blue-50 rounded-lg overflow-hidden h-full hover-elevate transition-all">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <img
                          src={products[1].imageUrl}
                          alt={products[1].name}
                          className={`w-full h-full object-contain p-3 ${
                            ["Electronics", "Furniture"].includes(products[1].category) ? 'blur-lg' : ''
                          }`}
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-xs md:text-sm line-clamp-2">{products[1].name}</h3>
                        <p className="text-foreground font-bold text-sm mt-1">${Number(products[1].price).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional products in grid */}
                {products.slice(2, 8).map((product) => (
                  <div key={product.id} className="col-span-1" data-testid={`product-card-${product.id}`}>
                    <div className="bg-white rounded-lg border border-card-border overflow-hidden h-full hover-elevate transition-all cursor-pointer">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-contain p-2 ${
                            ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : ''
                          }`}
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-xs line-clamp-2">{product.name}</h3>
                        <p className="text-foreground font-bold text-xs mt-1">${Number(product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar - Today's Picks (Right side - takes 1 column) */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-6">Today's Picks</h2>
                <div className="space-y-4">
                  {products.slice(0, 6).map((product, idx) => (
                    <div key={product.id} className="flex gap-3 hover-elevate p-2 rounded-lg transition-all cursor-pointer" data-testid={`sidebar-pick-${idx}`}>
                      <div className="w-16 h-16 bg-muted rounded flex-shrink-0 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-contain ${
                            ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : ''
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold line-clamp-2 text-foreground">{product.name}</p>
                        <p className="text-sm font-bold text-primary mt-1">${Number(product.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Category Tiles */}
        {categories.length > 0 && <CategoryTiles categories={categories} />}

        {/* Social Proof / Reviews */}
        {reviews.length > 0 && <SocialProof reviews={reviews} />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        cartCount={cartItems.length} 
        activeTab="home"
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Mini Cart Sidebar */}
      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistedProducts.has(quickViewProduct.id) : false}
      />

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
}
