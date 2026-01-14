// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import Review, { ReviewStatus } from '@/model/Review.model';
import Book from '@/model/Book.model';
import User from '@/model/User.model';
import ReadingLog from '@/model/ReadingLog.model';
import Activity from '@/model/Activity.model';
import authOptions from '@/lib/auth';
import mongoose from 'mongoose';

// GET: Get reviews (all, by book, or by user)
export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as ReviewStatus;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      query.book = new mongoose.Types.ObjectId(bookId);
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    // For regular users, only show approved reviews
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'admin';
    
    if (!isAdmin) {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }

    // Fetch reviews with user and book details
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name image')
        .populate('book', 'title author coverImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query)
    ]);

    // Calculate average rating for the book if bookId is provided
    let averageRating = 0;
    if (bookId) {
      const aggregate = await Review.aggregate([
        { $match: { book: new mongoose.Types.ObjectId(bookId), status: 'approved' } },
        { $group: { _id: '$book', avgRating: { $avg: '$rating' } } }
      ]);
      
      if (aggregate.length > 0) {
        averageRating = parseFloat(aggregate[0].avgRating.toFixed(1));
      }
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      averageRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST: Submit a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, rating, content } = body;

    // Validate required fields
    if (!bookId || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'Book ID, rating, and content are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 10 || content.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Review must be between 10 and 2000 characters' },
        { status: 400 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id name');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check if user has read the book (optional requirement)
    const hasRead = await ReadingLog.findOne({
      user: user._id,
      book: bookId,
      shelf: 'read'
    });

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      user: user._id,
      book: bookId
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this book' },
        { status: 400 }
      );
    }

    // Determine review status (pending for regular users, approved for admins)
    const isAdmin = session.user.role === 'admin';
    const status: ReviewStatus = isAdmin ? 'approved' : 'pending';

    // Create review
    const review = await Review.create({
      user: user._id,
      book: bookId,
      rating,
      content,
      status
    });

    // Update book's review count and average rating
    const reviewsAggregate = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId), status: 'approved' } },
      {
        $group: {
          _id: '$book',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = reviewsAggregate[0] || {
      averageRating: 0,
      totalReviews: 0
    };

    await Book.findByIdAndUpdate(bookId, {
      averageRating: parseFloat(stats.averageRating.toFixed(1)) || 0,
      totalReviews: stats.totalReviews || 0
    });

    // Create activity log
    await Activity.create({
      user: user._id,
      activityType: 'wrote_review',
      targetBook: bookId,
      targetReview: review._id,
      metadata: { rating }
    });

    // If admin, also create "rated_book" activity
    if (isAdmin) {
      await Activity.create({
        user: user._id,
        activityType: 'rated_book',
        targetBook: bookId,
        metadata: { rating }
      });
    }

    // Populate review with user info for response
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name image')
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedReview,
      message: isAdmin 
        ? 'Review published successfully' 
        : 'Review submitted for approval'
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// PATCH: Update review status (approve/reject) - Admin only
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email }).select('role');
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewId, status } = body;

    if (!reviewId || !status) {
      return NextResponse.json(
        { success: false, error: 'Review ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    await connectDb();

    // Find and update review
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name image');

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Update book's average rating if review was approved/rejected
    const reviewsAggregate = await Review.aggregate([
      { $match: { book: review.book, status: 'approved' } },
      {
        $group: {
          _id: '$book',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = reviewsAggregate[0] || {
      averageRating: 0,
      totalReviews: 0
    };

    await Book.findByIdAndUpdate(review.book, {
      averageRating: parseFloat(stats.averageRating.toFixed(1)) || 0,
      totalReviews: stats.totalReviews || 0
    });

    // Create activity for approval/rejection
    await Activity.create({
      user: user._id,
      activityType: status === 'approved' ? 'rated_book' : 'wrote_review',
      targetBook: review.book,
      targetReview: review._id,
      metadata: { rating: review.rating, action: status }
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: `Review ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id role');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check permission (user can delete their own review, admin can delete any)
    const isOwner = review.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this review' },
        { status: 403 }
      );
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Update book's average rating
    const reviewsAggregate = await Review.aggregate([
      { $match: { book: review.book, status: 'approved' } },
      {
        $group: {
          _id: '$book',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const stats = reviewsAggregate[0] || {
      averageRating: 0,
      totalReviews: 0
    };

    await Book.findByIdAndUpdate(review.book, {
      averageRating: parseFloat(stats.averageRating.toFixed(1)) || 0,
      totalReviews: stats.totalReviews || 0
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}