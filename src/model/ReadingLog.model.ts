import mongoose from 'mongoose';

export type ShelfType = 'want_to_read' | 'currently_reading' | 'read';
export type ReadingStatus = 'not_started' | 'reading' | 'finished';

interface IReadingLog {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Reference to User
  book: mongoose.Types.ObjectId; // Reference to Book
  shelf: ShelfType;
  status: ReadingStatus;
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  progressPercentage?: number; // Calculated field
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const readingLogSchema = new mongoose.Schema<IReadingLog>(
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
    shelf: {
      type: String,
      enum: ['want_to_read', 'currently_reading', 'read'],
      required: [true, 'Shelf type is required'],
      default: 'want_to_read'
    },
    status: {
      type: String,
      enum: ['not_started', 'reading', 'finished'],
      default: 'not_started'
    },
    currentPage: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: IReadingLog, value: number) {
          if (this.shelf === 'currently_reading') {
            return value > 0;
          }
          return true;
        },
        message: 'Current page is required for currently reading books'
      }
    },
    startDate: {
      type: Date
    },
    finishDate: {
      type: Date
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  { timestamps: true }
);

// Ensure one reading log per user per book
readingLogSchema.index({ user: 1, book: 1 }, { unique: true });

// Indexes for faster queries
readingLogSchema.index({ user: 1, shelf: 1 });
readingLogSchema.index({ user: 1, status: 1 });
readingLogSchema.index({ finishDate: -1 });

// Middleware to calculate progress and handle shelf changes
readingLogSchema.pre('save', async function () {
  try {
    // Set start date when moving to currently_reading or read
    if (this.isModified('shelf') && !this.startDate) {
      if (this.shelf === 'currently_reading' || this.shelf === 'read') {
        this.startDate = new Date();
      }
    }

    // Calculate progress percentage for currently reading books
    if (this.shelf === 'currently_reading' && this.currentPage) {
      const book = await mongoose.models.Book.findById(this.book);
      if (book && book.pages && book.pages > 0) {
        const calculatedProgress = Math.round((this.currentPage / book.pages) * 100);
        this.progressPercentage = Math.min(calculatedProgress, 100);
        this.status = 'reading';
      }
    }

    // Handle read shelf changes
    if (this.shelf === 'read') {
      this.status = 'finished';
      this.progressPercentage = 100;
      
      // If currentPage is not set, try to get book pages
      if (!this.currentPage) {
        const book = await mongoose.models.Book.findById(this.book);
        if (book?.pages) {
          this.currentPage = book.pages;
        }
      }
      
      if (!this.finishDate) {
        this.finishDate = new Date();
      }
    }

    // Handle want_to_read shelf
    if (this.shelf === 'want_to_read') {
      this.status = 'not_started';
      this.currentPage = 0;
      this.progressPercentage = 0;
    }

    // For async pre hooks, don't use next(); throw errors instead to reject the save
  } catch (error) {
    console.error('Error in readingLog pre-save hook:', error);
    throw error as mongoose.CallbackError;
  }
});

// Post-save hook for activity logging
readingLogSchema.post('save', async function (doc) {
  try {
    // Only log activity if this is a new log or shelf was modified
    if (this.isNew || this.isModified('shelf')) {
      // Import activity helpers dynamically to avoid circular dependencies
      const { activityHelpers } = await import('@/lib/activity');
      
      await activityHelpers.logAddedToShelf(
        doc.user.toString(),
        doc.book.toString(),
        doc.shelf
      );

      // Special logging for finished reading
      if (doc.shelf === 'read' && this.isModified('shelf')) {
        const book = await mongoose.models.Book.findById(doc.book);
        await activityHelpers.logFinishedReading(
          doc.user.toString(),
          doc.book.toString(),
          book?.pages
        );
      }
    }

    // Update book's totalShelves count
    if (this.isNew) {
      await mongoose.models.Book.findByIdAndUpdate(doc.book, {
        $inc: { totalShelves: 1 }
      });
    }
    
  } catch (error) {
    console.error('Error in readingLog post-save hook:', error);
    // Don't throw to avoid breaking the save operation
  }
});

// Post-remove hook to update book's totalShelves count
readingLogSchema.post('findOneAndDelete', async function (doc) {
  try {
    if (doc) {
      await mongoose.models.Book.findByIdAndUpdate(doc.book, {
        $inc: { totalShelves: -1 }
      });
    }
  } catch (error) {
    console.error('Error updating book shelves count after delete:', error);
  }
});

const ReadingLog = mongoose.models.ReadingLog || mongoose.model<IReadingLog>('ReadingLog', readingLogSchema);
export default ReadingLog;