import { X, ShoppingBag, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CartItemWithProduct } from "@shared/schema";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemWithProduct[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function MiniCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: MiniCartProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const freeShippingThreshold = 999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        data-testid="cart-backdrop"
      />

      {/* Cart Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l shadow-2xl z-50 flex flex-col"
        data-testid="mini-cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Shopping Cart</h2>
            <Badge>{items.length}</Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-cart"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <div className="p-4 bg-muted/50 border-b">
            <p className="text-sm text-muted-foreground mb-2">
              Add <span className="font-semibold text-foreground">₹{remainingForFreeShipping}</span> more for FREE shipping!
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Add some products to get started
              </p>
              <Button onClick={onClose} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-bold text-foreground mb-2">
                      ₹{Number(item.product.price).toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-quantity-${item.id}`}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-medium" data-testid={`quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted transition-colors"
                          data-testid={`button-increase-quantity-${item.id}`}
                        >
                          +
                        </button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-8 w-8"
                        data-testid={`button-remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Subtotal:</span>
              <span data-testid="cart-subtotal">₹{subtotal.toLocaleString()}</span>
            </div>

            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={onCheckout}
              data-testid="button-checkout"
            >
              Proceed to Checkout
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
