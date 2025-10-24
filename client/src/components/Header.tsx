import { useState } from "react";
import { Search, Heart, User, ShoppingCart, Menu, X, Mic, Globe, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@shared/schema";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onCartClick: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function Header({ cartCount, wishlistCount, onCartClick, language, onLanguageChange }: HeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice search",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language === "hi" ? "hi-IN" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setLocation(`/search?q=${encodeURIComponent(transcript)}`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice search failed",
        description: "Please try again",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleWishlistClick = () => {
    setLocation("/wishlist");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b">
        {/* Main Header */}
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4 px-4 md:px-6 h-16 md:h-20">
            {/* Mobile Menu Button */}
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Prime <span className="text-foreground">Pickz</span>
              </h1>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl items-center">
              <form onSubmit={handleSearch} className="relative w-full flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-20 h-10"
                    data-testid="input-search"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleVoiceSearch}
                      className="h-8 w-8"
                      data-testid="button-voice-search"
                    >
                      <Mic className={`w-4 h-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      data-testid="button-search-submit"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-1"
                    data-testid="button-language"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">{language === "en" ? "English" : "हिंदी"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onLanguageChange("en")} data-testid="menu-language-en">
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onLanguageChange("hi")} data-testid="menu-language-hi">
                    हिंदी (Hindi)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleWishlistClick}
                data-testid="button-wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>

              {/* Account */}
              {isLoading ? (
                <Button variant="ghost" size="icon" disabled data-testid="button-account-loading">
                  <User className="w-5 h-5" />
                </Button>
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-account">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.firstName || "User"}
                        </span>
                        {user.email && <span className="text-xs text-muted-foreground font-normal">{user.email}</span>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/api/logout" className="cursor-pointer" data-testid="link-logout">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-login"
                >
                  Login
                </Button>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onCartClick}
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-20 h-10 text-sm"
                data-testid="input-search-mobile"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleVoiceSearch}
                  className="h-8 w-8"
                  data-testid="button-voice-search-mobile"
                >
                  <Mic className={`w-4 h-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  data-testid="button-search-submit-mobile"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Categories - Desktop */}
          <div className="hidden md:block border-t">
            <div className="px-4 md:px-6">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseEnter={() => setShowMegaMenu(true)}
                  onMouseLeave={() => setShowMegaMenu(false)}
                  className="whitespace-nowrap"
                  data-testid="button-categories"
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant="ghost"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setLocation(`/category/${category.slug}`)}
                    data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {showMegaMenu && (
          <div
            className="absolute top-full left-0 right-0 bg-background border-b shadow-lg"
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <div className="max-w-screen-2xl mx-auto px-6 py-8">
              <div className="grid grid-cols-6 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex flex-col items-center gap-3 p-4 rounded-lg hover-elevate cursor-pointer"
                    onClick={() => {
                      setLocation(`/category/${category.slug}`);
                      setShowMegaMenu(false);
                    }}
                    data-testid={`megamenu-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="w-20 h-20 flex items-center justify-center bg-primary/10 rounded-lg">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-center">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-background md:hidden">
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Menu</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowMobileMenu(false)}
                data-testid="button-close-mobile-menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant="ghost"
                    className="w-full justify-start text-base h-12"
                    onClick={() => {
                      setLocation(`/category/${category.slug}`);
                      setShowMobileMenu(false);
                    }}
                    data-testid={`mobile-menu-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
