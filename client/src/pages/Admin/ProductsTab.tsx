import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
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
import { adminFetch } from './AdminDashboard';

export function ProductsTab() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [syncFilter, setSyncFilter] = useState('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { toast } = useToast();

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['admin', 'products'],
        queryFn: async () => {
            const res = await adminFetch('products');
            if (!res.ok) throw new Error('Failed to fetch products');
            return res.json();
        },
    });

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['/api/categories'],
    });

    const addProductMutation = useMutation({
        mutationFn: async (data: Partial<Product>) => {
            const res = await adminFetch('products', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
            setIsAddDialogOpen(false);
            toast({ title: 'Product added successfully' });
        },
        onError: () => {
            toast({ title: 'Failed to add product', variant: 'destructive' });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            const res = await adminFetch(`products&id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            setEditingProduct(null);
            toast({ title: 'Product updated successfully' });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await adminFetch(`products&id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete product');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
                            <SelectTrigger className="w-full md:w-48">
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
                            <SelectTrigger className="w-full md:w-48">
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
                                                {(product.stockCount || 0) === 0 ? (
                                                    <Badge className="bg-gray-800 text-white">
                                                        Out of Stock
                                                    </Badge>
                                                ) : (product.stockCount || 0) < 5 ? (
                                                    <Badge className="bg-red-100 text-red-700 border border-red-200">
                                                        {product.stockCount} units ⚠️
                                                    </Badge>
                                                ) : (product.stockCount || 0) < 20 ? (
                                                    <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                        {product.stockCount} units
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-green-100 text-green-700 border border-green-200">
                                                        {product.stockCount} units
                                                    </Badge>
                                                )}
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

interface Variant {
    id?: string;
    size: string;
    color: string;
    colorHex: string;
    price: string;
    stock: number;
    sku: string;
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const COMMON_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1E3A5F' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Beige', hex: '#D4B896' },
    { name: 'Brown', hex: '#92400E' },
];

function ProductForm({ categories, initialData, onSubmit, isLoading }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        price: initialData?.price || '',
        originalPrice: initialData?.originalPrice || '',
        category: initialData?.category || '',
        imageUrl: initialData?.imageUrl || '',
        videoUrl: (initialData as any)?.videoUrl || '',
        stockCount: initialData?.stockCount || 0,
        amazonAsin: initialData?.amazonAsin || '',
        amazonSku: initialData?.amazonSku || '',
        hasVariants: initialData?.hasVariants || false,
    });

    const [variants, setVariants] = useState<Variant[]>([]);
    const [showVariants, setShowVariants] = useState(formData.hasVariants);

    // Image upload state
    const [imageUploadMode, setImageUploadMode] = useState<'url' | 'file'>('url');
    const [imagePreview, setImagePreview] = useState<string>(formData.imageUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    // Handle image file upload
    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Max size 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        // Convert to base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setImagePreview(base64);
            setFormData({ ...formData, imageUrl: base64 });
            setIsUploading(false);
        };
        reader.onerror = () => {
            alert('Failed to read image file');
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    // Video upload state
    const [videoUploadMode, setVideoUploadMode] = useState<'url' | 'file'>('url');
    const [videoPreview, setVideoPreview] = useState<string>(formData.videoUrl || '');
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);

    // Handle video file upload
    const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('video/')) {
            alert('Please select a video file');
            return;
        }

        // Max size 50MB
        if (file.size > 50 * 1024 * 1024) {
            alert('Video size must be less than 50MB');
            return;
        }

        setIsUploadingVideo(true);

        // Convert to base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setVideoPreview(base64);
            setFormData({ ...formData, videoUrl: base64 });
            setIsUploadingVideo(false);
        };
        reader.onerror = () => {
            alert('Failed to read video file');
            setIsUploadingVideo(false);
        };
        reader.readAsDataURL(file);
    };

    const addVariant = () => {
        setVariants([...variants, {
            size: '',
            color: '',
            colorHex: '#000000',
            price: formData.price || '',
            stock: 0,
            sku: '',
        }]);
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };

        // If color is selected from presets, update colorHex
        if (field === 'color') {
            const preset = COMMON_COLORS.find(c => c.name === value);
            if (preset) {
                updated[index].colorHex = preset.hex;
            }
        }

        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            hasVariants: showVariants && variants.length > 0,
            // @ts-ignore - variants will be handled by the parent
            variants: showVariants ? variants : [],
        });
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
                    <Label>Base Price *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <Label>Original Price (for discount)</Label>
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
                    <Label>Stock Count {showVariants ? '(auto from variants)' : ''}</Label>
                    <Input
                        type="number"
                        value={formData.stockCount}
                        onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })}
                        disabled={showVariants}
                    />
                </div>

                {/* Image Upload Section */}
                <div className="col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Product Image *</Label>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${imageUploadMode === 'url'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                onClick={() => setImageUploadMode('url')}
                            >
                                URL
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${imageUploadMode === 'file'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                onClick={() => setImageUploadMode('file')}
                            >
                                Upload File
                            </button>
                        </div>
                    </div>

                    {imageUploadMode === 'url' ? (
                        <Input
                            value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                            onChange={(e) => {
                                setFormData({ ...formData, imageUrl: e.target.value });
                                setImagePreview(e.target.value);
                            }}
                            placeholder="https://example.com/image.jpg"
                            required={!formData.imageUrl}
                        />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">
                                        {isUploading ? 'Uploading...' : 'Click to upload image'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative inline-block">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setImagePreview('');
                                    setFormData({ ...formData, imageUrl: '' });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                {/* Video Upload Section */}
                <div className="col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Product Video (Optional)</Label>
                        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${videoUploadMode === 'url'
                                        ? 'bg-white shadow-sm text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                onClick={() => setVideoUploadMode('url')}
                            >
                                URL
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${videoUploadMode === 'file'
                                        ? 'bg-white shadow-sm text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                onClick={() => setVideoUploadMode('file')}
                            >
                                Upload File
                            </button>
                        </div>
                    </div>

                    {videoUploadMode === 'url' ? (
                        <div>
                            <Input
                                value={formData.videoUrl.startsWith('data:') ? '' : formData.videoUrl}
                                onChange={(e) => {
                                    setFormData({ ...formData, videoUrl: e.target.value });
                                    setVideoPreview(e.target.value);
                                }}
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                            />
                            <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video URL</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-600">
                                        {isUploadingVideo ? 'Uploading...' : 'Click to upload video'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleVideoFileChange}
                                        className="hidden"
                                        disabled={isUploadingVideo}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">MP4, WEBM up to 50MB</p>
                        </div>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                        <div className="relative inline-block">
                            {videoPreview.startsWith('data:video') ? (
                                <video
                                    src={videoPreview}
                                    controls
                                    className="w-48 h-32 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                    <span className="text-sm text-gray-600 max-w-xs truncate">{videoPreview}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setVideoPreview('');
                                    setFormData({ ...formData, videoUrl: '' });
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}
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

            {/* Variants Section */}
            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="hasVariants"
                            checked={showVariants}
                            onChange={(e) => setShowVariants(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="hasVariants" className="cursor-pointer">
                            This product has size/color variants
                        </Label>
                    </div>
                    {showVariants && (
                        <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add Variant
                        </Button>
                    )}
                </div>

                {showVariants && variants.length > 0 && (
                    <div className="space-y-3">
                        {variants.map((variant, index) => (
                            <div key={index} className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg items-end">
                                <div>
                                    <Label className="text-xs">Size</Label>
                                    <Select
                                        value={variant.size}
                                        onValueChange={(v) => updateVariant(index, 'size', v)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMMON_SIZES.map(s => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Color</Label>
                                    <Select
                                        value={variant.color}
                                        onValueChange={(v) => updateVariant(index, 'color', v)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Color" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMMON_COLORS.map(c => (
                                                <SelectItem key={c.name} value={c.name}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: c.hex }}
                                                        />
                                                        {c.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Price</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={variant.price}
                                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Stock</Label>
                                    <Input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                        className="h-9"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">SKU</Label>
                                    <Input
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        placeholder="SKU-001"
                                        className="h-9"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 h-9"
                                    onClick={() => removeVariant(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <p className="text-xs text-gray-500 mt-2">
                            Total variants: {variants.length} |
                            Total stock: {variants.reduce((sum, v) => sum + (v.stock || 0), 0)} units
                        </p>
                    </div>
                )}

                {showVariants && variants.length === 0 && (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        No variants added yet. Click "Add Variant" to create size/color options.
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
                {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
            </Button>
        </form>
    );
}

