import { supabase } from '@/lib/supabase/client';

export interface ReviewItem {
  id: string;
  goatId: string;
  farmId: string;
  customerId: string | null;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSubmission {
  goatId: string;
  farmId: string;
  bookingId?: string;
  rating: number;
  comment: string;
}

export const ReviewRepository = {
  /**
   * Fetches approved customer reviews for a specific goat.
   * Gracefully returns empty list if reviews table is not populated.
   */
  async getGoatReviews(goatId: string): Promise<ReviewItem[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          goat_id,
          farm_id,
          customer_id,
          rating,
          comment,
          is_verified_purchase,
          created_at,
          profiles:customer_id (
            name
          )
        `)
        .eq('goat_id', goatId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Table may not be created or cached yet; return gracefully
        return [];
      }

      return (data || []).map((r: any) => ({
        id: r.id,
        goatId: r.goat_id,
        farmId: r.farm_id,
        customerId: r.customer_id,
        customerName: r.profiles?.name || 'Verified Buyer',
        rating: Number(r.rating || 5),
        comment: r.comment,
        isVerifiedPurchase: Boolean(r.is_verified_purchase),
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetches reviews for all goats belonging to a farm.
   */
  async getFarmReviews(farmId: string): Promise<ReviewItem[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          goat_id,
          farm_id,
          customer_id,
          rating,
          comment,
          is_verified_purchase,
          created_at,
          profiles:customer_id (
            name
          )
        `)
        .eq('farm_id', farmId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) return [];

      return (data || []).map((r: any) => ({
        id: r.id,
        goatId: r.goat_id,
        farmId: r.farm_id,
        customerId: r.customer_id,
        customerName: r.profiles?.name || 'Verified Buyer',
        rating: Number(r.rating || 5),
        comment: r.comment,
        isVerifiedPurchase: Boolean(r.is_verified_purchase),
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submits a customer review for a purchase.
   */
  async submitReview(userId: string, input: ReviewSubmission): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          customer_id: userId,
          goat_id: input.goatId,
          farm_id: input.farmId,
          booking_id: input.bookingId || null,
          rating: input.rating,
          comment: input.comment,
          is_approved: true, // Auto-approved or pending based on system rules
          is_verified_purchase: Boolean(input.bookingId),
        });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit review' };
    }
  },
};
