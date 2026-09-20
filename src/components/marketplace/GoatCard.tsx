import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Goat } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatCurrency, formatAge } from '@/lib/utils';
import { Heart, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { WishlistRepository } from '@/repositories/WishlistRepository';

interface GoatCardProps {
  goat: Goat;
  isWishlisted?: boolean;
  onWishlistToggle?: (goatId: string, isSaved: boolean) => void;
  onOpenBookingModal?: (goat: Goat) => void;
}

export const GoatCard: React.FC<GoatCardProps> = ({
  goat,
  isWishlisted = false,
  onWishlistToggle,
  onOpenBookingModal,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<boolean>(isWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState<boolean>(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const nextState = !saved;
    setSaved(nextState);
    setIsTogglingWishlist(true);

    try {
      if (nextState) {
        await WishlistRepository.addToWishlist(user.id, goat.id);
      } else {
        await WishlistRepository.removeFromWishlist(user.id, goat.id);
      }
      onWishlistToggle?.(goat.id, nextState);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      setSaved(!nextState); // Revert on failure
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const isAvailable = goat.status === 'AVAILABLE';
  const isReserved = goat.status === 'RESERVED' || goat.status === 'BOOKING_PENDING';
  const isSold = goat.status === 'SOLD' || goat.status === 'COMPLETED';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Photo Container */}
      <Link to={`/goats/${goat.id}`} className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={goat.primaryPhoto}
          alt={goat.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {goat.isFeatured && (
            <Badge variant="secondary" className="shadow-xs font-bold text-[11px] bg-amber-400 text-slate-950">
              FEATURED
            </Badge>
          )}
          {goat.hasDiscount && (
            <Badge variant="destructive" className="shadow-xs font-bold text-[11px]">
              {goat.discountPercentage}% OFF
            </Badge>
          )}
          {isReserved && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-900 border-amber-300">
              RESERVED HOLD
            </Badge>
          )}
          {isSold && (
            <Badge variant="slate" className="bg-slate-800 text-white">
              SOLD
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform active:scale-90 hover:bg-white text-slate-700"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              saved ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
            }`}
          />
        </button>

        {/* Bottom Farm Tag on Image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-slate-900/75 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="truncate max-w-[150px]">{goat.farmName}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              {goat.breedName}
            </span>
            <Link to={`/goats/${goat.id}`}>
              <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                {goat.name}
              </h3>
            </Link>
          </div>
          <span className="font-mono text-xs text-slate-400">#{goat.goatCode}</span>
        </div>

        {/* Key Metrics Chips */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-50 p-2 text-center text-xs text-slate-600">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Gender</span>
            <span className="font-semibold text-slate-800">{goat.gender}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Age</span>
            <span className="font-semibold text-slate-800">{formatAge(goat.ageMonths)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Weight</span>
            <span className="font-semibold text-slate-800">{goat.weightKg} kg</span>
          </div>
        </div>

        {/* Location & Health Note */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[180px]">{goat.farmLocation}</span>
          {goat.vaccinationStatus && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Vaccinated
            </span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
          {/* Price Display */}
          <div>
            {goat.hasDiscount && (
              <span className="text-xs text-slate-400 line-through mr-1.5">
                {formatCurrency(goat.price)}
              </span>
            )}
            <div className="text-lg font-extrabold text-emerald-700">
              {formatCurrency(goat.finalPrice)}
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex gap-1.5">
            {isAvailable ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3"
                onClick={() => {
                  if (onOpenBookingModal) {
                    onOpenBookingModal(goat);
                  } else {
                    navigate(`/goats/${goat.id}`);
                  }
                }}
              >
                Reserve Hold
              </Button>
            ) : (
              <Link
                to={`/goats/${goat.id}`}
                className={buttonVariants({ size: 'sm', variant: 'outline', className: 'text-xs' })}
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
