import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import Goal from '@/model/Goal.model';
import User from '@/model/user.model';
import ReadingLog from '@/model/ReadingLog.model';
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

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();
    
    // Get goal for current year
    let goal = await Goal.findOne({ 
      user: user._id, 
      year: currentYear 
    });

    if (!goal) {
      // Count books read this year
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      
      const booksReadThisYear = await ReadingLog.countDocuments({
        user: user._id,
        shelf: 'read',
        finishDate: { $gte: startOfYear, $lte: endOfYear }
      });

      // Calculate pages read this year
      const readLogsThisYear = await ReadingLog.find({
        user: user._id,
        shelf: 'read',
        finishDate: { $gte: startOfYear, $lte: endOfYear }
      }).populate('book', 'pages');

      const pagesReadThisYear = readLogsThisYear.reduce((total, log) => {
        return total + ((log.book as any)?.pages || 0);
      }, 0);

      // Create default goal
      goal = await Goal.create({
        user: user._id,
        year: currentYear,
        targetBooks: 12,
        booksRead: booksReadThisYear,
        pagesRead: pagesReadThisYear,
        progressPercentage: Math.round((booksReadThisYear / 12) * 100),
        isActive: true,
        startDate: startOfYear,
        endDate: endOfYear
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        target: goal.targetBooks,
        progress: goal.booksRead,
        percentage: goal.progressPercentage,
        pagesRead: goal.pagesRead,
        targetPages: goal.targetPages,
        year: goal.year,
        isActive: goal.isActive
      }
    });

  } catch (error) {
    console.error('Error fetching reading goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reading goal' },
      { status: 500 }
    );
  }
}

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
    const { target } = body;

    if (!target || typeof target !== 'number' || target < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid target is required (minimum 1)' },
        { status: 400 }
      );
    }

    await connectDb();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();
    
    // Update existing goal or create new one
    const goal = await Goal.findOneAndUpdate(
      { user: user._id, year: currentYear },
      { 
        targetBooks: target,
        progressPercentage: Math.round((target > 0 ? (user.readingStats?.totalBooksRead || 0) / target : 0) * 100)
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        target: goal.targetBooks,
        progress: goal.booksRead,
        percentage: goal.progressPercentage,
        message: 'Reading goal updated successfully'
      }
    });

  } catch (error) {
    console.error('Error updating reading goal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reading goal' },
      { status: 500 }
    );
  }
}