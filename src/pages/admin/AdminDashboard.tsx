import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { PlatformStats } from '@/types';
import {
  Layers,
  Building2,
  CalendarCheck,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await AdminRepository.getPlatformStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load platform stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Super Admin Analytics | Adu Santhai" path="/admin/dashboard" />

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Platform Operations Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live metrics across the statewide Adu Santhai livestock marketplace
            </p>
          </div>
        </div>

        {/* Priority Moderation Alert Banner */}
        {stats && (stats.pendingListings > 0 || stats.pendingFarms > 0 || stats.totalReports > 0) && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Action Items Pending Moderation</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {stats.pendingListings} goats awaiting approval • {stats.pendingFarms} new farm applications • {stats.totalReports} unresolved user flags.
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {stats.pendingListings > 0 && (
                <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
                  <Link to="/admin/goats">Review Goats ({stats.pendingListings})</Link>
                </Button>
              )}
              {stats.pendingFarms > 0 && (
                <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  <Link to="/admin/farms">Review Farms ({stats.pendingFarms})</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Analytics KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <Layers className="h-5 w-5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">INVENTORY</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total Goats Listed</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalGoats ?? 0}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <Building2 className="h-5 w-5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">BREEDERS</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Verified Active Farms</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.activeFarms ?? 0}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-purple-600 mb-2">
              <CalendarCheck className="h-5 w-5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">HOLDS</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Active 24h Holds</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.activeBookings ?? 0}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">VOLUME</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Delivered Gross Volume</span>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </div>
          </div>
        </div>

        {/* Quick Links Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/goats"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-purple-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Goat Listing Moderation</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify pedigree photos, prices, vaccination claims, and approve partner listings.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 mt-4">
              Inspect Queue <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/admin/farms"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-purple-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Partner Farm Approvals</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review new breeder registration requests, inspect addresses, and configure quotas.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-4">
              Manage Farms <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            to="/admin/reports"
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-purple-300 hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Flag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Dispute & Incident Reports</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Investigate buyer flags on suspicious listings, inaccurate weights, or unreachable farms.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 mt-4">
              View Reports <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};
