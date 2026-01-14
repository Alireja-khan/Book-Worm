// src/app/(main)/browse/[id]/components/ProgressTracker.tsx
'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Flag, 
  Loader2,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner'; // or use your preferred toast library

interface ProgressTrackerProps {
  readingLog: {
    _id: string;
    currentPage?: number;
    progressPercentage?: number;
    book?: { _id: string } | string | null;
  };
  bookPages: number;
  onProgressUpdate: () => void;
  className?: string;
}

export default function ProgressTracker({
  readingLog,
  bookPages,
  onProgressUpdate,
  className = ''
}: ProgressTrackerProps) {
  const [currentPage, setCurrentPage] = useState(readingLog.currentPage || 1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [useSlider, setUseSlider] = useState(false);
  const [sliderValue, setSliderValue] = useState(
    Math.round(((readingLog.currentPage || 1) / bookPages) * 100)
  );

  const progressPercentage = readingLog.progressPercentage || 0;
  const pagesLeft = bookPages - (readingLog.currentPage || 0);

  const handlePageInput = async () => {
    if (currentPage < 1 || currentPage > bookPages) {
      toast.error(`Please enter a page between 1 and ${bookPages}`);
      return;
    }

    await updateProgress(currentPage);
  };

  const handleSliderChange = async (value: number[]) => {
    const percentage = value[0];
    const calculatedPage = Math.round((percentage / 100) * bookPages);
    setSliderValue(percentage);
    setCurrentPage(calculatedPage);
    
    // Update immediately on slider release
    await updateProgress(calculatedPage);
  };

  const handleSliderValueChange = (value: number[]) => {
    // Update slider value in real-time as user drags
    setSliderValue(value[0]);
  };

  const updateProgress = async (page: number) => {
    try {
      setIsUpdating(true);
      
          // Determine bookId from the populated readingLog.book (preferred)
      const bookId = (readingLog as any).book?._id || (readingLog as any).book;
      if (!bookId) {
        console.error('Book ID not found on readingLog:', readingLog);
        throw new Error('Book ID not found on reading log');
      }

      const response = await fetch('/api/reading-log', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          currentPage: page
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      onProgressUpdate();
      
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const markAsFinished = async () => {
    if (!confirm('Mark this book as finished?')) return;
    
    await updateProgress(bookPages);
  };

  const quickUpdate = (pages: number) => {
    const newPage = Math.min((readingLog.currentPage || 0) + pages, bookPages);
    setCurrentPage(newPage);
    updateProgress(newPage);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Reading Progress</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {pagesLeft} pages left
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span className="font-semibold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Page {readingLog.currentPage || 0}</span>
          <span>Page {bookPages}</span>
        </div>
      </div>

      {/* Input Methods Toggle */}
      <div className="flex gap-2">
        <Button
          variant={useSlider ? "outline" : "secondary"}
          size="sm"
          onClick={() => setUseSlider(false)}
          className="flex-1"
        >
          Enter Page
        </Button>
        <Button
          variant={useSlider ? "secondary" : "outline"}
          size="sm"
          onClick={() => setUseSlider(true)}
          className="flex-1"
        >
          Use Slider
        </Button>
      </div>

      {/* Input Method 1: Page Number Input */}
      {!useSlider ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max={bookPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value) || 1)}
              className="flex-1"
              disabled={isUpdating}
            />
            <Button
              onClick={handlePageInput}
              disabled={isUpdating}
              className="min-w-[100px]"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Update'
              )}
            </Button>
          </div>

          {/* Quick Update Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickUpdate(10)}
              disabled={isUpdating}
            >
              +10 pages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickUpdate(25)}
              disabled={isUpdating}
            >
              +25 pages
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickUpdate(50)}
              disabled={isUpdating}
            >
              +50 pages
            </Button>
          </div>
        </div>
      ) : (
        /* Input Method 2: Slider */
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={[sliderValue]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleSliderValueChange}
              onValueCommit={handleSliderChange}
              disabled={isUpdating}
              className="py-4"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Page {Math.round((sliderValue / 100) * bookPages)} of {bookPages}
          </div>
        </div>
      )}

      {/* Mark as Finished Button */}
      <Button
        variant="secondary"
        className="w-full"
        onClick={markAsFinished}
        disabled={isUpdating || progressPercentage === 100}
      >
        <Flag className="w-4 h-4 mr-2" />
        Mark as Finished
      </Button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center p-3 bg-card rounded-lg border">
          <div className="text-2xl font-bold">
            {Math.round((readingLog.currentPage || 0) / bookPages * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-3 bg-card rounded-lg border">
          <div className="text-2xl font-bold">
            {pagesLeft}
          </div>
          <div className="text-xs text-muted-foreground">Pages Left</div>
        </div>
      </div>
    </div>
  );
}