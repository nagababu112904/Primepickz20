import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Category } from "@shared/schema";

interface CategoryTilesProps {
  categories: Category[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div
                className="group relative aspect-[4/3] rounded-lg overflow-hidden hover-elevate transition-all cursor-pointer"
                data-testid={`category-tile-${category.slug}`}
              >
                {/* Background Image */}
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-muted flex items-center justify-center">
                    <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-primary/40" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                  <h3 className="text-white text-lg md:text-xl font-bold mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 text-sm mb-3 line-clamp-2 hidden md:block">
                      {category.description}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-fit gap-1 bg-white/90 hover:bg-white text-foreground backdrop-blur-sm"
                    data-testid={`button-shop-${category.slug}`}
                  >
                    Shop Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
