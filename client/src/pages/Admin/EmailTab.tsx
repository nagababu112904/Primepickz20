import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Check, ShoppingCart, User, Clock, DollarSign } from 'lucide-react';
import { adminFetch } from './AdminDashboard';

interface EmailItem {
    name: string;
    quantity: number;
    price: string;
}

interface EmailLog {
    id: string;
    type: string;
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    subject: string;
    items: EmailItem[];
    total: string;
    status: string;
    metadata: any;
    sentAt: string;
    readAt: string | null;
}

export function EmailTab() {
    const [filter, setFilter] = React.useState<'all' | 'unread' | 'read'>('all');

    const { data, isLoading } = useQuery<{ emails: EmailLog[]; unreadCount: number }>({
        queryKey: ['admin', 'emails', filter],
        queryFn: async () => {
            const res = await adminFetch(`emails&status=${filter}`);
            if (!res.ok) throw new Error('Failed to fetch emails');
            return res.json();
        },
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await adminFetch(`mark-email-read&id=${id}`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to mark as read');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'emails'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const emails = data?.emails || [];
    const unreadCount = data?.unreadCount || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Mail className="w-6 h-6" />
                        Order Notifications
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount} new
                            </Badge>
                        )}
                    </h2>
                    <p className="text-gray-500">View incoming order notifications</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </Button>
                    <Button
                        variant={filter === 'read' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('read')}
                    >
                        Read
                    </Button>
                </div>
            </div>

            {/* Email List */}
            {emails.length === 0 ? (
                <Card className="bg-white">
                    <CardContent className="py-12 text-center">
                        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No order notifications yet</p>
                        <p className="text-gray-400 text-sm">New orders will appear here</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {emails.map((email) => (
                        <Card
                            key={email.id}
                            className={`bg-white transition-all ${email.status === 'unread'
                                    ? 'border-l-4 border-l-blue-500 shadow-md'
                                    : 'opacity-80'
                                }`}
                        >
                            <CardContent className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    {/* Left side - Order info */}
                                    <div className="flex-1 space-y-3">
                                        {/* Subject line */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                                            <span className="font-semibold text-lg">{email.subject}</span>
                                            {email.status === 'unread' && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                    New
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Customer info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {email.customerName}
                                            </span>
                                            <span>{email.customerEmail}</span>
                                        </div>

                                        {/* Order items */}
                                        {email.items && email.items.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                                <ul className="space-y-1">
                                                    {email.items.map((item, idx) => (
                                                        <li key={idx} className="text-sm text-gray-600 flex justify-between">
                                                            <span>{item.name} x {item.quantity}</span>
                                                            <span className="font-medium">${item.price}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Total and time */}
                                        <div className="flex items-center gap-4 text-sm flex-wrap">
                                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                <DollarSign className="w-4 h-4" />
                                                Total: ${email.total}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                {new Date(email.sentAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side - Actions */}
                                    <div className="flex flex-row md:flex-col gap-2">
                                        {email.status === 'unread' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => markReadMutation.mutate(email.id)}
                                                disabled={markReadMutation.isPending}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Mark Read
                                            </Button>
                                        )}
                                        {email.status === 'read' && (
                                            <Badge variant="outline" className="text-gray-400">
                                                <Check className="w-3 h-3 mr-1" />
                                                Read
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
