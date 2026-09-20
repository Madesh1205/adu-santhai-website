import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { Farm } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Search,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export const FarmsPage: React.FC = () => {
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

  const filteredFarms = farms.filter((f) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(term) ||
      f.locationDistrict.toLowerCase().includes(term) ||
      f.farmCode.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <SEOHead
        title="Verified Goat Farms Directory | Adu Santhai - Ammal Farm"
        description="Browse certified goat breeders and commercial farms across Tamil Nadu. Direct farmer contacts, verifiable premises, and high health standards."
        path="/farms"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Verified Breeder Network
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Verified Goat Farms
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All listed farms undergo physical verification and background checks by Ammal Farm
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search farm or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shrink-0">
              <Link to="/register-farm">
                <PlusCircle className="h-4 w-4" />
                <span>Register Farm</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Farms Grid */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredFarms.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Farms Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try a different search keyword or check back shortly.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm) => (
              <div
                key={farm.id}
                className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 justify-end">
                    {farm.isAmmalOwnFarm ? (
                      <Badge variant="default" className="bg-emerald-600 text-white text-[10px]">
                        CENTRAL HUB
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 text-[10px]">
                        <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-slate-400">{farm.farmCode}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{farm.name}</h3>
                {farm.tagline && (
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">{farm.tagline}</p>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{farm.locationDistrict}, {farm.locationState}</span>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {farm.description || 'Verified livestock breeding facility specializing in certified pedigree and meat goats.'}
                </p>

                <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${farm.contactPhone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
                  >
                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                    <span>{farm.contactPhone}</span>
                  </a>

                  <Button size="sm" variant="outline" asChild className="text-xs gap-1">
                    <Link to={`/farms/${farm.id}`}>
                      <span>View Listings</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
