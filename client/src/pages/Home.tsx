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
        <section className="bg-white py-12 px-4 md:px-6">
          <div className="max-w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Main Product Grid (9 columns on desktop, 1 on mobile) */}
              <div className="lg:col-span-9">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Large Featured Product */}
                  {products.length > 0 && (
                    <div className="col-span-2 row-span-2" data-testid="featured-large-product">
                      <div className="bg-pink-50 rounded-md overflow-hidden h-full hover-elevate cursor-pointer">
                        <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                          <img
                            src={products[0].imageUrl}
                            alt={products[0].name}
                            className={`w-full h-full object-contain ${
                              ["Electronics", "Furniture"].includes(products[0].category) ? 'blur-lg' : ''
                            }`}
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-sm line-clamp-2">{products[0].name}</h3>
                          <p className="text-foreground font-bold text-sm mt-1">from ${Number(products[0].price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top right featured product */}
                  {products.length > 1 && (
                    <div className="col-span-1" data-testid="featured-top-right">
                      <div className="bg-blue-50 rounded-md overflow-hidden h-full hover-elevate cursor-pointer">
                        <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                          <img
                            src={products[1].imageUrl}
                            alt={products[1].name}
                            className={`w-full h-full object-contain ${
                              ["Electronics", "Furniture"].includes(products[1].category) ? 'blur-lg' : ''
                            }`}
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-xs line-clamp-2">{products[1].name}</h3>
                          <p className="text-foreground font-bold text-xs mt-0.5">${Number(products[1].price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom right featured products */}
                  {products.slice(2, 4).map((product) => (
                    <div key={product.id} className="col-span-1" data-testid={`product-card-${product.id}`}>
                      <div className="bg-white border border-card-border rounded-md overflow-hidden h-full hover-elevate cursor-pointer">
                        <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-contain ${
                              ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : ''
                            }`}
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-xs line-clamp-2">{product.name}</h3>
                          <p className="text-foreground font-bold text-xs mt-0.5">${Number(product.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Bottom row products */}
                  {products.slice(4, 10).map((product) => (
                    <div key={product.id} className="col-span-1" data-testid={`product-card-${product.id}`}>
                      <div className="bg-white border border-card-border rounded-md overflow-hidden h-full hover-elevate cursor-pointer">
                        <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={`w-full h-full object-contain ${
                              ["Electronics", "Furniture"].includes(product.category) ? 'blur-lg' : ''
                            }`}
                          />
                        </div>
                        <div className="p-2">
                          <h3 className="font-semibold text-xs line-clamp-2">{product.name}</h3>
                          <p className="text-foreground font-bold text-xs mt-0.5">${Number(product.price).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar - Today's Picks (3 columns on desktop) */}
              <aside className="lg:col-span-3">
                <div className="sticky top-24">
                  <h2 className="text-lg font-bold text-foreground mb-4">Today's Picks</h2>
                  <div className="space-y-3">
                    {products.slice(0, 6).map((product, idx) => (
                      <div key={product.id} className="flex gap-3 hover-elevate p-2 rounded-md transition-all cursor-pointer" data-testid={`sidebar-pick-${idx}`}>
                        <div className="w-14 h-14 bg-muted rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
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
                          <p className="text-xs font-bold text-primary mt-1">${Number(product.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
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
