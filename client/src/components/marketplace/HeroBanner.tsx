import React from 'react';

export function HeroBanner() {
    return (
        <div className="relative w-full bg-gradient-to-r from-[hsl(var(--prime-blue))] to-[hsl(var(--primary))] overflow-hidden">
            {/* Mobile: 16:9 aspect ratio */}
            <div className="aspect-video md:aspect-[21/9] flex items-center justify-center px-6 md:px-12">
                <div className="text-center text-white max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        Discover Your Style
                    </h1>
                    <p className="text-sm md:text-lg mb-6 opacity-90">
                        Find the perfect product from our curated collection
                    </p>
                    <button className="bg-[hsl(var(--pickz-gold))] text-[hsl(var(--foreground))] px-8 py-3 rounded-md font-medium hover:opacity-90 transition-opacity">
                        Shop Now
                    </button>
                </div>
            </div>
        </div>
    );
}
