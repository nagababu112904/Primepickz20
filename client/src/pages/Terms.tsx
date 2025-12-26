import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-[#1a2332]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm prose prose-gray max-w-none">
          <h1>Terms of Service</h1>
          <p className="text-gray-500">Last updated: January 2024</p>

          <h2>Acceptance of Terms</h2>
          <p>By accessing and using PrimePickz, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>

          <h2>Products and Pricing</h2>
          <p>All products are subject to availability. Prices are subject to change without notice. We reserve the right to limit quantities and refuse orders.</p>

          <h2>Order Acceptance</h2>
          <p>Your receipt of an order confirmation does not constitute our acceptance of your order. We reserve the right to cancel any order for any reason.</p>

          <h2>Payment</h2>
          <p>Payment must be received prior to shipment. We accept major credit cards and other payment methods as displayed at checkout.</p>

          <h2>Shipping and Delivery</h2>
          <p>We ship to addresses within the United States. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery.</p>

          <h2>Returns and Refunds</h2>
          <p>Please refer to our Returns Policy for information about returns and refunds. All returns must be initiated within 30 days of delivery.</p>

          <h2>Intellectual Property</h2>
          <p>All content on this website is the property of PrimePickz and protected by copyright laws. You may not reproduce or distribute any content without permission.</p>

          <h2>Limitation of Liability</h2>
          <p>PrimePickz shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>

          <h2>Contact</h2>
          <p>Questions? Contact us at support@primepickz.com</p>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
