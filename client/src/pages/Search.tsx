import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Header } from '@/components/marketplace/Header';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { Footer } from '@/components/marketplace/Footer';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@shared/schema';

export default function SearchPage() {
    const [, setLocation] = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches] = useState([
        'Wireless Headphones',
        'Running Shoes',
        'Smart Watch',
        'Laptop',
    ]);

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ['/api/products'],
    });

    // Trending searches
    const trendingSearches = [
        'Electronics',
        'Fashion',
        'Home Decor',
        'Fitness Equipment',
        'Beauty Products',
    ];

    // Search suggestions
    const suggestions = products
        .filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 8);

    const handleSearch = (query: string) => {
        if (query.trim()) {
            setLocation(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Search Products</h1>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search for products, brands, and more..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                            className="pl-12 pr-4 py-6 text-lg"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Search Results / Suggestions */}
                {searchQuery ? (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Suggestions</h2>
                        {suggestions.length > 0 ? (
                            <div className="space-y-2">
                                {suggestions.map((product) => (
                                    <Link key={product.id} href={`/product/${product.id}`}>
                                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={product.imageUrl ?? ''}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                                <p className="text-sm text-gray-600">{product.category}</p>
                                                <p className="text-sm font-bold text-[hsl(var(--primary))] mt-1">
                                                    ${product.price}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-8">No products found</p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Recent Searches */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <h2 className="text-lg font-semibold">Recent Searches</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(search)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trending Searches */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
                                <h2 className="text-lg font-semibold">Trending Searches</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {trendingSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(search)}
                                        className="px-4 py-2 bg-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] rounded-full text-sm transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Products */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Popular Products</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {products.slice(0, 8).map((product) => (
                                    <Link key={product.id} href={`/product/${product.id}`}>
                                        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                            <CardContent className="p-0">
                                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={product.imageUrl ?? ''}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="text-sm font-medium line-clamp-2 mb-2">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm font-bold text-[hsl(var(--primary))]">
                                                        ${product.price}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
            <BottomNav />
        </div>
    );
}
