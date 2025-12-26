import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ThumbsUp, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
    id: string;
    productId: string;
    customerName: string;
    customerLocation?: string;
    rating: number;
    title?: string;
    comment: string;
    photos?: string[];
    date: string;
    verified: boolean;
}

interface ReviewsSectionProps {
    productId: string;
    productRating?: string;
    reviewCount?: number;
}

// Star Rating Component
function StarRating({ rating, size = 'md', interactive = false, onChange }: {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
}) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => onChange?.(star)}
                    className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                >
                    <Star
                        className={`${sizeClasses[size]} ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

// Rating Summary Bar
function RatingBar({ stars, percentage, count }: { stars: number; percentage: number; count: number }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-8 text-gray-600">{stars} star</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-10 text-right text-gray-500">{count}</span>
        </div>
    );
}

// Review Card
function ReviewCard({ review }: { review: Review }) {
    return (
        <div className="border-b border-gray-200 py-6 last:border-0">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} size="sm" />
                        {review.verified && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Verified Purchase
                            </span>
                        )}
                    </div>
                    <h4 className="font-semibold text-gray-900">{review.title || 'Great product!'}</h4>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
            </div>

            <p className="text-gray-700 mb-3">{review.comment}</p>

            {/* Photo Thumbnails */}
            {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-3">
                    {review.photos.map((photo, idx) => (
                        <img
                            key={idx}
                            src={photo}
                            alt={`Review photo ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border"
                        />
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    By <span className="font-medium">{review.customerName}</span>
                    {review.customerLocation && ` from ${review.customerLocation}`}
                </p>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                </button>
            </div>
        </div>
    );
}

// Review Form Modal
function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const { toast } = useToast();

    const submitMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to submit review');
            return res.json();
        },
        onSuccess: () => {
            toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            onSuccess();
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating || !comment || !customerName) {
            toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
            return;
        }
        submitMutation.mutate({ productId, rating, title, comment, customerName, photos });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Your Rating *</label>
                <StarRating rating={rating} size="lg" interactive onChange={setRating} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John D."
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Review Title</label>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Great quality product!"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Your Review *</label>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    required
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={submitMutation.isPending}
            >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
        </form>
    );
}

// Main Reviews Section
export function ReviewsSection({ productId, productRating, reviewCount }: ReviewsSectionProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { data: reviews = [], isLoading } = useQuery<Review[]>({
        queryKey: ['reviews', productId],
        queryFn: async () => {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (!res.ok) throw new Error('Failed to fetch reviews');
            return res.json();
        },
    });

    // Calculate rating distribution
    const ratingCounts = [5, 4, 3, 2, 1].map(stars =>
        reviews.filter(r => r.rating === stars).length
    );
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : productRating || '0';

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            Write a Review
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                        </DialogHeader>
                        <ReviewForm productId={productId} onSuccess={() => setIsFormOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Rating Summary */}
                <Card className="md:col-span-1">
                    <CardContent className="p-6">
                        <div className="text-center mb-4">
                            <div className="text-5xl font-bold text-gray-900">{avgRating}</div>
                            <StarRating rating={parseFloat(avgRating)} />
                            <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
                        </div>
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars, idx) => (
                                <RatingBar
                                    key={stars}
                                    stars={stars}
                                    count={ratingCounts[idx]}
                                    percentage={totalReviews > 0 ? (ratingCounts[idx] / totalReviews) * 100 : 0}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="md:col-span-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                                <p className="text-gray-500 mb-4">Be the first to review this product!</p>
                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    Write a Review
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div>
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export { StarRating };
