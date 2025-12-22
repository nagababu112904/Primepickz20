import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

interface SubCategory {
    name: string;
    slug: string;
}

interface CategoryData {
    name: string;
    slug: string;
    subcategories?: SubCategory[];
}

const categoryData: CategoryData[] = [
    {
        name: 'Electronics',
        slug: 'electronics',
        subcategories: [
            { name: 'Smartphones', slug: 'smartphones' },
            { name: 'Laptops', slug: 'laptops' },
            { name: 'Cameras', slug: 'cameras' },
            { name: 'Audio', slug: 'audio' },
        ],
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        subcategories: [
            { name: 'Men\'s Clothing', slug: 'mens-clothing' },
            { name: 'Women\'s Clothing', slug: 'womens-clothing' },
            { name: 'Kids\' Clothing', slug: 'kids-clothing' },
            { name: 'Accessories', slug: 'accessories' },
        ],
    },
    {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        subcategories: [
            { name: 'Furniture', slug: 'furniture' },
            { name: 'Decor', slug: 'decor' },
            { name: 'Kitchen', slug: 'kitchen' },
            { name: 'Bedding', slug: 'bedding' },
        ],
    },
    {
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        subcategories: [
            { name: 'Skincare', slug: 'skincare' },
            { name: 'Makeup', slug: 'makeup' },
            { name: 'Hair Care', slug: 'hair-care' },
            { name: 'Fragrances', slug: 'fragrances' },
        ],
    },
    {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
    },
    {
        name: 'Toys & Games',
        slug: 'toys-games',
    },
    {
        name: 'Automotive',
        slug: 'automotive',
    },
    {
        name: 'Grocery',
        slug: 'grocery',
    },
];

interface CategoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryDrawer({ isOpen, onClose }: CategoryDrawerProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
            <div
                className="bg-white h-full w-full max-w-sm overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[hsl(var(--border))] px-4 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">All Categories</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-md">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Categories List */}
                <div className="py-2">
                    {categoryData.map((category) => (
                        <div key={category.slug} className="border-b border-gray-100">
                            {category.subcategories ? (
                                <>
                                    {/* Category with Subcategories */}
                                    <button
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        onClick={() =>
                                            setExpandedCategory(expandedCategory === category.slug ? null : category.slug)
                                        }
                                    >
                                        <span className="font-medium">{category.name}</span>
                                        {expandedCategory === category.slug ? (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    {/* Subcategories */}
                                    {expandedCategory === category.slug && (
                                        <div className="bg-gray-50">
                                            {category.subcategories.map((sub) => (
                                                <Link
                                                    key={sub.slug}
                                                    href={`/category/${category.slug}/${sub.slug}`}
                                                    className="block px-8 py-2.5 text-sm text-gray-700 hover:text-[hsl(var(--primary))] hover:bg-gray-100 transition-colors"
                                                    onClick={onClose}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Category without Subcategories */
                                <Link
                                    href={`/category/${category.slug}`}
                                    className="block px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
                                    onClick={onClose}
                                >
                                    {category.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
