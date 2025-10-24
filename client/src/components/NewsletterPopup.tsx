import { useState, useEffect } from "react";
import { X, Mail, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsletterPopupProps {
  onClose: () => void;
}

export function NewsletterPopup({ onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", { email, whatsappOptIn });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        data-testid="newsletter-backdrop"
      >
        {/* Popup */}
        <div
          className="bg-background rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          data-testid="newsletter-popup"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
            data-testid="button-close-newsletter"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with Icon */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 text-center relative">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Get $100 OFF!</h2>
            <p className="text-muted-foreground">
              Subscribe to our newsletter and get exclusive deals
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-newsletter-email"
                />
              </div>
            </div>

            {/* WhatsApp Opt-in */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="whatsapp"
                checked={whatsappOptIn}
                onCheckedChange={(checked) => setWhatsappOptIn(checked as boolean)}
                data-testid="checkbox-whatsapp"
              />
              <label
                htmlFor="whatsapp"
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                Get order updates and exclusive deals via WhatsApp
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              data-testid="button-subscribe"
            >
              Claim Your $100 OFF
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to receive marketing communications. You can unsubscribe anytime.
            </p>
          </form>

          {/* Features */}
          <div className="bg-muted/30 px-6 py-4 text-xs text-center space-y-1">
            <p className="font-medium">Exclusive deals • Early access to sales • Fashion tips & trends</p>
          </div>
        </div>
      </div>
    </>
  );
}
