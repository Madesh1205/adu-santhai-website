import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Flag,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  Building2,
  Clock,
  ChevronRight,
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
    setTimeout(() => setCopySuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-4/3 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!goat) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900">Goat Listing Not Found</h2>
        <p className="mt-2 text-xs text-slate-500 max-w-sm">
          This listing may have been sold, archived, or removed by administration.
        </p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link to="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const isAvailable = goat.status === 'AVAILABLE';
  const isReserved = goat.status === 'RESERVED' || goat.status === 'BOOKING_PENDING';
  const isSold = goat.status === 'SOLD' || goat.status === 'COMPLETED';

  // Structured product schema for SEO
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: goat.name,
    image: goat.photos,
    description: goat.description || `${goat.breedName} goat from ${goat.farmName}`,
    sku: goat.goatCode,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: goat.finalPrice,
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <SEOHead
        title={`${goat.name} (${goat.breedName}) | Adu Santhai`}
        description={`Buy ${goat.breedName} goat #${goat.goatCode} (${goat.weightKg} kg, ${formatAge(goat.ageMonths)}) from ${goat.farmName}. Price: ${formatCurrency(goat.finalPrice)}. Reserve with 24h hold.`}
        image={goat.primaryPhoto}
        path={`/goats/${goat.id}`}
        type="product"
        schema={productSchema}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-emerald-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/marketplace" className="hover:text-emerald-700">Marketplace</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-800 truncate">{goat.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
              <img
                src={activePhoto || goat.primaryPhoto}
                alt={goat.name}
                className="h-full w-full object-cover transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Status & Discount Overlays */}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {goat.isFeatured && (
                  <Badge variant="secondary" className="font-bold bg-amber-400 text-slate-950 shadow-md">
                    FEATURED
                  </Badge>
                )}
                {goat.hasDiscount && (
                  <Badge variant="destructive" className="font-bold shadow-md">
                    {goat.discountPercentage}% DISCOUNT
                  </Badge>
                )}
                {isReserved && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300 font-bold">
                    RESERVED (24H HOLD)
                  </Badge>
                )}
                {isSold && (
                  <Badge variant="slate" className="bg-slate-900 text-white font-bold">
                    SOLD OUT
                  </Badge>
                )}
              </div>

              {/* Verified Ammal Farm Watermark Badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Adu Santhai Verified</span>
              </div>
            </div>

            {/* Thumbnail Carousel Strip */}
            {goat.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {goat.photos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhoto(photoUrl)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                      activePhoto === photoUrl
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30'
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

          {/* Right Column: Pricing, Specs & Booking Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Strip */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {goat.breedName} • {goat.purpose}
                </span>
                <span className="font-mono text-xs text-slate-400 font-semibold">
                  TAG #{goat.goatCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {goat.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Listed by <Link to={`/farms/${goat.farmId}`} className="font-semibold text-emerald-700 hover:underline">{goat.farmName}</Link> • {goat.farmLocation}
              </p>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200 p-5 space-y-3">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Direct Breeder Price
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-emerald-800">
                  {formatCurrency(goat.finalPrice)}
                </span>
                {goat.hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-base text-slate-400 line-through">
                      {formatCurrency(goat.price)}
                    </span>
                    <Badge variant="destructive" className="text-xs font-bold">
                      Save {formatCurrency(goat.price - goat.finalPrice)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* 24-Hour Hold Guarantee Prompt */}
              <div className="flex items-start gap-2 pt-2 border-t border-emerald-200/80 text-xs text-emerald-900">
                <Clock className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Risk 24h Hold:</strong> Lock this goat exclusively without payment while you visit the farm or inspect the livestock.
                </span>
              </div>

              {/* Primary Booking & Wishlist Actions */}
              <div className="pt-2 flex gap-2">
                {isAvailable ? (
                  <Button
                    size="lg"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-md shadow-emerald-700/20"
                    onClick={() => setShowBookingModal(true)}
                  >
                    Reserve Goat (24h Hold)
                  </Button>
                ) : isReserved ? (
                  <Button size="lg" disabled className="flex-1 bg-amber-500 text-slate-950 font-bold">
                    Currently on 24h Hold
                  </Button>
                ) : (
                  <Button size="lg" disabled className="flex-1 bg-slate-800 text-white font-bold">
                    Goat Sold Out
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={`px-3.5 transition-colors ${
                    isSaved ? 'text-rose-600 border-rose-300 bg-rose-50' : ''
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-rose-500' : ''}`} />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  className="px-3.5"
                  aria-label="Share"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {copySuccess && (
                <p className="text-center text-xs font-semibold text-emerald-700">
                  Link copied to clipboard!
                </p>
              )}
            </div>

            {/* Specifications Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Livestock Specifications
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Breed</span>
                  <span className="font-bold text-slate-800 text-sm">{goat.breedName}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-slate-800 text-sm">{goat.gender}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Age</span>
                  <span className="font-bold text-slate-800 text-sm">{formatAge(goat.ageMonths)}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Current Weight</span>
                  <span className="font-bold text-slate-800 text-sm">{goat.weightKg} kg</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Vaccination Status</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {goat.vaccinationStatus || 'Verified Up-To-Date'}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-400 block font-medium">Last Dewormed</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {formatDate(goat.dewormedDate)}
                  </span>
                </div>
                {goat.parentageFatherTag && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block font-medium">Sire (Father Tag)</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">
                      {goat.parentageFatherTag}
                    </span>
                  </div>
                )}
                {goat.parentageMotherTag && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block font-medium">Dam (Mother Tag)</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">
                      {goat.parentageMotherTag}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Contact & Profile Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">Breeder Information</span>
                </div>
                <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="h-3 w-3 mr-1" /> VERIFIED
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">{goat.farmName}</h4>
                <p className="text-xs text-slate-500">{goat.farmLocation}</p>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={`tel:${goat.farmContact}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Call Breeder</span>
                </a>
                <a
                  href={`https://wa.me/${goat.farmContact?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello, I am interested in goat #${goat.goatCode} (${goat.name}, ${goat.breedName}) on Adu Santhai.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to={`/farms/${goat.farmId}`}
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  View All Listings from this Farm →
                </Link>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breeder Description Section */}
        {goat.description && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-3">About this Goat</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {goat.description}
            </p>
          </div>
        )}

        {/* Related Listings */}
        {relatedGoats.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              More {goat.breedName} Goats
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGoats.map((related) => (
                <GoatCard key={related.id} goat={related} />
              ))}
            </div>
          </div>
        )}
      </div>

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
