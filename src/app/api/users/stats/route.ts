// src/app/api/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import User from '@/model/user.model';
import ReadingLog from '@/model/ReadingLog.model';
import Book from '@/model/Book.model';
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

    // Get reading logs
    const readingLogs = await ReadingLog.find({ user: user._id })
      .populate('book', 'pages genre')
      .populate({
        path: 'book',
        populate: {
          path: 'genre',
          select: 'name'
        }
      });

    // Calculate stats
    const booksRead = readingLogs.filter(log => log.shelf === 'read').length;
    const booksReading = readingLogs.filter(log => log.shelf === 'currently_reading').length;
    const booksToRead = readingLogs.filter(log => log.shelf === 'want_to_read').length;

    // Calculate total pages read
    const totalPagesRead = readingLogs
      .filter(log => log.shelf === 'read')
      .reduce((sum, log) => sum + (log.book?.pages || 0), 0);

    // Get favorite genres
    const genreCounts: Record<string, number> = {};
    readingLogs
      .filter(log => log.shelf === 'read')
      .forEach(log => {
        const genreName = (log.book as any)?.genre?.name;
        if (genreName) {
          genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
        }
      });

    const favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    // Calculate monthly books (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBooks = readingLogs.filter(log => {
      const logDate = new Date(log.updatedAt);
      return log.shelf === 'read' && 
             logDate.getMonth() === currentMonth &&
             logDate.getFullYear() === currentYear;
    }).length;

    // Default reading goal
    const readingGoal = {
      target: 12, // Default 12 books per year
      progress: booksRead,
      percentage: Math.round((booksRead / 12) * 100)
    };

    const stats = {
      totalBooks: readingLogs.length,
      booksRead,
      booksReading,
      booksToRead,
      totalPagesRead,
      averageRating: user.readingStats?.averageRating || 0,
      favoriteGenres,
      currentStreak: user.readingStats?.currentStreak || 0,
      monthlyBooks,
      readingGoal
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}