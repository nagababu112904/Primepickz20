import React from 'react';
import { ProductCard } from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

interface Product {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    imageUrl?: string;
    badge?: string;
    inStock?: boolean;
    stockCount?: number;
}

interface FeaturedSectionProps {
    title: string;
    products: Product[];
    viewAllLink?: string;
}

export function FeaturedSection({ title, products, viewAllLink }: FeaturedSectionProps) {
    return (
        <section className="py-8 md:py-12">
            <div className="px-4 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-2xl font-bold text-[hsl(var(--foreground))]">
                        {title}
                    </h2>
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                        >
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {/* Products - Horizontal scroll on mobile, grid on desktop */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-4" style={{ width: 'max-content' }}>
                        {products.map((product) => (
                            <div key={product.id} className="w-40">
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
