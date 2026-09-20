import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoatRepository } from '@/repositories/GoatRepository';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Goat, GoatFilterCriteria, Breed, GoatGender, GoatPurpose, SortOption } from '@/types';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const TAMIL_NADU_DISTRICTS = [
  'Tiruvannamalai',
  'Vellore',
  'Salem',
  'Dharmapuri',
  'Krishnagiri',
  'Madurai',
  'Tiruchirappalli',
  'Coimbatore',
  'Erode',
  'Tirunelveli',
  'Thanjavur',
  'Dindigul',
  'Namakkal',
  'Villupuram',
  'Cuddalore',
  'Kallakurichi',
  'Karur',
  'Theni',
  'Virudhunagar',
  'Ramanathapuram',
  'Sivaganga',
  'Thoothukudi',
  'Kanchipuram',
  'Chengalpattu',
  'Tiruvallur',
  'Chennai',
];

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [goats, setGoats] = useState<Goat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [wishlistGoatIds, setWishlistGoatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);

  // Filter criteria states initialized from searchParams
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedBreed, setSelectedBreed] = useState<string>(searchParams.get('breed') || 'ALL');
  const [selectedGender, setSelectedGender] = useState<GoatGender | 'ALL'>(
    (searchParams.get('gender') as GoatGender) || 'ALL'
  );
  const [selectedPurpose, setSelectedPurpose] = useState<GoatPurpose | 'ALL'>(
    (searchParams.get('purpose') as GoatPurpose) || 'ALL'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(searchParams.get('district') || 'ALL');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [minWeight, setMinWeight] = useState<string>(searchParams.get('minWeight') || '');
  const [maxWeight, setMaxWeight] = useState<string>(searchParams.get('maxWeight') || '');
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );

  // Load breeds and wishlist
  useEffect(() => {
    GoatRepository.getBreeds().then(setBreeds);
    if (user) {
      WishlistRepository.getWishlistGoatIds(user.id).then(setWishlistGoatIds);
    }
  }, [user]);

  // Sync state from searchParams on query param change
  useEffect(() => {
    if (searchParams.get('q') !== null) setSearchQuery(searchParams.get('q') || '');
    if (searchParams.get('breed') !== null) setSelectedBreed(searchParams.get('breed') || 'ALL');
    if (searchParams.get('purpose') !== null) setSelectedPurpose((searchParams.get('purpose') as GoatPurpose) || 'ALL');
  }, [searchParams]);

  const fetchGoats = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: GoatFilterCriteria = {
        searchQuery: searchQuery.trim() || undefined,
        breed: selectedBreed !== 'ALL' ? selectedBreed : undefined,
        gender: selectedGender !== 'ALL' ? selectedGender : undefined,
        purpose: selectedPurpose !== 'ALL' ? selectedPurpose : undefined,
        locationDistrict: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minWeightKg: minWeight ? Number(minWeight) : undefined,
        maxWeightKg: maxWeight ? Number(maxWeight) : undefined,
        sortBy,
      };

      const data = await GoatRepository.getApprovedGoats(criteria);
      setGoats(data);
    } catch (err) {
      console.error('Failed to query goats:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedBreed,
    selectedGender,
    selectedPurpose,
    selectedDistrict,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    sortBy,
  ]);

  useEffect(() => {
    fetchGoats();
  }, [fetchGoats]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBreed('ALL');
    setSelectedGender('ALL');
    setSelectedPurpose('ALL');
    setSelectedDistrict('ALL');
    setMinPrice('');
    setMaxPrice('');
    setMinWeight('');
    setMaxWeight('');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedBreed !== 'ALL' ||
    selectedGender !== 'ALL' ||
    selectedPurpose !== 'ALL' ||
    selectedDistrict !== 'ALL' ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(minWeight) ||
    Boolean(maxWeight) ||
    sortBy !== 'newest';

  return (
    <>
      <SEOHead
        title="Live Goat Marketplace | Verified Boer, Sirohi, Kanni Goats"
        description="Browse certified live goats for sale in Tamil Nadu. Filter by breed, weight, purpose, and district with transparent pricing and 24-hour reservation hold."
        path="/marketplace"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Marketplace Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Live Goat Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Direct from verified breeders with 24-hour zero-risk holding reservations
            </p>
          </div>

          {/* Search + Mobile Filter Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search name, code, breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="hidden md:block rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="weight_heaviest">Weight: Heaviest First</option>
              <option value="age_youngest">Age: Youngest First</option>
              <option value="top_rated">Top Rated</option>
            </select>

            {/* Mobile Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden gap-1.5 text-xs font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 py-3">
            <span className="text-xs font-medium text-slate-500">Active filters:</span>
            {searchQuery && (
              <Badge variant="slate" className="gap-1 text-xs">
                Search: "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </Badge>
            )}
            {selectedBreed !== 'ALL' && (
              <Badge variant="default" className="gap-1 text-xs bg-emerald-100 text-emerald-800">
                Breed: {selectedBreed}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedBreed('ALL')} />
              </Badge>
            )}
            {selectedGender !== 'ALL' && (
              <Badge variant="slate" className="gap-1 text-xs">
                Gender: {selectedGender}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedGender('ALL')} />
              </Badge>
            )}
            {selectedPurpose !== 'ALL' && (
              <Badge variant="slate" className="gap-1 text-xs">
                Purpose: {selectedPurpose}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPurpose('ALL')} />
              </Badge>
            )}
            {selectedDistrict !== 'ALL' && (
              <Badge variant="slate" className="gap-1 text-xs">
                District: {selectedDistrict}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDistrict('ALL')} />
              </Badge>
            )}
            {(minPrice || maxPrice) && (
              <Badge variant="slate" className="gap-1 text-xs">
                Price: ₹{minPrice || 0} - ₹{maxPrice || 'Any'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                />
              </Badge>
            )}
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline ml-2"
            >
              <RotateCcw className="h-3 w-3" /> Reset all
            </button>
          </div>
        )}

        {/* Main Content Layout (Sidebar + Results Grid) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" /> Filter Criteria
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Breed Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Breeds</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Purpose
              </label>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value as GoatPurpose | 'ALL')}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Purposes</option>
                <option value="BREEDING">Breeding</option>
                <option value="MEAT">Meat</option>
                <option value="MILK">Milk</option>
                <option value="SHOW">Show</option>
                <option value="PET">Pet</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {['ALL', 'MALE', 'FEMALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g as GoatGender | 'ALL')}
                    className={`rounded-lg py-1.5 font-semibold text-center border transition-colors ${
                      selectedGender === g
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'ALL' ? 'All' : g}
                  </button>
                ))}
              </div>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                District (Tamil Nadu)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Districts</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Price (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Weight Range */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Weight (Kg)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min kg"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-1/2 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max kg"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-1/2 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {/* Results Count Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Showing {goats.length} {goats.length === 1 ? 'Goat' : 'Goats'}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : goats.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Goats Match Your Filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some criteria or expanding your price and weight ranges.
                </p>
                <Button onClick={handleClearFilters} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {goats.map((goat) => (
                  <GoatCard
                    key={goat.id}
                    goat={goat}
                    isWishlisted={wishlistGoatIds.includes(goat.id)}
                    onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Filter Listings</h3>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Breed */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-sm bg-white"
              >
                <option value="ALL">All Breeds</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Gender */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['ALL', 'MALE', 'FEMALE'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g as GoatGender | 'ALL')}
                    className={`rounded-lg py-2 text-xs font-bold border ${
                      selectedGender === g
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile District */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-sm bg-white"
              >
                <option value="ALL">All Districts</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClearFilters}
              >
                Reset
              </Button>
              <Button
                className="flex-1 bg-emerald-600 text-white font-bold"
                onClick={() => setShowMobileFilter(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Booking Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={Boolean(selectedGoatForBooking)}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
