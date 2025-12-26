import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { ProductCard } from '@/components/marketplace/ProductCard';
import type { Product } from '@shared/schema';

export default function Search() {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['/api/products'],
    });

    // Filter products based on search query
    const filteredProducts = products.filter(p =>
        debouncedQuery.length >= 2 && (
            p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-6 text-lg bg-white border-gray-200 rounded-full focus:ring-2 focus:ring-[#1a2332]/20"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                {debouncedQuery.length < 2 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <SearchIcon className="w-12 h-12 text-[#1a2332]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Search for products</h3>
                        <p className="text-gray-500">Enter at least 2 characters to search</p>
                    </div>
                ) : isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <>
                        <p className="text-gray-500 mb-6">
                            {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {filteredProducts.map((product) => (
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
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <SearchIcon className="w-12 h-12 text-[#1a2332]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-500">Try a different search term</p>
                    </div>
                )}
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
