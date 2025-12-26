import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { adminFetch } from './AdminDashboard';

interface AdminStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingSyncs: number;
}

export function AnalyticsTab() {
    const { data: stats } = useQuery<AdminStats>({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const res = await adminFetch('stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-gray-500">Track your store performance and metrics</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Revenue</p>
                                <p className="text-3xl font-bold">${stats?.totalRevenue?.toLocaleString() || '0'}</p>
                            </div>
                            <DollarSign className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Orders</p>
                                <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                            </div>
                            <ShoppingCart className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-700 to-gray-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Total Products</p>
                                <p className="text-3xl font-bold">{stats?.totalProducts || 0}</p>
                            </div>
                            <Package className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-80">Avg Order Value</p>
                                <p className="text-3xl font-bold">
                                    ${stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0'}
                                </p>
                            </div>
                            <TrendingUp className="w-10 h-10 opacity-80" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                            <div className="text-center">
                                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Revenue chart will appear here</p>
                                <p className="text-sm">After you start making sales</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle>Orders Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                            <div className="text-center">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Orders chart will appear here</p>
                                <p className="text-sm">After you start receiving orders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products Placeholder */}
            <Card className="bg-white">
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Top products will appear here</p>
                            <p className="text-sm">After you start making sales</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
