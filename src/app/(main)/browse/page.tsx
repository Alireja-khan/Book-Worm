// src/app/(main)/browse/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Grid, List, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BookCard from '@/components/books/BookCard';
import BookFilters from '@/components/books/BookFilters';
import { useDebounce } from '@/hooks/useDebounce';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  averageRating: number;
  totalReviews: number;
  totalShelves: number;
  genre: {
    _id: string;
    name: string;
  };
  pages: number;
}

interface Genre {
  _id: string;
  name: string;
}

export default function BrowseBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch books when filters change
  useEffect(() => {
    fetchBooks();
  }, [debouncedSearch, selectedGenres, minRating, maxRating, sortBy, sortOrder, pagination.page]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        minRating: minRating.toString(),
        maxRating: maxRating.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedGenres.length > 0 && { genres: selectedGenres.join(',') }),
      });

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setBooks(data.data);
        if (data.filters?.genres) {
          setGenres(data.filters.genres);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleRatingChange = (min: number, max: number) => {
    setMinRating(min);
    setMaxRating(max);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleGenreChange = (genres: string[]) => {
    setSelectedGenres(genres);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedGenres([]);
    setMinRating(0);
    setMaxRating(5);
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = selectedGenres.length > 0 || minRating > 0 || maxRating < 5 || sortBy !== 'createdAt';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Books</h1>
        <p className="text-muted-foreground">
          Discover {pagination.total}+ books in our collection
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="Search books or authors..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          {/* Filters Button */}
          <BookFilters
            genres={genres}
            selectedGenres={selectedGenres}
            onGenreChange={handleGenreChange}
            minRating={minRating}
            maxRating={maxRating}
            onRatingChange={handleRatingChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
          
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          
          {/* View Toggle */}
          <div className="flex border border-border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedGenres.map(genreId => {
            const genre = genres.find(g => g._id === genreId);
            return (
              <div
                key={genreId}
                className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
              >
                {genre?.name}
                <button
                  onClick={() => handleGenreChange(selectedGenres.filter(id => id !== genreId))}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </div>
            );
          })}
          {(minRating > 0 || maxRating < 5) && (
            <div className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
              Rating: {minRating.toFixed(1)}-{maxRating.toFixed(1)} stars
              <button
                onClick={() => handleRatingChange(0, 5)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          )}
          {sortBy !== 'createdAt' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">
              Sort: {sortBy === 'rating' ? 'Rating' : 
                     sortBy === 'popularity' ? 'Popularity' :
                     sortBy === 'title' ? 'Title' : 'Author'}
              <button
                onClick={() => handleSortChange('createdAt', 'desc')}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border animate-pulse">
              <div className="h-64 bg-muted rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-6 bg-muted rounded" />
                <div className="h-3 bg-muted rounded" />
                <div className="h-9 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No books found matching your filters</div>
          <Button onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {books.map((book) => (
              <BookCard key={book._id} book={{
                ...book,
                genre: "book.genre.name" // Convert to string for BookCard
              }} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'secondary' : 'outline'}
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}