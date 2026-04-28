import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../ThemeProvider';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function Header({ setSidebarOpen }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button size="icon" variant="outline" className="sm:hidden" onClick={() => setSidebarOpen(true)}>
        <span className="sr-only">Toggle Menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="9" y1="3" y2="21"/></svg>
      </Button>
      
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search crops, reports, or analyses..."
          className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
        <span className="sr-only">Toggle notifications</span>
      </Button>

      <Avatar className="h-8 w-8 cursor-pointer border">
        <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </header>
  );
}
