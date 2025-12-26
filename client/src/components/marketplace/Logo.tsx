import React from 'react';

export function Logo({ className = '', showImage = true }: { className?: string; showImage?: boolean }) {
    return (
        <div className={`font-bold text-2xl flex items-center gap-2 ${className}`}>
            {showImage && (
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                />
            )}
            <span>
                <span className="text-[hsl(var(--prime-blue))]">PRIME</span>
                <span className="text-[hsl(var(--pickz-gold))]">PICKZ</span>
            </span>
        </div>
    );
}
