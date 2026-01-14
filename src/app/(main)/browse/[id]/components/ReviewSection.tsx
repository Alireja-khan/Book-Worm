// src/app/(main)/browse/[id]/components/ReviewSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Star, 
  User, 
  Calendar, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Review {
  _id: string;
  rating: number;
  content: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  user: {
    name: string;
    image?: string;
  };
}

interface ReviewSectionProps {
  bookId: string;
  bookTitle: string;
  bookReviews: Review[];
  userHasRead: boolean;
  onReviewSubmit?: () => void;
}

export default function ReviewSection({
  bookId,
  bookTitle,
  bookReviews: initialReviews,
  userHasRead,
  onReviewSubmit
}: ReviewSectionProps) {
  const { data: session } = useSession();
  
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Check if user has already reviewed this book
  useEffect(() => {
    if (session?.user?.email) {
      const userReview = reviews.find(
        review => review.user.name === session.user?.name
      );
      setUserReview(userReview || null);
    }
  }, [reviews, session]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!userHasRead) {
      toast.error('You need to read this book before reviewing');
      return;
    }

    if (content.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          rating,
          content
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      
      // Add new review to the list
      if (data.data) {
        setReviews(prev => [data.data, ...prev]);
        setUserReview(data.data);
      }
      
      // Reset form
      setContent('');
      setRating(5);
      setShowForm(false);
      
      // Refresh parent if needed
      if (onReviewSubmit) {
        onReviewSubmit();
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreReviews = async () => {
    try {
      setLoading(true);
      const page = Math.ceil(reviews.length / 10) + 1;
      
      const response = await fetch(`/api/reviews?bookId=${bookId}&page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        setReviews(prev => [...prev, ...data.data]);
      }
    } catch (error) {
      console.error('Error loading more reviews:', error);
      toast.error('Failed to load more reviews');
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('Review deleted');
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      setUserReview(null);
      
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete review');
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Reviews</h2>
          <span className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
            {reviews.length}
          </span>
        </div>
        
        {/* Write Review Button */}
        {session && userHasRead && !userReview && (
          <Button onClick={() => setShowForm(!showForm)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        )}
      </div>

      {/* User's Existing Review */}
      {userReview && (
        <div className="p-6 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userReview.user.image} />
                <AvatarFallback>
                  {userReview.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Your Review</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {userReview.status === 'pending' && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Pending Approval
              </div>
            )}
            
            {userReview.status === 'approved' && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Published
              </div>
            )}
          </div>
          
          <div className="mb-4">
            {renderStars(userReview.rating)}
          </div>
          
          <p className="text-muted-foreground whitespace-pre-line">
            {userReview.content}
          </p>
          
          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteReview(userReview._id)}
              className="text-destructive hover:text-destructive"
            >
              Delete Review
            </Button>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && !userReview && (
        <form onSubmit={handleSubmitReview} className="p-6 bg-card rounded-xl border border-border space-y-4">
          <h3 className="font-semibold text-lg">Write Your Review</h3>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Your Rating:</span>
              <span className="font-semibold">{rating}/5</span>
            </div>
            {renderStars(rating, true)}
          </div>
          
          <div>
            <Textarea
              placeholder={`What did you think of "${bookTitle}"? Share your thoughts...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
              required
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {content.length}/2000 characters
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setContent('');
                setRating(5);
              }}
            >
              Cancel
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Your review will be visible to others after approval.
          </p>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews
            .filter(review => review.status === 'approved' || review._id === userReview?._id)
            .map((review) => (
              <div key={review._id} className="p-6 bg-card rounded-xl border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.user.image} />
                      <AvatarFallback>
                        {review.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{review.user.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 font-semibold">{review.rating}.0</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground whitespace-pre-line">
                  {review.content}
                </p>
                
                {/* Delete button for user's own review */}
                {session?.user?.name === review.user.name && (
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReview(review._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          
          {/* Load More Button */}
          {reviews.length >= 10 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={loadMoreReviews}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* No Reviews State */
        <div className="text-center py-12 border border-dashed rounded-xl">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your thoughts about this book!
          </p>
          
          {session && userHasRead && !userReview && (
            <Button onClick={() => setShowForm(true)}>
              Write the First Review
            </Button>
          )}
          
          {!session && (
            <Button asChild>
              <a href="/login">Login to Review</a>
            </Button>
          )}
          
          {session && !userHasRead && (
            <div className="text-sm text-muted-foreground">
              Read this book first to write a review
            </div>
          )}
        </div>
      )}
    </div>
  );
}