import mongoose from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface IReview {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Reference to User
  book: mongoose.Types.ObjectId; // Reference to Book
  rating: number; // 1-5 stars
  content: string;
  status: ReviewStatus;
  likes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    content: {
      type: String,
      required: [true, 'Review content is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Indexes for faster queries
reviewSchema.index({ book: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
export default Review;