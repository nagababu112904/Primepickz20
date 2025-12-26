import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminFetch } from './AdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface ReturnRequest {
    id: string;
    orderId: string;
    reason: string;
    description: string | null;
    photos: string[];
    contactEmail: string;
    contactPhone: string | null;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: RotateCcw },
};

export function ReturnsTab() {
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const { toast } = useToast();

    const { data: returns = [], isLoading } = useQuery<ReturnRequest[]>({
        queryKey: ['admin', 'returns'],
        queryFn: async () => {
            const res = await adminFetch('returns');
            if (!res.ok) throw new Error('Failed to fetch returns');
            return res.json();
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
            const res = await adminFetch(`returns&id=${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status, adminNotes }),
            });
            if (!res.ok) throw new Error('Failed to update return');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'returns'] });
            toast({ title: 'Return request updated!' });
            setSelectedReturn(null);
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to update return', variant: 'destructive' });
        },
    });

    const handleUpdate = () => {
        if (!selectedReturn || !newStatus) return;
        updateMutation.mutate({
            id: selectedReturn.id,
            status: newStatus,
            adminNotes,
        });
    };

    const openEditDialog = (returnReq: ReturnRequest) => {
        setSelectedReturn(returnReq);
        setNewStatus(returnReq.status);
        setAdminNotes(returnReq.adminNotes || '');
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const count = returns.filter(r => r.status === status).length;
                    const Icon = config.icon;
                    return (
                        <Card key={status}>
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{config.label}</p>
                                    <p className="text-2xl font-bold">{count}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Returns List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Return Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {returns.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No return requests yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {returns.map((returnReq) => {
                                const statusConfig = STATUS_CONFIG[returnReq.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                                return (
                                    <div
                                        key={returnReq.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={statusConfig.color}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        Order: {returnReq.orderId}
                                                    </span>
                                                </div>
                                                <p className="font-medium mb-1">{returnReq.reason}</p>
                                                {returnReq.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{returnReq.description}</p>
                                                )}
                                                <div className="text-sm text-gray-500">
                                                    <span>Contact: {returnReq.contactEmail}</span>
                                                    {returnReq.contactPhone && <span> | {returnReq.contactPhone}</span>}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Submitted: {new Date(returnReq.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditDialog(returnReq)}
                                            >
                                                Manage
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!selectedReturn} onOpenChange={() => setSelectedReturn(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Return Request</DialogTitle>
                    </DialogHeader>
                    {selectedReturn && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Order ID</p>
                                <p className="font-medium">{selectedReturn.orderId}</p>
                                <p className="text-sm text-gray-500 mt-2">Reason</p>
                                <p className="font-medium">{selectedReturn.reason}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this return..."
                                    rows={3}
                                />
                            </div>

                            <Button
                                onClick={handleUpdate}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? 'Updating...' : 'Update Status'}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
