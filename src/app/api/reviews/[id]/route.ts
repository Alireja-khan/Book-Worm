import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import Review from '@/model/Review.model';
import User from '@/model/user.model';
import Book from '@/model/Book.model';
import authOptions from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    
    const { id } = await params;
    
    const review = await Review.findById(id)
      .populate('user', 'name image')
      .populate('book', 'title author coverImage');
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: review
    });
    
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const data = await request.json();
    const { status, content, rating } = data;
    
    // Build update object
    const updateData: any = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      updateData.status = status;
    }
    
    if (content !== undefined) {
      if (content.length < 10 || content.length > 2000) {
        return NextResponse.json(
          { success: false, error: 'Review must be between 10 and 2000 characters' },
          { status: 400 }
        );
      }
      updateData.content = content;
    }
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: 'Rating must be between 1 and 5' },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }
    
    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'name image')
    .populate('book', 'title author coverImage');
    
    if (!updatedReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    // Update book's average rating if rating or status changed
    if (updateData.rating !== undefined || updateData.status !== undefined) {
      const reviewsAggregate = await Review.aggregate([
        { $match: { book: updatedReview.book._id, status: 'approved' } },
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
      
      await Book.findByIdAndUpdate(updatedReview.book._id, {
        averageRating: parseFloat(stats.averageRating.toFixed(1)) || 0,
        totalReviews: stats.totalReviews || 0
      });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid review data provided' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDb();
    
    const { id } = await params;
    
    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id role');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find review
    const review = await Review.findById(id);
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
    await Review.findByIdAndDelete(id);
    
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