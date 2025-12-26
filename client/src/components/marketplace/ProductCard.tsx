import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'wouter';

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    imageUrl?: string;
    badge?: string;
    rating?: number;
    reviewCount?: number;
    inStock?: boolean;
    stockCount?: number;
}

export function ProductCard({
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    badge,
    rating = 0,
    reviewCount = 0,
    inStock = true,
    stockCount,
}: ProductCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(price);

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            {/* Image Container */}
            <Link href={`/product/${id}`}>
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {/* Lazy loaded image */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                    )}
                    <img
                        src={imageUrl || '/placeholder.jpg'}
                        alt={name}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ${!inStock ? 'opacity-50 grayscale' : ''
                            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Rating Badge - Top Left */}
                    {rating > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                            <span className="text-sm font-semibold">{rating.toFixed(1)}/5</span>
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        </div>
                    )}

                    {/* Out of Stock Badge */}
                    {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Wishlist Button - Top Right */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsWishlisted(!isWishlisted);
                }}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${isWishlisted
                        ? 'bg-[#1a2332] text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-[#1a2332] hover:bg-white'
                    }`}
            >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Badge - Top Item / Sale */}
            {badge && (
                <div className={`absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${badge === 'Sale' || badge === 'Hot'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#1a2332] text-white'
                    }`}>
                    {badge === 'New' ? 'Top Item' : badge}
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                <Link href={`/product/${id}`}>
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-3 min-h-[2.5rem] hover:text-[#1a2332] transition-colors">
                        {name}
                    </h3>
                </Link>

                {/* Price Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                                ${parseFloat(originalPrice!).toFixed(2)}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                            <ShoppingCart className="w-4 h-4 text-[#1a2332]" />
                            <span className={`font-bold ${hasDiscount ? 'text-[#1a2332]' : 'text-gray-900'}`}>
                                ${parseFloat(price).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
