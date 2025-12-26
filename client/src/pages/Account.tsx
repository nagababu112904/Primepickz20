import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/marketplace/Header';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { Footer } from '@/components/marketplace/Footer';
import { User, Package, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@shared/schema';

export default function Account() {
    const [activeTab, setActiveTab] = useState('profile');

    // Mock user data - replace with actual auth in production
    const user = {
        name: 'Guest',
        email: 'guest@primepickz.com',
        phone: '+1 (555) 123-4567',
        joined: 'January 2024',
    };

    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ['/api/products'],
    });

    // Mock orders - replace with actual API
    const orders = [
        {
            id: '001',
            date: '2024-01-15',
            total: '299.99',
            status: 'Delivered',
            items: 2,
        },
        {
            id: '002',
            date: '2024-01-10',
            total: '89.99',
            status: 'In Transit',
            items: 1,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef] flex flex-col">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <h1 className="text-3xl font-bold mb-6">My Account</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-8">
                        <TabsTrigger value="profile">
                            <User className="w-4 h-4 mr-2 hidden md:block" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="orders">
                            <Package className="w-4 h-4 mr-2 hidden md:block" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="wishlist">
                            <Heart className="w-4 h-4 mr-2 hidden md:block" />
                            Wishlist
                        </TabsTrigger>
                        <TabsTrigger value="addresses" className="hidden md:flex">
                            <MapPin className="w-4 h-4 mr-2" />
                            Addresses
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="hidden md:flex">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="text-lg">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-lg">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <p className="text-lg">{user.phone}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                                    <p className="text-lg">{user.joined}</p>
                                </div>
                                <Button className="mt-4">Edit Profile</Button>
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
                                                <p className="font-bold text-[hsl(var(--primary))]">${order.total}</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="mt-3 w-full">
                                                View Details
                                            </Button>
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
                                            <div className="aspect-square bg-gray-100 rounded mb-2">
                                                <img
                                                    src={product.imageUrl ?? ''}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                            </div>
                                            <h4 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h4>
                                            <p className="text-sm font-bold text-[hsl(var(--primary))]">${product.price}</p>
                                            <Button size="sm" className="w-full mt-2">Add to Cart</Button>
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
                            <CardHeader>
                                <CardTitle>Saved Addresses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">No saved addresses yet</p>
                                <Button>Add New Address</Button>
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
                                <Button variant="outline" className="w-full justify-start">
                                    Change Password
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Email Preferences
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    Privacy Settings
                                </Button>
                                <Button variant="destructive" className="w-full justify-start">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <Footer />
            <BottomNav />
        </div>
    );
}
