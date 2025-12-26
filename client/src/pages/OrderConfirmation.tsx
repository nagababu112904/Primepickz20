import { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Check, Package, Truck, Home, ShoppingBag, Phone, Mail } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface OrderDetails {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    paymentStatus: string;
    createdAt: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: string;
        productImageUrl: string;
    }>;
    shippingAddress: {
        fullName: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
        phone: string;
    } | null;
}

export default function OrderConfirmation() {
    const [, setLocation] = useLocation();
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        const orderNumber = params.get('order');

        if (!sessionId && !orderNumber) {
            setError('No order information provided');
            setLoading(false);
            return;
        }

        // Verify the payment and get order details
        const verifyPayment = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (sessionId) queryParams.set('session_id', sessionId);
                if (orderNumber) queryParams.set('order', orderNumber);

                const response = await fetch(`/api/payment/verify-session?${queryParams}`);
                const data = await response.json();

                if (data.success) {
                    setOrder(data.order);
                    // Clear cart after successful payment
                    localStorage.removeItem('cart');
                } else {
                    setError(data.error || 'Failed to verify payment');
                }
            } catch (err) {
                setError('Failed to verify payment status');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A14A]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header cartCount={0} wishlistCount={0} onCartClick={() => { }} language="en" onLanguageChange={() => { }} />
                <main className="container mx-auto px-4 py-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
                        <p className="text-gray-600 mb-8">{error}</p>
                        <Link href="/checkout">
                            <Button className="bg-[#0B3C5D] hover:bg-[#0B3C5D]/90">
                                Try Again
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartCount={0} wishlistCount={0} onCartClick={() => { }} language="en" onLanguageChange={() => { }} />

            <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">
                        Thank you for your purchase. Your order has been received.
                    </p>
                </div>

                {order && (
                    <div className="max-w-3xl mx-auto">
                        {/* Order Number Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Number</p>
                                    <p className="text-xl font-bold text-[#0B3C5D]">{order.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-[#C9A14A]">
                                        ${parseFloat(order.totalAmount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Status Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-600">Confirmed</p>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2">
                                    <div className="h-full w-0 bg-green-500"></div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">Processing</p>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">Shipped</p>
                                </div>
                                <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Home className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-400">Delivered</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                                        <img
                                            src={item.productImageUrl || '/placeholder.svg'}
                                            alt={item.productName}
                                            className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.productName}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">${parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
                                <div className="text-gray-600">
                                    <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                                    <p className="flex items-center gap-2 mt-2">
                                        <Phone className="w-4 h-4" />
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/">
                                <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                                    <Home className="w-4 h-4" />
                                    Continue Shopping
                                </Button>
                            </Link>
                            <Link href="/track-order">
                                <Button className="w-full sm:w-auto bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Track Order
                                </Button>
                            </Link>
                        </div>

                        {/* Support Info */}
                        <div className="mt-8 text-center text-sm text-gray-500">
                            <p>Need help? Contact us at</p>
                            <a href="mailto:support@primepickz.org" className="text-[#0B3C5D] hover:underline flex items-center justify-center gap-1 mt-1">
                                <Mail className="w-4 h-4" />
                                support@primepickz.org
                            </a>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
