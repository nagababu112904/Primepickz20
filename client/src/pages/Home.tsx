import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/marketplace/Header';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { CategoryRow } from '@/components/marketplace/CategoryRow';
import { HeroBanner } from '@/components/marketplace/HeroBanner';
import { ShopByCategory } from '@/components/marketplace/ShopByCategory';
import { FeaturedSection } from '@/components/marketplace/FeaturedSection';
import { TrustSection } from '@/components/marketplace/TrustSection';
import { Footer } from '@/components/marketplace/Footer';
import type { Product } from '@shared/schema';

export default function Home() {
  // Fetch products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Organize products by category
  const trendingProducts = products
    .filter(p => p.tags?.includes('trending'))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
      badge: p.badge ?? undefined,
    }));

  const bestSellers = products
    .filter(p => p.tags?.includes('bestseller'))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
      badge: p.badge ?? undefined,
    }));

  const newArrivals = products
    .filter(p => p.badge === 'New')
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
      badge: p.badge ?? undefined,
    }));

  const recommendedProducts = products
    .filter(p => p.tags?.includes('recommended'))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      imageUrl: p.imageUrl ?? undefined,
      badge: p.badge ?? undefined,
    }));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Sticky */}
      <Header />

      {/* Category Row - Horizontal Scroll */}
      <CategoryRow />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner - Static */}
        <HeroBanner />

        {/* Shop by Category Grid */}
        <ShopByCategory />

        {/* Featured Section: Trending Items */}
        {trendingProducts.length > 0 && (
          <FeaturedSection
            title="Trending Now"
            products={trendingProducts}
            viewAllLink="/category/trending"
          />
        )}

        {/* Featured Section: Best Sellers */}
        {bestSellers.length > 0 && (
          <FeaturedSection
            title="Best Sellers"
            products={bestSellers}
            viewAllLink="/category/best-sellers"
          />
        )}

        {/* Featured Section: New Arrivals */}
        {newArrivals.length > 0 && (
          <FeaturedSection
            title="New Arrivals"
            products={newArrivals}
            viewAllLink="/category/new-arrivals"
          />
        )}

        {/* Featured Section: Recommended For You */}
        {recommendedProducts.length > 0 && (
          <FeaturedSection
            title="Recommended For You"
            products={recommendedProducts}
            viewAllLink="/category/recommended"
          />
        )}

        {/* Trust Section */}
        <TrustSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}
