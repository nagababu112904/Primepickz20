import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';
import { adminFetch } from './AdminDashboard';

interface AdminStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingSyncs: number;
    recentSyncLogs: Array<{
        id: string;
        productId: string | null;
        syncType: string;
        status: string;
        message: string | null;
        errorDetails: string | null;
        createdAt: string;
    }>;
}

export function DashboardTab() {
    const { data: stats, isLoading } = useQuery<AdminStats>({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const res = await adminFetch('stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${stats?.totalRevenue?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Products</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.totalProducts || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending Syncs</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {stats?.pendingSyncs || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Amazon Sync Activity */}
            <Card className="bg-white">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Amazon Sync Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats?.recentSyncLogs && stats.recentSyncLogs.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentSyncLogs.map((log) => (
                                <div key={log.id} className="flex items-start justify-between py-3 border-b last:border-0">
                                    <div className="flex items-start gap-3">
                                        <span className={`w-2 h-2 rounded-full mt-2 ${log.status === 'success' ? 'bg-green-500' :
                                                log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium text-gray-900">{log.message}</p>
                                            {log.errorDetails && (
                                                <p className="text-sm text-red-500">{log.errorDetails}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No sync activity yet</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
