import React from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf, LayoutDashboard, Search, Camera, FileText, History, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reports/new', label: 'Crop Analysis', icon: Search },
  { path: '/live', label: 'Live Detection', icon: Camera },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/advisories', label: 'Alerts', icon: Bell, badge: true },
  { path: '/profile', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden" onClick={() => setOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r bg-background transition-transform sm:flex sm:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-14 items-center border-b px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg">CropAI</span>
          </NavLink>
        </div>
        <nav className="flex-1 overflow-auto py-4">
          <ul className="grid gap-1 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all
                      ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        3
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto border-t p-4">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
