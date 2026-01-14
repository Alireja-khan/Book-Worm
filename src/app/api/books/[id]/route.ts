// src/app/api/books/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import Review from '@/model/Review.model';
import Genre from '@/model/Genre.model';
import ReadingLog from '@/model/ReadingLog.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import uploadOnCloudinary from '@/lib/cloudinary';

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

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }
    
    await connectDb();
    
    // Find the book to get the genre ID before deletion
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }
    
    // Delete associated reviews
    await Review.deleteMany({ book: id });
    
    // Delete associated reading logs
    await ReadingLog.deleteMany({ book: id });
    
    // Update genre book count
    await Genre.findByIdAndUpdate(book.genre, {
      $inc: { bookCount: -1 }
    });
    
    // Delete the book
    const deletedBook = await Book.findByIdAndDelete(id);
    
    if (!deletedBook) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete book' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}

// PUT method for updating book
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }
    
    await connectDb();
    
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const genreId = formData.get('genre') as string;
    const pages = parseInt(formData.get('pages') as string);
    const publicationYear = parseInt(formData.get('publicationYear') as string);
    const publisher = formData.get('publisher') as string;
    const isbn = formData.get('isbn') as string;
    const coverImageFile = formData.get('coverImage') as File;
    
    // Validate required fields
    if (!title || !author || !description || !genreId || !pages || !publicationYear) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }
    
    // Check if genre exists
    const genre = await Genre.findById(genreId);
    if (!genre) {
      return NextResponse.json(
        { success: false, error: 'Invalid genre' },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData: any = {
      title,
      author,
      description,
      genre: genreId,
      pages,
      publicationYear,
      publisher: publisher || undefined,
      isbn: isbn || undefined,
    };
    
    // Handle cover image upload if provided
    if (coverImageFile && coverImageFile.size > 0) {
      const coverImageUrl = await uploadOnCloudinary(coverImageFile);
      if (!coverImageUrl) {
        return NextResponse.json(
          { success: false, error: 'Failed to upload cover image' },
          { status: 500 }
        );
      }
      updateData.coverImage = coverImageUrl;
    }
    
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('genre', 'name');
    
    if (!updatedBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating book:', error);
    
    // Handle duplicate ISBN error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'A book with this ISBN already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update book' },
      { status: 500 }
    );
  }
}