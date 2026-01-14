// src/app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import Genre from '@/model/Genre.model';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import uploadOnCloudinary from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const genreIds = searchParams.get('genres')?.split(',') || [];
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxRating = parseFloat(searchParams.get('maxRating') || '5');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by genres (multi-select)
    if (genreIds.length > 0 && genreIds[0] !== '') {
      const validGenreIds = genreIds.filter(id => 
        mongoose.Types.ObjectId.isValid(id)
      ).map(id => new mongoose.Types.ObjectId(id));
      
      if (validGenreIds.length > 0) {
        query.genre = { $in: validGenreIds };
      }
    }
    
    // Filter by rating range
    query.averageRating = { $gte: minRating, $lte: maxRating };

    // Build sort object
    const sort: any = {};
    switch (sortBy) {
      case 'rating':
        sort.averageRating = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'popularity':
        sort.totalShelves = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'title':
        sort.title = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'author':
        sort.author = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('genre', 'name')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Book.countDocuments(query),
    ]);

    // Get all genres for filter dropdown
    const allGenres = await Genre.find().select('name _id').sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: books,
      filters: {
        genres: allGenres
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, you'd check if user is admin
    // For now, allow any authenticated user to add books for testing

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
    if (!title || !author || !description || !genreId || !pages || !publicationYear || !coverImageFile) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    await connectDb();

    // Check if genre exists
    const genre = await Genre.findById(genreId);
    if (!genre) {
      return NextResponse.json(
        { success: false, error: 'Invalid genre' },
        { status: 400 }
      );
    }

    // Upload cover image to Cloudinary
    let coverImageUrl = '';
    if (coverImageFile && coverImageFile.size > 0) {
      const imageUrl = await uploadOnCloudinary(coverImageFile);
      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: 'Failed to upload cover image' },
          { status: 500 }
        );
      }
      coverImageUrl = imageUrl;
    }

    // Create book
    const book = await Book.create({
      title,
      author,
      description,
      genre: genreId,
      pages,
      publicationYear,
      publisher: publisher || undefined,
      isbn: isbn || undefined,
      coverImage: coverImageUrl,
      averageRating: 0,
      totalReviews: 0,
      totalShelves: 0
    });

    // Update genre book count
    await Genre.findByIdAndUpdate(genreId, {
      $inc: { bookCount: 1 }
    });

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding book:', error);
    
    // Handle duplicate ISBN error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, error: 'A book with this ISBN already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add book' },
      { status: 500 }
    );
  }
}