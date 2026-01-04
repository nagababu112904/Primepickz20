import React from 'react';
import { Home, Grid3x3, Search, User, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { CartItemWithProduct } from '@shared/schema';

export function BottomNav() {
    const [location] = useLocation();

    // Fetch cart count
    const { data: cartItems = [] } = useQuery<CartItemWithProduct[]>({
        queryKey: ['/api/cart'],
        queryFn: async () => {
            let sessionId = localStorage.getItem('cartSessionId');
            if (!sessionId) {
                sessionId = crypto.randomUUID();
                localStorage.setItem('cartSessionId', sessionId);
            }
            const res = await fetch(`/api/cart?sessionId=${sessionId}`);
            if (!res.ok) return [];
            return res.json();
        },
    });

    const cartCount = cartItems.length;

    const isActive = (path: string) => {
        if (path === '/') return location === '/';
        return location.startsWith(path);
    };

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/account', icon: User, label: 'Account' },
        { path: '/checkout', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ path, icon: Icon, label, badge }) => (
                    <Link
                        key={path}
                        href={path}
                        className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive(path)
                            ? 'text-[#1a2332]'
                            : 'text-gray-400'
                            }`}
                    >
                        <div className="relative">
                            <Icon className="w-5 h-5 mb-0.5" />
                            {badge !== undefined && badge > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-[#d4a574] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
                            {label}
                        </span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
