import { supabase } from '@/lib/supabase/client';
import type { WishlistItem } from '@/types';
import { mapGoatRow } from './GoatRepository';

export const WishlistRepository = {
  /**
   * Fetches full wishlist items with joined goat details for a user.
   */
  async getWishlist(userId: string): Promise<WishlistItem[]> {
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
      console.error('Error fetching wishlist:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      goatId: row.goat_id,
      createdAt: row.created_at,
      goat: row.goats ? mapGoatRow(row.goats) : undefined,
    }));
  },

  /**
   * Fetches only the goat IDs saved in the user's wishlist for instant lookups.
   */
  async getWishlistGoatIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('wishlist')
      .select('goat_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching wishlist goat ids:', error);
      return [];
    }

    return (data || []).map((w) => w.goat_id);
  },

  /**
   * Adds a goat to user's wishlist.
   */
  async addToWishlist(userId: string, goatId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .insert({
        user_id: userId,
        goat_id: goatId,
      });

    if (error && error.code !== '23505') { // Ignore unique constraint violation
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  /**
   * Removes a goat from user's wishlist.
   */
  async removeFromWishlist(userId: string, goatId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('goat_id', goatId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
};
