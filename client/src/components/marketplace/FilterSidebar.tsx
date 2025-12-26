import React, { useState } from 'react';
import { Star, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterSidebarProps {
    onPriceChange?: (min: number, max: number) => void;
    onRatingChange?: (rating: number) => void;
    className?: string;
}

const BRANDS = [
    { id: 'all', name: 'All Brands' },
    { id: 'apple', name: 'Apple' },
    { id: 'samsung', name: 'Samsung' },
    { id: 'sony', name: 'Sony' },
    { id: 'nike', name: 'Nike' },
    { id: 'adidas', name: 'Adidas' },
];

export function FilterSidebar({ onPriceChange, onRatingChange, className = '' }: FilterSidebarProps) {
    const [priceRange, setPriceRange] = useState([20, 1130]);
    const [selectedRating, setSelectedRating] = useState(4);
    const [selectedBrands, setSelectedBrands] = useState<string[]>(['all']);
    const [deliveryOption, setDeliveryOption] = useState<'standard' | 'pickup'>('standard');

    const handlePriceChange = (values: number[]) => {
        setPriceRange(values);
        onPriceChange?.(values[0], values[1]);
    };

    const handleRatingChange = (rating: number) => {
        setSelectedRating(rating);
        onRatingChange?.(rating);
    };

    const toggleBrand = (brandId: string) => {
        if (brandId === 'all') {
            setSelectedBrands(['all']);
        } else {
            const newBrands = selectedBrands.filter(b => b !== 'all');
            if (selectedBrands.includes(brandId)) {
                const filtered = newBrands.filter(b => b !== brandId);
                setSelectedBrands(filtered.length ? filtered : ['all']);
            } else {
                setSelectedBrands([...newBrands, brandId]);
            }
        }
    };

    const resetFilters = () => {
        setPriceRange([20, 1130]);
        setSelectedRating(4);
        setSelectedBrands(['all']);
    };

    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
            {/* Price Range */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Price Range</h3>
                    <button onClick={resetFilters} className="text-sm text-gray-400 hover:text-[#7c3aed]">Reset</button>
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
                                <stop offset="0%" stopColor="#7c3aed" />
                                <stop offset="100%" stopColor="#c4b5fd" />
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

            {/* Brand */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Brand</h3>
                    <button
                        onClick={() => setSelectedBrands(['all'])}
                        className="text-sm text-gray-400 hover:text-[#7c3aed]"
                    >
                        Reset
                    </button>
                </div>
                <div className="space-y-2">
                    {BRANDS.map((brand) => (
                        <label
                            key={brand.id}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg -mx-2"
                        >
                            <Checkbox
                                checked={selectedBrands.includes(brand.id)}
                                onCheckedChange={() => toggleBrand(brand.id)}
                                className="border-gray-300 data-[state=checked]:bg-[#7c3aed] data-[state=checked]:border-[#7c3aed]"
                            />
                            <span className="text-sm text-gray-700">{brand.name}</span>
                        </label>
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
                                ? 'bg-[#7c3aed] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setDeliveryOption('pickup')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${deliveryOption === 'pickup'
                                ? 'bg-[#7c3aed] text-white'
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
