import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function Privacy() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: October 24, 2025</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, make a purchase, sign up for our newsletter, or contact us for support. This may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information</li>
              <li>Purchase history and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and our services</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website and customer service</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4">
              <li>Service providers who help us operate our business</li>
              <li>Payment processors to complete transactions</li>
              <li>Shipping partners to deliver your orders</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4">
              <li>Access and review your personal information</li>
              <li>Request corrections to your information</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at:<br />
              Email: privacy@primepickz.com<br />
              Phone: 1800-123-4567
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
