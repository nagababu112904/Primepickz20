import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@shared/schema';

export function ProductsTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [syncFilter, setSyncFilter] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { toast } = useToast();

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['/api/admin/products'],
        queryFn: async () => {
            const res = await fetch('/api/admin/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
    });

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['/api/categories'],
    });

    const addProductMutation = useMutation({
        mutationFn: async (data: Partial<Product>) => {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            setIsAddDialogOpen(false);
            toast({ title: 'Product added successfully' });
        },
        onError: () => {
            toast({ title: 'Failed to add product', variant: 'destructive' });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            const res = await fetch(`/api/admin/products?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
            setEditingProduct(null);
            toast({ title: 'Product updated successfully' });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/products?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
            toast({ title: 'Product deleted successfully' });
        },
    });

    // Filter products
    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesSync = syncFilter === 'all' || product.amazonSyncStatus === syncFilter;
        return matchesSearch && matchesCategory && matchesSync;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Products</h2>
                    <p className="text-gray-500">Manage your product catalog and Amazon sync</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-orange-500 border-orange-500">
                        <Upload className="w-4 h-4 mr-2" />
                        Import CSV
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm
                                categories={categories}
                                onSubmit={(data) => addProductMutation.mutate(data)}
                                isLoading={addProductMutation.isPending}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={syncFilter} onValueChange={setSyncFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Sync Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sync Status</SelectItem>
                                <SelectItem value="synced">Synced</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Product</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Price</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Stock</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Amazon Status</th>
                                    <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded object-cover bg-gray-100"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500">{product.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium">${product.price}</td>
                                            <td className="py-4 px-6">
                                                <Badge variant={product.stockCount && product.stockCount > 0 ? 'default' : 'destructive'} className="bg-blue-100 text-blue-700">
                                                    {product.stockCount || 0} units
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge
                                                    className={
                                                        product.amazonSyncStatus === 'synced'
                                                            ? 'bg-green-100 text-green-700'
                                                            : product.amazonSyncStatus === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-red-100 text-red-700'
                                                    }
                                                >
                                                    {product.amazonSyncStatus || 'pending'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" title="Sync">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingProduct(product)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => deleteProductMutation.mutate(product.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Product Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                        <ProductForm
                            categories={categories}
                            initialData={editingProduct}
                            onSubmit={(data) => updateProductMutation.mutate({ id: editingProduct.id, data })}
                            isLoading={updateProductMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface ProductFormProps {
    categories: Category[];
    initialData?: Partial<Product>;
    onSubmit: (data: Partial<Product>) => void;
    isLoading: boolean;
}

function ProductForm({ categories, initialData, onSubmit, isLoading }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        originalPrice: initialData?.originalPrice || '',
        category: initialData?.category || '',
        imageUrl: initialData?.imageUrl || '',
        stockCount: initialData?.stockCount || 0,
        amazonAsin: initialData?.amazonAsin || '',
        amazonSku: initialData?.amazonSku || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label>Product Name *</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="col-span-2">
                    <Label>Description *</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                    />
                </div>

                <div>
                    <Label>Price *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <Label>Original Price</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    />
                </div>

                <div>
                    <Label>Category *</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Stock Count</Label>
                    <Input
                        type="number"
                        value={formData.stockCount}
                        onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })}
                    />
                </div>

                <div className="col-span-2">
                    <Label>Image URL *</Label>
                    <Input
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        required
                        placeholder="https://..."
                    />
                </div>

                <div>
                    <Label>Amazon ASIN</Label>
                    <Input
                        value={formData.amazonAsin}
                        onChange={(e) => setFormData({ ...formData, amazonAsin: e.target.value })}
                        placeholder="B0XXXXXXXXX"
                    />
                </div>

                <div>
                    <Label>Amazon SKU</Label>
                    <Input
                        value={formData.amazonSku}
                        onChange={(e) => setFormData({ ...formData, amazonSku: e.target.value })}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
            </Button>
        </form>
    );
}
