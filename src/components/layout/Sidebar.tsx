'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {Home, BookOpen, Library, Video, Settings, ChevronLeft, ChevronRight ,Bookmark ,TrendingUp ,Users ,Shield ,Star ,BookCheck ,Bell ,HelpCircle ,FileText ,Download ,History ,Heart ,BarChart3 ,Award ,Globe ,Clock ,Folder ,Tag ,User ,LogOut ,Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Logo } from '../shared/logo';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: SidebarItem[];
  section?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const isAdmin = session?.user?.role === 'admin';

  // Initialize open items based on current path
  useEffect(() => {
    if (pathname.includes('/books/')) {
      setOpenItems(prev => [...new Set([...prev, 'books'])]);
    }
    if (pathname.includes('/admin/')) {
      setOpenItems(prev => [...new Set([...prev, 'admin'])]);
    }
  }, [pathname]);

  const toggleItem = (label: string) => {
    setOpenItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Get navigation items based on user role
  const getNavItems = (): SidebarItem[] => {
    if (!session?.user) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/browse', label: 'Browse Books', icon: BookOpen },
        { href: '/tutorials', label: 'Tutorials', icon: Video },
        { href: '/login', label: 'Sign In', icon: User },
      ];
    }

    if (isAdmin) {
      return [
        {
          section: 'Dashboard',
          href: '/admin/dashboard',
          label: 'Overview',
          icon: Home,
        },
        {
          section: 'Content Management',
          href: '/admin/books',
          label: 'Manage Books',
          icon: BookOpen,
        },
        {
          href: '/admin/genres',
          label: 'Manage Genres',
          icon: Folder,
        },
        {
          href: '/admin/users',
          label: 'Manage Users',
          icon: Users,
        },
        {
          href: '/admin/reviews',
          label: 'Manage Reviews',
          icon: Star,
        },
        {
          section: 'Analytics',
          href: '/admin/analytics',
          label: 'Analytics',
          icon: BarChart3,
          children: [
            { href: '/admin/analytics/overview', label: 'Overview', icon: BarChart3 },
            { href: '/admin/analytics/books', label: 'Book Stats', icon: BookOpen },
            { href: '/admin/analytics/users', label: 'User Stats', icon: Users },
            { href: '/admin/analytics/revenue', label: 'Revenue', icon: TrendingUp },
          ],
        },
        {
          section: 'System',
          href: '/admin/settings',
          label: 'Settings',
          icon: Settings,
          children: [
            { href: '/admin/settings/general', label: 'General', icon: Settings },
            { href: '/admin/settings/appearance', label: 'Appearance', icon: Globe },
            { href: '/admin/settings/notifications', label: 'Notifications', icon: Bell },
            { href: '/admin/settings/backup', label: 'Backup', icon: Download },
          ],
        },
      ];
    }

    // Regular user items
    return [
      {
        section: 'Dashboard',
        href: '/',
        label: 'Overview',
        icon: Home,
      },
      {
        section: 'Reading',
        href: '/library',
        label: 'My Library',
        icon: Library,
      },
      {
        href: '/browse',
        label: 'Browse Books',
        icon: BookOpen,
      },
      {
        section: 'Community',
        href: '/community',
        label: 'Community',
        icon: Users,
        children: [
          { href: '/community/reviews', label: 'Reviews', icon: Star },
          { href: '/community/discussions', label: 'Discussions', icon: Users },
          { href: '/community/recommendations', label: 'Recommendations', icon: Heart },
        ],
      },
      {
        href: '/tutorials',
        label: 'Tutorials',
        icon: Video,
      },
      {
        section: 'Account',
        href: '/profile',
        label: 'Profile',
        icon: User,
        children: [
          { href: '/profile/settings', label: 'Settings', icon: Settings },
          { href: '/profile/reading-history', label: 'Reading History', icon: History },
          { href: '/profile/notifications', label: 'Notifications', icon: Bell, badge: 3 },
          { href: '/profile/security', label: 'Security', icon: Shield },
        ],
      },
    ];
  };

  const navItems = getNavItems();

  const renderSidebarItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const isOpen = openItems.includes(item.label);

    return (
      <div key={item.href} className="mb-1">
        {/* Section Title */}
        {item.section && depth === 0 && !isCollapsed && (
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {item.section}
          </div>
        )}

        {/* Main Item */}
        <div>
          <div className="flex items-center">
            <Link
              href={hasChildren ? '#' : item.href}
              onClick={(e) => {
                if (hasChildren) {
                  e.preventDefault();
                  toggleItem(item.label);
                }
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 flex-1",
                "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                isActive && "bg-primary/10 text-primary font-medium",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive && "text-primary"
              )} />
              
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  
                  {item.badge && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  
                  {hasChildren && (
                    <ChevronRight className={cn(
                      "h-4 w-4 ml-2 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )} />
                  )}
                </>
              )}
            </Link>
          </div>

          {/* Children Items */}
          {hasChildren && !isCollapsed && isOpen && (
            <div className="ml-6 mt-1 space-y-1 border-l pl-3">
              {item.children!.map((child) => {
                const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isChildActive && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <span className="flex-1 truncate">{child.label}</span>
                    {child.badge && (
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <Logo></Logo>
          </div>
        ) : (
          <BookOpen className="h-6 w-6 text-primary mx-auto" />
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3 sidebar-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => renderSidebarItem(item))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t p-3">
        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors">
              <Download className="h-3 w-3" />
              Export
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80 transition-colors">
              <FileText className="h-3 w-3" />
              Report
            </button>
          </div>
        )}

        {/* User Info */}
        {session?.user && !isCollapsed && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/50">
            {session.user.image ? (
              <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-background transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Collapsed User Info */}
        {session?.user && isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}