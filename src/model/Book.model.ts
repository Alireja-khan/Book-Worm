import mongoose from 'mongoose';

interface IBook {
  _id?: mongoose.Types.ObjectId;
  title: string;
  author: string;
  description: string;
  coverImage: string; // Cloudinary URL or local path
  genre: mongoose.Types.ObjectId; // Reference to Genre
  pages: number;
  publicationYear: number;
  publisher?: string;
  isbn?: string;
  averageRating?: number; // Calculated field
  totalReviews?: number; // Calculated field
  totalShelves?: number; // Sum of all shelves (for popularity)
  createdAt?: Date;
  updatedAt?: Date;
}

const bookSchema = new mongoose.Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
      validate: {
        validator: (value: string) => {
          return /^(https?:\/\/|data:image)/.test(value);
        },
        message: 'Please provide a valid image URL'
      }
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
      required: [true, 'Genre is required']
    },
    pages: {
      type: Number,
      required: [true, 'Number of pages is required'],
      min: [1, 'Book must have at least 1 page']
    },
    publicationYear: {
      type: Number,
      required: [true, 'Publication year is required'],
      min: [1000, 'Please provide a valid year'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    publisher: {
      type: String,
      trim: true
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allows multiple null values but enforces uniqueness for non-null
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalShelves: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ totalShelves: -1 });
bookSchema.index({ publicationYear: -1 });

const Book = mongoose.models.Book || mongoose.model<IBook>('Book', bookSchema);
export default Book;