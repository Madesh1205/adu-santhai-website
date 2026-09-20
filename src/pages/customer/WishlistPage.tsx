import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { WishlistRepository } from '@/repositories/WishlistRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatCard } from '@/components/marketplace/GoatCard';
import { BookingModal } from '@/components/marketplace/BookingModal';
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Saved Wishlist ({items.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your bookmarked goats for quick comparison and reservation holds
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Heart className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Save goats you like while browsing the marketplace to compare prices, genetics, and weights later.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Link to="/marketplace">Browse Goats</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <BookingModal
        goat={selectedGoatForBooking}
        isOpen={Boolean(selectedGoatForBooking)}
        onClose={() => setSelectedGoatForBooking(null)}
      />
    </>
  );
};
