import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { Header } from "@/components/marketplace/Header";
import { Footer } from "@/components/marketplace/Footer";
import { BottomNav } from "@/components/marketplace/BottomNav";

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
}

export default function Wishlist() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: wishlistItems = [] } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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
    mutationFn: (productId: string) => {
      let sessionId = localStorage.getItem('cartSessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('cartSessionId', sessionId);
      }
      return apiRequest("POST", "/api/cart", {
        productId,
        quantity: 1,
        sessionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
  });

  const wishlistedProducts = allProducts.filter((product) =>
    wishlistItems.some((item) => item.productId === product.id)
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md text-center py-12 px-8">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-gray-500 mb-6">Please log in to view your wishlist</p>
              <Button className="bg-[#1a2332] hover:bg-[#0f1419]">Login</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-[#1a2332]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"}
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#1a2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Start adding products you love!</p>
              <Link href="/">
                <Button className="bg-[#1a2332] hover:bg-[#0f1419]">Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 w-8 h-8"
                      onClick={() => removeFromWishlistMutation.mutate(product.id)}
                      disabled={removeFromWishlistMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2 mb-2 text-sm">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-[#1a2332] hover:bg-[#0f1419]"
                    size="sm"
                    onClick={() => addToCartMutation.mutate(product.id)}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
