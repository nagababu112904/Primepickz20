import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, Category } from "@shared/schema";
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
import { Header } from "@/components/marketplace/Header";
import { BottomNav } from "@/components/marketplace/BottomNav";
import { Footer } from "@/components/marketplace/Footer";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { ProductCard } from "@/components/marketplace/ProductCard";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const category = categories?.find(cat => cat.slug === slug);
  const products = allProducts?.filter(p => {
    if (!category) return false;
    const matchesCategory = p.category === category.name;
    const price = parseFloat(p.price);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const productRating = typeof p.rating === 'string' ? parseFloat(p.rating) : (p.rating || 0);
    const matchesRating = productRating >= minRating;
    return matchesCategory && matchesPrice && matchesRating;
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

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ede9fe]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ede9fe]">
      <Header />

      {/* Category Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-3 text-gray-600 hover:text-[#7c3aed]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-500 text-sm mt-1">{sortedProducts.length} products</p>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                onPriceChange={(min, max) => setPriceRange([min, max])}
                onRatingChange={setMinRating}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice || undefined}
                    imageUrl={product.imageUrl || undefined}
                    badge={product.badge || undefined}
                    rating={typeof product.rating === 'string' ? parseFloat(product.rating) : (product.rating || 0)}
                    reviewCount={product.reviewCount || 0}
                    inStock={product.inStock ?? true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
