import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatRepository } from '@/repositories/GoatRepository';
import { BookingRepository } from '@/repositories/BookingRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Goat, Booking } from '@/types';
import {
  Layers,
  Clock,
  CheckCircle2,
  CalendarCheck,
  PlusCircle,
  PhoneCall,
  Building2,
} from 'lucide-react';

export const FarmDashboard: React.FC = () => {
  const { farm } = useAuth();
  const [goats, setGoats] = useState<Goat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      if (!farm) return;
      setLoading(true);
      try {
        const [farmGoats, farmBookings] = await Promise.all([
          GoatRepository.getMyFarmGoats(farm.id),
          BookingRepository.getFarmBookings(farm.id),
        ]);
        setGoats(farmGoats);
        setBookings(farmBookings);
      } catch (err) {
        console.error('Failed to load farm dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [farm]);

  if (!farm) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">No Farm Profile Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          You are not currently linked to an active farm. Please register your farm to list livestock.
        </p>
        <Button asChild className="mt-4 bg-emerald-600 text-white text-xs">
          <Link to="/register-farm">Register Farm</Link>
        </Button>
      </div>
    );
  }

  const activeGoatsCount = goats.filter((g) => g.status === 'AVAILABLE').length;
  const reservedGoatsCount = goats.filter((g) => g.status === 'RESERVED' || g.status === 'BOOKING_PENDING').length;
  const soldGoatsCount = goats.filter((g) => g.status === 'SOLD' || g.status === 'COMPLETED').length;
  const quota = farm.isAmmalOwnFarm ? 'Unlimited' : `${activeGoatsCount} / ${farm.goatListingLimit}`;

  return (
    <>
      <SEOHead title={`${farm.name} Dashboard | Adu Santhai`} path="/farm/dashboard" />

      <div className="space-y-8">
        {/* Top Welcome Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Welcome back, {farm.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status of your herd listings, holds, and customer inquiries
            </p>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs">
            <Link to="/farm/goats/new">
              <PlusCircle className="h-4 w-4" />
              <span>List New Goat</span>
            </Link>
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <Layers className="h-5 w-5" />
              <Badge variant="default" className="text-[10px] bg-emerald-50 text-emerald-800">
                ACTIVE
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Active Listings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{activeGoatsCount}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <Clock className="h-5 w-5" />
              <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-800">
                24H HOLDS
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Reserved on Hold</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{reservedGoatsCount}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <Badge variant="slate" className="text-[10px]">
                SOLD
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Goats Sold</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{soldGoatsCount}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-2">
              <CalendarCheck className="h-5 w-5" />
              <span className="font-mono text-xs text-slate-400 font-semibold">{farm.farmCode}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Quota Used</span>
            <div className="text-xl font-black text-slate-900 mt-1">{quota}</div>
          </div>
        </div>

        {/* Recent Reservations Received */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Holding Reservations</h3>
              <p className="text-xs text-slate-500">
                Customers who placed 24-hour holds on your livestock
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link to="/farm/bookings">View All Orders</Link>
            </Button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No reservation holds placed on your goats yet. Keep listings updated with clear photos!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.goatName}</span>
                      <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        Code: {b.bookingCode || 'AGF-HOLD'}
                      </Badge>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Customer: <strong className="text-slate-700">{b.customerName}</strong> • {formatDateTime(b.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-700 text-sm">
                      {formatCurrency(b.totalPrice)}
                    </span>
                    {b.customerPhone && (
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-2.5 py-1.5 font-bold hover:bg-slate-800"
                      >
                        <PhoneCall className="h-3 w-3 text-emerald-400" />
                        <span>Call Buyer</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
