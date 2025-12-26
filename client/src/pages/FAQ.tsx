import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order by visiting the "Track Order" page and entering your order number and email. You will also receive tracking updates via email once your order has shipped.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy on most items. Products must be in original condition with tags attached. Visit our Returns page to initiate a return.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. Free shipping on orders over $99.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within the United States. We are working on expanding to international shipping in the future.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us by phone at 475-239-6334, email at support@primepickz.com, or through our Contact page. Our support team is available 24/7.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), as well as PayPal and Apple Pay through our secure Stripe checkout.',
  },
  {
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be cancelled or modified within 1 hour of placement. After that, the order enters processing and cannot be changed. Contact support immediately if you need to make changes.',
  },
  {
    question: 'Are your products authentic?',
    answer: 'Yes! We only sell authentic products sourced directly from manufacturers or authorized distributors. All products come with a quality guarantee.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f7ff] via-[#f3f1ff] to-[#ede9fe]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-[#7c3aed]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions about shopping at PrimePickz.</p>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 p-6 bg-gray-50 rounded-xl text-center">
            <h3 className="font-bold text-lg mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">Our support team is here to help.</p>
            <Link href="/contact">
              <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">Contact Us</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
