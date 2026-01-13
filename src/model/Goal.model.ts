import mongoose from 'mongoose';

interface IGoal {
  _id?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // Reference to User
  year: number; // e.g., 2026
  targetBooks: number;
  targetPages?: number;
  booksRead: number; // Calculated from ReadingLog
  pagesRead: number; // Calculated from ReadingLog
  progressPercentage: number; // Calculated field
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const goalSchema = new mongoose.Schema<IGoal>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year cannot exceed 2100']
    },
    targetBooks: {
      type: Number,
      required: [true, 'Target books is required'],
      min: [1, 'Target must be at least 1 book']
    },
    targetPages: {
      type: Number,
      min: [1, 'Target pages must be at least 1']
    },
    booksRead: {
      type: Number,
      default: 0
    },
    pagesRead: {
      type: Number,
      default: 0
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), 0, 1) // Jan 1 of current year
    },
    endDate: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), 11, 31) // Dec 31 of current year
    }
  },
  { timestamps: true }
);

// Ensure one active goal per user per year
goalSchema.index({ user: 1, year: 1 }, { unique: true });

// Indexes for faster queries
goalSchema.index({ user: 1, isActive: 1 });
goalSchema.index({ progressPercentage: -1 });

const Goal = mongoose.models.Goal || mongoose.model<IGoal>('Goal', goalSchema);
export default Goal;