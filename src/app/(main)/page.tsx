// src/app/(main)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  TrendingUp, 
  BookOpen, 
  Star, 
  Target, 
  Calendar,
  Clock,
  Bookmark,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Loader2,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import BookCard from '@/components/books/BookCard';
import RecommendationsList from '@/components/dashboard/Recommendations';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Book {
  _id: string;
  title: string;
  author: string;
  coverImage: string;
  averageRating: number;
  totalReviews: number;
  totalShelves: number;
  genre: {
    name: string;
  };
  pages: number;
}

interface ReadingStats {
  totalBooks: number;
  booksRead: number;
  booksReading: number;
  booksToRead: number;
  totalPagesRead: number;
  averageRating: number;
  favoriteGenres: string[];
  currentStreak: number;
  monthlyBooks: number;
  readingGoal: {
    target: number;
    progress: number;
    percentage: number;
  };
}

interface Recommendation {
  book: Book;
  reason: string;
  reasonDetails?: {
    matchedGenre?: string;
    readCountForGenre?: number;
    fallback?: boolean;
    communityRating?: number;
    popularity?: number;
  };
  matchScore: number;
}

interface Activity {
  _id: string;
  type: 'added' | 'rated' | 'finished' | 'reviewed';
  user: {
    name: string;
    image?: string;
  };
  book: {
    title: string;
    id: string;
  };
  date: string;
  metadata?: {
    rating?: number;
    shelf?: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReadingStats>({
    totalBooks: 0,
    booksRead: 0,
    booksReading: 0,
    booksToRead: 0,
    totalPagesRead: 0,
    averageRating: 0,
    favoriteGenres: [],
    currentStreak: 0,
    monthlyBooks: 0,
    readingGoal: {
      target: 12,
      progress: 0,
      percentage: 0
    }
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<Book[]>([]);

  // Simple client-side helper to compute a match score for trending books
  const computeMatchScoreFromBook = (book: Book) => {
    const base = 60;
    const ratingBonus = Math.min((book.averageRating || 0) * 4, 20);
    const popularityBonus = Math.min((book.totalShelves || 0) / 100, 10);
    const raw = base + ratingBonus + popularityBonus;
    return Math.round(Math.min(Math.max(raw, 50), 98));
  };

  interface AdminStats {
    overview: {
      totalBooks: number;
      totalUsers: number;
      pendingReviews: number;
    };
    genreDistribution: Array<{ _id: string; count: number }>;
    adminInfo: any;
    recentActivities: any[];
    activityStats: any[];
    monthlyActivity: any[];
  }

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (session) {
      if (session.user?.role === 'admin') {
        fetchAdminData();
      } else {
        fetchDashboardData();
      }
    }
  }, [session]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      console.log('Admin API Response:', data); // Debug log
      if (data.success) {
        setAdminStats(data.data);
        console.log('Admin Stats Set:', data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsRes, recsRes, activityRes, trendingRes] = await Promise.all([
        fetch('/api/users/stats'),
        fetch('/api/recommendations'),
        fetch('/api/activity/recent'),
        fetch('/api/books/trending')
      ]);

      const statsData = await statsRes.json();
      const recsData = await recsRes.json();
      const activityData = await activityRes.json();
      const trendingData = await trendingRes.json();

      if (statsData.success) setStats(statsData.data);
      if (recsData.success) setRecommendations(recsData.data);
      if (activityData.success) setRecentActivity(activityData.data);
      if (trendingData.success) setTrendingBooks(trendingData.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for chart data formatting
  const formatMonthlyData = () => {
    if (!adminStats?.monthlyActivity) return [];
    
    return adminStats.monthlyActivity.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      Activities: item.count
    }));
  };

  const formatGenreData = () => {
    if (!adminStats?.genreDistribution) return [];
    
    return adminStats.genreDistribution.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const updateReadingGoal = async (newTarget: number) => {
    try {
      const response = await fetch('/api/users/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: newTarget })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating reading goal:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to BookWorm</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your personalized dashboard</p>
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

  // If admin, render enhanced admin dashboard on the root page
  if (session.user?.role === 'admin') {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <main className="lg:col-span-3">

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.overview?.totalBooks ?? '-'}</div>
                  <p className="text-xs text-muted-foreground">Books in library</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.overview?.totalUsers ?? '-'}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats?.overview?.pendingReviews ?? '-'}</div>
                  <p className="text-xs text-muted-foreground">Reviews awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Books by Genre
                  </CardTitle>
                  <CardDescription>
                    Distribution of books across different genres
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {adminStats?.genreDistribution && adminStats.genreDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formatGenreData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {formatGenreData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} books`, 'Count']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-2">No genre data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Activity Trend
                  </CardTitle>
                  <CardDescription>
                    Your admin activity over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {adminStats?.monthlyActivity && adminStats.monthlyActivity.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatMonthlyData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Activities" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <TrendingUp className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-2">No activity data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/admin/books/new">Add New Book</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/books">Manage Books</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/users">Manage Users</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/reviews?status=pending">Moderate Reviews</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Library Status</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                  <Separator />
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/admin/settings">View Settings</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                {stats.booksRead} read
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                {stats.booksReading} reading
              </div>
            </div>
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
              ≈ {Math.round(stats.totalPagesRead * 2 / 60)} hours of reading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(stats.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Books</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyBooks}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recommendations & Goal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Reading Goal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Reading Goal {new Date().getFullYear()}
              </CardTitle>
              <CardDescription>
                Track your progress towards your annual reading goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.readingGoal.progress} / {stats.readingGoal.target}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stats.readingGoal.target - stats.readingGoal.progress} books to go
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stats.readingGoal.percentage}%
                  </div>
                </div>
                
                <Progress value={stats.readingGoal.percentage} className="h-3" />
                
                <div className="flex gap-3">
                  <Button 
                    size="sm"
                    onClick={() => updateReadingGoal(stats.readingGoal.target + 5)}
                  >
                    Increase Goal
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateReadingGoal(12)}
                  >
                    Reset to 12
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Books you might enjoy based on your reading history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No recommendations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add more books to your library to get personalized recommendations
                  </p>
                  <Button asChild>
                    <Link href="/browse">Browse Books</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Tabs defaultValue="for-you">
                    <TabsList className="mb-4">
                      <TabsTrigger value="for-you">For You</TabsTrigger>
                      <TabsTrigger value="trending">Trending</TabsTrigger>
                      <TabsTrigger value="similar">Similar Tastes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="for-you" className="space-y-4">
                      <RecommendationsList recommendations={recommendations} />
                    </TabsContent>

                    <TabsContent value="trending" className="space-y-4">
                      {trendingBooks.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">No trending books</h3>
                          <p className="text-muted-foreground">Trending books will appear here when available</p>
                        </div>
                      ) : (
                        <RecommendationsList
                          recommendations={trendingBooks.slice(0, 12).map(book => ({
                            book,
                            reason: 'Trending now',
                            reasonDetails: { popularity: book.totalShelves, communityRating: book.averageRating },
                            matchScore: computeMatchScoreFromBook(book)
                          }))}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="similar" className="space-y-4">
                      {recommendations.filter(r => r.reason && r.reason.includes('Similar') || (r.reasonDetails && r.reasonDetails.matchedGenre)).length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-semibold mb-2">No similar recommendations</h3>
                          <p className="text-muted-foreground">We couldn't find books that closely match your taste yet</p>
                        </div>
                      ) : (
                        <RecommendationsList
                          recommendations={recommendations.filter(r => (r.reasonDetails && r.reasonDetails.matchedGenre)).slice(0, 12)}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump right into your reading journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/browse">
                    <BookOpen className="w-6 h-6" />
                    <span>Browse Books</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/library">
                    <Bookmark className="w-6 h-6" />
                    <span>My Library</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/reading-goals">
                    <Target className="w-6 h-6" />
                    <span>Goals</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/tutorials">
                    <Award className="w-6 h-6" />
                    <span>Tutorials</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & Trending */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest reading activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        {activity.user.image ? (
                          <Image
                            src={activity.user.image}
                            alt={activity.user.name}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <span className="text-xs font-semibold">
                              {activity.user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user.name}</span>{' '}
                          {activity.type === 'added' && 'added'}
                          {activity.type === 'rated' && 'rated'}
                          {activity.type === 'finished' && 'finished reading'}
                          {activity.type === 'reviewed' && 'reviewed'}{' '}
                          <Link 
                            href={`/browse/${activity.book.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {activity.book.title}
                          </Link>
                          {activity.metadata?.rating && (
                            <span className="ml-1">
                              <Star className="w-3 h-3 inline fill-yellow-400 text-yellow-400 ml-1" />
                              {activity.metadata.rating}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/activity">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trending Now */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Now
              </CardTitle>
              <CardDescription>
                What others are reading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendingBooks.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No trending books</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingBooks.slice(0, 3).map((book) => (
                    <div key={book._id} className="flex gap-3">
                      <div className="relative w-12 h-16 flex-shrink-0">
                        <Image
                          src={book.coverImage}
                          alt={book.title}
                          fill
                          className="object-cover rounded"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          <Link 
                            href={`/browse/${book._id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {book.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          by {book.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">
                              {book.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="text-xs">
                              {book.totalShelves}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/browse?sortBy=popularity">View All Trending</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Favorite Genres */}
          {stats.favoriteGenres.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Top Genres</CardTitle>
                <CardDescription>
                  Based on your reading history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.favoriteGenres.map((genre, index) => (
                    <div key={genre} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <span className="font-medium">{genre}</span>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/browse?genres=${genre.toLowerCase()}`}>
                          Explore
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reading Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reading Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reading Time</span>
                  <span className="font-medium">
                    {Math.round(stats.totalPagesRead * 2 / 60)}h
                  </span>
                </div>
                <Progress 
                  value={(Math.round(stats.totalPagesRead * 2 / 60) / 100) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Monthly Progress</span>
                  <span className="font-medium">
                    {stats.monthlyBooks} books
                  </span>
                </div>
                <Progress 
                  value={(stats.monthlyBooks / stats.readingGoal.target) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completion Rate</span>
                  <span className="font-medium">
                    {stats.booksRead > 0 ? Math.round((stats.booksRead / stats.totalBooks) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.booksRead > 0 ? (stats.booksRead / stats.totalBooks) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready for your next read?</h3>
              <p className="text-muted-foreground">
                Discover new books tailored just for you
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/browse">
                  Browse Recommendations
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/library">
                  View Your Library
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}