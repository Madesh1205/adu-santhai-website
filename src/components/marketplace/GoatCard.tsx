import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Goat } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { FallbackGoatImage } from '@/components/common/FallbackGoatImage';
import { formatAge } from '@/lib/utils';
import { Heart, Building2 } from 'lucide-react';
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
  const [imgError, setImgError] = useState<boolean>(false);

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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-emerald-700/40 hover:shadow-md">
      {/* 1. DOMINANT IMAGE CONTAINER */}
      <Link to={`/goats/${goat.id}`} className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 block">
        {goat.primaryPhoto && !imgError ? (
          <img
            src={goat.primaryPhoto}
            alt={goat.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
            onError={() => setImgError(true)}
          />
        ) : (
          <FallbackGoatImage breedName={goat.breedName} goatCode={goat.goatCode} />
        )}

        {/* Status Overlays */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {goat.isFeatured && (
            <Badge variant="earth" className="shadow-xs font-bold text-[10px]">
              FEATURED
            </Badge>
          )}
          {isReserved && (
            <Badge variant="reserved" className="shadow-xs text-[10px]">
              24H HOLD
            </Badge>
          )}
          {isSold && (
            <Badge variant="sold" className="shadow-xs text-[10px]">
              SOLD
            </Badge>
          )}
        </div>

        {/* Wishlist Button (Icon Action) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isTogglingWishlist}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-all active:scale-90 hover:bg-white text-slate-700 cursor-pointer"
        >
          <Heart
            className={`h-4.5 w-4.5 transition-colors ${
              saved ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'
            }`}
          />
        </button>
      </Link>

      {/* 2. BODY CONTENT */}
      <div className="flex flex-1 flex-col p-4">
        {/* Verification indicator */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <VerifiedBadge label="Verified" variant="subtle" />
          <span className="font-mono text-[11px] text-slate-400">#{goat.goatCode}</span>
        </div>

        {/* Goat Name */}
        <Link to={`/goats/${goat.id}`}>
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
            {goat.name}
          </h3>
        </Link>

        {/* Breed + Gender + Age / Weight (Clean Bulleted Line) */}
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          <span className="font-semibold text-slate-700">{goat.breedName}</span>
          {' • '}
          <span>{goat.gender}</span>
          {' • '}
          <span>{formatAge(goat.ageMonths)}</span>
          {' • '}
          <span className="font-medium text-slate-700">{goat.weightKg} kg</span>
        </p>

        {/* Farm Line */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600">
          <Building2 className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
          <span className="truncate font-medium">{goat.farmName}</span>
          {goat.farmLocation && (
            <>
              <span className="text-slate-300">•</span>
              <span className="truncate text-slate-400">{goat.farmLocation}</span>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="mt-auto pt-3" />

        {/* 3. PRICE & PRIMARY ACTION */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          {/* Dominant Final Price */}
          <PriceDisplay
            price={goat.price}
            finalPrice={goat.finalPrice}
            hasDiscount={goat.hasDiscount}
            discountPercentage={goat.discountPercentage}
            size="sm"
          />

          {/* Action CTA */}
          <div className="shrink-0">
            {isAvailable ? (
              <Button
                variant="default"
                size="sm"
                className="font-bold text-xs px-3.5 h-9"
                onClick={() => {
                  if (onOpenBookingModal) {
                    onOpenBookingModal(goat);
                  } else {
                    navigate(`/goats/${goat.id}`);
                  }
                }}
              >
                Reserve Goat
              </Button>
            ) : (
              <Link to={`/goats/${goat.id}`}>
                <Button variant="secondary" size="sm" className="font-semibold text-xs px-3 h-9">
                  View Details
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
