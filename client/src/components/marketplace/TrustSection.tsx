import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headset } from 'lucide-react';

const trustFeatures = [
    {
        icon: ShieldCheck,
        title: 'Secure Payments',
        description: '100% secure transactions',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'Quick shipping options',
    },
    {
        icon: RotateCcw,
        title: 'Easy Returns',
        description: 'Hassle-free returns',
    },
    {
        icon: Headset,
        title: '24/7 Support',
        description: 'Always here to help',
    },
];

export function TrustSection() {
    return (
        <section className="py-8 md:py-12 bg-gray-50">
            <div className="px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {trustFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div key={feature.title} className="flex flex-col items-center text-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6 md:w-8 md:h-8 text-[hsl(var(--primary))]" />
                                </div>
                                <h3 className="font-semibold text-sm md:text-base mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
