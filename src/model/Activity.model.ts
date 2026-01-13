import mongoose from 'mongoose';

type ActivityType = 
  | 'added_to_shelf' 
  | 'rated_book' 
  | 'finished_reading' 
  | 'wrote_review' 
  | 'followed_user';

interface IActivity {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Who performed the action
  activityType: ActivityType;
  targetUser?: mongoose.Types.ObjectId; // For follow actions
  targetBook?: mongoose.Types.ObjectId; // For book-related actions
  targetReview?: mongoose.Types.ObjectId; // For review actions
  metadata?: {
    shelf?: string;
    rating?: number;
    pagesRead?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const activitySchema = new mongoose.Schema<IActivity>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: ['added_to_shelf', 'rated_book', 'finished_reading', 'wrote_review', 'followed_user']
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    targetReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Indexes for fast activity feed queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ targetUser: 1, createdAt: -1 });
activitySchema.index({ targetBook: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });

const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', activitySchema);
export default Activity;