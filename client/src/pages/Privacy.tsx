import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function Privacy() {
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
          <h1>Privacy Policy</h1>
          <p className="text-gray-500">Last updated: January 2024</p>

          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, shipping address, payment information, and any other information you choose to provide.</p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process transactions and send related information</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our services and develop new features</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist in our operations, such as payment processors and shipping carriers.</p>

          <h2>Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information. All transactions are encrypted using SSL technology.</p>

          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. Contact us at support@primepickz.com to exercise these rights.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p>Email: support@primepickz.com<br />Phone: 475-239-6334</p>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
