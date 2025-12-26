import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Truck, Clock, Package, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function Shipping() {
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

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping Information</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <DollarSign className="w-8 h-8 text-[#1a2332] mb-4" />
                <h3 className="font-bold text-lg mb-2">Free Shipping</h3>
                <p className="text-gray-600">On orders over $99. Standard shipping available for smaller orders at $9.99.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Clock className="w-8 h-8 text-[#1a2332] mb-4" />
                <h3 className="font-bold text-lg mb-2">Processing Time</h3>
                <p className="text-gray-600">Orders are processed within 1-2 business days after placement.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Truck className="w-8 h-8 text-[#1a2332] mb-4" />
                <h3 className="font-bold text-lg mb-2">Delivery Time</h3>
                <p className="text-gray-600">Standard: 5-7 business days. Express: 2-3 business days.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-50">
              <CardContent className="p-6">
                <Package className="w-8 h-8 text-[#1a2332] mb-4" />
                <h3 className="font-bold text-lg mb-2">Tracking</h3>
                <p className="text-gray-600">All orders include tracking. Updates sent via email once shipped.</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Delivery Time</th>
                  <th className="py-3 px-4 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Standard</td>
                  <td className="py-3 px-4">5-7 business days</td>
                  <td className="py-3 px-4">$9.99 (Free over $99)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Express</td>
                  <td className="py-3 px-4">2-3 business days</td>
                  <td className="py-3 px-4">$19.99</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Overnight</td>
                  <td className="py-3 px-4">1 business day</td>
                  <td className="py-3 px-4">$29.99</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-600 mt-6 text-sm">* Currently shipping to United States addresses only.</p>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
