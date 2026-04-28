import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 dark:bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
