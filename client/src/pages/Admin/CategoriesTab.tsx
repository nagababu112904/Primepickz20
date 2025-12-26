import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminFetch } from './AdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { FolderOpen, Plus, Trash2, Edit2, Image } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    description: string | null;
}

export function CategoriesTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', imageUrl: '', description: '' });
    const { toast } = useToast();

    const { data: categories = [], isLoading } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            return res.json();
        },
    });

    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await adminFetch('categories', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to add category');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Category added!' });
            setIsAddOpen(false);
            resetForm();
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to add category', variant: 'destructive' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await adminFetch(`categories&id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update category');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Category updated!' });
            setEditingCategory(null);
            resetForm();
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await adminFetch(`categories&id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete category');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast({ title: 'Category deleted!' });
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
        },
    });

    const resetForm = () => {
        setFormData({ name: '', slug: '', imageUrl: '', description: '' });
    };

    const handleAdd = () => {
        if (!formData.name || !formData.slug || !formData.imageUrl) {
            toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
            return;
        }
        addMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!editingCategory || !formData.name || !formData.slug || !formData.imageUrl) {
            toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
            return;
        }
        updateMutation.mutate({ id: editingCategory.id, data: formData });
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            imageUrl: category.imageUrl,
            description: category.description || '',
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(id);
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Category Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                            slug: generateSlug(e.target.value)
                                        });
                                    }}
                                    placeholder="Electronics"
                                />
                            </div>
                            <div>
                                <Label>Slug *</Label>
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="electronics"
                                />
                            </div>
                            <div>
                                <Label>Image URL *</Label>
                                <Input
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Category description..."
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleAdd}
                                className="w-full"
                                disabled={addMutation.isPending}
                            >
                                {addMutation.isPending ? 'Adding...' : 'Add Category'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                        <div className="relative h-32 bg-gray-100">
                            {category.imageUrl ? (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-500 mb-3">/{category.slug}</p>
                            {category.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(category.id)}
                                    disabled={deleteMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {categories.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No categories yet</h3>
                        <p className="text-gray-500 mb-4">Add your first category to organize products</p>
                        <Button onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Category Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Slug *</Label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Image URL *</Label>
                            <Input
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <Button
                            onClick={handleUpdate}
                            className="w-full"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Updating...' : 'Update Category'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
