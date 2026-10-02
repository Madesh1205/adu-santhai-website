import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { GoatCardSkeleton } from '@/components/marketplace/GoatCardSkeleton';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GoatRepository } from '@/repositories/GoatRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Goat, GoatFilterCriteria, Breed, Farm, GoatGender, SortOption } from '@/types';
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Check,
  ArrowRight,
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
  'Chennai',
];

const ITEMS_PER_PAGE = 12;

export const MarketplacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [goats, setGoats] = useState<Goat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [wishlistGoatIds, setWishlistGoatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  // Filter criteria states initialized from searchParams
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedBreed, setSelectedBreed] = useState<string>(searchParams.get('breed') || 'ALL');
  const [selectedGender, setSelectedGender] = useState<GoatGender | 'ALL'>(
    (searchParams.get('gender') as GoatGender) || 'ALL'
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(searchParams.get('district') || 'ALL');
  const [selectedFarmId, setSelectedFarmId] = useState<string>(searchParams.get('farmId') || 'ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verified') === 'true');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('maxPrice') || '');
  const [minWeight, setMinWeight] = useState<string>(searchParams.get('minWeight') || '');
  const [maxWeight, setMaxWeight] = useState<string>(searchParams.get('maxWeight') || '');
  const [minAge, setMinAge] = useState<string>(searchParams.get('minAge') || '');
  const [maxAge, setMaxAge] = useState<string>(searchParams.get('maxAge') || '');
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );

  // Accordion state
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    breed: true,
    gender: true,
    purpose: true,
    price: true,
    age: false,
    farm: false,
    specs: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Load breeds, farms, and wishlist
  useEffect(() => {
    GoatRepository.getBreeds().then(setBreeds);
    FarmRepository.getApprovedFarms().then(setFarms);
    if (user) {
      WishlistRepository.getWishlistGoatIds(user.id).then(setWishlistGoatIds);
    }
  }, [user]);

  // Sync state from URL query parameters
  useEffect(() => {
    if (searchParams.get('q') !== null) setSearchQuery(searchParams.get('q') || '');
    if (searchParams.get('breed') !== null) setSelectedBreed(searchParams.get('breed') || 'ALL');
    if (searchParams.get('farmId') !== null) setSelectedFarmId(searchParams.get('farmId') || 'ALL');
  }, [searchParams]);

  const fetchGoats = useCallback(async () => {
    setLoading(true);
    try {
      const criteria: GoatFilterCriteria = {
        searchQuery: searchQuery.trim() || undefined,
        breed: selectedBreed !== 'ALL' ? selectedBreed : undefined,
        gender: selectedGender !== 'ALL' ? selectedGender : undefined,
        locationDistrict: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
        farmId: selectedFarmId !== 'ALL' ? selectedFarmId : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minWeightKg: minWeight ? Number(minWeight) : undefined,
        maxWeightKg: maxWeight ? Number(maxWeight) : undefined,
        minAgeMonths: minAge ? Number(minAge) : undefined,
        maxAgeMonths: maxAge ? Number(maxAge) : undefined,
        sortBy,
      };

      const data = await GoatRepository.getApprovedGoats(criteria);

      setGoats(data);
      setVisibleCount(ITEMS_PER_PAGE);
    } catch (err) {
      console.error('Failed to query goats:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedBreed,
    selectedGender,
    selectedDistrict,
    selectedFarmId,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    minAge,
    maxAge,
    sortBy,
  ]);

  useEffect(() => {
    fetchGoats();
  }, [fetchGoats]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBreed('ALL');
    setSelectedGender('ALL');
    setSelectedDistrict('ALL');
    setSelectedFarmId('ALL');
    setVerifiedOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setMinWeight('');
    setMaxWeight('');
    setMinAge('');
    setMaxAge('');
    setSortBy('newest');
    setSearchParams({});
  };

  const activeFilterCount = [
    selectedBreed !== 'ALL',
    selectedGender !== 'ALL',
    selectedDistrict !== 'ALL',
    selectedFarmId !== 'ALL',
    verifiedOnly,
    minPrice !== '',
    maxPrice !== '',
    minWeight !== '',
    maxWeight !== '',
    minAge !== '',
    maxAge !== '',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  const displayedGoats = useMemo(() => {
    return goats.slice(0, visibleCount);
  }, [goats, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const renderFilterPanel = () => (
    <div className="space-y-6">
      {/* Active Filters Summary & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-800" />
          <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="verified" className="text-[10px] px-2">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* 1. Breed Filter */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('breed')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>Breed</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.breed ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.breed && (
          <div className="space-y-1 pt-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedBreed('ALL')}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedBreed === 'ALL'
                  ? 'bg-emerald-50 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Breeds</span>
              {selectedBreed === 'ALL' && <Check className="h-3.5 w-3.5 text-emerald-800" />}
            </button>
            {breeds.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBreed(b.name)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedBreed === b.name
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{b.name}</span>
                {selectedBreed === b.name && <Check className="h-3.5 w-3.5 text-emerald-800" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Gender Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('gender')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>Gender</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.gender ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.gender && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Male', value: 'MALE' },
              { label: 'Female', value: 'FEMALE' },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setSelectedGender(g.value as any)}
                className={`rounded-lg py-1.5 text-xs font-semibold text-center transition-colors cursor-pointer border ${
                  selectedGender === g.value
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Age Group Range */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('age')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>Age Group</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.age ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.age && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'All Ages', min: '', max: '' },
                { label: 'Kids (< 6m)', min: '0', max: '6' },
                { label: 'Young (6–12m)', min: '6', max: '12' },
                { label: 'Adult (1–2y)', min: '12', max: '24' },
                { label: 'Mature (> 2y)', min: '24', max: '' },
              ].map((ag) => {
                const isActive = minAge === ag.min && maxAge === ag.max;
                return (
                  <button
                    key={ag.label}
                    onClick={() => {
                      setMinAge(ag.min);
                      setMaxAge(ag.max);
                    }}
                    className={`rounded-lg py-1 px-2 text-[11px] font-semibold text-center transition-colors cursor-pointer border ${
                      isActive
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ag.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Min Months</label>
                <input
                  type="number"
                  placeholder="Min m"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Max Months</label>
                <input
                  type="number"
                  placeholder="Max m"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Farm / Breeder Filter */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('farm')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>Breeder Farm</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.farm ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.farm && (
          <div className="pt-1">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
            >
              <option value="ALL">All Partner Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.isAmmalOwnFarm ? '(Central Hub)' : `(${f.locationDistrict})`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 7. Price Range */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>Price Range (₹)</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.price ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.price && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Min Price</label>
              <input
                type="number"
                placeholder="₹ Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium">Max Price</label>
              <input
                type="number"
                placeholder="₹ Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* 8. Progressive Disclosure: District & Weight */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => toggleSection('specs')}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
        >
          <span>District & Weight</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.specs ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.specs && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 font-medium">District</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
              >
                <option value="ALL">All Districts</option>
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Min Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Min kg"
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Max Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Max kg"
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Live Goat Marketplace | Buy Boer, Tellicherry, Sirohi | Adu Santhai"
        description="Search verified live goats from certified farms. Filter by breed, weight, gender, price, and location with 24-hour hold reservation."
        path="/marketplace"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Marketplace Title & Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Live Goat Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Verified high-quality goats available for direct purchase and 24-hour reservation hold.
              </p>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl"
                onClick={() => setShowMobileFilter(true)}
              >
                <SlidersHorizontal className="h-4 w-4 text-emerald-800" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort goats by"
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 h-10"
              >
                <option value="newest">Newest First</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="weight_heaviest">Heaviest First</option>
                <option value="age_youngest">Youngest First</option>
                <option value="top_rated">Featured First</option>
              </select>
            </div>
          </div>

          {/* Desktop Search & Sort Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by breed, name, ear tag, or farm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort goats by"
                className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="newest">Newest Listings</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="weight_heaviest">Weight: Heaviest First</option>
                <option value="age_youngest">Age: Youngest First</option>
                <option value="top_rated">Featured First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Marketplace Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Left Filter Rail (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sticky top-24">
            {renderFilterPanel()}
          </aside>

          {/* Right Results Grid (9 Cols) */}
          <main className="lg:col-span-9 space-y-6">
            {/* Results Counter & Active Pills */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span>
                Showing <strong className="text-slate-900">{displayedGoats.length}</strong> of{' '}
                <strong className="text-slate-900">{goats.length}</strong> available goats
              </span>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-emerald-800 hover:underline font-semibold cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Loading Skeleton State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <GoatCardSkeleton key={i} />
                ))}
              </div>
            ) : goats.length === 0 ? (
              /* Contextual Empty State */
              <EmptyState
                icon={Search}
                title="No goats match your filters"
                description="We couldn't find any goats matching your current criteria. Try adjusting your breed, price range, or clearing filters."
                actionLabel="Reset All Filters"
                onActionClick={handleClearFilters}
              />
            ) : (
              /* Real Data Card Grid */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedGoats.map((goat) => (
                    <GoatCard
                      key={goat.id}
                      goat={goat}
                      isWishlisted={wishlistGoatIds.includes(goat.id)}
                      onWishlistToggle={(id, isSaved) => {
                        setWishlistGoatIds((prev) =>
                          isSaved ? [...prev, id] : prev.filter((item) => item !== id)
                        );
                      }}
                      onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                    />
                  ))}
                </div>

                {/* Pagination / Load More Button */}
                {visibleCount < goats.length && (
                  <div className="pt-6 text-center">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleLoadMore}
                      className="font-bold text-xs px-6 py-2.5 gap-2 border-emerald-800/30 text-emerald-800 hover:bg-emerald-50"
                    >
                      <span>Load More Goats ({goats.length - visibleCount} remaining)</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-over / Dialog */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="ml-auto w-full max-w-xs bg-white h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="font-bold text-slate-900 text-base">Filter Livestock</span>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {renderFilterPanel()}
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleClearFilters}
              >
                Reset
              </Button>
              <Button
                variant="default"
                className="flex-1 text-xs font-bold"
                onClick={() => setShowMobileFilter(false)}
              >
                View ({goats.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Hold Booking Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={Boolean(selectedGoatForBooking)}
        onClose={() => setSelectedGoatForBooking(null)}
        onSuccess={() => {
          setSelectedGoatForBooking(null);
          fetchGoats();
        }}
      />
    </>
  );
};
