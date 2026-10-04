import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { GoatCardSkeleton } from '@/components/marketplace/GoatCardSkeleton';
import { BookingModal } from '@/components/marketplace/BookingModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import type { WishlistItem, Goat } from '@/types';
import { Heart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGoatForBooking, setSelectedGoatForBooking] = useState<Goat | null>(null);

  const loadWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await WishlistRepository.getWishlist(user.id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [user]);

  const handleWishlistToggle = (_goatId: string, isSaved: boolean) => {
    if (!isSaved) {
      setItems((prev) => prev.filter((i) => i.goatId !== _goatId));
    }
  };

  return (
    <>
      <SEOHead title="Saved Goats Wishlist | Adu Santhai" path="/wishlist" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Saved Wishlist' }]} />

        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Saved Wishlist ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your bookmarked goats for quick comparison and reservation holds.
            </p>
          </div>

          {items.length > 0 && (
            <Link to="/marketplace">
              <Button variant="outline" size="sm">
                Browse More Goats
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <GoatCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save goats you like while browsing the marketplace and find them here later for easy comparison."
            actionLabel="Browse Marketplace"
            actionHref="/marketplace"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              if (!item.goat) return null;
              return (
                <GoatCard
                  key={item.id}
                  goat={item.goat}
                  isWishlisted={true}
                  onWishlistToggle={handleWishlistToggle}
                  onOpenBookingModal={(g) => setSelectedGoatForBooking(g)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Hold Modal */}
      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={!!selectedGoatForBooking}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
