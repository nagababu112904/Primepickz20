import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
  };

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
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    required
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    data-testid="input-contact-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input
                    type="text"
                    placeholder="How can we help?"
                    required
                    data-testid="input-contact-subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    placeholder="Your message..."
                    rows={5}
                    required
                    data-testid="input-contact-message"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="button-contact-submit">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground">475-239-6334</p>
                  <p className="text-sm text-muted-foreground">Mon-Sat: 9 AM - 6 PM</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">support@primepickz.com</p>
                  <p className="text-sm text-muted-foreground">We reply within 24 hours</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    Prime Pickz Headquarters<br />
                    9121 Avalon Gates<br />
                    Trumbull, CT 06611<br />
                    United States
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Saturday: 9:00 AM - 6:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
