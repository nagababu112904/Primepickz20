import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, Category } from "@shared/schema";
import { useState } from "react";
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
import { ProductCard } from "@/components/marketplace/ProductCard";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  const [sortBy, setSortBy] = useState("featured");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const category = categories?.find(cat => cat.slug === slug);

  // Helper function for flexible category matching
  const matchesAnyCategory = (productCategory: string | null | undefined, targetCategory: Category | undefined): boolean => {
    if (!targetCategory || !productCategory) return false;

    const productCat = productCategory.toLowerCase().trim();
    const targetName = targetCategory.name.toLowerCase().trim();
    const targetSlug = targetCategory.slug.toLowerCase().trim();

    // Exact match
    if (productCat === targetName) return true;

    // Slug match (e.g., "home-kitchen" matches)
    if (productCat === targetSlug) return true;
    if (productCat.replace(/[\s&]/g, '-') === targetSlug) return true;

    // Handle & vs "and" variations
    const normalizedProduct = productCat.replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
    const normalizedTarget = targetName.replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');
    if (normalizedProduct === normalizedTarget) return true;

    // Partial match (e.g., "Kitchen" matches "Home & Kitchen")
    if (targetName.includes(productCat) || productCat.includes(targetName)) return true;

    // Word-based match (e.g., "Home", "Kitchen" in target)
    const targetWords = targetName.split(/[\s&]+/).filter(w => w.length > 2);
    const productWords = productCat.split(/[\s&]+/).filter(w => w.length > 2);
    if (productWords.some(pw => targetWords.includes(pw))) return true;

    return false;
  };

  // Simple filter - just match category, no price/rating filtering
  const products = allProducts?.filter(p => {
    if (!category) return false;
    return matchesAnyCategory(p.category, category);
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
            <Link href="/">
              <Button className="bg-[#1a2332] hover:bg-[#0f1419]">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <Header />

      {/* Category Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-3 text-gray-600 hover:text-[#1a2332]">
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

      {/* Main Content - No Sidebar */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-[#1a2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Check back later for new arrivals</p>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
