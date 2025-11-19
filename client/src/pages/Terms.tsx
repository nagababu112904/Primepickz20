import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function Terms() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: October 24, 2025</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Prime Pickz, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use of Website</h2>
            <p className="text-muted-foreground">
              You agree to use this website only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Product Information</h2>
            <p className="text-muted-foreground">
              We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, or error-free. We reserve the right to correct errors and update information at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Pricing and Payment</h2>
            <p className="text-muted-foreground">
              All prices are in USD and are subject to change without notice. Payment must be received before order processing. We accept various payment methods including credit/debit cards, UPI, and cash on delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Order Acceptance</h2>
            <p className="text-muted-foreground">
              We reserve the right to refuse or cancel any order at our discretion. This may include orders that appear fraudulent, violate our terms, or are placed by resellers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Please refer to our Returns & Refunds policy for detailed information about returns, exchanges, and refunds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Prime Pickz shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website, including text, graphics, logos, and images, is the property of Prime Pickz and is protected by copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms shall be governed by and construed in accordance with the laws of Connecticut, United States. Any disputes shall be subject to the exclusive jurisdiction of courts in Connecticut.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
