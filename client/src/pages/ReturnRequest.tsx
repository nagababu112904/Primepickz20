import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/marketplace/Header';
import { Footer } from '@/components/marketplace/Footer';
import { BottomNav } from '@/components/marketplace/BottomNav';
import { useToast } from '@/hooks/use-toast';

const RETURN_REASONS = [
    'Wrong item received',
    'Item damaged',
    'Item not as described',
    'No longer needed',
    'Found better price',
    'Other',
];

export default function ReturnRequest() {
    const { toast } = useToast();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        orderNumber: '',
        email: '',
        reason: '',
        description: '',
        phone: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/admin?action=returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to submit return request. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                variant: 'destructive',
            });
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
                <Header />
                <main className="flex-1 max-w-2xl mx-auto w-full px-4 lg:px-8 py-12">
                    <Card className="text-center">
                        <CardContent className="p-8 md:p-12">
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
                            <p className="text-gray-600 mb-6">
                                We've received your return request. You'll receive an email with further instructions within 24-48 hours.
                            </p>
                            <Link href="/">
                                <Button className="bg-[#1a2332] hover:bg-[#0f1419]">
                                    Back to Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8f9fa] via-[#f1f3f5] to-[#e9ecef]">
            <Header />

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 lg:px-8 py-8">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-[#1a2332]">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Submit Return Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="orderNumber">Order Number *</Label>
                                <Input
                                    id="orderNumber"
                                    value={formData.orderNumber}
                                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                                    placeholder="e.g., ORD-123456"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason for Return *</Label>
                                <Select
                                    value={formData.reason}
                                    onValueChange={(value) => setFormData({ ...formData, reason: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RETURN_REASONS.map((reason) => (
                                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="description">Additional Details</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Please provide any additional information about your return..."
                                    rows={4}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#1a2332] hover:bg-[#0f1419]">
                                Submit Return Request
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
