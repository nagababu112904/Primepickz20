import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function Returns() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Returns & Exchanges</h1>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-[#7c3aed] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">30-Day Returns</h3>
                <p className="text-gray-600">Return within 30 days of delivery for a full refund.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6 text-center">
                <RotateCcw className="w-10 h-10 text-[#7c3aed] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Easy Process</h3>
                <p className="text-gray-600">Simple online return request with prepaid labels.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-10 h-10 text-[#7c3aed] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Fast Refunds</h3>
                <p className="text-gray-600">Refunds processed within 5-7 business days.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Return Policy</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-600">Items must be in original, unworn condition with tags attached</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-600">Original packaging must be included when possible</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-gray-600">Electronics must include all original accessories</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-gray-600">Final sale items cannot be returned</p>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-gray-600">Personal care and hygiene items are non-returnable</p>
            </div>
          </div>

          <div className="bg-[#7c3aed]/10 rounded-xl p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Need to return something?</h3>
            <p className="text-gray-600 mb-4">Start your return request online.</p>
            <Link href="/return-request">
              <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">
                Start Return Request
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
