// src/app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import User from '@/model/user.model';
import ReadingLog from '@/model/ReadingLog.model';
import Book from '@/model/Book.model';
import Review from '@/model/Review.model';
import authOptions from '@/lib/auth';
import { calculateMatchScore, generateReason } from '@/lib/recommendations';

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

    // Configurable limits for recommendations
    const requestedLimit = Number(request.nextUrl.searchParams.get('limit')) || 12;
    const limit = Math.min(Math.max(requestedLimit, 12), 18); // clamp between 12 and 18

    // Get user's read books
    const readLogs = await ReadingLog.find({
      user: user._id,
      shelf: 'read'
    }).populate('book');

    const booksAlreadyRead = readLogs.map(log => (log.book as any)._id.toString());

    // Helper: fetch popular books (excluding some ids)
    async function fetchPopular(count: number, excludeIds: string[] = []) {
      return Book.find({ _id: { $nin: excludeIds } })
        .sort({ totalShelves: -1, averageRating: -1 })
        .limit(count)
        .populate('genre', 'name');
    }

    // Helper: fetch random books (excluding some ids)
    async function fetchRandom(count: number, excludeIds: string[] = []) {
      // Use aggregation for random sampling; fall back to find if not enough results
      const match: any = excludeIds.length > 0 ? { _id: { $nin: excludeIds } } : {};
      const samples = await Book.aggregate([
        { $match: match },
        { $sample: { size: count } }
      ]);
      if (samples.length === 0) return [];
      const ids = samples.map(s => s._id);
      return Book.find({ _id: { $in: ids } }).populate('genre', 'name');
    }

    // If user has very few reads, show a mix of popular + random books as a fallback
    if (readLogs.length < 3) {
      const popularCount = Math.ceil(limit * 0.7); // ~70% popular
      const randomCount = limit - popularCount;

      const popularBooks = await fetchPopular(popularCount, booksAlreadyRead);
      const popularIds = popularBooks.map(b => b._id.toString());

      let randomBooks: any[] = [];
      if (randomCount > 0) {
        randomBooks = await fetchRandom(randomCount, [...booksAlreadyRead, ...popularIds]);
      }

      const merged = [...popularBooks, ...randomBooks].slice(0, limit);

      const recommendations = merged.map(book => {
        const { reason, reasonDetails } = generateReason(book, { fallback: true });
        const matchScore = calculateMatchScore({ averageRating: book.averageRating, totalShelves: book.totalShelves, base: 60 });
        return { book, reason, reasonDetails, matchScore };
      });

      return NextResponse.json({ success: true, data: recommendations });
    }

    // Build favorite genres from read books
    const genreCounts: Record<string, number> = {};
    readLogs.forEach(log => {
      const genre = (log.book as any)?.genre?.toString();
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });

    const favoriteGenreIds = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) // top 3 genres
      .map(([genreId]) => genreId);

    // First, get books in favorite genres that user hasn't read
    const candidates = await Book.find({
      genre: { $in: favoriteGenreIds },
      _id: { $nin: booksAlreadyRead }
    })
      .sort({ averageRating: -1, totalShelves: -1 })
      .limit(limit)
      .populate('genre', 'name');

    const selected: any[] = [];
    const included = new Set<string>();

    // Add candidates (matches by genre)
    for (const book of candidates) {
      if (selected.length >= limit) break;
      const id = book._id.toString();
      if (!included.has(id)) {
        selected.push(book);
        included.add(id);
      }
    }

    // If we still need more, add popular books (not already included/read)
    if (selected.length < limit) {
      const need = limit - selected.length;
      const popular = await fetchPopular(need * 2, [...booksAlreadyRead, ...Array.from(included)]); // fetch a few to avoid duplicates
      for (const book of popular) {
        if (selected.length >= limit) break;
        const id = book._id.toString();
        if (!included.has(id)) {
          selected.push(book);
          included.add(id);
        }
      }
    }

    // If still short, fill with randoms
    if (selected.length < limit) {
      const need = limit - selected.length;
      const randoms = await fetchRandom(need, [...booksAlreadyRead, ...Array.from(included)]);
      for (const book of randoms) {
        if (selected.length >= limit) break;
        const id = book._id.toString();
        if (!included.has(id)) {
          selected.push(book);
          included.add(id);
        }
      }
    }

    // Generate recommendations with richer reasons and a matchScore
    const recommendations = selected.map((book: any) => {
      const genreName = (book.genre as any)?.name || 'this genre';
      const readCountForGenre = genreCounts[book.genre?.toString()] || 0;

      const { reason, reasonDetails } = generateReason(book, { matchedGenre: genreName, readCountForGenre });
      const matchScore = calculateMatchScore({ averageRating: book.averageRating, totalShelves: book.totalShelves, readCountForGenre });

      return {
        book,
        reason,
        reasonDetails,
        matchScore
      };
    });

    return NextResponse.json({ success: true, data: recommendations });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}