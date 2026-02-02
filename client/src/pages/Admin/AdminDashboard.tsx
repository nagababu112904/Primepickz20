import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LayoutDashboard, Package, ShoppingCart, RefreshCw, BarChart3, Settings, LogOut, Lock,
    RotateCcw, Warehouse, FolderOpen, ChevronLeft, Search, Bell, Menu, Mail, HelpCircle, X
} from 'lucide-react';
import { DashboardTab } from './DashboardTab';
import { ProductsTab } from './ProductsTab';
import { OrdersTab } from './OrdersTab';
import { AmazonSyncTab } from './AmazonSyncTab';
import { AnalyticsTab } from './AnalyticsTab';
import { ReturnsTab } from './ReturnsTab';
import { InventoryTab } from './InventoryTab';
import { CategoriesTab } from './CategoriesTab';
import { EmailTab } from './EmailTab';
import { useToast } from '@/hooks/use-toast';

// Auth helper
const getAuthToken = () => localStorage.getItem('adminToken');
const setAuthToken = (token: string) => localStorage.setItem('adminToken', token);
const clearAuthToken = () => localStorage.removeItem('adminToken');

// Admin fetch helper with auth
export const adminFetch = async (action: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    return fetch(`/api/admin?action=${action}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });
};

// Sidebar menu configuration
const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Menu' },
    { id: 'products', label: 'Products', icon: Package, section: 'Menu' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, section: 'Menu' },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, section: 'Menu' },
    { id: 'categories', label: 'Categories', icon: FolderOpen, section: 'Menu' },
    { id: 'analytics', label: 'Report & Analytics', icon: BarChart3, section: 'Menu' },
    { id: 'amazon-sync', label: 'Amazon Sync', icon: RefreshCw, section: 'Tools' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, section: 'Tools' },
    { id: 'email', label: 'Email', icon: Mail, section: 'Tools' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'Settings' },
    { id: 'help', label: 'Help Center', icon: HelpCircle, section: 'Settings' },
];

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
                    <div className="mx-auto w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div>
                            <Label htmlFor="username">Username / Email</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin or email"
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
                        <Button type="submit" className="w-full bg-[#1a365d] hover:bg-[#2d4a7c]" disabled={loading}>
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Close mobile menu on window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogin = (token: string) => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        clearAuthToken();
        setIsAuthenticated(false);
        toast({ title: 'Logged out successfully' });
    };

    const handleNavClick = (tabId: string) => {
        setActiveTab(tabId);
        setMobileMenuOpen(false); // Close mobile menu on navigation
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardTab />;
            case 'products': return <ProductsTab />;
            case 'orders': return <OrdersTab />;
            case 'inventory': return <InventoryTab />;
            case 'categories': return <CategoriesTab />;
            case 'analytics': return <AnalyticsTab />;
            case 'amazon-sync': return <AmazonSyncTab />;
            case 'returns': return <ReturnsTab />;
            case 'email': return <EmailTab />;
            case 'help': return (
                <Card>
                    <CardHeader><CardTitle>Help Center</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Documentation and support resources coming soon...</p>
                    </CardContent>
                </Card>
            );
            case 'settings': return (
                <Card>
                    <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-gray-500">Settings panel coming soon...</p>
                    </CardContent>
                </Card>
            );
            default: return <DashboardTab />;
        }
    };

    const getPageTitle = () => {
        const item = MENU_ITEMS.find(m => m.id === activeTab);
        return item?.label || 'Dashboard';
    };

    // Group menu items by section
    const menuSections = MENU_ITEMS.reduce((acc, item) => {
        if (!acc[item.section]) acc[item.section] = [];
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, typeof MENU_ITEMS>);

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <>
            {/* Logo */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    {(!sidebarCollapsed || isMobile) && (
                        <span className="font-bold text-lg">
                            <span className="text-[#1a365d]">Prime</span>
                            <span className="text-[#d4a574]">Pickz</span>
                        </span>
                    )}
                </div>
                {isMobile ? (
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-1.5 hover:bg-gray-100 rounded-md"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                ) : (
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 hover:bg-gray-100 rounded-md hidden md:block"
                    >
                        <ChevronLeft className={`w-5 h-5 text-gray-500 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            {/* Search */}
            {(!sidebarCollapsed || isMobile) && (
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search"
                            className="pl-9 bg-gray-50 border-gray-200"
                        />
                    </div>
                </div>
            )}

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-2">
                {Object.entries(menuSections).map(([section, items]) => (
                    <div key={section} className="mb-4">
                        {(!sidebarCollapsed || isMobile) && (
                            <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">{section}</p>
                        )}
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${isActive
                                        ? 'bg-[#1a365d] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    title={sidebarCollapsed && !isMobile ? item.label : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {(!sidebarCollapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title={sidebarCollapsed && !isMobile ? 'Logout' : undefined}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {(!sidebarCollapsed || isMobile) && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent isMobile={true} />
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex bg-white border-r border-gray-200 flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                <SidebarContent isMobile={false} />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{getPageTitle()}</h1>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-medium text-sm">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
