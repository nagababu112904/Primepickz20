import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Truck, MapPin, Clock, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Shipping() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Shipping Policy</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Free Shipping</h3>
            <p className="text-xs text-muted-foreground">On orders $999+</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">3-7 Days</h3>
            <p className="text-xs text-muted-foreground">Standard delivery</p>
          </Card>
          
          <Card className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">500+ Cities</h3>
            <p className="text-xs text-muted-foreground">All India delivery</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold mb-1">Secure Packaging</h3>
            <p className="text-xs text-muted-foreground">Safe transit</p>
          </Card>
        </div>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Shipping Charges</h2>
            <div className="bg-muted/30 rounded-lg p-4">
              <ul className="text-muted-foreground space-y-2">
                <li><strong>Orders above $999:</strong> FREE shipping</li>
                <li><strong>Orders below $999:</strong> $49 flat shipping fee</li>
                <li><strong>Express delivery:</strong> Additional $99 (1-3 days in select cities)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Delivery Timeline</h2>
            <p className="text-muted-foreground mb-3">
              Delivery times vary based on your location and product availability:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li><strong>Metro cities:</strong> 3-5 business days</li>
              <li><strong>Other cities:</strong> 5-7 business days</li>
              <li><strong>Remote areas:</strong> 7-10 business days</li>
              <li><strong>Express delivery:</strong> 1-3 business days (select locations)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
            <p className="text-muted-foreground">
              Orders are typically processed within 1-2 business days. You'll receive a confirmation email once your order is shipped with tracking details. Orders placed on weekends or holidays will be processed on the next business day.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Tracking Your Order</h2>
            <p className="text-muted-foreground">
              Once shipped, you'll receive a tracking number via email and SMS. You can track your order using:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>Our Track Order page (enter order number)</li>
              <li>Courier partner's website (using tracking number)</li>
              <li>SMS/Email notifications at each delivery milestone</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Shipping Partners</h2>
            <p className="text-muted-foreground">
              We work with trusted courier partners including Blue Dart, Delhivery, and India Post to ensure safe and timely delivery of your orders.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Delivery Attempts</h2>
            <p className="text-muted-foreground mb-3">
              Our delivery partners will make up to 3 attempts to deliver your order:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-2">
              <li>You'll be notified before each delivery attempt</li>
              <li>If delivery fails after 3 attempts, order will be returned</li>
              <li>Reshipping charges may apply for returned orders</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">International Shipping</h2>
            <p className="text-muted-foreground">
              Currently, we only ship within India. International shipping will be available soon. Sign up for our newsletter to be notified when we expand globally.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For shipping-related queries:<br />
              Email: shipping@primepickz.com<br />
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
