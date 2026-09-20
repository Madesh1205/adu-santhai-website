import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { MobileNav } from '@/components/navigation/MobileNav';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  CalendarCheck,
  Building2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

export const FarmAdminLayout: React.FC = () => {
  const { farm } = useAuth();

  const isPending = farm?.status === 'PENDING';
  const isSuspended = farm?.status === 'SUSPENDED';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      {/* Farm Banner Header */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-md shadow-emerald-950">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white">
                    {farm?.name || 'Farm Admin Portal'}
                  </h1>
                  {farm && (
                    <Badge
                      variant={
                        farm.status === 'APPROVED'
                          ? 'default'
                          : farm.status === 'PENDING'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-[11px]"
                    >
                      {farm.status}
                    </Badge>
                  )}
                  {farm?.isAmmalOwnFarm && (
                    <Badge variant="default" className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                      CENTRAL HUB
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Farm Code: <span className="font-mono text-emerald-400 font-bold">{farm?.farmCode || 'N/A'}</span> • {farm?.locationDistrict || 'Tamil Nadu'}
                </p>
              </div>
            </div>

            {/* Quota display */}
            <div className="flex items-center gap-4 bg-slate-800/80 rounded-xl px-4 py-2.5 border border-slate-700">
              <div className="text-right text-xs">
                <span className="text-slate-400 block">Listing Quota:</span>
                <span className="font-bold text-white">
                  {farm?.isAmmalOwnFarm ? 'Unlimited (Ammal Farm)' : `Max ${farm?.goatListingLimit ?? 2} Active Goats`}
                </span>
              </div>
              <Link
                to={`/farms/${farm?.id}`}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Public Profile <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {isPending && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Your farm application is currently under review by Ammal Farm administration. Goats you list will be visible on the marketplace once approved.
              </span>
            </div>
          )}

          {isSuspended && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-xs text-red-200">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>
                This farm has been temporarily suspended. Please contact platform support at +91 63808 98358.
              </span>
            </div>
          )}

          {/* Sub Navigation Bar */}
          <nav className="mt-6 flex gap-2 overflow-x-auto border-t border-slate-800 pt-4 text-xs font-medium">
            <NavLink
              to="/farm/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </NavLink>

            <NavLink
              to="/farm/goats"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Layers className="h-4 w-4" /> My Goats
            </NavLink>

            <NavLink
              to="/farm/goats/new"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <PlusCircle className="h-4 w-4" /> Add Goat
            </NavLink>

            <NavLink
              to="/farm/bookings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <CalendarCheck className="h-4 w-4" /> Bookings & Orders
            </NavLink>

            <NavLink
              to="/farm/settings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Building2 className="h-4 w-4" /> Farm Profile
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};
