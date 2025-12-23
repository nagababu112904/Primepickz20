import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Box, ShoppingCart, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminFetch } from './AdminDashboard';

interface SyncStatus {
    connected: boolean;
    lastSyncAt: string | null;
    message: string;
}

interface SyncLog {
    id: string;
    productId: string | null;
    syncType: string;
    status: string;
    message: string | null;
    errorDetails: string | null;
    createdAt: string;
}

export function AmazonSyncTab() {
    const { toast } = useToast();

    const { data: status } = useQuery<SyncStatus>({
        queryKey: ['admin', 'amazon-status'],
        queryFn: async () => {
            const res = await adminFetch('amazon-status');
            if (!res.ok) throw new Error('Failed to fetch status');
            return res.json();
        },
    });

    const { data: logs = [] } = useQuery<SyncLog[]>({
        queryKey: ['admin', 'amazon-logs'],
        queryFn: async () => {
            const res = await adminFetch('amazon-logs');
            if (!res.ok) throw new Error('Failed to fetch logs');
            return res.json();
        },
    });

    const syncProductsMutation = useMutation({
        mutationFn: async () => {
            const res = await adminFetch('amazon-sync-products', { method: 'POST' });
            if (!res.ok) throw new Error('Sync failed');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            toast({ title: `Product sync complete: ${data.syncedCount} synced, ${data.failedCount} failed` });
        },
        onError: () => {
            toast({ title: 'Product sync failed', variant: 'destructive' });
        },
    });

    const syncInventoryMutation = useMutation({
        mutationFn: async () => {
            const res = await adminFetch('amazon-sync-inventory', { method: 'POST' });
            if (!res.ok) throw new Error('Sync failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            toast({ title: 'Inventory sync completed' });
        },
    });

    const syncOrdersMutation = useMutation({
        mutationFn: async () => {
            const res = await adminFetch('amazon-sync-orders', { method: 'POST' });
            if (!res.ok) throw new Error('Sync failed');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            toast({ title: 'Order sync completed' });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Amazon Integration</h2>
                <p className="text-gray-500">Manage Amazon Seller API integration and sync settings</p>
            </div>

            {/* Connection Status */}
            <Card className="bg-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                                <p className="font-medium text-gray-900">
                                    {status?.connected ? 'Amazon SP-API Connected' : 'Amazon SP-API Not Configured'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {status?.lastSyncAt
                                        ? `Last sync: ${new Date(status.lastSyncAt).toLocaleString()}`
                                        : 'No sync activity yet'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" className="text-orange-500 border-orange-500">
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sync Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Product Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                            Sync product listings between PrimePickz and Amazon
                        </p>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => syncProductsMutation.mutate()}
                            disabled={syncProductsMutation.isPending}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
                            {syncProductsMutation.isPending ? 'Syncing...' : 'Sync All Products'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Inventory Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                            Keep inventory levels synchronized in real-time
                        </p>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => syncInventoryMutation.mutate()}
                            disabled={syncInventoryMutation.isPending}
                        >
                            <Box className={`w-4 h-4 mr-2 ${syncInventoryMutation.isPending ? 'animate-spin' : ''}`} />
                            {syncInventoryMutation.isPending ? 'Syncing...' : 'Sync Inventory'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Order Sync</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-4">
                            Sync orders and fulfillment status
                        </p>
                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={() => syncOrdersMutation.mutate()}
                            disabled={syncOrdersMutation.isPending}
                        >
                            <ShoppingCart className={`w-4 h-4 mr-2 ${syncOrdersMutation.isPending ? 'animate-spin' : ''}`} />
                            {syncOrdersMutation.isPending ? 'Syncing...' : 'Sync Orders'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Sync Activity Log */}
            <Card className="bg-white">
                <CardHeader>
                    <CardTitle>Sync Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {logs.length > 0 ? (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-start justify-between py-3 border-b last:border-0">
                                    <div className="flex items-start gap-3">
                                        <span className={`w-2 h-2 rounded-full mt-2 ${log.status === 'success' ? 'bg-green-500' :
                                                log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium text-gray-900">{log.syncType.toUpperCase()} SYNC - {log.message}</p>
                                            <p className="text-sm text-gray-600">
                                                Status: <span className={log.status === 'success' ? 'text-green-600' : log.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}>
                                                    {log.status}
                                                </span>
                                            </p>
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
