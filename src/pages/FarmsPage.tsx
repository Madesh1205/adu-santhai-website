import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { Farm } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { useLocation } from '@/lib/location/LocationContext';
import { formatDistrictLabel } from '@/lib/location/locationUtils';
import { LocationPill } from '@/components/location/LocationPill';
import { LocationRelevanceBadge } from '@/components/location/LocationRelevanceBadge';
import {
  Building2,
  MapPin,
  PhoneCall,
  Search,
  ArrowRight,
  PlusCircle,
  X,
} from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const { userDistrict, getFarmRelevance } = useLocation();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadFarms() {
      try {
        const data = await FarmRepository.getApprovedFarms();
        setFarms(data);
      } catch (err) {
        console.error('Failed to load farms:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFarms();
  }, []);

  const sortedFilteredFarms = React.useMemo(() => {
    let result = farms.filter((f) => {
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(term) ||
        f.locationDistrict.toLowerCase().includes(term) ||
        f.farmCode.toLowerCase().includes(term)
      );
    });

    if (userDistrict) {
      const relevanceRank = {
        IN_DISTRICT: 1,
        NEARBY_DISTRICT: 2,
        OTHER_LOCATION: 3,
        UNKNOWN: 4,
      };

      result = [...result].sort((a, b) => {
        const relA = getFarmRelevance(a.locationDistrict);
        const relB = getFarmRelevance(b.locationDistrict);
        return relevanceRank[relA] - relevanceRank[relB];
      });
    }

    return result;
  }, [farms, searchQuery, userDistrict, getFarmRelevance]);

  return (
    <>
      <SEOHead
        title="Verified Goat Breeders Directory | Adu Santhai"
        description="Browse certified goat breeders and commercial farms across Tamil Nadu. Direct farmer contacts, verifiable premises, and high health standards."
        path="/farms"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Breadcrumb items={[{ label: 'Verified Breeder Network' }]} className="mb-4" />

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verified Breeder Network
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Connect directly with verified breeders across Tamil Nadu. Certified health protocols, zero middlemen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LocationPill variant="compact" />

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search farm or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Link to="/register-farm">
              <Button variant="default" size="sm" className="font-bold gap-1.5 shrink-0">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Partner Registration</span>
                <span className="sm:hidden">Register</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Farms Grid */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : sortedFilteredFarms.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Building2}
              title="No Partner Farms Found"
              description="No partner farms match your search keyword. Try clearing your search query."
              actionLabel="Clear Search"
              onActionClick={() => setSearchQuery('')}
            />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedFilteredFarms.map((farm) => {
              return (
                <Link
                  key={farm.id}
                  to={`/farms/${farm.id}`}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-emerald-700/60 hover:shadow-md cursor-pointer group"
                >
                  {/* Banner Strip */}
                  <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-800">
                    {farm.bannerUrl ? (
                      <img
                        src={farm.bannerUrl}
                        alt={farm.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                        className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900" />
                    )}
                    <div className="absolute top-3 right-3 flex flex-wrap items-center gap-1.5 justify-end">
                      {farm.isAmmalOwnFarm ? (
                        <Badge variant="earth" className="text-[10px] font-bold shadow-xs">
                          CENTRAL HUB
                        </Badge>
                      ) : (
                        <VerifiedBadge label="Verified" variant="default" />
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex-1 flex flex-col">
                    {/* Logo Avatar Badge */}
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-0.5 overflow-hidden border-2 border-white shadow-md text-emerald-800 font-bold -mt-8 mb-3 z-10">
                      {farm.logoUrl ? (
                        <img
                          src={farm.logoUrl}
                          alt={farm.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/logo.png';
                          }}
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

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {farm.name}
                        </h3>
                        {farm.tagline && (
                          <p className="text-xs text-emerald-800 font-medium mt-0.5">{farm.tagline}</p>
                        )}
                      </div>

                      <LocationRelevanceBadge relevance={getFarmRelevance(farm.locationDistrict)} />
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                      <span className="truncate">{formatDistrictLabel(farm.locationDistrict)}</span>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {farm.description || 'Verified livestock breeding facility specializing in certified pedigree and meat goats.'}
                    </p>

                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                      {farm.contactPhone ? (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `tel:${farm.contactPhone}`;
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors z-10"
                        >
                          <PhoneCall className="h-4 w-4 text-emerald-800" />
                          <span>Call Breeder</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Verified Listing</span>
                      )}

                      <Button variant="secondary" size="sm" className="text-xs font-bold gap-1 group-hover:bg-emerald-800 group-hover:text-white transition-colors pointer-events-none">
                        <span>View Herd</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
