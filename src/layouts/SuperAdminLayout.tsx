import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import {
  BarChart3,
  CheckSquare,
  Building2,
  CalendarCheck,
  Users,
  Flag,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Super Admin Top Header - Clean White & Emerald */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-xs">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Super Admin Control Hub
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform-wide livestock moderation, breeder verification, and customer complaints
                </p>
              </div>
            </div>

            <Link
              to="/marketplace"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Public Marketplace
            </Link>
          </div>

          {/* Navigation Bar */}
          <nav className="mt-6 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4 text-xs font-semibold">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <BarChart3 className="h-4 w-4" /> Platform Analytics
            </NavLink>

            <NavLink
              to="/admin/goats"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <CheckSquare className="h-4 w-4" /> Goat Moderation
            </NavLink>

            <NavLink
              to="/admin/farms"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Building2 className="h-4 w-4" /> Farm Approvals
            </NavLink>

            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <CalendarCheck className="h-4 w-4" /> Platform Bookings
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Users className="h-4 w-4" /> User Accounts
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Flag className="h-4 w-4" /> Listing Reports & Flags
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
    </div>
  );
};
