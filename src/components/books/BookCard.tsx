// src/components/books/BookCard.tsx
import { Star, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
    averageRating: number;
    totalReviews: number;
    totalShelves: number;
    genre: string;
    pages: number;
  };
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={book.coverImage}
          alt={book.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full">
            {book.genre}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{book.averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({book.totalReviews})</span>
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">by {book.author}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>{book.pages} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{book.totalShelves} readers</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/books/${book._id}`}>
              View Details
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            Add to Shelf
          </Button>
        </div>
      </div>
    </div>
  );
}