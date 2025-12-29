import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Package, Box, ShoppingCart, Settings, Download, Check, AlertCircle } from 'lucide-react';
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

interface AmazonProduct {
    asin: string;
    sku: string;
    title: string;
    description?: string;
    price: number;
    imageUrl: string;
    stockCount: number;
    category: string;
    status: string;
}

export function AmazonSyncTab() {
    const { toast } = useToast();
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [showProducts, setShowProducts] = useState(false);

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

    const { data: amazonProducts, isLoading: loadingProducts, refetch: fetchProducts } = useQuery<{ products: AmazonProduct[]; message: string }>({
        queryKey: ['admin', 'amazon-products'],
        queryFn: async () => {
            const res = await adminFetch('amazon-products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
        enabled: showProducts,
    });

    const importMutation = useMutation({
        mutationFn: async (products: AmazonProduct[]) => {
            const res = await adminFetch('amazon-import', {
                method: 'POST',
                body: JSON.stringify({ products }),
            });
            if (!res.ok) throw new Error('Import failed');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            setSelectedProducts(new Set());
            toast({
                title: `Import Complete!`,
                description: `${data.imported} products imported successfully.`
            });
        },
        onError: () => {
            toast({ title: 'Import failed', variant: 'destructive' });
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

    const toggleProductSelection = (asin: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(asin)) {
            newSelected.delete(asin);
        } else {
            newSelected.add(asin);
        }
        setSelectedProducts(newSelected);
    };

    const selectAllProducts = () => {
        if (amazonProducts?.products) {
            setSelectedProducts(new Set(amazonProducts.products.map(p => p.asin)));
        }
    };

    const deselectAllProducts = () => {
        setSelectedProducts(new Set());
    };

    const importSelectedProducts = () => {
        if (amazonProducts?.products) {
            const productsToImport = amazonProducts.products.filter(p => selectedProducts.has(p.asin));
            importMutation.mutate(productsToImport);
        }
    };

    const importAllProducts = () => {
        if (amazonProducts?.products) {
            importMutation.mutate(amazonProducts.products);
        }
    };

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
                                    {status?.message && !status?.connected ? (
                                        <span className="text-red-500">{status.message}</span>
                                    ) : status?.lastSyncAt
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

            {/* Import Products from Amazon */}
            {status?.connected && (
                <Card className="bg-white">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Import Products from Amazon</CardTitle>
                            <Button
                                onClick={() => { setShowProducts(true); fetchProducts(); }}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={loadingProducts}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {loadingProducts ? 'Loading...' : 'Fetch Amazon Products'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showProducts && amazonProducts?.products && (
                            <div className="space-y-4">
                                {/* Header with actions */}
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium">
                                            {selectedProducts.size} of {amazonProducts.products.length} selected
                                        </span>
                                        <Button variant="link" size="sm" onClick={selectAllProducts}>
                                            Select All
                                        </Button>
                                        <Button variant="link" size="sm" onClick={deselectAllProducts}>
                                            Deselect All
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={importSelectedProducts}
                                            disabled={selectedProducts.size === 0 || importMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Import Selected ({selectedProducts.size})
                                        </Button>
                                        <Button
                                            onClick={importAllProducts}
                                            disabled={importMutation.isPending}
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Import All ({amazonProducts.products.length})
                                        </Button>
                                    </div>
                                </div>

                                {/* Product Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {amazonProducts.products.map((product) => (
                                        <div
                                            key={product.asin}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedProducts.has(product.asin)
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => toggleProductSelection(product.asin)}
                                        >
                                            <div className="flex gap-3">
                                                <Checkbox
                                                    checked={selectedProducts.has(product.asin)}
                                                    onCheckedChange={() => toggleProductSelection(product.asin)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.title}
                                                        className="w-full h-32 object-cover rounded-md mb-2"
                                                    />
                                                    <h4 className="font-medium text-sm line-clamp-2">{product.title}</h4>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-orange-600 font-bold">${product.price}</span>
                                                        <span className="text-xs text-gray-500">{product.stockCount} in stock</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">ASIN: {product.asin}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm text-gray-500 text-center mt-4">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    {amazonProducts.message}
                                </p>
                            </div>
                        )}

                        {!showProducts && (
                            <p className="text-gray-500 text-center py-8">
                                Click "Fetch Amazon Products" to view your Amazon catalog
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

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
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                            {logs.slice(0, 10).map((log) => (
                                <div key={log.id} className="flex items-start justify-between py-3 border-b last:border-0">
                                    <div className="flex items-start gap-3">
                                        <span className={`w-2 h-2 rounded-full mt-2 ${log.status === 'success' ? 'bg-green-500' :
                                            log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <p className="font-medium text-gray-900">{log.message}</p>
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
