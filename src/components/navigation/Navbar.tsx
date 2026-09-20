import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import type { AppNotification } from '@/types';
import {
  Search,
  Bell,
  Heart,
  PlusCircle,
  User,
  LogOut,
  Shield,
  LayoutDashboard,
  CalendarCheck,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isFarmAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on path change
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

  // Fetch notification and wishlist counts
  useEffect(() => {
    if (user) {
      NotificationRepository.getUnreadCount(user.id).then(setUnreadCount);
      WishlistRepository.getWishlistGoatIds(user.id).then((ids) => setWishlistCount(ids.length));
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
              <span className="text-xl font-black tracking-tight">AS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors">
                ADU SANTHAI
              </span>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                Ammal Farm Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              to="/marketplace"
              className={`hover:text-emerald-600 transition-colors ${
                location.pathname === '/marketplace' ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              Browse Goats
            </Link>
            <Link
              to="/farms"
              className={`hover:text-emerald-600 transition-colors ${
                location.pathname === '/farms' ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              Verified Farms
            </Link>
          </nav>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex relative w-64 xl:w-80 items-center"
        >
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search Boer, Sirohi, Kanni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </form>

        {/* Action Controls & User Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to={isFarmAdmin ? '/farm/goats/new' : '/register-farm'}
            className={buttonVariants({
              size: 'sm',
              className: 'hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs',
            })}
          >
            <PlusCircle className="h-4 w-4" />
            <span>List Goat</span>
          </Link>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Notifications Dropdown */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleOpenNotifications}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-emerald-600 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-1">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 text-xs rounded-lg transition-colors ${
                            notif.isRead ? 'text-slate-600' : 'bg-emerald-50/60 text-slate-900 font-medium'
                          }`}
                        >
                          <p className="font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <Link
                      to="/notifications"
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account Menu / Auth Buttons */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full p-1 border border-slate-200 hover:border-emerald-500 transition-colors"
                aria-label="User profile menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 text-sm truncate">{profile?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <Badge variant="secondary" className="mt-1.5 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      {profile?.role || 'CUSTOMER'}
                    </Badge>
                  </div>

                  <div className="py-1 text-xs text-slate-700 space-y-0.5">
                    <Link
                      to="/my-bookings"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors"
                    >
                      <CalendarCheck className="h-4 w-4 text-emerald-600" />
                      <span>My Bookings</span>
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-600" />
                      <span>Account Profile</span>
                    </Link>

                    {isFarmAdmin && (
                      <Link
                        to="/farm/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-emerald-50 text-emerald-800 font-semibold transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                        <span>Farm Admin Portal</span>
                      </Link>
                    )}

                    {isSuperAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-purple-50 text-purple-900 font-semibold transition-colors"
                      >
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span>Super Admin Portal</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-xs' })}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={buttonVariants({
                  size: 'sm',
                  className: 'text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold',
                })}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search Boer, Sirohi, Kanni..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm"
            />
          </form>

          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link to="/marketplace" className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Browse Marketplace
            </Link>
            <Link to="/farms" className="py-2 px-3 rounded-lg hover:bg-slate-50">
              Verified Farms
            </Link>
            <Link to={isFarmAdmin ? '/farm/goats/new' : '/register-farm'} className="py-2 px-3 rounded-lg hover:bg-emerald-50 text-emerald-700 font-bold">
              + Post Goat Listing
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
