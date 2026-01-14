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

// Pre-save hook for book rating updates
reviewSchema.pre('save', async function (next) {
  try {
    // If this is a new review or rating changed, update book's average rating
    if (this.isNew || this.isModified('rating')) {
      await this.updateBookAverageRating();
    }

    // Auto-approve reviews from admins
    if (this.isNew) {
      const user = await mongoose.models.User.findById(this.user);
      if (user?.role === 'admin') {
        this.status = 'approved';
      }
    }

    next();
  } catch (error) {
    console.error('Error in review pre-save hook:', error);
    next(error as mongoose.CallbackError);
  }
});

// Post-save hook for activity logging
reviewSchema.post('save', async function (doc) {
  try {
    // Import activity helpers dynamically
    const { activityHelpers } = await import('@/lib/activity');
    
    // Log activity for new reviews
    if (this.isNew) {
      await activityHelpers.logWroteReview(
        doc.user.toString(),
        doc.book.toString(),
        doc._id.toString()
      );
    }

    // Log activity for ratings (both new and updated)
    if (this.isNew || this.isModified('rating')) {
      await activityHelpers.logRatedBook(
        doc.user.toString(),
        doc.book.toString(),
        doc.rating
      );
    }

    // Update book's totalReviews count for new reviews
    if (this.isNew) {
      await mongoose.models.Book.findByIdAndUpdate(doc.book, {
        $inc: { totalReviews: 1 }
      });
    }
    
  } catch (error) {
    console.error('Error in review post-save hook:', error);
  }
});

// Post-remove hook to update book's totalReviews count and recalculate average
reviewSchema.post('findOneAndDelete', async function (doc) {
  try {
    if (doc) {
      // Decrement total reviews count
      await mongoose.models.Book.findByIdAndUpdate(doc.book, {
        $inc: { totalReviews: -1 }
      });

      // Recalculate average rating for the book
      const Review = mongoose.models.Review;
      const reviews = await Review.find({ 
        book: doc.book, 
        status: 'approved' 
      });
      
      if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await mongoose.models.Book.findByIdAndUpdate(doc.book, {
          averageRating: parseFloat(averageRating.toFixed(1))
        });
      } else {
        // No reviews left, reset to 0
        await mongoose.models.Book.findByIdAndUpdate(doc.book, {
          averageRating: 0
        });
      }
    }
  } catch (error) {
    console.error('Error updating book after review delete:', error);
  }
});

// Instance method to update book's average rating
reviewSchema.methods.updateBookAverageRating = async function () {
  try {
    const Review = mongoose.models.Review;
    const reviews = await Review.find({ 
      book: this.book, 
      status: 'approved' 
    });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await mongoose.models.Book.findByIdAndUpdate(this.book, {
        averageRating: parseFloat(averageRating.toFixed(1))
      });
    } else {
      // If no approved reviews, use this review's rating
      await mongoose.models.Book.findByIdAndUpdate(this.book, {
        averageRating: this.rating
      });
    }
  } catch (error) {
    console.error('Error updating book average rating:', error);
  }
};

// Static method to approve a review
reviewSchema.statics.approveReview = async function (reviewId: string) {
  try {
    const review = await this.findByIdAndUpdate(
      reviewId,
      { status: 'approved' },
      { new: true }
    );

    if (review) {
      // Recalculate book's average rating
      await review.updateBookAverageRating();
    }

    return review;
  } catch (error) {
    console.error('Error approving review:', error);
    throw error;
  }
};

// Static method to reject a review
reviewSchema.statics.rejectReview = async function (reviewId: string) {
  try {
    const review = await this.findByIdAndUpdate(
      reviewId,
      { status: 'rejected' },
      { new: true }
    );

    if (review) {
      // Recalculate book's average rating
      await review.updateBookAverageRating();
    }

    return review;
  } catch (error) {
    console.error('Error rejecting review:', error);
    throw error;
  }
};

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
export default Review;