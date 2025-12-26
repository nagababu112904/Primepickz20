import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

interface Category {
    id: string;
    name: string;
    slug: string;
}

const DEFAULT_CATEGORIES = [
    { id: 'all', name: 'All Categories', slug: '' },
    { id: 'deals', name: 'Deals', slug: 'deals' },
    { id: 'electronics', name: 'Electronics', slug: 'electronics' },
    { id: 'fashion', name: 'Fashion', slug: 'fashion' },
    { id: 'health', name: 'Health & Wellness', slug: 'health-wellness' },
    { id: 'home', name: 'Home', slug: 'home-kitchen' },
    { id: 'beauty', name: 'Beauty', slug: 'beauty-wellness' },
    { id: 'sports', name: 'Sports', slug: 'sports' },
];

interface CategoryPillsProps {
    activeCategory?: string;
    onCategoryChange?: (slug: string) => void;
}

export function CategoryPills({ activeCategory = '', onCategoryChange }: CategoryPillsProps) {
    const [location] = useLocation();

    // Fetch categories from API
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) return DEFAULT_CATEGORIES;
            const data = await res.json();
            return [{ id: 'all', name: 'All Categories', slug: '' }, ...data];
        },
    });

    const displayCategories = categories.length > 1 ? categories : DEFAULT_CATEGORIES;

    return (
        <div className="bg-white border-b border-gray-100 py-4 overflow-x-auto scrollbar-hide">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-2 md:gap-3 flex-nowrap">
                    {displayCategories.map((category) => {
                        const isActive = activeCategory === category.slug ||
                            (category.slug === '' && activeCategory === '') ||
                            location === `/category/${category.slug}`;

                        if (onCategoryChange) {
                            return (
                                <button
                                    key={category.id}
                                    onClick={() => onCategoryChange(category.slug)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                                            ? 'bg-[#7c3aed] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={category.id}
                                href={category.slug ? `/category/${category.slug}` : '/'}
                            >
                                <button
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${isActive
                                            ? 'bg-[#7c3aed] text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
