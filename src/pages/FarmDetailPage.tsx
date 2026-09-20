import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { FarmRepository } from '@/repositories/FarmRepository';
import { GoatRepository } from '@/repositories/GoatRepository';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Farm, Goat } from '@/types';
import {
  Building2,
  MapPin,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
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
      <div className="mx-auto max-w-7xl px-4 py-16 space-y-6">
        <div className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Farm Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">
          The requested breeder farm profile could not be located.
        </p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link to="/farms">Browse All Farms</Link>
        </Button>
      </div>
    );
  }

  const farmSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: farm.name,
    telephone: farm.contactPhone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: farm.locationDistrict,
      addressRegion: farm.locationState,
      addressCountry: 'IN',
    },
  };

  return (
    <>
      <SEOHead
        title={`${farm.name} | Verified Goat Breeder in ${farm.locationDistrict}`}
        description={`View live goat listings, pedigrees, and direct booking reservations from ${farm.name} (${farm.farmCode}) in ${farm.locationDistrict}, Tamil Nadu.`}
        path={`/farms/${farm.id}`}
        schema={farmSchema}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/farms" className="hover:text-emerald-700">Farms</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-800 truncate">{farm.name}</span>
        </nav>

        {/* Farm Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-2xl shadow-md shadow-emerald-200">
                <Building2 className="h-10 w-10" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{farm.name}</h1>
                  {farm.isAmmalOwnFarm ? (
                    <Badge variant="default" className="bg-emerald-600 text-white font-bold text-xs">
                      CENTRAL OPERATIONS HUB
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> VERIFIED BREEDER
                    </Badge>
                  )}
                  <span className="font-mono text-xs text-slate-400 font-semibold">
                    #{farm.farmCode}
                  </span>
                </div>

                {farm.tagline && (
                  <p className="text-sm font-semibold text-emerald-700">{farm.tagline}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {farm.address ? `${farm.address}, ` : ''}{farm.locationDistrict}, {farm.locationState}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Contact Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <a
                href={`tel:${farm.contactPhone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>Call {farm.contactPhone}</span>
              </a>

              <a
                href={`https://wa.me/${farm.contactPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${farm.name}, I am contacting you via Adu Santhai regarding your goat listings.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Farmer</span>
              </a>
            </div>
          </div>

          {/* Description */}
          {farm.description && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                About this Farm
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {farm.description}
              </p>
            </div>
          )}
        </div>

        {/* Live Farm Listings Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Live Goats for Sale ({goats.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active listings available for immediate 24-hour reservation hold
              </p>
            </div>
          </div>

          {goats.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Sparkles className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Active Listings Currently</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                This farm currently has no active goats for sale, or their listings are undergoing routine health updates.
              </p>
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <Link to="/marketplace">Explore Other Farms</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {goats.map((goat) => (
                <GoatCard
                  key={goat.id}
                  goat={goat}
                  onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Booking Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={Boolean(selectedGoatForBooking)}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
