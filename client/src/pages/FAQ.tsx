import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const [language, setLanguage] = useState("en");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our products, add items to your cart, and proceed to checkout. You can pay using credit/debit card, UPI, net banking, or cash on delivery.",
    },
    {
      question: "What is your delivery time?",
      answer: "Standard delivery takes 3-7 business days depending on your location. Express delivery (1-3 days) is available in select cities for an additional charge.",
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free shipping on all orders above $999. Orders below this amount have a flat shipping fee of $49.",
    },
    {
      question: "What is your return policy?",
      answer: "We have a hassle-free 7-day return policy. You can return any product within 7 days of delivery if you're not satisfied, provided it's in its original condition with tags attached.",
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this to track your order on our Track Order page or the courier's website.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, mobile wallets (GPay, PhonePe, Paytm), EMI options, and cash on delivery (COD).",
    },
    {
      question: "How do I exchange a product?",
      answer: "To exchange a product, simply initiate a return request and mention that you want an exchange. Once we receive the returned item, we'll ship the replacement immediately.",
    },
    {
      question: "Is cash on delivery available?",
      answer: "Yes, COD is available for all orders. However, for orders above $5,000, you may need to pay a small advance amount online.",
    },
    {
      question: "How can I cancel my order?",
      answer: "You can cancel your order within 24 hours of placing it from the My Orders section. After 24 hours, you'll need to contact customer support.",
    },
    {
      question: "Are the products genuine?",
      answer: "Absolutely! We source all our products directly from authorized dealers and brands. Every product comes with authenticity guaranteed.",
    },
  ];

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
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">
          Find answers to the most common questions about shopping on Prime Pickz
        </p>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Our customer support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover-elevate"
            data-testid="link-contact-support"
          >
            Contact Support
          </a>
        </div>
      </main>

      <Footer />
      <MobileBottomNav cartCount={0} activeTab="home" />
    </div>
  );
}
