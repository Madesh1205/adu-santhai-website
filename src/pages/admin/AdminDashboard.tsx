import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PlatformStats } from '@/types';
import {
  Layers,
  Building2,
  CalendarCheck,
  Flag,
  ArrowRight,
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
        <div className="h-8 w-1/3 bg-slate-100 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Super Admin Analytics | Adu Santhai" path="/admin" />

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Operations Overview</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live metrics across the statewide Adu Santhai livestock marketplace
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/goats">
              <Button variant="default" size="sm" className="font-bold">
                Moderate Listings
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core Platform KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <Layers className="h-5 w-5" />
              <Badge variant="verified" className="text-[10px]">TOTAL</Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Total Goat Listings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalGoats || 0}</div>
            <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
              {stats?.pendingListings || 0} pending review
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <Building2 className="h-5 w-5" />
              <Badge variant="verified" className="text-[10px]">BREEDERS</Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Registered Farms</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {(stats?.activeFarms || 0) + (stats?.pendingFarms || 0) + (stats?.suspendedFarms || 0)}
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
              {stats?.activeFarms || 0} active verified farms
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <CalendarCheck className="h-5 w-5" />
              <Badge variant="reserved" className="text-[10px]">HOLDS</Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Active 24h Holds</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.activeBookings || 0}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats?.completedBookings || 0} completed sales
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-red-600 mb-2">
              <Flag className="h-5 w-5" />
              <Badge variant="destructive" className="text-[10px]">ALERTS</Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Pending Reports</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalReports || 0}</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Buyer complaints</span>
          </div>
        </div>

        {/* Action Moderation Queues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Goat Listings Moderation</h3>
              <Badge variant="verified" className="text-[10px]">QUEUE</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Inspect incoming partner goat submissions, verify health photos, check pricing, and feature top sires.
            </p>
            <Link to="/admin/goats">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
                <span>Moderate Goats</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Farm Breeder Verification</h3>
              <Badge variant="earth" className="text-[10px]">APPROVALS</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review new partner farm applications, assign ear tag codes, verify physical premises, and set listing quotas.
            </p>
            <Link to="/admin/farms">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
                <span>Review Farms</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Disputes & Buyer Reports</h3>
              <Badge variant="destructive" className="text-[10px]">FLAGS</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Investigate buyer flags regarding incorrect weights, missed health disclosures, or breeder communications.
            </p>
            <Link to="/admin/reports">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1">
                <span>Resolve Reports</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
