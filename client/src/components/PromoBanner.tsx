import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  gradient?: "pink" | "purple" | "dual";
}

export function PromoBanner({ 
  title, 
  subtitle, 
  imageUrl, 
  ctaText = "Shop Now",
  ctaLink = "/",
  gradient = "dual" 
}: PromoBannerProps) {
  const gradientClasses = {
    pink: "from-pink-600 via-pink-500 to-pink-400",
    purple: "from-purple-600 via-purple-500 to-purple-400",
    dual: "from-pink-600 via-purple-500 to-pink-400"
  };

  return (
    <div className="relative overflow-hidden rounded-2xl group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses[gradient]} opacity-90`} />
      </div>

      {/* Content */}
      <div className="relative px-8 md:px-16 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left max-w-2xl">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
              Limited Time Offer
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 drop-shadow-lg leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-2xl text-white/90 font-semibold mb-6">
              {subtitle}
            </p>
          )}
        </div>

        <Button
          size="lg"
          className="h-14 px-8 text-lg font-bold bg-white text-pink-600 hover:bg-pink-50 hover:scale-110 transition-all duration-300 shadow-2xl group/btn"
          onClick={() => window.location.href = ctaLink}
          data-testid="button-promo-cta"
        >
          {ctaText}
          <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-4 left-4 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl" />
    </div>
  );
}
