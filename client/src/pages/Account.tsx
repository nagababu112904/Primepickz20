import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Header } from '@/components/marketplace/Header';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { Footer } from '@/components/marketplace/Footer';
import { User, Package, Heart, MapPin, Settings, LogOut, Edit, Plus, Eye, Trash2, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@shared/schema';

interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    isDefault: boolean;
}

interface Order {
    id: string;
    date: string;
    total: string;
    status: string;
    items: number;
    products?: { name: string; quantity: number; price: string }[];
}

export default function Account() {
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.displayName || 'Guest',
        email: user?.email || 'guest@primepickz.com',
        phone: '+1 (555) 123-4567',
    });

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'isDefault'>>({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
    });

    // Order Details State
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    // Settings State
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ['/api/products'],
    });

    // Mock orders - in production, fetch from API
    const orders: Order[] = [
        {
            id: '001',
            date: '2024-01-15',
            total: '299.99',
            status: 'Delivered',
            items: 2,
            products: [
                { name: 'Wireless Earbuds Pro', quantity: 1, price: '199.99' },
                { name: 'Phone Case', quantity: 1, price: '100.00' },
            ],
        },
        {
            id: '002',
            date: '2024-01-10',
            total: '89.99',
            status: 'In Transit',
            items: 1,
            products: [
                { name: 'Smart Watch Band', quantity: 1, price: '89.99' },
            ],
        },
    ];

    // Profile handlers
    const handleSaveProfile = () => {
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
        setIsEditingProfile(false);
    };

    // Address handlers
    const handleAddAddress = () => {
        const address: Address = {
            id: Date.now().toString(),
            ...newAddress,
            isDefault: addresses.length === 0,
        };
        setAddresses([...addresses, address]);
        setNewAddress({ name: '', street: '', city: '', state: '', zip: '', phone: '' });
        setIsAddingAddress(false);
        toast({ title: 'Address Added', description: 'New address has been saved.' });
    };

    const handleDeleteAddress = (id: string) => {
        setAddresses(addresses.filter(a => a.id !== id));
        toast({ title: 'Address Deleted', description: 'Address has been removed.' });
    };

    const handleSetDefaultAddress = (id: string) => {
        setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
        toast({ title: 'Default Updated', description: 'Default address has been changed.' });
    };

    // Password handler
    const handleChangePassword = () => {
        if (passwordData.new !== passwordData.confirm) {
            toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
            return;
        }
        if (passwordData.new.length < 8) {
            toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
            return;
        }
        toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
        setPasswordData({ current: '', new: '', confirm: '' });
        setIsChangingPassword(false);
    };

    // Sign out handler
    const handleSignOut = () => {
        logout?.();
        toast({ title: 'Signed Out', description: 'You have been logged out successfully.' });
        window.location.href = '/';
    };

    // Show loading spinner while auth state is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your account...</p>
                    </div>
                </main>
                <Footer />
                <BottomNav />
            </div>
        );
    }

    // If not authenticated (and loading is complete), show login prompt
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
                <Header />
                <main className="flex-1 flex items-center justify-center px-4 py-12">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-8 text-center">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
                            <p className="text-gray-600 mb-6">Please sign in to access your account.</p>
                            <Link href="/login">
                                <Button className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                                    Sign In
                                </Button>
                            </Link>
                            <p className="text-sm text-gray-500 mt-4">
                                Don't have an account? <Link href="/login" className="text-[#1a2332] font-medium">Sign Up</Link>
                            </p>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <h1 className="text-3xl font-bold mb-6">My Account</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-8 bg-white">
                        <TabsTrigger value="profile" className="data-[state=active]:bg-[#1a2332] data-[state=active]:text-white">
                            <User className="w-4 h-4 mr-2 hidden md:block" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="data-[state=active]:bg-[#1a2332] data-[state=active]:text-white">
                            <Package className="w-4 h-4 mr-2 hidden md:block" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="wishlist" className="data-[state=active]:bg-[#1a2332] data-[state=active]:text-white">
                            <Heart className="w-4 h-4 mr-2 hidden md:block" />
                            Wishlist
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="hidden md:flex data-[state=active]:bg-[#1a2332] data-[state=active]:text-white">
                            <MapPin className="w-4 h-4 mr-2" />
                            Addresses
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="hidden md:flex data-[state=active]:bg-[#1a2332] data-[state=active]:text-white">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Profile Information</CardTitle>
                                {!isEditingProfile && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditingProfile ? (
                                    <>
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input
                                                id="name"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <Button onClick={handleSaveProfile} className="bg-[#1a2332] hover:bg-[#0f1419]">
                                                <Check className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="text-lg">{profileData.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-lg">{profileData.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-lg">{profileData.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Member Since</label>
                                            <p className="text-lg">January 2024</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-600">{order.date}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <p className="text-sm text-gray-600">{order.items} item(s)</p>
                                                <p className="font-bold text-[#1a2332]">${order.total}</p>
                                            </div>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setViewingOrder(order)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Order #{order.id} Details</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Status:</span>
                                                            <span className={`font-medium ${order.status === 'Delivered' ? 'text-green-600' : 'text-blue-600'}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Date:</span>
                                                            <span>{order.date}</span>
                                                        </div>
                                                        <div className="border-t pt-4">
                                                            <p className="font-medium mb-2">Items:</p>
                                                            {order.products?.map((item, i) => (
                                                                <div key={i} className="flex justify-between py-2 border-b last:border-0">
                                                                    <span>{item.name} x{item.quantity}</span>
                                                                    <span>${item.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between font-bold text-lg pt-2">
                                                            <span>Total:</span>
                                                            <span>${order.total}</span>
                                                        </div>
                                                        <Link href="/track-order">
                                                            <Button className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                                                                Track Order
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Wishlist Tab */}
                    <TabsContent value="wishlist">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Wishlist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {products.slice(0, 4).map((product) => (
                                        <div key={product.id} className="border rounded-lg p-3">
                                            <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                                                <img
                                                    src={product.imageUrl ?? ''}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h4 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h4>
                                            <p className="text-sm font-bold text-[#1a2332]">${product.price}</p>
                                            <Button size="sm" className="w-full mt-2 bg-[#1a2332] hover:bg-[#0f1419]">
                                                Add to Cart
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                {products.length === 0 && (
                                    <p className="text-center text-gray-600 py-8">Your wishlist is empty</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Addresses Tab */}
                    <TabsContent value="addresses">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Saved Addresses</CardTitle>
                                <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-[#1a2332] hover:bg-[#0f1419]">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add New Address
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Address</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Full Name</Label>
                                                <Input
                                                    value={newAddress.name}
                                                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <Label>Street Address</Label>
                                                <Input
                                                    value={newAddress.street}
                                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                    placeholder="123 Main St"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>City</Label>
                                                    <Input
                                                        value={newAddress.city}
                                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                        placeholder="New York"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>State</Label>
                                                    <Input
                                                        value={newAddress.state}
                                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                        placeholder="NY"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>ZIP Code</Label>
                                                    <Input
                                                        value={newAddress.zip}
                                                        onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                                        placeholder="10001"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Phone</Label>
                                                    <Input
                                                        value={newAddress.phone}
                                                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleAddAddress} className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                                                Save Address
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {addresses.length === 0 ? (
                                    <p className="text-gray-600">No saved addresses yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((address) => (
                                            <div key={address.id} className="border rounded-lg p-4 relative">
                                                {address.isDefault && (
                                                    <span className="absolute top-2 right-2 bg-[#1a2332] text-white text-xs px-2 py-1 rounded">
                                                        Default
                                                    </span>
                                                )}
                                                <p className="font-medium">{address.name}</p>
                                                <p className="text-gray-600">{address.street}</p>
                                                <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
                                                <p className="text-gray-600">{address.phone}</p>
                                                <div className="flex gap-2 mt-3">
                                                    {!address.isDefault && (
                                                        <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address.id)}>
                                                            Set as Default
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteAddress(address.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Change Password */}
                                <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start">
                                            Change Password
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Password</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Current Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.current}
                                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Confirm New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                />
                                            </div>
                                            <Button onClick={handleChangePassword} className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                                                Update Password
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Email Preferences', description: 'Email preferences updated.' })}>
                                    Email Preferences
                                </Button>

                                <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Privacy Settings', description: 'Privacy settings saved.' })}>
                                    Privacy Settings
                                </Button>

                                <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
