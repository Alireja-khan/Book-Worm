import mongoose from 'mongoose';

interface ITutorial {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeId: string; // Extracted from URL
  thumbnailUrl: string;
  duration?: string; // e.g., "12:45"
  category: string; // e.g., "review", "reading-tips", "author-interview"
  tags: string[];
  isActive: boolean;
  order: number; // For manual sorting
  createdAt?: Date;
  updatedAt?: Date;
}

const tutorialSchema = new mongoose.Schema<ITutorial>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      validate: {
        validator: function (value: string) {
          return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(value);
        },
        message: 'Please provide a valid YouTube URL'
      }
    },
    youtubeId: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Thumbnail URL is required']
    },
    duration: {
      type: String
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['review', 'reading-tips', 'author-interview', 'book-recommendation', 'writing-tips']
    },
    tags: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Extract YouTube ID before saving
tutorialSchema.pre('save', async function () {
  if (this.youtubeUrl && !this.youtubeId) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.youtubeUrl.match(regex);
    if (match && match[1]) {
      this.youtubeId = match[1];
      // Generate thumbnail URL if not provided
      if (!this.thumbnailUrl) {
        this.thumbnailUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
  }
});

const Tutorial = mongoose.models.Tutorial || mongoose.model<ITutorial>('Tutorial', tutorialSchema);
export default Tutorial;