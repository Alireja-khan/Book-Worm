// src/app/api/books/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import Review from '@/model/Review.model';
import mongoose from 'mongoose';

interface Params {
  params: {
    id: string;
  };
} 

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    console.log('Fetching book with ID:', id);
    
    await connectDb();
    
    console.log('Validating ObjectId for:', id); // Add this
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId:', id); // Add this
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Fetch book with genre populated and approved reviews
    const book = await Book.findById(id)
      .populate('genre', 'name description slug')
      .populate({
        path: 'reviews',
        model: Review,
        match: { status: 'approved' },
        options: { 
          sort: { createdAt: -1 },
          limit: 10 
        },
        populate: {
          path: 'user',
          select: 'name image'
        }
      })
      .lean();

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Calculate average rating and total reviews
    const reviewsAggregate = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(id), status: 'approved' } },
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

    // Update book with calculated fields
    const updatedBook = {
      ...book,
      averageRating: parseFloat(stats.averageRating.toFixed(1)) || 0,
      totalReviews: stats.totalReviews || 0
    };

    return NextResponse.json({
      success: true,
      data: updatedBook
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}