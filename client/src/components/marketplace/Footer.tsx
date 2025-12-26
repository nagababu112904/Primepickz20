import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'wouter';

const footerSections = [
    {
        title: 'Quick Links',
        links: [
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/categories' },
            { label: 'My Account', href: '/account' },
            { label: 'Shopping Cart', href: '/checkout' },
            { label: 'Wishlist', href: '/wishlist' },
        ],
    },
    {
        title: 'Customer Service',
        links: [
            { label: 'Help Center', href: '/faq' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Shipping Info', href: '/shipping' },
            { label: 'Returns & Exchanges', href: '/returns' },
            { label: 'Track Your Order', href: '/track-order' },
        ],
    },
    {
        title: 'Popular Categories',
        links: [
            { label: 'Electronics', href: '/category/electronics' },
            { label: 'Fashion', href: '/category/fashion' },
            { label: 'Home & Kitchen', href: '/category/home-kitchen' },
            { label: 'Beauty & Personal Care', href: '/category/beauty-personal-care' },
            { label: 'Sports & Fitness', href: '/category/sports-fitness' },
        ],
    },
];

function FooterSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700 md:border-none">
            {/* Mobile: Accordion Header */}
            <button
                className="md:hidden w-full flex items-center justify-between py-4 text-left font-semibold text-white"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {/* Desktop: Static Title */}
            <h3 className="hidden md:block font-semibold text-white text-lg mb-4">{title}</h3>

            {/* Links */}
            <ul className={`md:block ${isOpen ? 'block pb-4' : 'hidden'} space-y-3`}>
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Footer() {
    return (
        <footer className="bg-[#1a2332] text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="PrimePickz Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <div className="font-bold text-xl">
                                <span className="text-white">PRIME</span>
                                <span className="text-[#d4a574]">PICKZ</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">
                            Your trusted marketplace for premium products with fast shipping and excellent customer service.
                        </p>

                        {/* Contact Information */}
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-[hsl(var(--pickz-gold))] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">475-239-6334</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-[hsl(var(--pickz-gold))] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">support@primepickz.com</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[hsl(var(--pickz-gold))] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">9121 Avalon Gates, Trumbull, CT 06611</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {footerSections.map((section) => (
                        <FooterSection key={section.title} title={section.title} links={section.links} />
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} PrimePickz. All rights reserved. Powered by Readdy
                        </p>

                        {/* Links & Social */}
                        <div className="flex items-center gap-6">
                            {/* Legal Links */}
                            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                                Terms of Service
                            </Link>

                            {/* Social Icons */}
                            <div className="flex items-center gap-3 ml-4">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-4 h-4 text-white" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-colors"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="w-4 h-4 text-white" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-gray-700 hover:bg-[hsl(var(--primary))] flex items-center justify-center transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-4 h-4 text-white" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safe area for mobile bottom nav */}
            <div className="h-16 md:hidden" />
        </footer>
    );
}
