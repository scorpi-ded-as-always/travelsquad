import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import { disconnectSocket } from '@/hooks/useSocket';
import {
  Compass, LayoutDashboard, Users, Zap, User, LogOut, Plus, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/squads', label: 'Squads', icon: Users },
  { to: '/matches', label: 'Matches', icon: Zap },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border fixed h-full z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-border">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg ts-gradient-hero flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900">TravelSquad</span>
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-ocean-50 text-ocean-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-border">
            <NavLink
              to="/trips/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-ocean-500 text-white hover:bg-ocean-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Plan a Trip
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <NavLink
            to="/profile"
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full',
              isActive ? 'bg-ocean-50 text-ocean-600' : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-ocean-100 flex items-center justify-center text-ocean-600 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.homeCity || 'Traveler'}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg ts-gradient-hero flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-slate-900">TravelSquad</span>
        </NavLink>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white pt-16 px-3 py-4" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive ? 'bg-ocean-50 text-ocean-600' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/trips/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-ocean-500 text-white mt-4"
              >
                <Plus className="w-4 h-4" />
                Plan a Trip
              </NavLink>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
