'use client';

import { Sidebar } from './Sidebar';
import { Navbar } from './navbar';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={sidebarCollapsed ? 'ml-16' : 'ml-64'}>
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}