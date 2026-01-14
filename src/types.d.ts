import { Connection } from "mongoose";
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// MongoDB connection cache
declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'admin';
      image?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: 'user' | 'admin';
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'user' | 'admin';
    image?: string;
  }
}

// Your model interfaces
export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'admin';
  readingStats?: {
    totalBooksRead: number;
    totalPagesRead: number;
    averageRating: number;
    favoriteGenres: string[];
    currentStreak: number;
    longestStreak: number;
  };
  preferences?: {
    favoriteGenres: string[];
    notificationEnabled: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBook {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genre: string   ;
  pages: number;
  publicationYear: number;
  publisher?: string;
  isbn?: string;
  averageRating?: number;
  totalReviews?: number;
  totalShelves?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGenre {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  bookCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReview {
  _id: string;
  user: string | IUser;
  book: string | IBook;
  rating: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  likes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReadingLog {
  _id: string;
  user: string | IUser;
  book: string | IBook;
  shelf: 'want_to_read' | 'currently_reading' | 'read';
  status: 'not_started' | 'reading' | 'finished';
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  progressPercentage?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITutorial {
  _id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  duration?: string;
  category: 'review' | 'reading-tips' | 'author-interview' | 'book-recommendation' | 'writing-tips';
  tags: string[];
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGoal {
  _id: string;
  user: string | IUser;
  year: number;
  targetBooks: number;
  targetPages?: number;
  booksRead: number;
  pagesRead: number;
  progressPercentage: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Specific metadata types (replaces Record<string, any>)
export interface IActivityMetadata {
  shelf?: string;
  rating?: number;
  pagesRead?: number;
  followedUserId?: string;
  reviewId?: string;
  [key: string]: unknown; // Allows additional properties safely
}

export interface IActivity {
  _id: string;
  user: string | IUser;
  activityType: 'added_to_shelf' | 'rated_book' | 'finished_reading' | 'wrote_review' | 'followed_user';
  targetUser?: string | IUser;
  targetBook?: string | IBook;
  targetReview?: string | IReview;
  metadata?: IActivityMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  image?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genre: string;
  pages: number;
  publicationYear: number;
  publisher?: string;
  isbn?: string;
}

export interface ReviewFormData {
  rating: number;
  content: string;
}

export interface GoalFormData {
  targetBooks: number;
  targetPages?: number;
  year: number;
}

// Search & Filter types
export interface BookFilters {
  search?: string;
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  sortBy?: 'title' | 'author' | 'rating' | 'publicationYear' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}