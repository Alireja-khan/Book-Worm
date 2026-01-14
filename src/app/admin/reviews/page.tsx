'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Star, Check, X, Eye, Edit, Trash2, ChevronLeft, ChevronRight, BookOpen, User } from 'lucide-react';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  
  const reviewsPerPage = 10;

  useEffect(() => {
    fetchReviews();
  }, [search, filterStatus, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        status: filterStatus === 'all' ? '' : filterStatus,
        page: currentPage.toString(),
        limit: reviewsPerPage.toString()
      }).toString();
      
      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data || []);
        setTotalReviews(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (reviewId: string, status: 'approved' | 'rejected', reviewContent: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Review ${status} successfully!`);
        setDialogOpen(false);
        fetchReviews();
      } else {
        toast.error(result.error || `Failed to ${status} review`);
      }
    } catch (error) {
      console.error(`Error ${status} review:`, error);
      toast.error(`Failed to ${status} review. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId: string, reviewContent: string) => {
    if (!confirm(`Are you sure you want to delete this review: "${reviewContent.substring(0, 50)}..."? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Review deleted successfully!');
        fetchReviews();
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderate Reviews</h1>
        <p className="text-muted-foreground">
          Review and moderate user-submitted book reviews.
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reviews by book title or user name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reviews ({totalReviews})</CardTitle>
          <CardDescription>
            Moderate user reviews and manage their approval status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No reviews found</h3>
              <p className="mt-2 text-muted-foreground">
                {search || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No reviews have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-8 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={review.book.coverImage}
                              alt={review.book.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div>
                            <div className="font-medium line-clamp-1">{review.book.title}</div>
                            <div className="text-sm text-muted-foreground">{review.book.author}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={review.user.image} alt={review.user.name} />
                            <AvatarFallback>
                              {review.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{review.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium ml-1">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">{review.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(review.status)}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewReviewDetails(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {review.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-600 hover:bg-green-50"
                                onClick={() => handleApproveReject(review._id, 'approved', review.content)}
                                disabled={actionLoading}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleApproveReject(review._id, 'rejected', review.content)}
                                disabled={actionLoading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(review._id, review.content)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * reviewsPerPage + 1}-{Math.min(currentPage * reviewsPerPage, totalReviews)} of {totalReviews} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Review by {selectedReview?.user.name} for &quot;{selectedReview?.book.title}&quot;
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative h-20 w-14 rounded overflow-hidden">
                    <img
                      src={selectedReview.book.coverImage}
                      alt={selectedReview.book.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedReview.book.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReview.book.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm font-medium ml-2">{selectedReview.rating}/5</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Review Content:</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{selectedReview.content}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={getStatusBadgeVariant(selectedReview.status)}>
                    {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Submitted on {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            {selectedReview && selectedReview.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleApproveReject(selectedReview._id, 'rejected', selectedReview.content);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Rejecting...' : 'Reject' }
                </Button>
                <Button
                  className="text-green-600 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApproveReject(selectedReview._id, 'approved', selectedReview.content);
                  }}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Approve' }
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
