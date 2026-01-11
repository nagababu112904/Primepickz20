import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { analytics } from '@/lib/analytics';
import type { Product } from '@shared/schema';

interface SearchAutocompleteProps {
    className?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
}

// Popular searches (could be fetched from API based on trends)
const POPULAR_SEARCHES = [
    'Electronics',
    'Kitchen appliances',
    'Fashion',
    'Beauty products',
    'Home decor',
];

export function SearchAutocomplete({ className = '', placeholder = 'Search products...', onSearch }: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [, setLocation] = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get recent searches from localStorage
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            return JSON.parse(localStorage.getItem('recentSearches') || '[]').slice(0, 5);
        } catch {
            return [];
        }
    });

    // Fetch products for suggestions
    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['/api/products'],
    });

    // Filter suggestions based on query
    const suggestions = query.length >= 2
        ? products
            .filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 6)
        : [];

    // Get unique categories from filtered products
    const categoryMatches = query.length >= 2
        ? [...new Set(
            products
                .filter(p => p.category?.toLowerCase().includes(query.toLowerCase()))
                .map(p => p.category)
        )].slice(0, 3)
        : [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        // Track search
        analytics.search(searchQuery);

        // Save to recent searches
        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));

        // Navigate to search results
        setIsOpen(false);
        setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
        onSearch?.(searchQuery);
    };

    const handleProductClick = (product: Product) => {
        analytics.viewItem({
            item_id: product.id,
            item_name: product.name,
            price: parseFloat(product.price),
            item_category: product.category || undefined,
        });
        setIsOpen(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(query);
                        }
                        if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-[#1a2332]/20"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                >
                    {/* Loading State */}
                    {isLoading && query.length >= 2 && (
                        <div className="p-4 flex items-center justify-center text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Searching...
                        </div>
                    )}

                    {/* Product Suggestions */}
                    {query.length >= 2 && suggestions.length > 0 && (
                        <div className="p-2">
                            <p className="text-xs text-gray-500 px-3 py-2 font-medium">Products</p>
                            {suggestions.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={product.imageUrl || '/placeholder.jpg'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                            <p className="text-sm text-gray-500">${product.price}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Category Matches */}
                    {categoryMatches.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 px-3 py-2 font-medium">Categories</p>
                            {categoryMatches.map((category) => (
                                <Link
                                    key={category}
                                    href={`/category/${category?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                                        <div className="w-8 h-8 bg-[#1a2332] rounded-lg flex items-center justify-center">
                                            <Search className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm text-gray-700">Shop {category}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query.length >= 2 && !isLoading && suggestions.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-gray-500 mb-2">No products found for "{query}"</p>
                            <button
                                onClick={() => handleSearch(query)}
                                className="text-sm text-[#1a2332] font-medium hover:underline"
                            >
                                Search for "{query}"
                            </button>
                        </div>
                    )}

                    {/* Recent & Popular Searches (when no query) */}
                    {query.length < 2 && (
                        <>
                            {recentSearches.length > 0 && (
                                <div className="p-2 border-b border-gray-100">
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <p className="text-xs text-gray-500 font-medium">Recent Searches</p>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-gray-400 hover:text-gray-600"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {recentSearches.map((search, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSearch(search)}
                                            className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors"
                                        >
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="p-2">
                                <p className="text-xs text-gray-500 px-3 py-2 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    Popular Searches
                                </p>
                                {POPULAR_SEARCHES.map((search, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSearch(search)}
                                        className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchAutocomplete;
