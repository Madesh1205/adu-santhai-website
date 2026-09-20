import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { FarmRepository } from '@/repositories/FarmRepository';
import { GoatRepository } from '@/repositories/GoatRepository';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { GoatCardSkeleton } from '@/components/marketplace/GoatCardSkeleton';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { EmptyState } from '@/components/common/EmptyState';
import type { Farm, Goat } from '@/types';
import {
  Building2,
  MapPin,
  PhoneCall,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';

export const FarmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);

  useEffect(() => {
    async function loadFarmAndGoats() {
      if (!id) return;
      setLoading(true);
      try {
        const [farmData, farmGoats] = await Promise.all([
          FarmRepository.getFarmById(id),
          GoatRepository.getGoatsByFarm(id),
        ]);
        setFarm(farmData);
        setGoats(farmGoats);
      } catch (err) {
        console.error('Failed to load farm profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmAndGoats();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 space-y-6">
        <div className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <GoatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Farm Profile Not Found</h2>
        <p className="text-sm text-slate-500">
          This farm profile may have been updated or removed.
        </p>
        <Link to="/farms">
          <Button variant="default">Browse Verified Farms</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${farm.name} | Verified Breeder Profile | Adu Santhai`}
        description={`View live goat listings and breeding stock from ${farm.name} in ${farm.locationDistrict}. Direct breeder contact and 24-hour hold reservations.`}
        path={`/farms/${farm.id}`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-800 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/farms" className="hover:text-emerald-800 transition-colors">Farms</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate">{farm.name}</span>
        </nav>

        {/* 1. FARM IDENTITY & HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold shadow-xs">
                <Building2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {farm.name}
                  </h1>
                  {farm.isAmmalOwnFarm ? (
                    <Badge variant="earth" className="text-xs font-bold">
                      CENTRAL HUB
                    </Badge>
                  ) : (
                    <VerifiedBadge label="Verified Partner Farm" variant="default" />
                  )}
                  <span className="font-mono text-xs text-slate-400">#{farm.farmCode}</span>
                </div>

                {farm.tagline && (
                  <p className="text-sm font-semibold text-emerald-800">{farm.tagline}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                  <span>{farm.locationDistrict}, {farm.locationState || 'Tamil Nadu'}, India</span>
                  <span className="text-slate-300">•</span>
                  <span>{goats.length} active listings</span>
                </div>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {farm.contactPhone && (
                <a
                  href={`tel:${farm.contactPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-800" />
                  <span>Call Breeder</span>
                </a>
              )}

              {farm.contactPhone && (
                <a
                  href={`https://wa.me/${farm.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${farm.name}, I found your farm profile on Adu Santhai and would like to inquire about your goats.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-800" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          {/* Farm Bio & Health Protocol */}
          {farm.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {farm.description}
              </p>
            </div>
          )}
        </div>

        {/* 2. LIVE HERD LISTINGS SECTION */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Goats from {farm.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reserve any goat with our 24-hour hold guarantee.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {goats.length} goats listed
            </span>
          </div>

          {goats.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Active Listings Right Now"
              description="This farm currently has no live listings in the marketplace. Check back soon or browse other verified farms."
              actionLabel="Browse Marketplace"
              actionHref="/marketplace"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {goats.map((goat) => (
                <GoatCard
                  key={goat.id}
                  goat={goat}
                  onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Booking Hold Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={!!selectedGoatForBooking}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
