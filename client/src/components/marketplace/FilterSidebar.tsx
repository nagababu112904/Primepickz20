import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface FilterSidebarProps {
    onPriceChange?: (min: number, max: number) => void;
    onRatingChange?: (rating: number) => void;
    className?: string;
}

export function FilterSidebar({ onPriceChange, onRatingChange, className = '' }: FilterSidebarProps) {
    const [priceRange, setPriceRange] = useState([20, 1130]);
    const [selectedRating, setSelectedRating] = useState(4);
    const [deliveryOption, setDeliveryOption] = useState<'standard' | 'pickup'>('standard');

    const handlePriceChange = (values: number[]) => {
        setPriceRange(values);
        onPriceChange?.(values[0], values[1]);
    };

    const handleRatingChange = (rating: number) => {
        setSelectedRating(rating);
        onRatingChange?.(rating);
    };

    const resetFilters = () => {
        setPriceRange([20, 1130]);
        setSelectedRating(4);
    };

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
            {/* Price Range */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Price Range</h3>
                    <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-[#1a2332]">Reset</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">The average price is $300</p>

                {/* Price Chart Visualization */}
                <div className="h-16 mb-4 relative">
                    <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <path
                            d="M0 60 Q 30 60, 50 40 T 100 20 T 150 40 T 200 50 L 200 60 Z"
                            fill="url(#priceGradient)"
                            opacity="0.5"
                        />
                        <defs>
                            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1a2332" />
                                <stop offset="100%" stopColor="#adb5bd" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <Slider
                    min={0}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    className="mb-3"
                />

                <div className="flex items-center justify-between">
                    <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg">${priceRange[0]}</span>
                    <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg">${priceRange[1]}</span>
                </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Star Rating</h3>
                    <span className="text-sm text-gray-500">{selectedRating} Stars & up</span>
                </div>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRatingChange(star)}
                            className="p-0.5"
                        >
                            <Star
                                className={`w-6 h-6 transition-colors ${star <= selectedRating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Delivery Options */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3">Delivery Options</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setDeliveryOption('standard')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${deliveryOption === 'standard'
                                ? 'bg-[#1a2332] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setDeliveryOption('pickup')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${deliveryOption === 'pickup'
                                ? 'bg-[#1a2332] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Pick Up
                    </button>
                </div>
            </div>
        </div>
    );
}
