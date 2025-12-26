import React, { useState } from 'react';
import { Logo } from './Logo';
import { Search, ShoppingCart, User, Menu, X, Heart, Package } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    {/* Left: Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Logo />
                    </Link>

                    {/* Center: Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-xl mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus:ring-2 focus:ring-[#1a2332]/20"
                            />
                        </div>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Mobile Search */}
                        <Link href="/search" className="md:hidden p-2 hover:bg-gray-100 rounded-full" aria-label="Search">
                            <Search className="w-5 h-5 text-gray-600" />
                        </Link>

                        {/* Orders */}
                        <Link href="/account" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <Package className="w-5 h-5" />
                            <span className="text-sm font-medium">Orders</span>
                        </Link>

                        {/* Favourites/Wishlist */}
                        <Link href="/wishlist" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <Heart className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Favourites</span>
                        </Link>

                        {/* Cart */}
                        <Link href="/checkout" className="flex items-center gap-2 text-[#1a2332] hover:text-[#0f1419]">
                            <div className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-2 -right-2 bg-[#1a2332] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    0
                                </span>
                            </div>
                            <span className="hidden md:inline text-sm font-medium">Cart</span>
                        </Link>

                        {/* Account */}
                        <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        </Link>

                        {/* Mobile Menu */}
                        <button
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-12 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full"
                        />
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-white">
                        <nav className="flex flex-col p-4 gap-3">
                            <Link href="/" className="py-2 text-gray-700 hover:text-[#1a2332]" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href="/category/electronics" className="py-2 text-gray-700 hover:text-[#1a2332]" onClick={() => setMobileMenuOpen(false)}>
                                Electronics
                            </Link>
                            <Link href="/category/fashion" className="py-2 text-gray-700 hover:text-[#1a2332]" onClick={() => setMobileMenuOpen(false)}>
                                Fashion
                            </Link>
                            <Link href="/category/home-kitchen" className="py-2 text-gray-700 hover:text-[#1a2332]" onClick={() => setMobileMenuOpen(false)}>
                                Home & Kitchen
                            </Link>
                            <Link href="/account" className="py-2 text-gray-700 hover:text-[#1a2332]" onClick={() => setMobileMenuOpen(false)}>
                                My Account
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
