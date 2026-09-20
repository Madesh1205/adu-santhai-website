import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Plus, CalendarCheck, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export const MobileNav: React.FC = () => {
  const { user, isFarmAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md safe-area-pb">
      <div className="grid h-16 grid-cols-5 items-center px-2">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* Marketplace */}
        <NavLink
          to="/marketplace"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <Compass className="h-5 w-5 mb-0.5" />
          <span>Market</span>
        </NavLink>

        {/* Sell / List Goat (Centered Highlight) */}
        <div className="flex items-center justify-center">
          <NavLink
            to={isFarmAdmin ? '/farm/goats/new' : '/register-farm'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform"
            aria-label="Sell or list goat"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </NavLink>
        </div>

        {/* Bookings */}
        <NavLink
          to={user ? '/my-bookings' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <CalendarCheck className="h-5 w-5 mb-0.5" />
          <span>Bookings</span>
        </NavLink>

        {/* Profile / Account */}
        <NavLink
          to={user ? '/profile' : '/login'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`
          }
        >
          <User className="h-5 w-5 mb-0.5" />
          <span>Account</span>
        </NavLink>
      </div>
    </nav>
  );
};
