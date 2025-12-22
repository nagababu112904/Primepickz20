import React from 'react';

export function Logo({ className = '' }: { className?: string }) {
    return (
        <div className={`font-bold text-2xl ${className}`}>
            <span className="text-[hsl(var(--prime-blue))]">PRIME</span>
            <span className="text-[hsl(var(--pickz-gold))]">PICKZ</span>
        </div>
    );
}
