import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { CategoryPills } from './CategoryPills';

interface PageLayoutProps {
    children: React.ReactNode;
    showCategories?: boolean;
    activeCategory?: string;
    onCategoryChange?: (slug: string) => void;
}

export function PageLayout({
    children,
    showCategories = false,
    activeCategory = '',
    onCategoryChange,
}: PageLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ede9fe]">
            {/* Header */}
            <Header />

            {/* Category Pills - Optional */}
            {showCategories && (
                <CategoryPills
                    activeCategory={activeCategory}
                    onCategoryChange={onCategoryChange}
                />
            )}

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Mobile Bottom Nav */}
            <BottomNav />
        </div>
    );
}
