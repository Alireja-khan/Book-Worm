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
        // FIXED: Removed the explicit 'this' typing from the function
        validator: function (value: number) {
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
readingLogSchema.pre('save', async function (next) {
  try {
    const doc = this as mongoose.Document & IReadingLog;
    
    // Set start date when moving to currently_reading or read
    if (this.isModified('shelf') && !doc.startDate) {
      if (doc.shelf === 'currently_reading' || doc.shelf === 'read') {
        doc.startDate = new Date();
      }
    }

    // Calculate progress percentage for currently reading books
    if (doc.shelf === 'currently_reading' && doc.currentPage) {
      const book = await mongoose.models.Book.findById(doc.book);
      if (book && (book as any).pages && (book as any).pages > 0) {
        const calculatedProgress = Math.round((doc.currentPage / (book as any).pages) * 100);
        doc.progressPercentage = Math.min(calculatedProgress, 100);
        doc.status = 'reading';
      }
    }

    // Handle read shelf changes
    if (doc.shelf === 'read') {
      doc.status = 'finished';
      doc.progressPercentage = 100;
      
      // If currentPage is not set, try to get book pages
      if (!doc.currentPage) {
        const book = await mongoose.models.Book.findById(doc.book);
        if (book && (book as any).pages) {
          doc.currentPage = (book as any).pages;
        }
      }
      
      if (!doc.finishDate) {
        doc.finishDate = new Date();
      }
    }

    // Handle want_to_read shelf
    if (doc.shelf === 'want_to_read') {
      doc.status = 'not_started';
      doc.currentPage = 0;
      doc.progressPercentage = 0;
    }

    next();
  } catch (error) {
    console.error('Error in readingLog pre-save hook:', error);
    next(error as mongoose.CallbackError);
  }
});

// Post-save hook for activity logging
readingLogSchema.post('save', async function (doc: IReadingLog & mongoose.Document) {
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
          (book as any)?.pages
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
readingLogSchema.post('findOneAndDelete', async function (doc: IReadingLog) {
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