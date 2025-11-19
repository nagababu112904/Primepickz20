import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ShoppingBag, Users, Globe, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function About() {
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

      <main className="flex-1 max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          About Prime Pickz
        </h1>

        <div className="prose max-w-none mb-12">
          <p className="text-lg text-muted-foreground mb-6">
            Prime Pickz is your premier destination for fashion and lifestyle
            products. We bring you the latest trends in contemporary
            wear, curated with passion and delivered with care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">10M+ Products</h3>
            <p className="text-sm text-muted-foreground">
              Vast collection across categories
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">5M+ Customers</h3>
            <p className="text-sm text-muted-foreground">Trusted by millions</p>
          </Card>

          <Card className="p-6 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">Nationwide</h3>
            <p className="text-sm text-muted-foreground">
              Delivery across USA
            </p>
          </Card>

          <Card className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-lg mb-2">99% Satisfaction</h3>
            <p className="text-sm text-muted-foreground">
              Customer happiness guaranteed
            </p>
          </Card>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground">
              Founded in 2020, Prime Pickz started with a simple mission: to
              make high-quality fashion accessible to everyone. From
              contemporary wear to modern fashion essentials, we've grown to
              become one of the most trusted online shopping destinations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Quality products at competitive prices</li>
              <li>Fast and reliable delivery</li>
              <li>Exceptional customer service</li>
              <li>Authentic products, 100% genuine</li>
              <li>Sustainable and ethical sourcing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              <strong>Email:</strong> support@primepickz.com
              <br />
              <strong>Phone:</strong> 475-239-6334
              <br />
              <strong>Address:</strong> 9121 Avalon Gates, Trumbull, CT 06611, United States
            </p>
          </section>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
