import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatRepository } from '@/repositories/GoatRepository';
import { BookingRepository } from '@/repositories/BookingRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
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
  ArrowRight,
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
      <EmptyState
        icon={Building2}
        title="No Farm Profile Found"
        description="You are not currently linked to an active breeder profile. Register your farm to list livestock."
        actionLabel="Register Farm"
        actionHref="/register-farm"
      />
    );
  }

  const activeGoatsCount = goats.filter((g) => g.status === 'AVAILABLE').length;
  const reservedGoatsCount = goats.filter((g) => g.status === 'RESERVED' || g.status === 'BOOKING_PENDING').length;
  const soldGoatsCount = goats.filter((g) => g.status === 'SOLD' || g.status === 'COMPLETED').length;
  const quota = farm.isAmmalOwnFarm ? 'Unlimited' : `${activeGoatsCount} / ${farm.goatListingLimit}`;

  return (
    <>
      <SEOHead title={`${farm.name} Dashboard | Adu Santhai`} path="/farm" />

      <div className="space-y-8">
        {/* Top Welcome Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Farm Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live status of your herd listings, customer holds, and inventory.
            </p>
          </div>

          <Link to="/farm/goats/new">
            <Button variant="default" size="default" className="font-bold gap-1.5 shadow-xs">
              <PlusCircle className="h-4 w-4" />
              <span>List New Goat</span>
            </Button>
          </Link>
        </div>

        {/* Farm Branding Cover Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="relative h-32 sm:h-44 w-full overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900">
            {farm.bannerUrl ? (
              <img
                src={farm.bannerUrl}
                alt={farm.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-emerald-950 via-emerald-800 to-slate-900 p-4 flex items-end">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  Partner Breeder Portal • {farm.locationDistrict}
                </span>
              </div>
            )}
          </div>
          <div className="p-5 pt-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8 sm:-mt-10">
            <div className="flex items-end gap-3 z-10">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-0.5 overflow-hidden border-2 border-white shadow-md text-emerald-800 font-bold">
                {farm.logoUrl ? (
                  <img
                    src={farm.logoUrl}
                    alt={farm.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : farm.isAmmalOwnFarm ? (
                  <img
                    src="/logo.png"
                    alt={farm.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-emerald-800" />
                )}
              </div>
              <div className="mb-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {farm.name}
                </h3>
                {farm.tagline && (
                  <p className="text-xs text-emerald-800 font-semibold">{farm.tagline}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/farm/settings">
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  Manage Branding
                </Button>
              </Link>
              <Link to={`/farms/${farm.id}`} target="_blank">
                <Button variant="secondary" size="sm" className="text-xs font-semibold">
                  Public Profile ↗
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <Layers className="h-5 w-5" />
              <Badge variant="verified" className="text-[10px]">
                ACTIVE
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Available Goats</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{activeGoatsCount}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <Clock className="h-5 w-5" />
              <Badge variant="reserved" className="text-[10px]">
                HOLDS
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">24-Hour Holds</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{reservedGoatsCount}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <Badge variant="sold" className="text-[10px]">
                SOLD
              </Badge>
            </div>
            <span className="text-xs text-slate-500 font-medium">Completed Sales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{soldGoatsCount}</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <CalendarCheck className="h-5 w-5" />
              <span className="font-mono text-xs text-slate-400 font-semibold">{farm.farmCode}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Listing Quota</span>
            <div className="text-xl font-black text-slate-900 mt-1">{quota}</div>
          </div>
        </div>

        {/* Recent Reservations Received */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Customer Reservations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Buyers who placed 24-hour holds on your livestock
              </p>
            </div>
            <Link to="/farm/bookings">
              <Button variant="outline" size="sm" className="text-xs font-bold">
                <span>View All</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No reservation holds placed on your goats yet. Keep listings updated with high-resolution photos!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{b.goatName}</span>
                      <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                      <Badge variant="reserved" className="text-[10px]">
                        Code: {b.bookingCode || 'AGF-HOLD'}
                      </Badge>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Buyer: <strong className="text-slate-700">{b.customerName}</strong> • {formatDateTime(b.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-emerald-800 text-sm">
                      {formatCurrency(b.totalPrice)}
                    </span>
                    {b.customerPhone && (
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-900 px-3 py-1.5 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-emerald-800" />
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
