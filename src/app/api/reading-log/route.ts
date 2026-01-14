// src/app/api/reading-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import ReadingLog, { ShelfType, ReadingStatus } from '@/model/ReadingLog.model';
import Book from '@/model/Book.model';
import User from '@/model/user.model';
import Activity from '@/model/Activity.model';
import authOptions from '@/lib/auth';
import mongoose from 'mongoose';

// GET: Get reading logs (all for user or specific book)
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
    
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const shelf = searchParams.get('shelf') as ShelfType;

    // Build query
    const query: any = {};
    
    // Get user ID
    const user = await User.findOne({ email: session.user.email }).select('_id');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    query.user = user._id;

    // Filter by book if provided
    if (bookId && mongoose.Types.ObjectId.isValid(bookId)) {
      query.book = new mongoose.Types.ObjectId(bookId);
    }

    // Filter by shelf if provided
    if (shelf && ['want_to_read', 'currently_reading', 'read'].includes(shelf)) {
      query.shelf = shelf;
    }

    // Fetch reading logs with book details
    const readingLogs = await ReadingLog.find(query)
      .populate({
        path: 'book',
        select: 'title author coverImage pages genre',
        populate: {
          path: 'genre',
          select: 'name'
        }
      })
      .sort({ updatedAt: -1 });

    // For single book query, return the first log or null
    if (bookId) {
      return NextResponse.json({
        success: true,
        data: readingLogs[0] || null
      });
    }

    return NextResponse.json({
      success: true,
      data: readingLogs
    });

  } catch (error) {
    console.error('Error fetching reading logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reading logs' },
      { status: 500 }
    );
  }
}

// POST: Add/update book in shelf
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
    const { bookId, shelf, currentPage } = body;

    // Validate required fields
    if (!bookId || !shelf) {
      return NextResponse.json(
        { success: false, error: 'Book ID and shelf are required' },
        { status: 400 }
      );
    }

    // Validate shelf type
    const validShelves: ShelfType[] = ['want_to_read', 'currently_reading', 'read'];
    if (!validShelves.includes(shelf)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shelf type' },
        { status: 400 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id');
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

    // Determine status based on shelf
    let status: ReadingStatus = 'not_started';
    let progressPercentage = 0;
    let startDate: Date | undefined;
    let finishDate: Date | undefined;

    if (shelf === 'currently_reading') {
      status = 'reading';
      startDate = new Date();
      // Calculate progress if currentPage is provided
      if (currentPage && book.pages) {
        progressPercentage = Math.round((currentPage / book.pages) * 100);
      }
    } else if (shelf === 'read') {
      status = 'finished';
      progressPercentage = 100;
      finishDate = new Date();
      if (!startDate) {
        startDate = new Date(); // Default start date if not set
      }
    }

    // Find existing reading log or create new
    const existingLog = await ReadingLog.findOne({
      user: user._id,
      book: bookId
    });

    let readingLog;
    const isNew = !existingLog;

    if (existingLog) {
      // Update existing log
      readingLog = await ReadingLog.findByIdAndUpdate(
        existingLog._id,
        {
          shelf,
          status,
          currentPage,
          progressPercentage,
          startDate: startDate || existingLog.startDate,
          finishDate,
          $inc: { __v: 1 }
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new log
      readingLog = await ReadingLog.create({
        user: user._id,
        book: bookId,
        shelf,
        status,
        currentPage,
        progressPercentage,
        startDate,
        finishDate
      });

      // Update book's totalShelves count
      await Book.findByIdAndUpdate(bookId, {
        $inc: { totalShelves: 1 }
      });
    }

    // Create activity log
    await Activity.create({
      user: user._id,
      activityType: 'added_to_shelf',
      targetBook: bookId,
      metadata: {
        shelf,
        ...(currentPage && { pagesRead: currentPage })
      }
    });

    // Update user's reading stats if moved to "read"
    if (shelf === 'read' && (!existingLog || existingLog.shelf !== 'read')) {
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          'readingStats.totalBooksRead': 1,
          'readingStats.totalPagesRead': book.pages
        }
      });

      // Also create "finished_reading" activity
      await Activity.create({
        user: user._id,
        activityType: 'finished_reading',
        targetBook: bookId
      });
    }

    return NextResponse.json({
      success: true,
      data: readingLog,
      message: isNew ? 'Book added to shelf' : 'Shelf updated'
    });

  } catch (error) {
    console.error('Error updating reading log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reading log' },
      { status: 500 }
    );
  }
}

// PATCH: Update reading progress
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, currentPage } = body;

    if (!bookId || !currentPage) {
      return NextResponse.json(
        { success: false, error: 'Book ID and current page are required' },
        { status: 400 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get book to calculate total pages
    const book = await Book.findById(bookId);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Validate current page
    if (currentPage < 0 || currentPage > book.pages) {
      return NextResponse.json(
        { success: false, error: `Current page must be between 0 and ${book.pages}` },
        { status: 400 }
      );
    }

    // Find and update reading log
    const readingLog = await ReadingLog.findOneAndUpdate(
      {
        user: user._id,
        book: bookId,
        shelf: 'currently_reading'
      },
      {
        currentPage,
        progressPercentage: Math.round((currentPage / book.pages) * 100),
        // Auto-move to "read" if finished
        ...(currentPage >= book.pages && {
          shelf: 'read',
          status: 'finished',
          progressPercentage: 100,
          finishDate: new Date()
        })
      },
      { new: true, runValidators: true }
    );

    if (!readingLog) {
      return NextResponse.json(
        { success: false, error: 'Reading log not found or book not in currently reading' },
        { status: 404 }
      );
    }

    // If book was finished, update stats
    if (currentPage >= book.pages) {
      await User.findByIdAndUpdate(user._id, {
        $inc: {
          'readingStats.totalBooksRead': 1,
          'readingStats.totalPagesRead': book.pages
        }
      });

      await Activity.create({
        user: user._id,
        activityType: 'finished_reading',
        targetBook: bookId
      });
    }

    return NextResponse.json({
      success: true,
      data: readingLog,
      message: currentPage >= book.pages 
        ? 'Congratulations! Book marked as read' 
        : 'Progress updated'
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// DELETE: Remove book from shelf
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
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { success: false, error: 'Book ID is required' },
        { status: 400 }
      );
    }

    await connectDb();

    // Get user
    const user = await User.findOne({ email: session.user.email }).select('_id');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Find and delete reading log
    const readingLog = await ReadingLog.findOneAndDelete({
      user: user._id,
      book: bookId
    });

    if (!readingLog) {
      return NextResponse.json(
        { success: false, error: 'Book not found in your library' },
        { status: 404 }
      );
    }

    // Update book's totalShelves count
    await Book.findByIdAndUpdate(bookId, {
      $inc: { totalShelves: -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Book removed from your library'
    });

  } catch (error) {
    console.error('Error removing book from shelf:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove book' },
      { status: 500 }
    );
  }
}