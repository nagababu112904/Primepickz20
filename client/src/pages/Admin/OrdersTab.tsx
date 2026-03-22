import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { adminFetch } from './AdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { Eye, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    paymentStatus: string | null;
    email: string | null;
    createdAt: string;
    items: Array<{
        id: string;
        productName: string;
        quantity: number;
        price: string;
    }>;
    shippingAddress?: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        pincode: string;
    } | null;
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
];

export function OrdersTab() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const { toast } = useToast();

    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['admin', 'orders'],
        queryFn: async () => {
            const res = await adminFetch('orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await adminFetch(`order-status&id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update order status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
            toast({ title: 'Order status updated!' });
            setSelectedOrder(null);
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
        },
    });

    const handleUpdateStatus = () => {
        if (!selectedOrder || !newStatus) return;
        updateStatusMutation.mutate({ id: selectedOrder.id, status: newStatus });
    };

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setAdminNotes('');
    };

    const getStatusConfig = (status: string) => {
        return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
    };

    // Summary stats
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Orders</h2>
                <p className="text-gray-500">Manage and track customer orders</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-700"><Clock className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Confirmed</p>
                            <p className="text-2xl font-bold">{confirmedCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><Truck className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Shipped</p>
                            <p className="text-2xl font-bold">{shippedCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-700"><CheckCircle className="w-5 h-5" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Delivered</p>
                            <p className="text-2xl font-bold">{deliveredCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Order #</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Customer</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Items</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Total</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Payment</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-gray-500">
                                            No orders yet
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        return (
                                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-6 font-medium">#{order.orderNumber}</td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 text-sm">
                                                    {order.email || '—'}
                                                </td>
                                                <td className="py-4 px-6 text-gray-600">
                                                    {order.items?.length || 0} items
                                                </td>
                                                <td className="py-4 px-6 font-medium">${order.totalAmount}</td>
                                                <td className="py-4 px-6">
                                                    <Badge className={statusConfig.color}>
                                                        {statusConfig.label}
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
                                                <td className="py-4 px-6">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openOrderDetails(order)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Manage
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details + Status Update Dialog */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            {/* Order Info */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Customer:</span>
                                    <span>{selectedOrder.email || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total:</span>
                                    <span className="font-bold">${selectedOrder.totalAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment:</span>
                                    <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                        {selectedOrder.paymentStatus || 'pending'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            {selectedOrder.shippingAddress && (
                                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                    <p className="font-medium text-blue-900 mb-2">📦 Shipping Address</p>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Name:</span>
                                        <span className="font-medium">{selectedOrder.shippingAddress.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone:</span>
                                        <span>{selectedOrder.shippingAddress.phone || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Address:</span>
                                        <span className="text-right max-w-[60%]">
                                            {selectedOrder.shippingAddress.addressLine1}
                                            {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">City/State:</span>
                                        <span>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</span>
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div>
                                    <p className="font-medium mb-2">Items:</p>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between py-1 border-b last:border-0">
                                                <span>{item.productName} ×{item.quantity}</span>
                                                <span>${item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Update */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Update Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleUpdateStatus}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={updateStatusMutation.isPending || newStatus === selectedOrder.status}
                            >
                                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
