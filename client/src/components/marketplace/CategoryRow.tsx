import React from 'react';
import { Link } from 'wouter';
import {
    Smartphone,
    Laptop,
    Monitor,
    Shirt,
    User,
    Users,
    Baby,
    Footprints,
    Watch,
    Briefcase,
    Sparkles,
    Home,
    Sofa,
    Zap,
    Dumbbell,
    Plane,
    Gamepad2,
    Car,
    ShoppingBasket,
} from 'lucide-react';

const categories = [
    { name: 'Electronics', slug: 'electronics', icon: Zap },
    { name: 'Mobiles', slug: 'mobiles-accessories', icon: Smartphone },
    { name: 'Computers', slug: 'computers-accessories', icon: Laptop },
    { name: 'Fashion', slug: 'fashion', icon: Shirt },
    { name: 'Men', slug: 'men', icon: User },
    { name: 'Women', slug: 'women', icon: Users },
    { name: 'Kids', slug: 'kids', icon: Baby },
    { name: 'Footwear', slug: 'footwear', icon: Footprints },
    { name: 'Watches', slug: 'watches', icon: Watch },
    { name: 'Bags', slug: 'bags-luggage', icon: Briefcase },
    { name: 'Beauty', slug: 'beauty-personal-care', icon: Sparkles },
    { name: 'Home', slug: 'home-kitchen', icon: Home },
    { name: 'Furniture', slug: 'furniture', icon: Sofa },
    { name: 'Appliances', slug: 'appliances', icon: Monitor },
    { name: 'Sports', slug: 'sports-fitness', icon: Dumbbell },
    { name: 'Travel', slug: 'travel', icon: Plane },
    { name: 'Toys', slug: 'toys-games', icon: Gamepad2 },
    { name: 'Auto', slug: 'automotive', icon: Car },
    { name: 'Grocery', slug: 'grocery', icon: ShoppingBasket },
];

export function CategoryRow() {
    return (
        <div className="bg-white border-b border-[hsl(var(--border))] py-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4 max-w-7xl mx-auto">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <Link
                            key={category.slug}
                            href={`/category/${category.slug}`}
                            className="flex flex-col items-center gap-2 min-w-[72px] group"
                        >
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.1)] transition-colors">
                                <Icon className="w-6 h-6 text-gray-700 group-hover:text-[hsl(var(--primary))] transition-colors" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 text-center leading-tight group-hover:text-[hsl(var(--primary))] transition-colors">
                                {category.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
