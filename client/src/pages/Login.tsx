import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { Logo } from '@/components/marketplace/Logo';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!isLogin && formData.password !== formData.confirmPassword) {
                toast({
                    title: 'Error',
                    description: 'Passwords do not match.',
                    variant: 'destructive',
                });
                setLoading(false);
                return;
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isLogin) {
                // For demo: accept any login
                localStorage.setItem('user', JSON.stringify({
                    id: '1',
                    name: formData.email.split('@')[0] || 'User',
                    email: formData.email,
                }));
                toast({
                    title: 'Welcome back!',
                    description: 'You have been logged in successfully.',
                });
            } else {
                localStorage.setItem('user', JSON.stringify({
                    id: '1',
                    name: formData.name,
                    email: formData.email,
                }));
                toast({
                    title: 'Account Created!',
                    description: 'Welcome to PrimePickz!',
                });
            }

            setLocation('/account');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        setLoading(true);

        // For demo purposes, simulate social login
        setTimeout(() => {
            localStorage.setItem('user', JSON.stringify({
                id: '1',
                name: `${provider} User`,
                email: `user@${provider.toLowerCase()}.com`,
                provider: provider,
            }));
            toast({
                title: `Signed in with ${provider}!`,
                description: 'Welcome to PrimePickz!',
            });
            setLocation('/account');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center pb-0">
                        <div className="flex justify-center mb-4">
                            <Logo />
                        </div>
                        <h1 className="text-2xl font-bold">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isLogin
                                ? 'Sign in to continue shopping'
                                : 'Join PrimePickz for exclusive deals'
                            }
                        </p>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            <Button
                                variant="outline"
                                className="w-full h-11 gap-3 font-medium"
                                onClick={() => handleSocialLogin('Google')}
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-11 gap-3 font-medium"
                                onClick={() => handleSocialLogin('Facebook')}
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Continue with Facebook
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full h-11 gap-3 font-medium"
                                onClick={() => handleSocialLogin('Instagram')}
                                disabled={loading}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <defs>
                                        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#FFDC80" />
                                            <stop offset="50%" stopColor="#F56040" />
                                            <stop offset="100%" stopColor="#833AB4" />
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                                Continue with Instagram
                            </Button>
                        </div>

                        <div className="relative my-6">
                            <Separator />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
                                or
                            </span>
                        </div>

                        {/* Email/Password Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            className="pl-10"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {!isLogin && (
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-sm text-[#1a2332] hover:underline">
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-[#1a2332] hover:bg-[#0f1419]"
                                disabled={loading}
                            >
                                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="text-[#1a2332] font-medium hover:underline"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
