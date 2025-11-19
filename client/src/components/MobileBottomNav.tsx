import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface MobileBottomNavProps {
  cartCount: number;
  activeTab?: string;
  onCartClick?: () => void;
}

export function MobileBottomNav({ cartCount, activeTab = "home", onCartClick }: MobileBottomNavProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Home", href: "/" },
    { id: "categories", icon: Grid3x3, label: "Categories", href: "/category/fashion" },
    { id: "cart", icon: ShoppingCart, label: "Cart", badge: cartCount, onClick: onCartClick },
    { id: "account", icon: User, label: "Account", href: "/wishlist" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.onClick) {
            return (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`mobile-nav-${tab.id}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link key={tab.id} href={tab.href || "/"}>
              <button
                className={`flex flex-col items-center justify-center gap-1 relative transition-colors w-full h-16 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`mobile-nav-${tab.id}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
