import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';

const footerSections = [
    {
        title: 'Shop',
        links: [
            { label: 'Electronics', href: '/category/electronics' },
            { label: 'Fashion', href: '/category/fashion' },
            { label: 'Home & Kitchen', href: '/category/home-kitchen' },
            { label: 'Beauty', href: '/category/beauty-wellness' },
        ],
    },
    {
        title: 'Customer Service',
        links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Track Order', href: '/track-order' },
            { label: 'Returns', href: '/returns' },
            { label: 'Shipping Policy', href: '/shipping' },
            { label: 'FAQs', href: '/faq' },
        ],
    },
    {
        title: 'About',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
];

function FooterSection({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[hsl(var(--border))] md:border-none">
            {/* Mobile: Accordion Header */}
            <button
                className="md:hidden w-full flex items-center justify-between py-4 text-left font-medium"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {/* Desktop: Static Title */}
            <h3 className="hidden md:block font-medium text-lg mb-4">{title}</h3>

            {/* Links */}
            <ul className={`md:block ${isOpen ? 'block pb-4' : 'hidden'} space-y-2 text-sm`}>
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="text-gray-600 hover:text-[hsl(var(--primary))] transition-colors">
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
        <footer className="bg-gray-50 border-t border-[hsl(var(--border))] mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Footer Sections */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="mb-6 md:mb-0">
                        <div className="font-bold text-2xl mb-4">
                            <span className="text-[hsl(var(--prime-blue))]">PRIME</span>
                            <span className="text-[hsl(var(--pickz-gold))]">PICKZ</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Your premier destination for quality products across all categories.
                        </p>
                    </div>

                    {/* Dynamic Sections */}
                    {footerSections.map((section) => (
                        <FooterSection key={section.title} title={section.title} links={section.links} />
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-[hsl(var(--border))] text-center md:text-left">
                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} PrimePickz. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Safe area for mobile bottom nav */}
            <div className="h-16 md:hidden" />
        </footer>
    );
}
