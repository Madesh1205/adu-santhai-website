import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { GoatRepository } from '@/repositories/GoatRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { Goat, Farm } from '@/types';
import {
  Search,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const POPULAR_BREEDS = [
  { name: 'Boer', tagline: 'World-Class Meat Sires', image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=500&q=80' },
  { name: 'Sirohi', tagline: 'Hardy Commercial Breed', image: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=500&q=80' },
  { name: 'Tellicherry', tagline: 'Prolific & High Milk', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=500&q=80' },
  { name: 'Jamnapari', tagline: 'Majestic Dual Purpose', image: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=500&q=80' },
  { name: 'Barbari', tagline: 'Ideal for Stall Feeding', image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=500&q=80' },
  { name: 'Kanni Adu', tagline: 'Native Tamil Nadu Breed', image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=500&q=80' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredGoats, setFeaturedGoats] = useState<Goat[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);

  // Quick Hero Search Form State
  const [searchBreed, setSearchBreed] = useState<string>('');
  const [searchPurpose, setSearchPurpose] = useState<string>('ALL');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [goatsData, farmsData] = await Promise.all([
          GoatRepository.getFeaturedGoats(8),
          FarmRepository.getApprovedFarms(),
        ]);
        setFeaturedGoats(goatsData);
        setFarms(farmsData.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchBreed.trim()) params.append('breed', searchBreed.trim());
    if (searchPurpose !== 'ALL') params.append('purpose', searchPurpose);
    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <>
      <SEOHead
        title="Adu Santhai | Tamil Nadu's Premier Direct Goat Marketplace"
        description="Buy verified live goats directly from Ammal Farm and top certified breeders. High quality Boer, Sirohi, Jamnapari, Tellicherry with 24-hour hold reservations."
        path="/"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
        {/* Background decorative glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 backdrop-blur-xs">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Ammal Farm • Direct Farmer Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Direct Goat Marketplace <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                With Zero Middlemen
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Explore authentic high-yield breeding sires, commercial meat stock, and certified native breeds. Reserve with our exclusive <strong>24-hour hold guarantee</strong>.
            </p>

            {/* Quick Hero Search Box */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 rounded-2xl bg-white p-3 shadow-2xl text-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Breed (e.g. Boer, Sirohi)"
                  value={searchBreed}
                  onChange={(e) => setSearchBreed(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={searchPurpose}
                  onChange={(e) => setSearchPurpose(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ALL">All Purposes</option>
                  <option value="BREEDING">Breeding Sires & Does</option>
                  <option value="MEAT">Commercial Meat</option>
                  <option value="MILK">Dairy / Milk</option>
                  <option value="SHOW">Show & Exhibition</option>
                  <option value="PET">Farm Pets</option>
                </select>
              </div>

              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 rounded-xl"
              >
                Find Goats
              </Button>
            </form>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>100% Direct Breeder Prices</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Free 24h Holding Reservation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Health & Lineage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Goats Showcase */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Premium Livestock
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Featured Goats on Market
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Handpicked verified listings with immediate 24-hour reservation hold
              </p>
            </div>
            <Button variant="outline" asChild className="self-start sm:self-auto gap-1.5">
              <Link to="/marketplace">
                Explore All Listings <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-200/80 animate-pulse" />
              ))}
            </div>
          ) : featuredGoats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <p className="text-slate-500 text-sm">
                No featured goats currently available. Check the full marketplace for regular listings.
              </p>
              <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link to="/marketplace">Go to Marketplace</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGoats.map((goat) => (
                <GoatCard
                  key={goat.id}
                  goat={goat}
                  onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Breed Categories Grid */}
      <section className="py-16 sm:py-20 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Genetics & Lineage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Popular Goat Breeds
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a breed category to browse tailored listings and stud genetics
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_BREEDS.map((breed) => (
              <Link
                key={breed.name}
                to={`/marketplace?breed=${encodeURIComponent(breed.name)}`}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-md"
              >
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-emerald-600/30 group-hover:border-emerald-600 transition-colors shadow-xs">
                  <img
                    src={breed.image}
                    alt={breed.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {breed.name}
                </h3>
                <span className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                  {breed.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Partner Farms Showcase */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Breeder Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Verified Goat Farms
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Certified farms with physical locations, transparent health protocols, and direct farm visits
              </p>
            </div>
            <Button variant="outline" asChild className="self-start sm:self-auto gap-1.5">
              <Link to="/farms">
                View All Farms <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED
                  </Badge>
                  <span className="font-mono text-xs text-slate-400">{farm.farmCode}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{farm.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {farm.locationDistrict}, {farm.locationState}
                </p>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {farm.description || farm.tagline || 'Leading livestock breeder offering quality goats with health transparency.'}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${farm.contactPhone}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <PhoneCall className="h-3.5 w-3.5" /> Call Farm
                  </a>
                  <Button size="sm" variant="ghost" asChild className="text-xs">
                    <Link to={`/farms/${farm.id}`}>View Farm</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ammal Farm Trust Guarantee Banner */}
      <section className="py-16 sm:py-20 bg-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Ammal Farm Standards
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                Why Buy Through Adu Santhai?
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
                Traditional livestock markets involve high broker commissions, inaccurate weights, and hidden diseases. Adu Santhai revolutionizes goat trading by establishing verifiable records and direct booking locks.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-emerald-300 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">24-Hour Zero-Risk Hold</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Reserve without upfront commitment while you coordinate farm visit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-emerald-300 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Verified Farm Inspections</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      All partner farms undergo physical verification by Ammal Farm team.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-emerald-300 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Vaccinated & Dewormed</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Every listed goat displays recent vaccination and deworming dates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-emerald-300 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Pure Genetic Pedigrees</h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Mother & sire ear tag identification for genuine breeding bloodlines.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="rounded-3xl bg-emerald-950/80 border border-emerald-700/50 p-8 text-center space-y-5">
              <Building2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-black text-white">Are You a Goat Farmer?</h3>
              <p className="text-xs text-emerald-200 max-w-md mx-auto leading-relaxed">
                Join Ammal Farm's verified seller network. Showcase your breeds to thousands of verified goat buyers across South India.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild className="bg-white text-emerald-950 hover:bg-slate-100 font-bold">
                  <Link to="/register-farm">Register Your Farm</Link>
                </Button>
                <Button variant="outline" asChild className="border-emerald-500 text-emerald-100 hover:bg-emerald-900">
                  <Link to="/marketplace">Explore Market</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Booking Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={Boolean(selectedGoatForBooking)}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
