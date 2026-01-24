'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Clock, 
  Shield, 
  TrendingUp,
  Activity,
  Star
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

interface DashboardStats {
  overview: {
    totalBooks: number;
    totalUsers: number;
    pendingReviews: number;
  };
  genreDistribution: Array<{
    _id: string;
    count: number;
  }>;
  adminInfo: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
  };
  recentActivities: Array<{
    _id: string;
    activityType: string;
    targetBook?: { title: string };
    targetReview?: { content: string };
    createdAt: string;
    metadata?: any;
  }>;
  activityStats: Array<{
    _id: string;
    count: number;
  }>;
  monthlyActivity: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'added_to_shelf': return <BookOpen className="h-4 w-4" />;
      case 'rated_book': return <Star className="h-4 w-4" />;
      case 'finished_reading': return <TrendingUp className="h-4 w-4" />;
      case 'wrote_review': return <MessageSquare className="h-4 w-4" />;
      case 'followed_user': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'added_to_shelf': return 'Added book to shelf';
      case 'rated_book': return 'Rated a book';
      case 'finished_reading': return 'Finished reading';
      case 'wrote_review': return 'Wrote a review';
      case 'followed_user': return 'Followed user';
      default: return activityType;
    }
  };

  const formatMonthlyData = () => {
    if (!stats?.monthlyActivity) return [];
    
    return stats.monthlyActivity.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      Activities: item.count
    }));
  };

  const formatGenreData = () => {
    if (!stats?.genreDistribution) return [];
    
    return stats.genreDistribution.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Unable to load dashboard</h3>
        <p className="mt-2 text-muted-foreground">There was an error loading the dashboard data.</p>
        <Button onClick={fetchDashboardStats} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your library today.</p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalBooks}</div>
            <p className="text-xs text-muted-foreground">Books in library</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Reviews awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={stats.adminInfo.image} alt={stats.adminInfo.name} />
                <AvatarFallback className="text-lg">
                  {stats.adminInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{stats.adminInfo.name}</h3>
                <p className="text-sm text-muted-foreground">{stats.adminInfo.email}</p>
                <Badge className="mt-1">{stats.adminInfo.role.toUpperCase()}</Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member since {new Date(stats.adminInfo.createdAt).toLocaleDateString()}</span>
              </div>
              {stats.adminInfo.lastLogin && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last login {new Date(stats.adminInfo.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Books by Genre Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Books Distribution by Genre
            </CardTitle>
            <CardDescription>
              Distribution of books across different genres in your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest actions in the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                stats.recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {getActivityLabel(activity.activityType)}
                      </p>
                      {activity.targetBook && (
                        <p className="text-xs text-muted-foreground truncate">
                          Book: {activity.targetBook.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Trend
            </CardTitle>
            <CardDescription>
              Your activity over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
