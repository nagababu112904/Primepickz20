import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

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
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();

    const hasDiscount = originalPrice && parseFloat(originalPrice) > parseFloat(price);

    // Check if this product is in the user's wishlist
    const { data: wishlistItems = [] } = useQuery<Array<{ productId: string }>>({
        queryKey: ['/api/wishlist', user?.uid],
        queryFn: async () => {
            if (!user?.uid) return [];
            const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.uid)}`);
            if (!res.ok) return [];
            return res.json();
        },
        enabled: isAuthenticated && !!user?.uid,
    });

    const isWishlisted = wishlistItems.some(item => item.productId === id);

    // Toggle wishlist
    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated || !user?.uid) {
            toast({
                title: 'Login Required',
                description: 'Please log in to add items to your wishlist',
                variant: 'destructive',
            });
            return;
        }

        setIsToggling(true);
        try {
            if (isWishlisted) {
                // Remove from wishlist
                const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.uid)}&productId=${encodeURIComponent(id)}`, {
                    method: 'DELETE',
                });
                if (res.ok) {
                    toast({ title: 'Removed from wishlist' });
                }
            } else {
                // Add to wishlist
                const res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.uid, productId: id }),
                });
                if (res.ok) {
                    toast({ title: '❤️ Added to wishlist!' });
                }
            }
            queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update wishlist', variant: 'destructive' });
        } finally {
            setIsToggling(false);
        }
    };

    // Add to cart
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!inStock) return;

        setIsAddingToCart(true);
        try {
            let sessionId = localStorage.getItem('cartSessionId');
            if (!sessionId) {
                sessionId = crypto.randomUUID();
                localStorage.setItem('cartSessionId', sessionId);
            }
            await apiRequest('POST', '/api/cart', {
                productId: id,
                quantity: 1,
                sessionId,
            });
            queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
            toast({ title: '🛒 Added to cart!' });
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to add to cart', variant: 'destructive' });
        } finally {
            setIsAddingToCart(false);
        }
    };

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

            {/* Wishlist Button - Top Right — calls real API */}
            <button
                onClick={handleToggleWishlist}
                disabled={isToggling}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${isWishlisted
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white'
                    } ${isToggling ? 'opacity-50' : ''}`}
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
                <div className="flex items-center gap-2 mb-3">
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            ${parseFloat(originalPrice!).toFixed(2)}
                        </span>
                    )}
                    <span className={`text-lg font-bold ${hasDiscount ? 'text-[#1a2332]' : 'text-gray-900'}`}>
                        ${parseFloat(price).toFixed(2)}
                    </span>
                </div>

                {/* Add to Cart Button */}
                {inStock ? (
                    <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full flex items-center justify-center gap-2 bg-[#1a2332] hover:bg-[#0f1419] text-white py-2.5 px-4 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                ) : (
                    <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-2.5 px-4 rounded-xl font-medium text-sm cursor-not-allowed"
                    >
                        Out of Stock
                    </button>
                )}
            </div>
        </div>
    );
}
