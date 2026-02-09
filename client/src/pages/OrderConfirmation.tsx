import React, { useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { clearCartSession } from '@/lib/cartSession';
import { queryClient } from '@/lib/queryClient';

export default function OrderConfirmation() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    // Check all possible param names for order number
    const orderNumber = params.get('order') || params.get('order_id') || params.get('orderNumber');
    const sessionId = params.get('session_id');
    const orderId = orderNumber || (sessionId ? `Session: ${sessionId.substring(0, 8)}...` : 'Processing...');

    // Clear cart when order is confirmed
    useEffect(() => {
        // Clear the cart session (generates new session ID for next order)
        clearCartSession();
        // Invalidate cart query so it refetches with empty cart
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 lg:px-8 py-12">
                <Card className="text-center">
                    <CardContent className="p-8 md:p-12">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase. Your order has been received and is being processed.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <p className="text-sm text-gray-500 mb-1">Order Number</p>
                            <p className="text-xl font-bold text-[#1a2332]">{orderId}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-[#1a2332]/10 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-[#1a2332]" />
                                </div>
                                <p className="text-sm font-medium">Confirmed</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">Processing</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">Shipping</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-8">
                            A confirmation email has been sent to your email address with order details and tracking information.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/track-order">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Track Order
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button className="w-full sm:w-auto bg-[#1a2332] hover:bg-[#0f1419]">
                                    Continue Shopping
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
