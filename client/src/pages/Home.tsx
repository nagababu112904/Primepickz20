import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/marketplace/Header';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { CategoryPills } from '@/components/marketplace/CategoryPills';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { TrustSection } from '@/components/marketplace/TrustSection';
import { Footer } from '@/components/marketplace/Footer';
import type { Product } from '@shared/schema';

export default function Home() {
  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      {/* Header */}
      <Header />

      {/* Category Pills - No callback means they navigate to category pages */}
      <CategoryPills />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6">
        {/* Products Grid - Full width, no sidebar */}
        <div className="w-full">
          {isLoading ? (
            // Loading skeleton
            <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.originalPrice || undefined}
                  imageUrl={product.imageUrl || undefined}
                  badge={product.badge || undefined}
                  rating={product.rating || 0}
                  reviewCount={product.reviewCount || 0}
                  inStock={product.inStock ?? true}
                  stockCount={product.stockCount || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-[#1a2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Check back later for new arrivals</p>
            </div>
          )}
        </div>
      </main>

      {/* Trust Section */}
      <TrustSection />

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
