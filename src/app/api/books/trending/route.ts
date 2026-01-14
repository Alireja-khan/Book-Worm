import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import Review from '@/model/Review.model';

export async function GET(request: NextRequest) {
  try {
    await connectDb();

    // Get trending books (highly rated + many reviews + recently active)
    const trendingBooks = await Book.aggregate([
      // Get books with reviews
      {
        $match: {
          totalReviews: { $gt: 0 },
          averageRating: { $gte: 3.0 }
        }
      },
      // Lookup recent reviews (last 30 days)
      {
        $lookup: {
          from: 'reviews',
          let: { bookId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$book', '$$bookId'] },
                    { $eq: ['$status', 'approved'] },
                    { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }
                  ]
                }
              }
            },
            { $count: 'recentReviewCount' }
          ],
          as: 'recentReviews'
        }
      },
      // Add fields for sorting
      {
        $addFields: {
          recentReviewCount: { $arrayElemAt: ['$recentReviews.recentReviewCount', 0] } || 0,
          popularityScore: {
            $add: [
              { $multiply: ['$averageRating', 20] }, // Rating weight (0-100)
              { $multiply: [{ $divide: ['$totalReviews', 10] }, 5] }, // Review count weight
              { $multiply: ['$recentReviewCount', 10] } // Recent activity weight
            ]
          }
        }
      },
      // Sort by popularity score
      { $sort: { popularityScore: -1 } },
      { $limit: 10 },
      // Lookup genre
      {
        $lookup: {
          from: 'genres',
          localField: 'genre',
          foreignField: '_id',
          as: 'genre'
        }
      },
      { $unwind: { path: '$genre', preserveNullAndEmptyArrays: true } },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          title: 1,
          author: 1,
          coverImage: 1,
          averageRating: 1,
          totalReviews: 1,
          totalShelves: 1,
          pages: 1,
          'genre.name': 1,
          popularityScore: 1
        }
      }
    ]);

    // Format response
    const formattedBooks = trendingBooks.map(book => ({
      _id: book._id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      averageRating: book.averageRating,
      totalReviews: book.totalReviews,
      totalShelves: book.totalShelves,
      genre: {
        name: book.genre?.name || 'Unknown'
      },
      pages: book.pages
    }));

    return NextResponse.json({
      success: true,
      data: formattedBooks
    });

  } catch (error) {
    console.error('Error fetching trending books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending books' },
      { status: 500 }
    );
  }
}