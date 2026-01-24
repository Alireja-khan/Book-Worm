'use client';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useState, useRef, useEffect } from 'react';
import { 
  Menu, X, User, ChevronDown, LogOut, Shield, 
  Home, BookOpen, Video, Library, Target, Users, 
  Star, Heart, Settings, History, Bell, 
  Folder, Tag, Download, Clock, BookCheck, 
  BarChart3, TrendingUp, Globe, 
  ChevronRight
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Get user's display name
  const getUserDisplayName = () => {
    return session?.user?.name || session?.user?.email?.split('@')[0] || 'User';
  };

  // Get current route name and icon for display
  const getCurrentRouteInfo = () => {
    const routeInfo: Record<string, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
      // Public routes
      '/': { name: 'Home', icon: Home },
      '/browse': { name: 'Browse Books', icon: BookOpen },
      '/tutorials': { name: 'Tutorials', icon: Video },
      '/login': { name: 'Sign In', icon: User },
      '/register': { name: 'Register', icon: User },
      
      // User routes
      '/dashboard': { name: 'Dashboard', icon: Home },
      '/library': { name: 'My Library', icon: Library },
      '/reading-goals': { name: 'Reading Goals', icon: Target },
      '/community': { name: 'Community', icon: Users },
      '/community/reviews': { name: 'Reviews', icon: Star },
      '/community/discussions': { name: 'Discussions', icon: Users },
      '/community/recommendations': { name: 'Recommendations', icon: Heart },
      
      // Profile routes
      '/profile': { name: 'My Profile', icon: User },
      '/profile/settings': { name: 'Settings', icon: Settings },
      '/profile/reading-history': { name: 'Reading History', icon: History },
      '/profile/notifications': { name: 'Notifications', icon: Bell },
      '/profile/security': { name: 'Security', icon: Shield },
      
      // Admin routes
      '/admin/dashboard': { name: 'Admin Dashboard', icon: Home },
      '/admin/books': { name: 'Manage Books', icon: BookOpen },
      '/admin/books/all': { name: 'All Books', icon: BookOpen },
      '/admin/books/add': { name: 'Add New Book', icon: BookOpen },
      '/admin/books/categories': { name: 'Book Categories', icon: Tag },
      '/admin/books/import': { name: 'Import Books', icon: Download },
      '/admin/genres': { name: 'Manage Genres', icon: Folder },
      '/admin/genres/all': { name: 'All Genres', icon: Folder },
      '/admin/genres/add': { name: 'Add New Genre', icon: Folder },
      '/admin/users': { name: 'Manage Users', icon: Users },
      '/admin/users/all': { name: 'All Users', icon: Users },
      '/admin/users/add': { name: 'Add User', icon: Users },
      '/admin/users/roles': { name: 'User Roles', icon: Shield },
      '/admin/reviews': { name: 'Moderate Reviews', icon: Star },
      '/admin/reviews/pending': { name: 'Pending Reviews', icon: Clock },
      '/admin/reviews/approved': { name: 'Approved Reviews', icon: BookCheck },
      '/admin/reviews/reported': { name: 'Reported Reviews', icon: Bell },
      '/admin/analytics': { name: 'Analytics', icon: BarChart3 },
      '/admin/analytics/overview': { name: 'Analytics Overview', icon: BarChart3 },
      '/admin/analytics/books': { name: 'Book Analytics', icon: BookOpen },
      '/admin/analytics/users': { name: 'User Analytics', icon: Users },
      '/admin/analytics/revenue': { name: 'Revenue Analytics', icon: TrendingUp },
      '/admin/settings': { name: 'Settings', icon: Settings },
      '/admin/settings/general': { name: 'General Settings', icon: Settings },
      '/admin/settings/appearance': { name: 'Appearance', icon: Globe },
      '/admin/settings/notifications': { name: 'Notification Settings', icon: Bell },
      '/admin/settings/backup': { name: 'Backup Settings', icon: Download },
    };

    // Try exact match first
    if (routeInfo[pathname]) {
      return routeInfo[pathname];
    }

    // Try prefix match for nested routes
    for (const [route, info] of Object.entries(routeInfo)) {
      if (pathname.startsWith(route + '/')) {
        return info;
      }
    }

    // Extract from pathname as fallback
    const pathParts = pathname.split('/').filter(Boolean);
    let icon = Home; // Default icon
    let name = 'Page';

    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Convert kebab-case to Title Case
      name = lastPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    return { name, icon };
  };

  // Get current route info
  const currentRoute = getCurrentRouteInfo();
  const RouteIcon = currentRoute.icon;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side: Current Route Name with Icon */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-lg font-semibold">{currentRoute.name}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {isAdmin ? '' : session?.user ? '' : 'Book Reading Platform'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side: Theme toggle and User dropdown */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {session?.user ? (
              // User is logged in - show user dropdown
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  aria-label="User menu"
                >
                  <div className="flex items-center gap-2">
                    {session.user.image ? (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                        <Image
                          src={session.user.image}
                          alt={getUserDisplayName()}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="text-left hidden lg:block">
                      <span className="text-sm font-medium block truncate max-w-[120px]">
                        {getUserDisplayName()}
                      </span>
                      {isAdmin && (
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isUserDropdownOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>
                
                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border bg-background shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b flex items-center gap-3">
                      {session.user.image ? (
                        <div className="relative h-12 w-12 rounded-full overflow-hidden border flex-shrink-0">
                          <Image
                            src={session.user.image}
                            alt={getUserDisplayName()}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border flex-shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            <Shield className="h-3 w-3" />
                            Administrator
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      {isAdmin ? (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <Link
                          href="/"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          My Dashboard
                        </Link>
                      )}
                      
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile Settings
                      </Link>
                      
                      {!isAdmin && (
                        <>
                          <Link
                            href="/library"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <Library className="h-4 w-4" />
                            My Library
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - show auth buttons
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register" className="flex items-center gap-2">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-3">
            {session?.user ? (
              <>
                <div className="px-3 py-3 rounded-lg bg-accent/50 flex items-center gap-3">
                  {session.user.image ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border flex-shrink-0">
                      <Image
                        src={session.user.image}
                        alt={getUserDisplayName()}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
                
                <Button 
                  variant="destructive" 
                  className="w-full mt-2" 
                  size="lg"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login" className="flex items-center justify-center gap-2">
                    <User className="h-5 w-5" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  className="w-full" 
                  size="lg" 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register" className="flex items-center justify-center gap-2">
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}