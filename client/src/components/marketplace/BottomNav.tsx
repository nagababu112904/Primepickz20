import React from 'react';
import { Home, Grid3x3, Search, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export function BottomNav() {
    const [location] = useLocation();

    const isActive = (path: string) => location === path;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[hsl(var(--border))] shadow-lg z-50 pb-safe">
            <div className="flex items-center justify-around h-16">
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/') ? 'text-[hsl(var(--pickz-gold))]' : 'text-gray-600'
                        }`}
                >
                    <Home className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Home</span>
                </Link>

                <Link
                    href="/categories"
                    className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/categories') ? 'text-[hsl(var(--pickz-gold))]' : 'text-gray-600'
                        }`}
                >
                    <Grid3x3 className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Categories</span>
                </Link>

                <Link
                    href="/search"
                    className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/search') ? 'text-[hsl(var(--pickz-gold))]' : 'text-gray-600'
                        }`}
                >
                    <Search className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Search</span>
                </Link>

                <Link
                    href="/account"
                    className={`flex flex-col items-center justify-center flex-1 h-full ${isActive('/account') ? 'text-[hsl(var(--pickz-gold))]' : 'text-gray-600'
                        }`}
                >
                    <User className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Account</span>
                </Link>

                <Link
                    href="/checkout"
                    className={`flex flex-col items-center justify-center flex-1 h-full relative ${isActive('/checkout') ? 'text-[hsl(var(--pickz-gold))]' : 'text-gray-600'
                        }`}
                >
                    <div className="relative">
                        <ShoppingCart className="w-6 h-6 mb-1" />
                        {/* Cart badge */}
                        <span className="absolute -top-1 -right-2 bg-[hsl(var(--primary))] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                            0
                        </span>
                    </div>
                    <span className="text-xs font-medium">Cart</span>
                </Link>
            </div>
        </nav>
    );
}
