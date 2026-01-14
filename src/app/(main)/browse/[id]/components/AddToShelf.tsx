// src/app/(main)/browse/[id]/components/AddToShelf.tsx
'use client';

import { useState } from 'react';
import { 
  Bookmark, 
  BookOpen, 
  Check, 
  Loader2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface AddToShelfProps {
  bookId: string;
  bookPages: number;
  currentShelf?: 'want_to_read' | 'currently_reading' | 'read';
  onShelfChange: () => void;
  className?: string;
}

const shelfOptions = [
  {
    value: 'want_to_read',
    label: 'Want to Read',
    icon: Bookmark,
    description: 'Save for later',
    color: 'text-yellow-600'
  },
  {
    value: 'currently_reading',
    label: 'Currently Reading',
    icon: BookOpen,
    description: 'Start reading now',
    color: 'text-blue-600'
  },
  {
    value: 'read',
    label: 'Read',
    icon: Check,
    description: 'Mark as finished',
    color: 'text-green-600'
  }
];

export default function AddToShelf({
  bookId,
  bookPages,
  currentShelf,
  onShelfChange,
  className = ''
}: AddToShelfProps) {
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleAddToShelf = async (shelf: string) => {
    try {
      setLoading(true);
      
      const payload = {
        bookId,
        shelf,
        ...(shelf === 'currently_reading' && { currentPage: 1 })
      };

      const response = await fetch('/api/reading-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message || 'Book added to shelf');
      onShelfChange();
      
    } catch (error) {
      console.error('Error adding to shelf:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update shelf');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShelf = async () => {
    if (!confirm('Remove this book from your library?')) return;

    try {
      setRemoving(true);
      
      const response = await fetch(`/api/reading-log?bookId=${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success('Book removed from library');
      onShelfChange();
      
    } catch (error) {
      console.error('Error removing from shelf:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove book');
    } finally {
      setRemoving(false);
    }
  };

  const currentShelfOption = shelfOptions.find(opt => opt.value === currentShelf);

  return (
    <div className={className}>
      {currentShelf ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {currentShelfOption && (
                <>
                  <currentShelfOption.icon className={`w-5 h-5 ${currentShelfOption.color}`} />
                  <div>
                    <p className="font-medium">In your library</p>
                    <p className="text-sm text-muted-foreground">
                      {currentShelfOption.label}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFromShelf}
              disabled={removing}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {removing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Move to another shelf'
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {shelfOptions
                .filter(option => option.value !== currentShelf)
                .map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleAddToShelf(option.value)}
                    className="cursor-pointer"
                  >
                    <option.icon className={`w-4 h-4 mr-2 ${option.color}`} />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Add to My Library
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {shelfOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleAddToShelf(option.value)}
                className="cursor-pointer"
              >
                <option.icon className={`w-4 h-4 mr-2 ${option.color}`} />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}