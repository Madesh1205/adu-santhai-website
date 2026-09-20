import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, CalendarCheck, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, end: true },
    { label: 'Market', path: '/marketplace', icon: Compass },
    { label: 'Wishlist', path: user ? '/wishlist' : '/login', icon: Heart },
    { label: 'Bookings', path: user ? '/my-bookings' : '/login', icon: CalendarCheck },
    { label: 'Account', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md safe-area-pb shadow-lg">
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 transition-all ${
                  isActive
                    ? 'text-emerald-800 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      isActive ? 'bg-emerald-50 text-emerald-800' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
