import React from 'react';
import { Link } from 'wouter';
import { Star } from 'lucide-react';

interface ProductCardProps {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    imageUrl?: string;
    badge?: string;
    inStock?: boolean;
    stockCount?: number;
    rating?: string | number;
    reviewCount?: number;
}

export function ProductCard({
    id,
    name,
    price,
    originalPrice,
    imageUrl,
    badge,
    inStock = true,
    stockCount,
    rating,
    reviewCount
}: ProductCardProps) {
    const isOutOfStock = inStock === false || stockCount === 0;
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : (rating || 0);

    return (
        <Link href={`/product/${id}`}>
            <div className={`group bg-white border border-[hsl(var(--border))] rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}>
                {/* Image Container - Fixed aspect ratio 4:5 */}
                <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={name}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale' : ''}`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}

                    {/* Out of Stock Badge */}
                    {isOutOfStock && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                            Out of Stock
                        </div>
                    )}

                    {/* Badge */}
                    {badge && !isOutOfStock && (
                        <div className="absolute top-2 left-2 bg-[hsl(var(--primary))] text-white text-xs font-bold px-2 py-1 rounded">
                            {badge}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col gap-1">
                    {/* Title - 2 lines max */}
                    <h3 className="text-sm font-medium line-clamp-2 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors min-h-[2.5rem]">
                        {name}
                    </h3>

                    {/* Star Rating */}
                    {numericRating > 0 && (
                        <div className="flex items-center gap-1">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-3 h-3 ${star <= Math.round(numericRating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-gray-200 text-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">
                                {numericRating.toFixed(1)}
                                {reviewCount !== undefined && ` (${reviewCount})`}
                            </span>
                        </div>
                    )}

                    {/* Price Block */}
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-lg font-bold ${isOutOfStock ? 'text-gray-400' : 'text-[hsl(var(--primary))]'}`}>
                            ${price}
                        </span>
                        {originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                ${originalPrice}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
