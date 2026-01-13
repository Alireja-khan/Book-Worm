import mongoose from 'mongoose';

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  readingStats?: {
    totalBooksRead: number;
    totalPagesRead: number;
    averageRating: number;
    favoriteGenres: mongoose.Types.ObjectId[];
    currentStreak: number; // Days
    longestStreak: number; // Days
  };
  preferences?: {
    favoriteGenres: mongoose.Types.ObjectId[];
    notificationEnabled: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    image: {
      type: String,
      default: '/default-avatar.png'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    readingStats: {
      totalBooksRead: { type: Number, default: 0 },
      totalPagesRead: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      favoriteGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 }
    },
    preferences: {
      favoriteGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
      notificationEnabled: { type: Boolean, default: true }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ 'readingStats.totalBooksRead': -1 });

// Remove password from JSON response
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;