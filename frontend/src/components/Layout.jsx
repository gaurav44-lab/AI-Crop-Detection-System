import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { path: '/reports/new', label: 'New Report', icon: '＋', highlight: true },
  { path: '/reports', label: 'My Reports', icon: '◈' },
  { path: '/advisories', label: 'Advisories', icon: '◎' },
  { path: '/community', label: 'Community', icon: '◉' },
  { path: '/profile', label: 'Profile', icon: '◐' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a1a0e] flex font-body">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-forest-950 border-r border-forest-800/50 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-forest-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-400 to-earth-500 rounded-xl flex items-center justify-center text-xl">
              🌿
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">CropGuard</h1>
              <p className="text-forest-400 text-xs">AI Disease Detection</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${item.highlight
                  ? 'bg-gradient-to-r from-forest-600 to-forest-500 text-white shadow-lg shadow-forest-900/50 hover:from-forest-500 hover:to-forest-400'
                  : isActive
                    ? 'bg-forest-800/80 text-forest-200 border border-forest-700/50'
                    : 'text-forest-400 hover:bg-forest-900/50 hover:text-forest-200'
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-forest-800/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gradient-to-br from-earth-400 to-earth-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-forest-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-forest-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg text-sm transition-all duration-200 text-left"
          >
            → Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-forest-950 border-b border-forest-800/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-forest-300 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-display font-bold text-white">🌿 CropGuard</h1>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
