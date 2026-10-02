import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/common/SectionHeader';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { GoatCardSkeleton } from '@/components/marketplace/GoatCardSkeleton';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { FallbackGoatImage } from '@/components/common/FallbackGoatImage';
import { GoatRepository } from '@/repositories/GoatRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { Goat, Farm, Breed } from '@/types';
import {
  Search,
  ShieldCheck,
  Clock,
  Tag,
  Building2,
  MapPin,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredGoats, setFeaturedGoats] = useState<Goat[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [goatsData, farmsData, breedsData] = await Promise.all([
          GoatRepository.getFeaturedGoats(8),
          FarmRepository.getApprovedFarms(),
          GoatRepository.getBreeds(),
        ]);
        setFeaturedGoats(goatsData);
        setFarms(farmsData.slice(0, 3));
        setBreeds(breedsData);
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const topGoatImage = featuredGoats.find((g) => g.primaryPhoto)?.primaryPhoto;
  const heroBannerImage = farms.find((f) => f.bannerUrl)?.bannerUrl || topGoatImage;

  return (
    <>
      <SEOHead
        title="Adu Santhai | Tamil Nadu's Premier Direct Goat Marketplace"
        description="Buy verified live goats directly from Ammal Farm and top certified breeders. Boer, Sirohi, Jamnapari, Tellicherry, and Kanni with 24-hour hold reservations."
        path="/"
      />

      {/* 1. HERO SECTION (Clean White + Green + Split Visual) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white py-12 sm:py-16 lg:py-20 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-semibold text-emerald-900 border border-emerald-200/60">
                <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
                <span>Powered by Ammal Farm • Direct Breeder Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Find the Right Goat <br className="hidden sm:inline" />
                <span className="text-emerald-800">From Trusted Farms</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Browse verified goats from trusted farms across Tamil Nadu. Inspect health specs, get direct farmer prices, and reserve with confidence.
              </p>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="max-w-xl">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by breed, name, ear tag, or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-32 text-sm text-slate-900 shadow-xs focus:border-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 placeholder:text-slate-400"
                  />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="absolute right-2 font-bold px-4 h-10 rounded-xl"
                  >
                    Search
                  </Button>
                </div>
              </form>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/marketplace">
                  <Button variant="default" size="lg" className="font-bold text-sm h-12 px-6">
                    Browse Goats
                  </Button>
                </Link>
                <Link to="/farms">
                  <Button variant="secondary" size="lg" className="font-bold text-sm h-12 px-6">
                    Explore Farms
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual (5 Cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="relative mx-auto w-full">
                <div className="relative w-full h-64 sm:h-80 md:h-[380px] lg:h-[460px] xl:h-[500px] overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-slate-100 shadow-md group transition-all">
                  {heroBannerImage ? (
                    <img
                      src={heroBannerImage}
                      alt="Ammal Farm • Adu Santhai Official Farm Banner"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <FallbackGoatImage breedName="Verified Livestock" />
                  )}

                  {/* Floating Trust Card Overlay */}
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-3.5 border border-slate-200/80 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <VerifiedBadge label="Verified Sires" variant="default" />
                        <span className="text-xs font-bold text-slate-900">Ammal Farm Stock</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800">100% Direct</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 hidden sm:block">
                      Direct breeder verification, authentic parentage, and zero commissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST INDICATORS */}
      <section className="py-8 sm:py-10 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Verified Farms</h4>
                <p className="text-[11px] text-slate-500">Vetted breeders only</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Secure 24h Hold</h4>
                <p className="text-[11px] text-slate-500">Zero-risk reservation</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Transparent Pricing</h4>
                <p className="text-[11px] text-slate-500">Zero hidden fees</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Direct Farm Listings</h4>
                <p className="text-[11px] text-slate-500">Straight from farmers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR BREEDS (Fetched directly from DB) */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Certified Breeds"
            title="Popular Goat Breeds"
            description="Explore authentic bloodlines suitable for commercial meat production, dairy yield, or stud breeding."
            actionLabel="View all breeds"
            actionHref="/marketplace"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {(breeds.length > 0 ? breeds : [
              { id: '1', name: 'Tellicherry (Malabari)', primaryPurpose: 'MEAT_AND_MILK', description: 'High prolificacy native breed' },
              { id: '2', name: 'Jamunapari', primaryPurpose: 'MILK_AND_MEAT', description: 'Majestic large dual purpose' },
              { id: '3', name: 'Boer', primaryPurpose: 'MEAT', description: 'World-class meat sires' },
              { id: '4', name: 'Sirohi', primaryPurpose: 'MEAT', description: 'Hardy commercial breed' },
              { id: '5', name: 'Kanni Adu', primaryPurpose: 'MEAT', description: 'Native Tamil Nadu breed' },
              { id: '6', name: 'Kodi Adu', primaryPurpose: 'MEAT', description: 'Tall hardy southern breed' },
            ]).slice(0, 6).map((breed) => (
              <Link
                key={breed.id || breed.name}
                to={`/marketplace?breed=${encodeURIComponent(breed.name)}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-emerald-700/50 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 mb-3 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {breed.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {breed.description || 'Verified Breed'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED GOATS */}
      <section className="py-14 sm:py-16 bg-slate-50/60 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Top Listings"
            title="Featured Goats"
            description="Inspected, healthy livestock available for direct purchase or instant 24-hour reservation."
            actionLabel="Browse full marketplace"
            actionHref="/marketplace"
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <GoatCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredGoats.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No featured goats available at this moment. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredGoats.slice(0, 8).map((goat) => (
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

      {/* 5. VERIFIED FARMS */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Breeder Directory"
            title="Verified Partner Farms"
            description="Meet the passionate breeders maintaining high health protocols and pedigree lineage across Tamil Nadu."
            actionLabel="View all farms"
            actionHref="/farms"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div
                key={farm.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-emerald-700/40 hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <VerifiedBadge label="Verified Breeder" variant="default" />
                    <span className="font-mono text-xs text-slate-400">#{farm.farmCode}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{farm.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-800" />
                      <span>{farm.locationDistrict || 'Tamil Nadu'}, India</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {farm.description || 'Specialized in breeding high-quality meat sires and native breeds with certified health care.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/farms/${farm.id}`}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    View Available Goats →
                  </Link>
                  {farm.contactPhone && (
                    <a
                      href={`tel:${farm.contactPhone}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <PhoneCall className="h-3 w-3 text-emerald-800" /> Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-14 sm:py-16 bg-slate-50/60 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Simple Process"
            title="How Adu Santhai Works"
            description="Purchasing livestock with complete transparency and peace of mind in three easy steps."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-black text-lg border border-emerald-200">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900">Browse & Select</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by breed, weight, gender, and age. Review parent ear tags and high-resolution photos.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-black text-lg border border-emerald-200">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900">Reserve with 24h Hold</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lock your chosen goat exclusively for 24 hours with zero advance fee. No other buyer can reserve it during your hold window.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-black text-lg border border-emerald-200">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900">Inspect & Complete</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visit the breeder farm directly or verify via live video call. Pay the farmer directly with 100% price transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AMMAL FARM HERITAGE SECTION */}
      <section id="about" className="py-16 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/20 p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl overflow-hidden bg-white shadow-md border-2 border-emerald-800/20 p-2">
                  <img
                    src="/logo.jpg"
                    alt="Ammal Farm • Adu Santhai Official Emblem"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#92400E] border border-amber-200">
                  <span>HERITAGE • AMMAL FARM</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Empowering Goat Farmers with Direct Market Access
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Based in Rusha Post, Kollimedu, Chennangkuppam, K.V. Kuppam, Vellore (PIN 632209), <strong>Ammal Farm</strong> established Adu Santhai to eliminate exploitation by traditional middlemen. Every listing connects buyers directly to the breeder, guaranteeing true weights, honest health disclosure, and authentic breed genetics. Specializing in Nellore Judipi, Salem Black goats, country chicken, and ducks.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800" />
                    <span>Certified Animal Welfare</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800" />
                    <span>Fair Pricing for Breeders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-800" />
                    <span>Statewide Logistics Guidance</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link to="/register-farm">
                    <Button variant="default" size="default" className="font-bold">
                      Join as a Verified Partner Farm
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Hold Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={!!selectedGoatForBooking}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
