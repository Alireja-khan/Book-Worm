'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Logo } from '@/components/shared/logo';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, User, ChevronDown, LogOut, Home, BookOpen, Library, Video, Settings, Shield, Users, Star, BookCheck } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

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

  // Navigation items based on user role
  const getNavItems = () => {
    if (!session?.user) {
      return [
        { href: '/', label: 'Home', icon: Home }
      ];
    }

    if (isAdmin) {
      return [
        { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { href: '/admin/books', label: 'Manage Books', icon: BookOpen },
        { href: '/admin/genres', label: 'Manage Genres', icon: Library },
        { href: '/admin/users', label: 'Manage Users', icon: Users },
        { href: '/admin/reviews', label: 'Moderate Reviews', icon: Star },
        { href: '/admin/tutorials', label: 'Tutorials', icon: Video }
      ];
    }

    // Regular user
    return [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/browse', label: 'Browse Books', icon: BookOpen },
      { href: '/library', label: 'My Library', icon: Library },
      { href: '/tutorials', label: 'Tutorials', icon: Video }
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
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
                      className={`h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
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
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          User Dashboard
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
                          <Link
                            href="/reading-goals"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <BookCheck className="h-4 w-4" />
                            Reading Goals
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
                    <BookOpen className="h-4 w-4" />
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
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t space-y-3">
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
                  
                  {!isAdmin && (
                    <>
                      <Link
                        href="/reading-goals"
                        className="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg hover:bg-accent transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookCheck className="h-5 w-5" />
                        Reading Goals
                      </Link>
                    </>
                  )}
                  
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
                      <BookOpen className="h-5 w-5" />
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}