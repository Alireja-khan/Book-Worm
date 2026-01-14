// src/app/(main)/browse/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  BookOpen,
  Calendar,
  Users,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import AddToShelf from './components/AddToShelf';
import ProgressTracker from './components/ProgressTracker';
import ReviewSection from './components/ReviewSection';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pages: number;
  publicationYear: number;
  publisher?: string;
  averageRating: number;
  totalReviews: number;
  totalShelves: number;
  genre?: {
    _id: string;
    name: string;
    description?: string;
    slug: string;
  } | null;
  reviews?: Array<{
    _id: string;
    rating: number;
    content: string;
    createdAt: string;
    user: {
      name: string;
      image?: string;
    };
  }>;
}

interface ReadingLog {
  _id: string;
  shelf: 'want_to_read' | 'currently_reading' | 'read';
  status: 'not_started' | 'reading' | 'finished';
  currentPage?: number;
  progressPercentage?: number;
  startDate?: string;
  finishDate?: string;
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [book, setBook] = useState<Book | null>(null);
  const [readingLog, setReadingLog] = useState<ReadingLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bookId = params.id as string;

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    fetchBookData();
  }, [bookId, status, router]);

  // In fetchBookData function, update this part:
  const fetchBookData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch book details
      const bookResponse = await fetch(`/api/books/${bookId}`);

      // Check if response is not OK
      if (!bookResponse.ok) {
        // Try to get the error message from response
        const errorData = await bookResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${bookResponse.status}`);
      }

      const bookData = await bookResponse.json();

      if (!bookData.success) {
        throw new Error(bookData.error || 'Failed to load book');
      }

      setBook(bookData.data);

      // Fetch user's reading log for this book
      if (session?.user?.email) {
        // Make sure to pass the correct parameter name
        const logResponse = await fetch(`/api/reading-log?bookId=${bookId}`);
        if (logResponse.ok) {
          const logData = await logResponse.json();
          if (logData.success) {
            setReadingLog(logData.data);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
      console.error('Error fetching book:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
        </Button>

        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/browse">Browse Books</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/browse">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Book Cover & Basic Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            {/* Book Cover */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border mb-6">
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-2xl font-bold">{book.averageRating.toFixed(1)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold">{book.totalReviews}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Readers</p>
                    <p className="text-2xl font-bold">{book.totalShelves}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Pages</p>
                  <p className="text-2xl font-bold">{book.pages}</p>
                </div>
              </div>
            </div>

            {/* Add to Shelf Component */}
            <AddToShelf
              bookId={book._id}
              bookPages={book.pages}
              currentShelf={readingLog?.shelf}
              onShelfChange={fetchBookData}
              className="mt-6"
            />

            {/* Progress Tracker (if Currently Reading) */}
            {readingLog?.shelf === 'currently_reading' && (
              <ProgressTracker
                readingLog={readingLog}
                bookPages={book.pages}
                onProgressUpdate={fetchBookData}
                className="mt-6"
              />
            )}
          </div>
        </div>

        {/* Right Column - Book Details & Reviews */}
        <div className="lg:col-span-2">
          {/* Book Title & Author */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {book.genre?.name ?? 'Unknown'}
              </span>
              <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                Published {book.publicationYear}
              </span>
              {book.publisher && (
                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                  {book.publisher}
                </span>
              )}
            </div>
          </div>

          {/* Book Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          </div>

          {/* Reading Status (if any) */}
          {readingLog && (
            <div className="mb-8 p-6 bg-card rounded-xl border border-border">
              <h2 className="text-xl font-semibold mb-4">Your Reading Status</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className={`px-4 py-2 rounded-full capitalize ${readingLog.shelf === 'read' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    readingLog.shelf === 'currently_reading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                  {readingLog.shelf.replace('_', ' ')}
                </div>
                {readingLog.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">
                      Started {new Date(readingLog.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {readingLog.finishDate && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm text-muted-foreground">
                      Finished {new Date(readingLog.finishDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {readingLog.progressPercentage && readingLog.progressPercentage > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${readingLog.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {readingLog.progressPercentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <ReviewSection
            bookId={book._id}
            bookTitle={book.title}
            bookReviews={book.reviews || []}
            userHasRead={readingLog?.shelf === 'read'}
            onReviewSubmit={fetchBookData}
          />
        </div>
      </div>
    </div>
  );
}