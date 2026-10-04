import { supabase } from '@/lib/supabase/client';
import type { WishlistItem } from '@/types';
import { mapGoatRow } from './GoatRepository';

export const WishlistRepository = {
  /**
   * Fetches full wishlist items with joined goat details for a user.
   */
  async getWishlist(userId: string): Promise<WishlistItem[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          id,
          user_id,
          goat_id,
          created_at,
          goats (
            *,
            farms (
              id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
            ),
            goat_images (
              id, image_url, is_primary, display_order
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Wishlist query notice:', error.message || error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        goatId: row.goat_id,
        createdAt: row.created_at,
        goat: row.goats ? mapGoatRow(row.goats) : undefined,
      }));
    } catch (err) {
      console.warn('Wishlist fetch fallback:', err);
      return [];
    }
  },

  /**
   * Fetches only the goat IDs saved in the user's wishlist for instant lookups.
   */
  async getWishlistGoatIds(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('goat_id')
        .eq('user_id', userId);

      if (error) {
        console.warn('Wishlist IDs query notice:', error.message || error);
        return [];
      }

      return (data || []).map((w) => w.goat_id);
    } catch (err) {
      console.warn('Wishlist IDs fetch fallback:', err);
      return [];
    }
  },

  /**
   * Adds a goat to user's wishlist.
   */
  async addToWishlist(userId: string, goatId: string): Promise<void> {
    if (!userId || !goatId) return;
    try {
      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: userId,
          goat_id: goatId,
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violation
        console.warn('Add to wishlist notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Add to wishlist network fallback:', err);
    }
  },

  /**
   * Removes a goat from user's wishlist.
   */
  async removeFromWishlist(userId: string, goatId: string): Promise<void> {
    if (!userId || !goatId) return;
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('goat_id', goatId);

      if (error) {
        console.warn('Remove from wishlist notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Remove from wishlist network fallback:', err);
    }
  },
};
