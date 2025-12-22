import React, { useState } from 'react';
import { Logo } from './Logo';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Link } from 'wouter';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Announcement Bar */}
            <div className="bg-[hsl(var(--pickz-gold))] text-[hsl(var(--foreground))] text-xs text-center py-1.5 px-4">
                Free shipping on orders over $99
            </div>

            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-[hsl(var(--border))] shadow-sm">
                <div className="h-14 md:h-16 px-4 flex items-center justify-between gap-4 max-w-7xl mx-auto">
                    {/* Left: Menu Button (Mobile) / Navigation Links (Desktop) */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="/" className="hover:text-[hsl(var(--primary))] transition-colors">
                                Home
                            </Link>
                            <Link href="/category/electronics" className="hover:text-[hsl(var(--primary))] transition-colors">
                                Electronics
                            </Link>
                            <Link href="/category/fashion" className="hover:text-[hsl(var(--primary))] transition-colors">
                                Fashion
                            </Link>
                            <Link href="/category/home-kitchen" className="hover:text-[hsl(var(--primary))] transition-colors">
                                Home
                            </Link>
                        </nav>
                    </div>

                    {/* Center: Logo */}
                    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                        <Logo />
                    </Link>

                    {/* Right: Icons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/search" className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Search">
                            <Search className="w-5 h-5 md:w-6 md:h-6" />
                        </Link>
                        <Link href="/checkout" className="p-2 hover:bg-gray-100 rounded-md transition-colors relative" aria-label="Cart">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                            {/* Cart badge */}
                            <span className="absolute top-0 right-0 bg-[hsl(var(--primary))] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                0
                            </span>
                        </Link>
                        <Link href="/account" className="hidden sm:block p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="Account">
                            <User className="w-5 h-5 md:w-6 md:h-6" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[hsl(var(--border))] bg-white">
                        <nav className="flex flex-col p-4 gap-4 text-sm font-medium">
                            <Link
                                href="/"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/category/electronics"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Electronics
                            </Link>
                            <Link
                                href="/category/fashion"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Fashion
                            </Link>
                            <Link
                                href="/category/home-kitchen"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home & Kitchen
                            </Link>
                            <Link
                                href="/category/beauty-wellness"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Beauty & Wellness
                            </Link>
                            <Link
                                href="/account"
                                className="py-2 hover:text-[hsl(var(--primary))] transition-colors sm:hidden"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                My Account
                            </Link>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}
