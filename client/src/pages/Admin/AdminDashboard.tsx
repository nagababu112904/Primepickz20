import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, ShoppingCart, RefreshCw, BarChart3, Settings, LogOut } from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { OrdersTab } from './OrdersTab';
import { AmazonSyncTab } from './AmazonSyncTab';
import { AnalyticsTab } from './AnalyticsTab';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');

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
                        <Button variant="ghost" size="sm">
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
