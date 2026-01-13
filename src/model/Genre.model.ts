import mongoose from 'mongoose';

interface IGenre {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string; // URL-friendly version
  bookCount?: number; // Calculated field
  createdAt?: Date;
  updatedAt?: Date;
}

const genreSchema = new mongoose.Schema<IGenre>(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Genre name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    bookCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Auto-generate slug from name
genreSchema.pre('save', async function () {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
});

const Genre = mongoose.models.Genre || mongoose.model<IGenre>('Genre', genreSchema);
export default Genre;