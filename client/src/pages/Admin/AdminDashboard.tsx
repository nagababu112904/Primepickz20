import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Package, ShoppingCart, RefreshCw, BarChart3, Settings, LogOut, Lock } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { OrdersTab } from './OrdersTab';
import { AmazonSyncTab } from './AmazonSyncTab';
import { AnalyticsTab } from './AnalyticsTab';
import { useToast } from '@/hooks/use-toast';

// Auth helper
const getAuthToken = () => localStorage.getItem('adminToken');
const setAuthToken = (token: string) => localStorage.setItem('adminToken', token);
const clearAuthToken = () => localStorage.removeItem('adminToken');

export const adminFetch = async (action: string, options?: RequestInit) => {
    const token = getAuthToken();
    const res = await fetch(`/api/admin?action=${action}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Basic ${token}` : '',
            ...options?.headers,
        },
    });

    if (res.status === 401) {
        clearAuthToken();
        window.location.reload();
        throw new Error('Unauthorized');
    }

    return res;
};

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setAuthToken(data.token);
                onLogin(data.token);
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                    <p className="text-gray-500">Enter your credentials to access the dashboard</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const { toast } = useToast();

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (token: string) => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsAuthenticated(false);
        toast({ title: 'Logged out successfully' });
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="text-orange-500 border-orange-500 hover:bg-orange-50">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 bg-white border border-gray-200 p-1 rounded-lg">
                        <TabsTrigger
                            value="dashboard"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                            value="products"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Products
                        </TabsTrigger>
                        <TabsTrigger
                            value="orders"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger
                            value="amazon-sync"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Amazon Sync
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <DashboardTab />
                    </TabsContent>

                    <TabsContent value="products">
                        <ProductsTab />
                    </TabsContent>

                    <TabsContent value="orders">
                        <OrdersTab />
                    </TabsContent>

                    <TabsContent value="amazon-sync">
                        <AmazonSyncTab />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <AnalyticsTab />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
