import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import type { AppNotification } from '@/types';
import { LocationPill } from '@/components/location/LocationPill';
import {
  Bell,
  Heart,
  User,
  LogOut,
  Shield,
  CalendarCheck,
  Menu,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isFarmAdmin, isSuperAdmin, signOut } = useAuth();
  const location = useLocation();

  const [scrolled, setScrolled] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Dynamic header scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notification and wishlist counts and subscribe to realtime updates
  useEffect(() => {
    if (user) {
      NotificationRepository.getUnreadCount(user.id)
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0));

      WishlistRepository.getWishlistGoatIds(user.id)
        .then((ids) => setWishlistCount(ids ? ids.length : 0))
        .catch(() => setWishlistCount(0));

      // Realtime notification listener
      const unsubscribe = NotificationRepository.subscribeToNotifications(user.id, (newNotif) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [newNotif, ...prev]);
      });

      return () => {
        unsubscribe();
      };
    } else {
      setUnreadCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  const handleOpenNotifications = async () => {
    if (!user) return;
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      const list = await NotificationRepository.getNotifications(user.id, 6);
      setNotifications(list);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await NotificationRepository.markAllAsRead(user.id);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const navLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'Farms', path: '/farms' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'About', path: '/#about' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs py-2.5'
          : 'bg-white border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Ammal Farm Heritage */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-emerald-800/15 group-hover:border-emerald-800 transition-colors">
              <img
                src="/logo.jpg"
                alt="Ammal Farm Adu Santhai"
                className="h-full w-full object-contain p-0.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors leading-none">
                Adu Santhai
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-800 mt-0.5">
                Ammal Farm Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-emerald-800 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Location Selector Pill */}
          <LocationPill variant="compact" className="hidden sm:inline-flex" />
          {/* Wishlist Button */}
          {user && (
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-800 text-[10px] font-bold text-white">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
          )}

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleOpenNotifications}
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B7791F] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <Badge variant="earth" className="text-[10px]">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl transition-colors ${
                            !n.isRead ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                    <Link
                      to="/notifications"
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 pr-3 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800 text-white font-bold text-xs">
                  {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {profile?.name || 'My Account'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {profile?.name || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Role: {profile?.role || 'Customer'}
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
                    >
                      <Shield className="h-4 w-4 text-emerald-700" />
                      Super Admin Hub
                    </Link>
                  )}

                  {isFarmAdmin && (
                    <Link
                      to="/farm"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-emerald-700" />
                      Farm Admin Portal
                    </Link>
                  )}

                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <CalendarCheck className="h-4 w-4 text-slate-500" />
                    My Reservations
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-500" />
                    Account Profile
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Log In
              </Button>
            </Link>
          )}

          {/* Primary CTA: Browse Goats */}
          <Link to="/marketplace" className="hidden sm:inline-flex">
            <Button variant="default" size="sm" className="font-bold">
              Browse Goats
            </Button>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-800"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            {!user ? (
              <>
                <Link to="/login" className="flex-1">
                  <Button variant="outline" size="default" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/marketplace" className="flex-1">
                  <Button variant="default" size="default" className="w-full">
                    Browse Goats
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/marketplace" className="w-full">
                <Button variant="default" size="default" className="w-full">
                  Browse Goats
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
