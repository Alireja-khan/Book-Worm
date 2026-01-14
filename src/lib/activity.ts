import Activity from '@/model/Activity.model';
import connectDb from '@/lib/db';

interface LogActivityParams {
  userId: string;
  activityType: 'added_to_shelf' | 'rated_book' | 'finished_reading' | 'wrote_review' | 'followed_user';
  targetUserId?: string;
  targetBookId?: string;
  targetReviewId?: string;
  metadata?: {
    shelf?: string;
    rating?: number;
    pagesRead?: number;
    [key: string]: any;
  };
}

export async function logActivity(params: LogActivityParams) {
  try {
    await connectDb();
    
    await Activity.create({
      user: params.userId,
      activityType: params.activityType,
      ...(params.targetUserId && { targetUser: params.targetUserId }),
      ...(params.targetBookId && { targetBook: params.targetBookId }),
      ...(params.targetReviewId && { targetReview: params.targetReviewId }),
      metadata: params.metadata || {}
    });

    console.log(`Activity logged: ${params.activityType} for user ${params.userId}`);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw to avoid breaking main functionality
  }
}

// Convenience functions
export const activityHelpers = {
  async logAddedToShelf(userId: string, bookId: string, shelf: string) {
    return logActivity({
      userId,
      activityType: 'added_to_shelf',
      targetBookId: bookId,
      metadata: { shelf }
    });
  },

  async logRatedBook(userId: string, bookId: string, rating: number) {
    return logActivity({
      userId,
      activityType: 'rated_book',
      targetBookId: bookId,
      metadata: { rating }
    });
  },

  async logFinishedReading(userId: string, bookId: string, pagesRead?: number) {
    return logActivity({
      userId,
      activityType: 'finished_reading',
      targetBookId: bookId,
      metadata: { pagesRead }
    });
  },

  async logWroteReview(userId: string, bookId: string, reviewId: string) {
    return logActivity({
      userId,
      activityType: 'wrote_review',
      targetBookId: bookId,
      targetReviewId: reviewId
    });
  },

  async logFollowedUser(userId: string, targetUserId: string) {
    return logActivity({
      userId,
      activityType: 'followed_user',
      targetUserId: targetUserId
    });
  }
};