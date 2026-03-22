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

    // ASIN Import State
    const [asinInput, setAsinInput] = useState('');
    const [isFetchingAsin, setIsFetchingAsin] = useState(false);
    const [asinProduct, setAsinProduct] = useState<any>(null);

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

    // Fetch product by ASIN from Amazon
    const handleFetchByAsin = async () => {
        if (!asinInput.trim()) {
            toast({ title: 'Please enter an ASIN', variant: 'destructive' });
            return;
        }

        setIsFetchingAsin(true);
        setAsinProduct(null);

        try {
            const res = await adminFetch(`fetch-by-asin&asin=${asinInput.trim().toUpperCase()}`);
            const data = await res.json();

            if (!res.ok) {
                toast({
                    title: data.error || 'Failed to fetch product',
                    description: data.message,
                    variant: 'destructive'
                });
                return;
            }

            setAsinProduct(data.product);
            toast({ title: 'Product found!', description: data.product.name });
        } catch (error) {
            toast({ title: 'Failed to fetch product', variant: 'destructive' });
        } finally {
            setIsFetchingAsin(false);
        }
    };

    // Add the fetched ASIN product to our catalog
    const handleAddAsinProduct = async () => {
        if (!asinProduct) return;

        try {
            await addProductMutation.mutateAsync({
                name: asinProduct.name,
                description: asinProduct.description || asinProduct.name,
                price: asinProduct.price || '0',
                imageUrl: asinProduct.imageUrl || '',
                category: asinProduct.category || 'General',
                stockCount: asinProduct.stockCount || 10,
                inStock: true,
                amazonAsin: asinProduct.asin,
            });

            setAsinProduct(null);
            setAsinInput('');
        } catch (error) {
            // Error handled by mutation
        }
    };

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

            {/* ASIN Import Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0">
                            <h3 className="font-semibold text-blue-900">🔍 Import by ASIN</h3>
                            <p className="text-sm text-gray-600">Enter an Amazon ASIN to auto-fetch product details</p>
                        </div>
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="e.g., B08N5WRWNW"
                                value={asinInput}
                                onChange={(e) => setAsinInput(e.target.value.toUpperCase())}
                                className="flex-1 uppercase bg-white"
                                maxLength={10}
                            />
                            <Button
                                onClick={handleFetchByAsin}
                                disabled={isFetchingAsin || !asinInput.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isFetchingAsin ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4 mr-2" />
                                        Fetch Product
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* ASIN Product Preview */}
                    {asinProduct && (
                        <div className="mt-4 p-4 bg-white rounded-lg border flex flex-col md:flex-row gap-4">
                            {asinProduct.imageUrl && (
                                <img
                                    src={asinProduct.imageUrl}
                                    alt={asinProduct.name}
                                    className="w-24 h-24 object-contain rounded"
                                />
                            )}
                            <div className="flex-1 space-y-2">
                                <h4 className="font-semibold text-gray-900">{asinProduct.name}</h4>
                                <p className="text-sm text-gray-500">ASIN: {asinProduct.asin}</p>

                                {/* Editable Category Dropdown */}
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm text-gray-500 w-20">Category:</Label>
                                    <Select
                                        value={asinProduct.category || 'General'}
                                        onValueChange={(val) => setAsinProduct({ ...asinProduct, category: val })}
                                    >
                                        <SelectTrigger className="w-48 h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                            <SelectItem value="General">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <p className="text-lg font-bold text-green-600 mt-1">
                                    ${parseFloat(asinProduct.price || 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="flex gap-2 items-start">
                                <Button
                                    onClick={handleAddAsinProduct}
                                    disabled={addProductMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {addProductMutation.isPending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add to Catalog
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setAsinProduct(null);
                                        setAsinInput('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

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
        shippingCost: (initialData as any)?.shippingCost || '0',
        taxRate: (initialData as any)?.taxRate || '8',
        category: initialData?.category || '',
        imageUrl: initialData?.imageUrl || '',
        stockCount: initialData?.stockCount || 0,
        amazonAsin: initialData?.amazonAsin || '',
        amazonSku: initialData?.amazonSku || '',
        hasVariants: initialData?.hasVariants || false,
    });

    const [variants, setVariants] = useState<Variant[]>([]);
    const [showVariants, setShowVariants] = useState(formData.hasVariants);

    // Multi-image state
    const [images, setImages] = useState<string[]>(() => {
        const existing: string[] = [];
        if (initialData?.imageUrl) existing.push(initialData.imageUrl);
        if ((initialData as any)?.images) {
            const extraImages = (initialData as any).images;
            if (Array.isArray(extraImages)) {
                extraImages.forEach((img: string) => {
                    if (!existing.includes(img)) existing.push(img);
                });
            }
        }
        return existing;
    });
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Multi-video state
    const [videos, setVideos] = useState<string[]>(() => {
        const existing: string[] = [];
        if ((initialData as any)?.videoUrl) existing.push((initialData as any).videoUrl);
        if ((initialData as any)?.videos) {
            const extraVideos = (initialData as any).videos;
            if (Array.isArray(extraVideos)) {
                extraVideos.forEach((vid: string) => {
                    if (!existing.includes(vid)) existing.push(vid);
                });
            }
        }
        return existing;
    });
    const [videoUrlInput, setVideoUrlInput] = useState('');
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);

    // Add image by URL
    const handleAddImageUrl = () => {
        if (imageUrlInput.trim()) {
            setImages([...images, imageUrlInput.trim()]);
            setImageUrlInput('');
        }
    };

    // Add image by file upload
    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newImages: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) continue;

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            newImages.push(base64);
        }

        setImages([...images, ...newImages]);
        setIsUploading(false);
        e.target.value = '';
    };

    // Remove image
    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Add video by URL
    const handleAddVideoUrl = () => {
        if (videoUrlInput.trim()) {
            setVideos([...videos, videoUrlInput.trim()]);
            setVideoUrlInput('');
        }
    };

    // Add video by file upload
    const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingVideo(true);
        const newVideos: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('video/')) continue;
            if (file.size > 50 * 1024 * 1024) continue;

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            newVideos.push(base64);
        }

        setVideos([...videos, ...newVideos]);
        setIsUploadingVideo(false);
        e.target.value = '';
    };

    // Remove video
    const handleRemoveVideo = (index: number) => {
        setVideos(videos.filter((_, i) => i !== index));
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
        const primaryImage = images[0] || '';
        const additionalImages = images.slice(1);
        onSubmit({
            ...formData,
            imageUrl: primaryImage,
            // @ts-ignore - images array will be stored in jsonb
            images: additionalImages,
            // @ts-ignore - videos will be stored alongside
            videos: videos,
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
                    <Label>Shipping Cost ($)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.shippingCost}
                        onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                        placeholder="0 = free shipping"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set to 0 for free shipping</p>
                </div>

                <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        placeholder="e.g. 8 for 8%"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default 8%</p>
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

                {/* Multi-Image Upload Section */}
                <div className="col-span-2 space-y-3 border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Product Images * <span className="text-xs font-normal text-gray-500">({images.length} added, first = primary)</span></Label>
                    </div>

                    {/* Add by URL */}
                    <div className="flex gap-2">
                        <Input
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="Paste image URL and click Add"
                            className="flex-1 bg-white"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddImageUrl} disabled={!imageUrlInput.trim()}>
                            <Plus className="w-4 h-4 mr-1" /> Add URL
                        </Button>
                    </div>

                    {/* Upload files */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors bg-white">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                            {isUploading ? 'Uploading...' : 'Click to upload images (multi-select supported)'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageFileChange}
                            className="hidden"
                            disabled={isUploading}
                        />
                    </label>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each</p>

                    {/* Image Previews Grid */}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {images.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Image ${index + 1}`}
                                        className={`w-24 h-24 object-cover rounded-lg border-2 ${
                                            index === 0 ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                                        }`}
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" font-size="14">Error</text></svg>'; }}
                                    />
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Primary</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Multi-Video Upload Section */}
                <div className="col-span-2 space-y-3 border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Product Videos <span className="text-xs font-normal text-gray-500">(Optional, {videos.length} added)</span></Label>
                    </div>

                    {/* Add by URL */}
                    <div className="flex gap-2">
                        <Input
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            placeholder="YouTube, Vimeo, or direct video URL"
                            className="flex-1 bg-white"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideoUrl())}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddVideoUrl} disabled={!videoUrlInput.trim()}>
                            <Plus className="w-4 h-4 mr-1" /> Add URL
                        </Button>
                    </div>

                    {/* Upload files */}
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors bg-white">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 text-sm">
                            {isUploadingVideo ? 'Uploading...' : 'Click to upload videos (multi-select supported)'}
                        </span>
                        <input
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={handleVideoFileChange}
                            className="hidden"
                            disabled={isUploadingVideo}
                        />
                    </label>
                    <p className="text-xs text-gray-500">MP4, WEBM up to 50MB each</p>

                    {/* Video Previews */}
                    {videos.length > 0 && (
                        <div className="space-y-2">
                            {videos.map((vid, index) => (
                                <div key={index} className="relative flex items-center gap-3 bg-white rounded-lg border p-2 group">
                                    {vid.startsWith('data:video') ? (
                                        <video src={vid} controls className="w-32 h-20 rounded object-cover" />
                                    ) : (
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-sm text-blue-600 truncate">{vid}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVideo(index)}
                                        className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 flex-shrink-0"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
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

