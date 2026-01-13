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

// Calculate progress percentage before save
readingLogSchema.pre('save', async function (next) {
  if (this.shelf === 'currently_reading' && this.currentPage) {
    try {
      const book = await mongoose.models.Book.findById(this.book);
      if (book && book.pages) {
        this.progressPercentage = Math.round((this.currentPage / book.pages) * 100);
      }
    } catch (error) {
      // Continue without progress calculation
    }
  }
  
  if (this.shelf === 'read') {
    this.status = 'finished';
    this.progressPercentage = 100;
    if (!this.finishDate) {
      this.finishDate = new Date();
    }
  }
  
  next();
});

const ReadingLog = mongoose.models.ReadingLog || mongoose.model<IReadingLog>('ReadingLog', readingLogSchema);
export default ReadingLog;