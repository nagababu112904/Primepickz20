import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from './AdminDashboard';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    paymentStatus: string | null;
    createdAt: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: string;
    }>;
}

export function OrdersTab() {
    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['admin', 'orders'],
        queryFn: async () => {
            const res = await adminFetch('orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-700';
            case 'shipped':
                return 'bg-blue-100 text-blue-700';
            case 'processing':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Orders</h2>
                <p className="text-gray-500">Manage and track customer orders</p>
            </div>

            <Card className="bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Order #</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Items</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Total</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No orders yet
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-6 font-medium">#{order.orderNumber}</td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {order.items?.length || 0} items
                                            </td>
                                            <td className="py-4 px-6 font-medium">${order.totalAmount}</td>
                                            <td className="py-4 px-6">
                                                <Badge className={getStatusColor(order.status)}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    className={
                                                        order.paymentStatus === 'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }
                                                >
                                                    {order.paymentStatus || 'pending'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
