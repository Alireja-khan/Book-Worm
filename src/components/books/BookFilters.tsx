// src/components/books/BookFilters.tsx
'use client';

import { X, Filter as FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Genre {
  _id: string;
  name: string;
}

interface BookFiltersProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  minRating: number;
  maxRating: number;
  onRatingChange: (min: number, max: number) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  className?: string;
}

export default function BookFilters({
  genres,
  selectedGenres,
  onGenreChange,
  minRating,
  maxRating,
  onRatingChange,
  sortBy,
  sortOrder,
  onSortChange,
  className = ''
}: BookFiltersProps) {
  const handleGenreToggle = (genreId: string) => {
    const newGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenreChange(newGenres);
  };

  const handleRatingChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    if (type === 'min') {
      onRatingChange(numValue, maxRating);
    } else {
      onRatingChange(minRating, numValue);
    }
  };

  const clearFilters = () => {
    onGenreChange([]);
    onRatingChange(0, 5);
    onSortChange('createdAt', 'desc');
  };

  const hasActiveFilters = selectedGenres.length > 0 || minRating > 0 || maxRating < 5 || sortBy !== 'createdAt';

  return (
    <div className={className}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 relative">
            <FilterIcon className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90vw] sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filter Books</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6">
            {/* Sort Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Sort By</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={(value) => onSortChange(value, sortOrder)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                      <SelectItem value="author">Author A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={sortOrder}
                    onValueChange={(value) => onSortChange(sortBy, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Rating Range</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={minRating}
                    onChange={(e) => handleRatingChange('min', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="text-muted-foreground pt-5">to</div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground mb-1 block">Max</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={maxRating}
                    onChange={(e) => handleRatingChange('max', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {minRating.toFixed(1)} - {maxRating.toFixed(1)} stars
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Genres</Label>
                {selectedGenres.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onGenreChange([])}
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {genres.map((genre) => (
                  <div key={genre._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`genre-${genre._id}`}
                      checked={selectedGenres.includes(genre._id)}
                      onCheckedChange={() => handleGenreToggle(genre._id)}
                    />
                    <Label
                      htmlFor={`genre-${genre._id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {genre.name}
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedGenres.map(genreId => {
                    const genre = genres.find(g => g._id === genreId);
                    return (
                      <div
                        key={genreId}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                      >
                        {genre?.name}
                        <button
                          onClick={() => handleGenreToggle(genreId)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}