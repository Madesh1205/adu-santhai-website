import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import {
  ShieldAlert,
  BarChart3,
  CheckSquare,
  Building2,
  Flag,
  ArrowLeft,
} from 'lucide-react';

export const SuperAdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Navbar />

      {/* Super Admin Top Header */}
      <div className="bg-slate-950 text-white py-6 border-b border-purple-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white font-black shadow-lg shadow-purple-950">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Super Admin Control Hub</h1>
                <p className="text-xs text-purple-300">
                  Global moderation, farm approvals, dispute resolution & audit logs
                </p>
              </div>
            </div>

            <Link
              to="/marketplace"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Public Marketplace
            </Link>
          </div>

          {/* Navigation Bar */}
          <nav className="mt-6 flex gap-2 overflow-x-auto border-t border-slate-800 pt-4 text-xs font-medium">
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <BarChart3 className="h-4 w-4" /> Platform Analytics
            </NavLink>

            <NavLink
              to="/admin/goats"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <CheckSquare className="h-4 w-4" /> Goat Moderation
            </NavLink>

            <NavLink
              to="/admin/farms"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Building2 className="h-4 w-4" /> Farm Verification
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Flag className="h-4 w-4" /> Reports & Flags
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Super Admin Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
};
