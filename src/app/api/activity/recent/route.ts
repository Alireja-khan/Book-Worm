import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDb from '@/lib/db';
import Activity from '@/model/Activity.model';
import User from '@/model/user.model';
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

    // Get recent activities for the user
    const activities = await Activity.find({
      user: user._id
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name image')
      .populate('targetBook', 'title coverImage')
      .populate('targetUser', 'name image')
      .populate({
        path: 'targetReview',
        select: 'content rating'
      })
      .lean();

    // Transform activities for the dashboard
    const formattedActivities = activities.map((activity: any) => {
      let type: 'added' | 'rated' | 'finished' | 'reviewed' | 'followed';
      let bookTitle = '';
      let bookId = '';
      let rating = 0;

      switch (activity.activityType) {
        case 'added_to_shelf':
          type = 'added';
          bookTitle = activity.targetBook?.title || '';
          bookId = activity.targetBook?._id.toString() || '';
          break;
        case 'rated_book':
          type = 'rated';
          bookTitle = activity.targetBook?.title || '';
          bookId = activity.targetBook?._id.toString() || '';
          rating = activity.metadata?.rating || 0;
          break;
        case 'finished_reading':
          type = 'finished';
          bookTitle = activity.targetBook?.title || '';
          bookId = activity.targetBook?._id.toString() || '';
          break;
        case 'wrote_review':
          type = 'reviewed';
          bookTitle = activity.targetBook?.title || '';
          bookId = activity.targetBook?._id.toString() || '';
          break;
        case 'followed_user':
          type = 'followed';
          bookTitle = activity.targetUser?.name || '';
          bookId = activity.targetUser?._id.toString() || '';
          break;
        default:
          type = 'added';
      }

      return {
        _id: activity._id.toString(),
        type,
        user: {
          name: activity.user?.name || 'You',
          image: activity.user?.image || '/default-avatar.png'
        },
        book: {
          title: bookTitle,
          id: bookId
        },
        date: activity.createdAt?.toISOString() || new Date().toISOString(),
        metadata: {
          rating,
          shelf: activity.metadata?.shelf,
          ...activity.metadata
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}