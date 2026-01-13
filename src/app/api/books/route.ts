// src/app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import Genre from '@/model/Genre.model';

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (genre) {
      const genreDoc = await Genre.findOne({ name: genre });
      if (genreDoc) {
        query.genre = genreDoc._id;
      }
    }

    // Execute query
    const [books, total] = await Promise.all([
      Book.find(query)
        .populate('genre', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Book.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: books,
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