// src/app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import User from '@/model/user.model';
import ReadingLog from '@/model/ReadingLog.model';
import Book from '@/model/Book.model';
import Review from '@/model/Review.model';
import authOptions from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's read books
    const readLogs = await ReadingLog.find({
      user: user._id,
      shelf: 'read'
    }).populate('book');

    // If user has less than 3 books read, show popular books
    if (readLogs.length < 3) {
      const popularBooks = await Book.find({})
        .sort({ totalShelves: -1, averageRating: -1 })
        .limit(6)
        .populate('genre', 'name');

      const recommendations = popularBooks.map(book => ({
        book,
        reason: "Popular among all readers",
        matchScore: Math.floor(Math.random() * 30) + 60 // 60-90% match
      }));

      return NextResponse.json({
        success: true,
        data: recommendations
      });
    }

    // Get user's favorite genres from read books
    const genreCounts: Record<string, number> = {};
    readLogs.forEach(log => {
      const genre = (log.book as any)?.genre?.toString();
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });

    const favoriteGenreIds = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([genreId]) => genreId);

    // Get books in favorite genres that user hasn't read
    const booksAlreadyRead = readLogs.map(log => (log.book as any)._id.toString());

    const recommendedBooks = await Book.find({
      genre: { $in: favoriteGenreIds },
      _id: { $nin: booksAlreadyRead }
    })
      .sort({ averageRating: -1, totalShelves: -1 })
      .limit(6)
      .populate('genre', 'name');

    // Generate recommendations with reasons
    const recommendations = recommendedBooks.map(book => {
      const genreName = (book.genre as any)?.name || 'this genre';
      const readCount = genreCounts[book.genre.toString()] || 0;
      
      const reasons = [
        `Matches your preference for ${genreName} (${readCount} books read)`,
        `Highly rated by the community (${book.averageRating.toFixed(1)} stars)`,
        `Popular among readers (${book.totalShelves} readers)`,
        `Similar to books you've enjoyed`
      ];

      // Calculate match score (70-95%)
      const baseScore = 70;
      const ratingBonus = Math.min(book.averageRating * 3, 15); // Up to 15%
      const popularityBonus = Math.min(book.totalShelves / 100, 10); // Up to 10%
      const matchScore = Math.min(baseScore + ratingBonus + popularityBonus, 95);

      return {
        book,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        matchScore: Math.floor(matchScore)
      };
    });

    return NextResponse.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}