import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock tracking data
    if (orderNumber && email) {
      setTracking({
        orderNumber,
        status: 'In Transit',
        estimatedDelivery: 'December 28, 2024',
        carrier: 'USPS',
        trackingNumber: 'USPS123456789',
        steps: [
          { status: 'Order Placed', date: 'Dec 24, 2024', completed: true },
          { status: 'Processing', date: 'Dec 25, 2024', completed: true },
          { status: 'Shipped', date: 'Dec 26, 2024', completed: true },
          { status: 'In Transit', date: 'Dec 26, 2024', completed: true, current: true },
          { status: 'Out for Delivery', date: '', completed: false },
          { status: 'Delivered', date: '', completed: false },
        ],
      });
      setError('');
    } else {
      setError('Please enter both order number and email');
    }
  };

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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Order</h1>

        {!tracking ? (
          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleTrack} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., ORD-123456"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                  <Search className="w-4 h-4 mr-2" />
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1a2332]" />
                  Order #{tracking.orderNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold text-[#1a2332]">{tracking.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Carrier</p>
                    <p className="font-semibold">{tracking.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Est. Delivery</p>
                    <p className="font-semibold">{tracking.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {tracking.steps.map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                          ? 'bg-[#1a2332] text-white'
                          : 'bg-gray-200 text-gray-400'
                        }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.current ? 'text-[#1a2332]' : ''}`}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">{step.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              onClick={() => setTracking(null)}
              className="w-full"
            >
              Track Another Order
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
