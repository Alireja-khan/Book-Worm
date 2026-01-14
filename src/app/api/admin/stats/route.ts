import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import User from '@/model/user.model';
import Review from '@/model/Review.model';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const user = await User.findOne({ email: session.user.email }).select('role');
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    await connectDb();

    const [totalBooks, totalUsers, pendingReviews] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Review.countDocuments({ status: 'pending' })
    ]);

    return NextResponse.json({ success: true, data: { totalBooks, totalUsers, pendingReviews } });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
