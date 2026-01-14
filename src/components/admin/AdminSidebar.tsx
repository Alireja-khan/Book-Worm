'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Users, 
  Star, 
  Library, 
  Video, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const AdminSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/books', label: 'Manage Books', icon: BookOpen },
    { href: '/admin/genres', label: 'Manage Genres', icon: Library },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/reviews', label: 'Moderate Reviews', icon: Star },
    { href: '/admin/tutorials', label: 'Tutorials', icon: Video },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-md border bg-background hover:bg-accent"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          Menu
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`lg:block ${
          isMobileMenuOpen ? 'block' : 'hidden'
        } lg:w-64 bg-background border rounded-lg p-4`}
      >
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;