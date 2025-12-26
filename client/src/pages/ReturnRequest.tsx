import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import { Package, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'wouter';

const RETURN_REASONS = [
    'Defective or damaged item',
    'Wrong item received',
    'Item not as described',
    'Changed my mind',
    'Better price available',
    'No longer needed',
    'Other'
];

export default function ReturnRequest() {
    const [orderNumber, setOrderNumber] = useState('');
    const [orderId, setOrderId] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { toast } = useToast();

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/admin?action=returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to submit return request');
            }
            return res.json();
        },
        onSuccess: () => {
            setIsSubmitted(true);
            toast({ title: 'Return request submitted!', description: 'We will review your request within 24-48 hours.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderNumber || !reason || !contactEmail) {
            toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
            return;
        }

        submitMutation.mutate({
            orderId: orderNumber, // Using order number as ID for simplicity
            reason,
            description,
            contactEmail,
            contactPhone,
            photos: [],
        });
    };

    if (isSubmitted) {
        return (
            <>
                <header className="bg-white border-b px-6 py-4">
                    <Link href="/"><div className="flex items-center gap-2 text-xl font-bold text-[#1a365d]"><Home className="w-5 h-5" /> Prime Pickz</div></Link>
                </header>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-lg mx-auto px-4">
                        <Card className="text-center">
                            <CardContent className="pt-12 pb-8">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
                                <p className="text-gray-600 mb-6">
                                    We've received your return request. Our team will review it and get back to you within 24-48 hours.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    Order Number: <strong>{orderNumber}</strong>
                                </p>
                                <Link href="/">
                                    <Button className="bg-orange-500 hover:bg-orange-600">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <header className="bg-white border-b px-6 py-4">
                <Link href="/"><div className="flex items-center gap-2 text-xl font-bold text-[#1a365d]"><Home className="w-5 h-5" /> Prime Pickz</div></Link>
            </header>
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Package className="w-8 h-8 text-orange-500" />
                                <div>
                                    <CardTitle className="text-2xl">Request a Return</CardTitle>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Fill out the form below to initiate a return
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Order Number */}
                                <div>
                                    <Label htmlFor="orderNumber">Order Number *</Label>
                                    <Input
                                        id="orderNumber"
                                        value={orderNumber}
                                        onChange={(e) => setOrderNumber(e.target.value)}
                                        placeholder="e.g., PP-1234567890-ABC123"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can find this in your order confirmation email
                                    </p>
                                </div>

                                {/* Reason */}
                                <div>
                                    <Label htmlFor="reason">Reason for Return *</Label>
                                    <Select value={reason} onValueChange={setReason}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RETURN_REASONS.map((r) => (
                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label htmlFor="description">Additional Details</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Please provide any additional details about your return request..."
                                        rows={4}
                                    />
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Contact Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number (Optional)</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                </div>

                                {/* Policy Notice */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">Return Policy</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Returns must be requested within 7 days of delivery</li>
                                        <li>• Items must be unused and in original packaging</li>
                                        <li>• Refunds will be processed within 5-7 business days</li>
                                    </ul>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                    disabled={submitMutation.isPending}
                                >
                                    {submitMutation.isPending ? 'Submitting...' : 'Submit Return Request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </>
    );
}
