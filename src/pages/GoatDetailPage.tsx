import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { StickyActionBar } from '@/components/common/StickyActionBar';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { ReportModal } from '@/components/marketplace/ReportModal';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { GoatRepository } from '@/repositories/GoatRepository';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatCurrency, formatAge, formatDate } from '@/lib/utils';
import type { Goat } from '@/types';
import {
  Heart,
  Share2,
  PhoneCall,
  MessageCircle,
  Building2,
  Clock,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Info,
} from 'lucide-react';

export const GoatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [goat, setGoat] = useState<Goat | null>(null);
  const [relatedGoats, setRelatedGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePhoto, setActivePhoto] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadGoat() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await GoatRepository.getGoatById(id);
        if (data) {
          setGoat(data);
          setActivePhoto(data.primaryPhoto);

          // Fetch related goats from the same breed or farm
          const related = await GoatRepository.getApprovedGoats({ breed: data.breedName });
          setRelatedGoats(related.filter((g) => g.id !== data.id).slice(0, 4));
        }

        if (user && data) {
          const ids = await WishlistRepository.getWishlistGoatIds(user.id);
          setIsSaved(ids.includes(data.id));
        }
      } catch (err) {
        console.error('Failed to load goat details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoat();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!goat) return;

    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      if (nextState) {
        await WishlistRepository.addToWishlist(user.id, goat.id);
      } else {
        await WishlistRepository.removeFromWishlist(user.id, goat.id);
      }
    } catch {
      setIsSaved(!nextState);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: goat?.name || 'Adu Santhai Goat Listing',
          text: `Check out this ${goat?.breedName} goat (${goat?.weightKg} kg) on Adu Santhai!`,
          url,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 aspect-4/3 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 w-3/4 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-12 w-1/2 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-14 w-full bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!goat) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Goat Listing Not Found</h2>
        <p className="text-sm text-slate-500">
          This goat may have been sold or removed from the marketplace.
        </p>
        <Link to="/marketplace">
          <Button variant="default">Browse Available Goats</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = goat.status === 'AVAILABLE';
  const isReserved = goat.status === 'RESERVED' || goat.status === 'BOOKING_PENDING';
  const isSold = goat.status === 'SOLD' || goat.status === 'COMPLETED';

  return (
    <>
      <SEOHead
        title={`${goat.name} (${goat.breedName}) | Adu Santhai`}
        description={`Buy ${goat.breedName} goat #${goat.goatCode} (${goat.weightKg} kg, ${formatAge(goat.ageMonths)}) from ${goat.farmName}. Price: ${formatCurrency(goat.finalPrice)}. Reserve with 24h hold.`}
        image={goat.primaryPhoto}
        path={`/goats/${goat.id}`}
        type="product"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 lg:pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-emerald-800 transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to="/marketplace" className="hover:text-emerald-800 transition-colors">Marketplace</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link to={`/marketplace?breed=${encodeURIComponent(goat.breedName)}`} className="hover:text-emerald-800 transition-colors">
            {goat.breedName}
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate max-w-[200px]">{goat.name}</span>
        </nav>

        {/* TOP FLAGSHIP PRODUCT SECTION (Split 7 / 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: Large Interactive Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xs">
              <img
                src={activePhoto || goat.primaryPhoto}
                alt={goat.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Status Badges Overlays */}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {goat.isFeatured && (
                  <Badge variant="earth" className="shadow-xs font-bold text-xs">
                    FEATURED LIVESTOCK
                  </Badge>
                )}
                {isReserved && (
                  <Badge variant="reserved" className="shadow-xs font-bold text-xs">
                    24-HOUR HOLD ACTIVE
                  </Badge>
                )}
                {isSold && (
                  <Badge variant="sold" className="shadow-xs font-bold text-xs">
                    SOLD
                  </Badge>
                )}
              </div>

              {/* Floating Wishlist & Share buttons */}
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share listing"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs text-slate-700 hover:bg-white transition-transform active:scale-95 cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs text-slate-700 hover:bg-white transition-transform active:scale-95 cursor-pointer"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      isSaved ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
                    }`}
                  />
                </button>
              </div>

              {copySuccess && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1 text-xs text-white backdrop-blur-xs">
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {goat.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {goat.photos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(photoUrl)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                      activePhoto === photoUrl
                        ? 'border-emerald-800 ring-2 ring-emerald-700/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`${goat.name} view ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Flagship Conversion & Specifications Card (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6 lg:sticky lg:top-24">
            {/* Header: Verified + Ear Tag */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <VerifiedBadge label="Adu Santhai Verified" variant="default" />
              <span className="font-mono text-xs text-slate-400">Ear Tag #{goat.goatCode}</span>
            </div>

            {/* Title & Key Line */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {goat.name}
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                <span className="text-emerald-800 font-bold">{goat.breedName}</span>
                {' • '}
                <span>{goat.gender}</span>
                {' • '}
                <span>{goat.purpose}</span>
              </p>
            </div>

            {/* Dominant Price Display (Section 11) */}
            <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                Direct Breeder Price
              </span>
              <PriceDisplay
                price={goat.price}
                finalPrice={goat.finalPrice}
                hasDiscount={goat.hasDiscount}
                discountPercentage={goat.discountPercentage}
                size="lg"
              />
            </div>

            {/* Primary Action CTA (User Refinement 1) */}
            <div className="space-y-2.5">
              {isAvailable ? (
                <Button
                  variant="default"
                  size="lg"
                  className="w-full text-base font-bold h-13 shadow-sm"
                  onClick={() => setShowBookingModal(true)}
                >
                  Reserve Goat
                </Button>
              ) : isReserved ? (
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-900 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Currently Under 24-Hour Reservation</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    A buyer has temporarily reserved this goat. If not completed within 24 hours, it will become available again.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-100 p-4 text-center text-sm font-bold text-slate-600">
                  This goat has been marked as sold.
                </div>
              )}

              {/* Factual Messaging (User Refinement 2) */}
              {isAvailable && (
                <div className="flex items-start gap-2 text-xs text-slate-500 pt-1">
                  <Clock className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
                  <span>
                    <strong>24-hour reservation hold</strong> — Reserve this goat for 24 hours while you complete farm visit or arrange logistics. No advance payment required.
                  </span>
                </div>
              )}
            </div>

            {/* Farm Breeder Snapshot */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-800" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Breeder Information
                  </span>
                </div>
                <VerifiedBadge label="Verified Farm" variant="subtle" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{goat.farmName}</h4>
                  <p className="text-xs text-slate-500">{goat.farmLocation || 'Tamil Nadu, India'}</p>
                </div>

                <Link
                  to={`/farms/${goat.farmId}`}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  View Farm →
                </Link>
              </div>

              {/* Call & WhatsApp CTAs */}
              {goat.farmContact && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${goat.farmContact}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-emerald-800" />
                    <span>Call Breeder</span>
                  </a>
                  <a
                    href={`https://wa.me/${goat.farmContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello, I saw goat #${goat.goatCode} (${goat.name}, ${goat.breedName}) on Adu Santhai and would like more details.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 px-3 text-xs font-bold text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-800" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DETAILED SPECIFICATIONS SECTION */}
        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Specifications & Health Records</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Age
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {formatAge(goat.ageMonths)}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Live Weight
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {goat.weightKg} kg
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Gender
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {goat.gender}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Breed
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {goat.breedName}
              </span>
            </div>
          </div>

          {/* Health & Lineage Badges Row */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
              <span className="text-slate-600">
                Vaccination Status:{' '}
                <strong className={goat.vaccinationStatus ? 'text-emerald-800' : 'text-slate-700'}>
                  {goat.vaccinationStatus ? 'Up to date' : 'Pending verification'}
                </strong>
              </span>
            </div>

            {goat.dewormedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-800 shrink-0" />
                <span className="text-slate-600">
                  Last Dewormed: <strong>{formatDate(goat.dewormedDate)}</strong>
                </span>
              </div>
            )}

            {goat.parentageFatherTag && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-800 shrink-0" />
                <span className="text-slate-600">
                  Sire Tag: <strong>{goat.parentageFatherTag}</strong>
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ABOUT THIS GOAT (Breeder Description) */}
        {goat.description && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-3">About this Goat</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {goat.description}
            </p>
          </section>
        )}

        {/* RELATED GOATS */}
        {relatedGoats.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  More {goat.breedName} Goats
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore other available goats from the same breed or region.
                </p>
              </div>

              <Link
                to={`/marketplace?breed=${encodeURIComponent(goat.breedName)}`}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                View all {goat.breedName} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedGoats.map((related) => (
                <GoatCard key={related.id} goat={related} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (Section 7 & User Refinement 5) */}
      {isAvailable && (
        <StickyActionBar>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Price</span>
            <span className="text-lg font-black text-emerald-900 leading-tight">
              {formatCurrency(goat.finalPrice)}
            </span>
          </div>

          <Button
            variant="default"
            size="default"
            className="font-bold text-sm px-6 h-11"
            onClick={() => setShowBookingModal(true)}
          >
            Reserve Goat
          </Button>
        </StickyActionBar>
      )}

      {/* Booking Hold Modal */}
      <BookingModal
        goat={goat}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="GOAT"
        targetId={goat.id}
        targetTitle={goat.name}
      />
    </>
  );
};
