// src/app/(main)/library/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  BookOpen, 
  Bookmark, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  Users,
  ArrowRight,
  Loader2,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  pages: number;
  genre: {
    name: string;
  };
}

interface ReadingLog {
  _id: string;
  book: Book;
  shelf: 'want_to_read' | 'currently_reading' | 'read';
  status: 'not_started' | 'reading' | 'finished';
  currentPage?: number;
  progressPercentage?: number;
  startDate?: string;
  finishDate?: string;
  updatedAt: string;
}

interface LibraryStats {
  totalBooks: number;
  booksRead: number;
  totalPagesRead: number;
  readingTime: number; // in hours
  favoriteGenres: string[];
  currentStreak: number;
}

export default function MyLibraryPage() {
  const { data: session } = useSession();
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ReadingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    booksRead: 0,
    totalPagesRead: 0,
    readingTime: 0,
    favoriteGenres: [],
    currentStreak: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session) {
      fetchLibrary();
    }
  }, [session]);

  useEffect(() => {
    filterLogs();
  }, [readingLogs, activeTab, searchQuery]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reading-log');
      const data = await response.json();
      
      if (data.success) {
        setReadingLogs(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (logs: ReadingLog[]) => {
    const readBooks = logs.filter(log => log.shelf === 'read');
    const currentlyReading = logs.filter(log => log.shelf === 'currently_reading');
    
    // Calculate total pages read
    const totalPagesRead = readBooks.reduce((sum, log) => {
      return sum + (log.book.pages || 0);
    }, 0);
    
    // Calculate reading time (assuming 1 page = 2 minutes)
    const readingTime = Math.round(totalPagesRead * 2 / 60);
    
    // Get favorite genres
    const genreCounts: Record<string, number> = {};
    readBooks.forEach(log => {
      const genre = log.book.genre?.name;
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
    
    const favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    setStats({
      totalBooks: logs.length,
      booksRead: readBooks.length,
      totalPagesRead,
      readingTime,
      favoriteGenres,
      currentStreak: calculateCurrentStreak(readBooks)
    });
  };

  const calculateCurrentStreak = (readBooks: ReadingLog[]): number => {
    if (readBooks.length === 0) return 0;
    
    // Sort by finish date
    const sortedDates = readBooks
      .filter(log => log.finishDate)
      .map(log => new Date(log.finishDate!).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if user read today or yesterday to start streak
    if (sortedDates.includes(today.toDateString())) {
      streak = 1;
    } else if (sortedDates.includes(yesterday.toDateString())) {
      streak = 1;
    }
    
    return streak;
  };

  const filterLogs = () => {
    let filtered = readingLogs;
    
    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(log => log.shelf === activeTab);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.book.title.toLowerCase().includes(query) ||
        log.book.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredLogs(filtered);
  };

  const getShelfStats = (shelf: string) => {
    const shelfLogs = readingLogs.filter(log => log.shelf === shelf);
    return {
      count: shelfLogs.length,
      icon: shelf === 'want_to_read' ? Bookmark : 
            shelf === 'currently_reading' ? BookOpen : CheckCircle,
      color: shelf === 'want_to_read' ? 'text-yellow-600' :
             shelf === 'currently_reading' ? 'text-blue-600' : 'text-green-600',
      bgColor: shelf === 'want_to_read' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
               shelf === 'currently_reading' ? 'bg-blue-100 dark:bg-blue-900/20' : 
               'bg-green-100 dark:bg-green-900/20'
    };
  };

  const handleUpdateProgress = async (logId: string, currentPage: number) => {
    try {
      const response = await fetch('/api/reading-log', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingLogId: logId, currentPage })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLibrary(); // Refresh library
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleMoveToShelf = async (bookId: string, newShelf: string) => {
    try {
      const response = await fetch('/api/reading-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, shelf: newShelf })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLibrary(); // Refresh library
      }
    } catch (error) {
      console.error('Error moving book:', error);
    }
  };

  const handleRemoveFromLibrary = async (bookId: string) => {
    if (!confirm('Remove this book from your library?')) return;
    
    try {
      const response = await fetch(`/api/reading-log?bookId=${bookId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        fetchLibrary(); // Refresh library
      }
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">My Library</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your library</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">
              Across all shelves
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booksRead}</div>
            <p className="text-xs text-muted-foreground">
              Completed this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Read</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPagesRead.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ≈ {stats.readingTime} hours of reading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep going!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shelf Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(['want_to_read', 'currently_reading', 'read'] as const).map((shelf) => {
          const shelfStat = getShelfStats(shelf);
          const Icon = shelfStat.icon;
          
          return (
            <Card key={shelf} className={`${shelfStat.bgColor} border-0`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${shelfStat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${shelfStat.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {shelf.replace('_', ' ')}
                      </h3>
                      <p className="text-2xl font-bold">{shelfStat.count} books</p>
                    </div>
                  </div>
                  {shelf === 'currently_reading' && shelfStat.count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="search"
            placeholder="Search your library..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Books ({readingLogs.length})</TabsTrigger>
          <TabsTrigger value="want_to_read">Want to Read ({getShelfStats('want_to_read').count})</TabsTrigger>
          <TabsTrigger value="currently_reading">Currently Reading ({getShelfStats('currently_reading').count})</TabsTrigger>
          <TabsTrigger value="read">Read ({getShelfStats('read').count})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {searchQuery 
                  ? 'No books found matching your search'
                  : activeTab === 'all'
                    ? 'Your library is empty. Start adding books!'
                    : `No books in ${activeTab.replace('_', ' ')} shelf`}
              </div>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/browse">Browse Books</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLogs.map((log) => (
                <Card key={log._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    {/* Book Cover */}
                    <div className="w-24 h-32 relative flex-shrink-0">
                      <Image
                        src={log.book.coverImage}
                        alt={log.book.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    
                    {/* Book Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold line-clamp-1">
                            <Link 
                              href={`/browse/${log.book._id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {log.book.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            by {log.book.author}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {log.book.genre?.name}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                log.shelf === 'read' ? 'text-green-600 border-green-600' :
                                log.shelf === 'currently_reading' ? 'text-blue-600 border-blue-600' :
                                'text-yellow-600 border-yellow-600'
                              }`}
                            >
                              {log.shelf.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromLibrary(log.book._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      {/* Progress Tracker (for currently reading) */}
                      {log.shelf === 'currently_reading' && log.progressPercentage !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{log.progressPercentage}%</span>
                          </div>
                          <Progress value={log.progressPercentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Page {log.currentPage || 0}</span>
                            <span>{log.book.pages} pages</span>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateProgress(log._id, Math.min((log.currentPage || 0) + 10, log.book.pages))}
                              className="flex-1 text-xs"
                            >
                              +10 pages
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateProgress(log._id, log.book.pages)}
                              className="flex-1 text-xs"
                            >
                              Mark as Read
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Finished Date (for read books) */}
                      {log.shelf === 'read' && log.finishDate && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Finished on {new Date(log.finishDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      {/* Move to Shelf Options */}
                      <div className="flex gap-2 mt-3">
                        {log.shelf !== 'want_to_read' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveToShelf(log.book._id, 'want_to_read')}
                            className="text-xs"
                          >
                            <Bookmark className="w-3 h-3 mr-1" />
                            Want to Read
                          </Button>
                        )}
                        {log.shelf !== 'currently_reading' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveToShelf(log.book._id, 'currently_reading')}
                            className="text-xs"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            Currently Reading
                          </Button>
                        )}
                        {log.shelf !== 'read' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveToShelf(log.book._id, 'read')}
                            className="text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Favorite Genres */}
      {stats.favoriteGenres.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Favorite Genres</CardTitle>
            <CardDescription>
              Based on your reading history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.favoriteGenres.map((genre, index) => (
                <Badge key={genre} variant="secondary" className="text-sm py-1.5 px-3">
                  {index === 0 ? '🏆 ' : ''}{genre}
                </Badge>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/browse">
                  Discover more {stats.favoriteGenres[0]} books
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State for new users */}
      {readingLogs.length === 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your personal library by adding books you want to read, 
              are currently reading, or have finished.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/browse">Browse Books to Add</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/browse#add-book">How to Add Books</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}