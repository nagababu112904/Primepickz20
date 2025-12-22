import React from 'react';
import { Link } from 'wouter';
import {
    Monitor,
    Shirt,
    Home as HomeIcon,
    Sparkles,
    Dumbbell,
    BookOpen,
    Car,
    Gamepad2
} from 'lucide-react';

const categories = [
    {
        name: 'Electronics',
        slug: 'electronics',
        itemCount: '10,000+',
        icon: Monitor,
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        itemCount: '25,000+',
        icon: Shirt,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    },
    {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        itemCount: '15,000+',
        icon: HomeIcon,
        image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
    },
    {
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        itemCount: '8,000+',
        icon: Sparkles,
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    },
    {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        itemCount: '12,000+',
        icon: Dumbbell,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    },
    {
        name: 'Books & Media',
        slug: 'books-media',
        itemCount: '50,000+',
        icon: BookOpen,
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
    },
    {
        name: 'Automotive',
        slug: 'automotive',
        itemCount: '6,000+',
        icon: Car,
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
    },
    {
        name: 'Toys & Games',
        slug: 'toys-games',
        itemCount: '7,000+',
        icon: Gamepad2,
        image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
    },
];

export function ShopByCategory() {
    return (
        <section className="py-12 bg-white">
            <div className="px-4 max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-3">
                        Shop by Category
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover millions of products across all categories with the best prices and fastest delivery
                    </p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link key={category.slug} href={`/category/${category.slug}`}>
                                <div className="group bg-white border border-[hsl(var(--border))] rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                                    {/* Category Image */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        {/* Icon Overlay */}
                                        <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                                            <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                                        </div>
                                    </div>

                                    {/* Category Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {category.itemCount} items
                                        </p>
                                        <div className="flex items-center text-[hsl(var(--primary))] text-sm font-medium group-hover:underline">
                                            Shop Now
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center">
                    <Link href="/categories">
                        <button className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                            View All Categories
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
