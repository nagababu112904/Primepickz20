import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PackageCheck, RefreshCcw, Clock, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Returns() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={0}
        wishlistCount={0}
        onCartClick={() => setIsCartOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main className="flex-1 max-w-screen-lg mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Returns & Refunds Policy</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">7 Days</h3>
            <p className="text-xs text-muted-foreground">Return window</p>
          </Card>
          
          <Card className="p-4 text-center">
            <PackageCheck className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Easy Process</h3>
            <p className="text-xs text-muted-foreground">Hassle-free returns</p>
          </Card>
          
          <Card className="p-4 text-center">
            <RefreshCcw className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Free Pickup</h3>
            <p className="text-xs text-muted-foreground">We collect it</p>
          </Card>
          
          <Card className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Quick Refund</h3>
            <p className="text-xs text-muted-foreground">5-7 business days</p>
          </Card>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Return Eligibility</h2>
            <p className="text-muted-foreground mb-3">
              You can return most items within 7 days of delivery. To be eligible for a return:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Item must be unused and in the same condition as received</li>
              <li>Must be in original packaging with all tags attached</li>
              <li>Proof of purchase is required (invoice/receipt)</li>
              <li>Item should not be on our non-returnable list</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Intimate wear, lingerie, and socks</li>
              <li>Cosmetics and personal care items</li>
              <li>Perishable goods</li>
              <li>Gift cards and vouchers</li>
              <li>Customized or personalized items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How to Return</h2>
            <ol className="list-decimal list-inside text-muted-foreground ml-4 space-y-2">
              <li>Login to your account and go to "My Orders"</li>
              <li>Select the item you want to return</li>
              <li>Choose reason for return and submit request</li>
              <li>We'll schedule a free pickup from your address</li>
              <li>Hand over the package to our delivery partner</li>
              <li>Refund will be processed once we receive the item</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Refund Process</h2>
            <p className="text-muted-foreground mb-3">
              Once we receive and inspect your returned item:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>We'll send you an email confirmation</li>
              <li>Refund will be initiated within 2-3 business days</li>
              <li>Amount will be credited to your original payment method</li>
              <li>Bank processing may take 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Exchange Policy</h2>
            <p className="text-muted-foreground">
              If you'd like to exchange an item for a different size or color, simply return the original item and place a new order for the desired variant. This ensures faster processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Damaged or Defective Items</h2>
            <p className="text-muted-foreground">
              If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We'll arrange for immediate replacement or refund at no additional cost.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground">
              Contact our customer support team:<br />
              Email: returns@primepickz.com<br />
              Phone: 1800-123-4567<br />
              Available: Mon-Sat, 9 AM - 6 PM
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
