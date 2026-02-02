import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock, Download,
    Play, RotateCcw, Eye, ChevronDown, ChevronUp, Loader2, Wifi, WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getAuthToken = () => localStorage.getItem('adminToken');

// API helper
const catalogSyncFetch = async (
    action: string,
    method: string = 'GET',
    body?: Record<string, unknown>
) => {
    const token = getAuthToken();
    const res = await fetch(`/api/catalog-sync?action=${action}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return res;
};

interface SyncStatus {
    total: number;
    synced: number;
    failed: number;
    pending: number;
    items: Array<{
        productId: string;
        retailerId: string;
        status: string;
        lastSyncedAt: string | null;
        lastError: string | null;
    }>;
}

interface SyncLog {
    id: number;
    productId: string;
    retailerId: string;
    operation: string;
    status: string;
    errorMessage: string | null;
    createdAt: string;
}

interface DeadLetterItem {
    id: number;
    productId: string;
    retailerId: string | null;
    operation: string;
    errorMessage: string | null;
    retryCount: number;
    createdAt: string | null;
    resolved: boolean | null;
}

export function CatalogSyncTab() {
    const { toast } = useToast();
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    // Fetch connection status
    const { data: connectionData, isLoading: connectionLoading, refetch: refetchConnection } = useQuery({
        queryKey: ['catalog-sync-connection'],
        queryFn: async () => {
            const res = await catalogSyncFetch('verify');
            return res.json();
        },
        retry: false,
    });

    // Fetch sync status
    const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SyncStatus>({
        queryKey: ['catalog-sync-status'],
        queryFn: async () => {
            const res = await catalogSyncFetch('status');
            return res.json();
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Fetch logs
    const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<{ logs: SyncLog[] }>({
        queryKey: ['catalog-sync-logs'],
        queryFn: async () => {
            const res = await catalogSyncFetch('logs');
            return res.json();
        },
    });

    // Fetch dead letter items
    const { data: deadLetterData, isLoading: deadLetterLoading, refetch: refetchDeadLetter } = useQuery<{ items: DeadLetterItem[] }>({
        queryKey: ['catalog-sync-dead-letter'],
        queryFn: async () => {
            const res = await catalogSyncFetch('dead-letter');
            return res.json();
        },
    });

    // Sync all mutation
    const syncAllMutation = useMutation({
        mutationFn: async () => {
            await catalogSyncFetch('sync-all', 'POST', { batchSize: 50 });
        },
        onSuccess: () => {
            toast({ title: 'Full sync started', description: 'All products are being synced to Meta Catalog' });
            refetchStatus();
            refetchLogs();
        },
        onError: (error: Error) => {
            toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
        },
    });

    // Retry dead letter mutation
    const retryMutation = useMutation({
        mutationFn: async (id: number) => {
            await catalogSyncFetch('retry', 'POST', { id });
        },
        onSuccess: () => {
            toast({ title: 'Retry successful' });
            refetchStatus();
            refetchDeadLetter();
            refetchLogs();
        },
        onError: (error: Error) => {
            toast({ title: 'Retry failed', description: error.message, variant: 'destructive' });
        },
    });

    // Export CSV
    const handleExportCsv = async () => {
        try {
            const res = await catalogSyncFetch('export-csv');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `primepickz-catalog-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: 'CSV exported successfully' });
        } catch (error) {
            toast({ title: 'Export failed', variant: 'destructive' });
        }
    };

    const toggleLogExpanded = (id: number) => {
        setExpandedLogs(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'synced':
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <AlertTriangle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        const variant = statusLower === 'synced' || statusLower === 'success'
            ? 'default'
            : statusLower === 'failed'
                ? 'destructive'
                : 'secondary';
        return <Badge variant={variant}>{status}</Badge>;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                {connectionLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : connectionData?.connected ? (
                                    <Wifi className="w-5 h-5 text-green-500" />
                                ) : (
                                    <WifiOff className="w-5 h-5 text-red-500" />
                                )}
                                Meta Catalog Connection
                            </CardTitle>
                            <CardDescription>
                                {connectionLoading
                                    ? 'Checking connection...'
                                    : connectionData?.connected
                                        ? `Connected to catalog: ${connectionData.catalog?.name || 'Unknown'}`
                                        : connectionData?.error || 'Not connected'}
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetchConnection()}
                            disabled={connectionLoading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${connectionLoading ? 'animate-spin' : ''}`} />
                            Verify
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Sync Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{statusData?.total || 0}</div>
                        <p className="text-sm text-gray-500">Total Products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">{statusData?.synced || 0}</div>
                        <p className="text-sm text-gray-500">Synced</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">{statusData?.failed || 0}</div>
                        <p className="text-sm text-gray-500">Failed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-600">{statusData?.pending || 0}</div>
                        <p className="text-sm text-gray-500">Pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => syncAllMutation.mutate()}
                            disabled={syncAllMutation.isPending || !connectionData?.connected}
                        >
                            {syncAllMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 mr-2" />
                            )}
                            Sync All Products
                        </Button>
                        <Button variant="outline" onClick={handleExportCsv}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                refetchStatus();
                                refetchLogs();
                                refetchDeadLetter();
                            }}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dead Letter Queue */}
            {(deadLetterData?.items?.length ?? 0) > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            Dead Letter Queue ({deadLetterData?.items?.length || 0})
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            These products failed to sync after multiple retries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {deadLetterData?.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{item.productId}</div>
                                        <div className="text-xs text-gray-500">
                                            {item.operation} • {item.retryCount} retries • {formatDate(item.createdAt)}
                                        </div>
                                        {item.errorMessage && (
                                            <div className="text-xs text-red-600 mt-1">{item.errorMessage}</div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => retryMutation.mutate(item.id)}
                                        disabled={retryMutation.isPending}
                                    >
                                        <RotateCcw className="w-3 h-3 mr-1" />
                                        Retry
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Sync Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Product Sync Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {statusLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : statusData?.items?.length ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {statusData.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(item.status)}
                                        <div>
                                            <div className="font-medium text-sm">{item.productId}</div>
                                            <div className="text-xs text-gray-500">
                                                {item.retailerId} • Last synced: {formatDate(item.lastSyncedAt)}
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No products synced yet. Click "Sync All Products" to start.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Sync Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    {logsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : logsData?.logs?.length ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {logsData.logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <button
                                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                        onClick={() => toggleLogExpanded(log.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(log.status)}
                                            <div className="text-left">
                                                <div className="font-medium text-sm">
                                                    {log.operation} - {log.productId}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(log.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(log.status)}
                                            {expandedLogs.has(log.id) ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedLogs.has(log.id) && log.errorMessage && (
                                        <div className="px-3 pb-3">
                                            <div className="text-sm bg-red-50 text-red-700 p-2 rounded">
                                                {log.errorMessage}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No sync logs yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
