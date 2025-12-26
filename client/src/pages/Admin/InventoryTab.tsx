import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from './AdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { Package, AlertTriangle, Check, Edit2, Save, X } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    stockCount: number | null;
    imageUrl: string | null;
    price: string;
    inStock: boolean;
}

export function InventoryTab() {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const { toast } = useToast();

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['admin', 'products'],
        queryFn: async () => {
            const res = await adminFetch('products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, stockCount }: { id: string; stockCount: number }) => {
            const res = await adminFetch(`products&id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({ stockCount, inStock: stockCount > 0 }),
            });
            if (!res.ok) throw new Error('Failed to update stock');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            toast({ title: 'Stock updated!' });
            setEditingId(null);
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
        },
    });

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setEditValue(product.stockCount || 0);
    };

    const handleSave = (id: string) => {
        updateMutation.mutate({ id, stockCount: editValue });
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const stock = p.stockCount || 0;
        if (filter === 'low') return stock > 0 && stock <= 5;
        if (filter === 'out') return stock === 0;
        return true;
    });

    // Summary stats
    const lowStockCount = products.filter(p => (p.stockCount || 0) > 0 && (p.stockCount || 0) <= 5).length;
    const outOfStockCount = products.filter(p => (p.stockCount || 0) === 0).length;
    const totalProducts = products.length;

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Products</p>
                            <p className="text-2xl font-bold">{totalProducts}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('low')}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 text-yellow-700">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Low Stock (&le;5)</p>
                            <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('out')}>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-700">
                            <X className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Indicator */}
            {filter !== 'all' && (
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{filter === 'low' ? 'Low Stock' : 'Out of Stock'}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>Clear filter</Button>
                </div>
            )}

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Inventory Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-3 font-medium">Product</th>
                                    <th className="p-3 font-medium">Price</th>
                                    <th className="p-3 font-medium">Stock</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const stock = product.stockCount || 0;
                                    const isEditing = editingId === product.id;

                                    return (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    {product.imageUrl && (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    )}
                                                    <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">${product.price}</td>
                                            <td className="p-3">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                                        className="w-20"
                                                    />
                                                ) : (
                                                    <span className={`font-medium ${stock <= 5 ? 'text-red-600' : ''}`}>
                                                        {stock} units
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {stock === 0 ? (
                                                    <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
                                                ) : stock <= 5 ? (
                                                    <Badge className="bg-yellow-100 text-yellow-700">Low Stock</Badge>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700">In Stock</Badge>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSave(product.id)}
                                                            disabled={updateMutation.isPending}
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingId(null)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No products found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
