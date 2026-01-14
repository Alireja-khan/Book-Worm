import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDb from '@/lib/db';
import Book from '@/model/Book.model';
import User from '@/model/user.model';
import Review from '@/model/Review.model';
import Genre from '@/model/Genre.model';
import Activity from '@/model/Activity.model';
import mongoose from 'mongoose';

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

    // Get basic stats
    const [totalBooks, totalUsers, pendingReviews] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Review.countDocuments({ status: 'pending' })
    ]);

    // Get books per genre distribution
    const genreDistribution = await Book.aggregate([
      {
        $lookup: {
          from: 'genres',
          localField: 'genre',
          foreignField: '_id',
          as: 'genreInfo'
        }
      },
      {
        $unwind: '$genreInfo'
      },
      {
        $group: {
          _id: '$genreInfo.name',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get admin user info
    const adminUser = await User.findOne({ email: session.user.email })
      .select('name email image role createdAt lastLogin');

    // Get recent admin activities (last 10 activities)
    const recentActivities = await Activity.find({ user: adminUser?._id })
      .populate('targetBook', 'title')
      .populate('targetReview', 'content')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get activity statistics
    const activityStats = await Activity.aggregate([
      { $match: { user: adminUser?._id } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly activity trend (last 6 months)
    const monthlyActivity = await Activity.aggregate([
      { 
        $match: { 
          user: adminUser?._id,
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return NextResponse.json({ 
      success: true, 
      data: { 
        overview: { totalBooks, totalUsers, pendingReviews },
        genreDistribution,
        adminInfo: adminUser,
        recentActivities,
        activityStats,
        monthlyActivity
      } 
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
