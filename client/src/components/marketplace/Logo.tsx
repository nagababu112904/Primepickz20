import React from 'react';

export function Logo({ className = '', showImage = true }: { className?: string; showImage?: boolean }) {
    return (
        <div className={`font-bold text-xl md:text-2xl flex items-center gap-2 ${className}`}>
            {showImage && (
                <div className="w-8 h-8 md:w-9 md:h-9 bg-[#d4a574] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </div>
            )}
            <span>
                <span className="text-[#1a365d] font-bold">PRIME</span>
                <span className="text-[#d4a574] font-bold">PICKZ</span>
            </span>
        </div>
    );
}
