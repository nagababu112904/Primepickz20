import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ];

  const customerService = [
    { label: "Track Order", href: "/track-order" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "FAQ", href: "/faq" },
    { label: "Size Guide", href: "/size-guide" },
  ];

  const policies = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Disclaimer", href: "/disclaimer" },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", count: "2.5M", href: "https://facebook.com" },
    { icon: Instagram, label: "Instagram", count: "1.8M", href: "https://instagram.com" },
    { icon: Twitter, label: "Twitter", count: "850K", href: "https://twitter.com" },
    { icon: Youtube, label: "Youtube", count: "1.2M", href: "https://youtube.com" },
  ];

  return (
    <footer className="bg-muted/30 border-t mt-12 md:mt-20">
      {/* Main Footer Content */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Prime <span className="text-foreground">Pickz</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              India's premier destination for fashion and lifestyle. Discover the latest trends in ethnic and contemporary wear.
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Subscribe to our Newsletter</h3>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  data-testid="input-footer-email"
                />
                <Button data-testid="button-footer-subscribe">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Get exclusive deals and early access to sales
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>1800-123-4567 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@primepickz.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>New Haven, CT, United States</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-3">
              {customerService.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile App & Social */}
          <div>
            <h3 className="font-semibold mb-4">Download Our App</h3>
            <div className="space-y-3 mb-6">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => window.open('https://play.google.com', '_blank')}
                data-testid="button-google-play"
              >
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => window.open('https://apps.apple.com', '_blank')}
                data-testid="button-app-store"
              >
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
            </div>

            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  size="icon"
                  variant="outline"
                  className="h-10 w-10"
                  onClick={() => window.open(social.href, '_blank')}
                  data-testid={`button-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t pt-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">We Accept</h4>
              <div className="flex flex-wrap items-center gap-4">
                <SiVisa className="w-12 h-8 text-blue-600" />
                <SiMastercard className="w-12 h-8 text-red-600" />
                <div className="px-3 py-1 bg-muted rounded text-xs font-semibold">Amex</div>
                <div className="px-3 py-1 bg-muted rounded text-xs font-semibold">Discover</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Secure & Certified</h4>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-2 bg-muted rounded text-xs font-semibold">SSL Secure</div>
                <div className="px-3 py-2 bg-muted rounded text-xs font-semibold">PCI Compliant</div>
                <div className="px-3 py-2 bg-muted rounded text-xs font-semibold">ISO Certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-muted/50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Prime Pickz. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {policies.map((link, index) => (
                <span key={link.label} className="flex items-center gap-4">
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </a>
                  {index < policies.length - 1 && (
                    <span className="text-muted-foreground">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
