import { Star, Quote, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@shared/schema";

interface SocialProofProps {
  reviews: Review[];
}

export function SocialProof({ reviews }: SocialProofProps) {
  if (reviews.length === 0) {
    return null;
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const totalCustomers = "10M+";

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)}/5.0
            </span>
            <span>•</span>
            <span>Join {totalCustomers} Happy Customers</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Verified Purchases", value: "100%", icon: CheckCircle },
            { label: "Customer Satisfaction", value: "4.8/5", icon: Star },
            { label: "On-Time Delivery", value: "98%", icon: CheckCircle },
            { label: "Easy Returns", value: "7 Days", icon: CheckCircle },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-card border border-card-border rounded-lg p-4 text-center"
              data-testid={`stat-${index}`}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mx-auto mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review.id}
              className="bg-card border border-card-border rounded-lg p-6 hover-elevate transition-all"
              data-testid={`review-card-${review.id}`}
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-primary/20 mb-3" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-foreground mb-4 line-clamp-4">{review.comment}</p>

              {/* Customer Info */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl font-bold">
                  {review.customerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{review.customerName}</p>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {review.customerLocation} • {review.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
