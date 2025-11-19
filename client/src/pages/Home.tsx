import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ProductCarousel } from "@/components/ProductCarousel";
import { CategoryTiles } from "@/components/CategoryTiles";
import { FlashDeals } from "@/components/FlashDeals";
import { SocialProof } from "@/components/SocialProof";
import { MiniCart } from "@/components/MiniCart";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { QuickViewDialog } from "@/components/QuickViewDialog";
import { PromoBanner } from "@/components/PromoBanner";
import type { Product, Category, DealWithProduct, Review, CartItemWithProduct, PurchaseNotification as PurchaseNotificationType } from "@shared/schema";
import promoImage1 from "@assets/stock_images/indian_woman_wearing_3b87b137.jpg";
import promoImage2 from "@assets/stock_images/fashion_sale_shoppin_35f2fd34.jpg";
import promoImage3 from "@assets/stock_images/indian_woman_wearing_61bb8465.jpg";

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

  const { data: deals = [] } = useQuery<DealWithProduct[]>({
    queryKey: ["/api/deals"],
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
    toast({
      title: "Checkout",
      description: "Proceeding to secure checkout...",
    });
    setIsCartOpen(false);
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

        {/* Trending Products Carousel */}
        {trendingProducts.length > 0 && (
          <ProductCarousel
            title="Trending Now"
            subtitle="Most popular products this week"
            products={trendingProducts}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleQuickView}
            wishlistedProducts={wishlistedProducts}
          />
        )}

        {/* Category Tiles */}
        {categories.length > 0 && <CategoryTiles categories={categories} />}

        {/* Promo Banner 1 */}
        <div className="px-4 md:px-6 py-8 md:py-12 max-w-screen-2xl mx-auto">
          <PromoBanner
            title="Festival Fashion Sale!"
            subtitle="Up to 70% OFF on Ethnic Wear"
            imageUrl={promoImage1}
            gradient="pink"
            ctaLink="/category/fashion"
          />
        </div>

        {/* Flash Deals */}
        {deals.length > 0 && (
          <FlashDeals
            deals={deals}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleQuickView}
            wishlistedProducts={wishlistedProducts}
          />
        )}

        {/* Recommended Products Carousel */}
        {recommendedProducts.length > 0 && (
          <ProductCarousel
            title="Recommended for You"
            subtitle="Curated picks based on your style"
            products={recommendedProducts}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleQuickView}
            wishlistedProducts={wishlistedProducts}
          />
        )}

        {/* Promo Banner 2 */}
        <div className="px-4 md:px-6 py-8 md:py-12 max-w-screen-2xl mx-auto">
          <PromoBanner
            title="Mega Shopping Fest!"
            subtitle="Grab Your Favorites Before They're Gone"
            imageUrl={promoImage2}
            gradient="purple"
            ctaLink="/"
          />
        </div>

        {/* New Arrivals Carousel */}
        {newArrivals.length > 0 && (
          <ProductCarousel
            title="New Arrivals"
            subtitle="Fresh styles just landed"
            products={newArrivals}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleQuickView}
            wishlistedProducts={wishlistedProducts}
          />
        )}

        {/* Promo Banner 3 */}
        <div className="px-4 md:px-6 py-8 md:py-12 max-w-screen-2xl mx-auto">
          <PromoBanner
            title="Traditional Elegance"
            subtitle="Discover Timeless Indian Fashion"
            imageUrl={promoImage3}
            gradient="dual"
            ctaLink="/category/fashion"
          />
        </div>

        {/* Social Proof / Reviews */}
        {reviews.length > 0 && <SocialProof reviews={reviews} />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav cartCount={cartItems.length} activeTab="home" />

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
