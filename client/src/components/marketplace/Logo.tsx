import React from 'react';

export function Logo({ className = '', showImage = true }: { className?: string; showImage?: boolean }) {
    return (
        <div className={`font-bold text-xl md:text-2xl flex items-center gap-2 ${className}`}>
            {showImage && (
                <img
                    src="/logo.png"
                    alt="PrimePickz Logo"
                    className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                />
            )}
            <span>
                <span className="text-[#1a365d] font-bold">PRIME</span>
                <span className="text-[#d4a574] font-bold">PICKZ</span>
            </span>
        </div>
    );
}
