import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminFetch } from './AdminDashboard';
import {
    RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Send,
    Download, Trash2, RotateCcw, Package, Activity, Loader2
} from 'lucide-react';

interface SyncStatus {
    totalProducts: number;
    syncedProducts: number;
    failedProducts: number;
    pendingProducts: number;
    lastSyncTime: string | null;
}

interface SyncLog {
    id: string;
    productId: string;
    productName: string;
    action: 'create' | 'update' | 'delete';
    status: 'success' | 'failed' | 'pending';
    message: string;
    timestamp: string;
}

interface DeadLetterItem {
    id: string;
    productId: string;
    productName: string;
    error: string;
    attempts: number;
    lastAttempt: string;
}

export function MetaCatalogTab() {
    const { toast } = useToast();
    const [syncing, setSyncing] = useState(false);

    // Connection status
    const { data: connectionStatus, isLoading: connectionLoading, refetch: refetchConnection } = useQuery({
        queryKey: ['meta-catalog-connection'],
        queryFn: async () => {
            try {
                const res = await adminFetch('meta-catalog-status');
                if (!res.ok) {
                    return { connected: false, error: 'Failed to check connection' };
                }
                return res.json();
            } catch (error) {
                return { connected: false, error: 'Connection check failed' };
            }
        },
        retry: false,
        staleTime: 30000,
    });

    // Sync status
    const { data: syncStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SyncStatus>({
        queryKey: ['meta-catalog-sync-status'],
        queryFn: async () => {
            const res = await adminFetch('meta-catalog-sync-status');
            if (!res.ok) throw new Error('Failed to fetch sync status');
            return res.json();
        },
        retry: false,
        staleTime: 10000,
    });

    // Recent logs
    const { data: recentLogs, refetch: refetchLogs } = useQuery<SyncLog[]>({
        queryKey: ['meta-catalog-logs'],
        queryFn: async () => {
            const res = await adminFetch('meta-catalog-logs');
            if (!res.ok) return [];
            const data = await res.json();
            return data.logs || [];
        },
        retry: false,
        staleTime: 15000,
    });

    // Dead letter queue
    const { data: deadLetterItems, refetch: refetchDeadLetter } = useQuery<DeadLetterItem[]>({
        queryKey: ['meta-catalog-dead-letter'],
        queryFn: async () => {
            const res = await adminFetch('meta-catalog-dead-letter');
            if (!res.ok) return [];
            const data = await res.json();
            return data.items || [];
        },
        retry: false,
        staleTime: 30000,
    });

    // Sync all products
    const syncAllMutation = useMutation({
        mutationFn: async () => {
            setSyncing(true);
            const res = await adminFetch('meta-catalog-sync-all', { method: 'POST' });
            if (!res.ok) throw new Error('Sync failed');
            return res.json();
        },
        onSuccess: (data) => {
            toast({
                title: 'Sync Started',
                description: `Syncing ${data.count || 'all'} products to Meta Catalog`,
            });
            setTimeout(() => {
                refetchStatus();
                refetchLogs();
            }, 2000);
        },
        onError: (error: Error) => {
            toast({
                title: 'Sync Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
        onSettled: () => {
            setSyncing(false);
        },
    });

    // Retry failed item
    const retryMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await adminFetch('meta-catalog-retry', {
                method: 'POST',
                body: JSON.stringify({ productId }),
            });
            if (!res.ok) throw new Error('Retry failed');
            return res.json();
        },
        onSuccess: () => {
            toast({ title: 'Retry initiated' });
            refetchDeadLetter();
            refetchLogs();
        },
        onError: (error: Error) => {
            toast({
                title: 'Retry Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Remove from dead letter
    const removeMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await adminFetch('meta-catalog-remove-dead-letter', {
                method: 'POST',
                body: JSON.stringify({ productId }),
            });
            if (!res.ok) throw new Error('Remove failed');
            return res.json();
        },
        onSuccess: () => {
            toast({ title: 'Removed from queue' });
            refetchDeadLetter();
        },
    });

    const isConnected = connectionStatus?.connected === true;

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Meta Catalog Connection</CardTitle>
                            <CardDescription>Integration status with Meta Product Catalog</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchConnection()}
                            disabled={connectionLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${connectionLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        {connectionLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        ) : isConnected ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="font-medium text-green-700">Connected to Meta Catalog</span>
                                <Badge variant="secondary" className="ml-2">
                                    Catalog ID: {connectionStatus?.catalogId || 'N/A'}
                                </Badge>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium text-red-700">Not Connected</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {connectionStatus?.error || 'Check environment variables'}
                                </span>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sync Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Products</p>
                                <p className="text-2xl font-bold">{syncStatus?.totalProducts || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Synced</p>
                                <p className="text-2xl font-bold text-green-600">{syncStatus?.syncedProducts || 0}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{syncStatus?.failedProducts || 0}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{syncStatus?.pendingProducts || 0}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Sync Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => syncAllMutation.mutate()}
                            disabled={!isConnected || syncing}
                            className="bg-[#1a365d] hover:bg-[#2d4a7c]"
                        >
                            {syncing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Sync All Products
                        </Button>
                        <Button variant="outline" disabled={!isConnected}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                    {syncStatus?.lastSyncTime && (
                        <p className="text-sm text-gray-500 mt-3">
                            Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Dead Letter Queue */}
            {(deadLetterItems?.length || 0) > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            <CardTitle className="text-lg">Failed Syncs ({deadLetterItems?.length})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {deadLetterItems?.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.productName}</p>
                                        <p className="text-xs text-gray-500">{item.error}</p>
                                        <p className="text-xs text-gray-400">
                                            Attempts: {item.attempts} | Last: {new Date(item.lastAttempt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => retryMutation.mutate(item.productId)}
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => removeMutation.mutate(item.productId)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Logs */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <CardTitle className="text-lg">Recent Sync Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {!recentLogs?.length ? (
                        <p className="text-gray-500 text-sm">No sync activity yet</p>
                    ) : (
                        <div className="space-y-2">
                            {recentLogs.slice(0, 10).map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        {log.status === 'success' ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        ) : log.status === 'failed' ? (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        ) : (
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{log.productName}</p>
                                            <p className="text-xs text-gray-500">
                                                {log.action.toUpperCase()} - {log.message}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
