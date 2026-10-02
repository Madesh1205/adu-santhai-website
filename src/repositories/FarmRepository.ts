import { supabase, resolveStorageUrl, BUCKET_GOAT_IMAGES } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { Farm } from '@/types';

type FarmRow = Database['public']['Tables']['farms']['Row'];

export function mapFarmRow(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    tagline: row.tagline,
    description: row.description,
    locationDistrict: row.location_district,
    locationState: row.location_state,
    address: row.address,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    status: row.status,
    isAmmalOwnFarm: row.is_ammal_own_farm ?? false,
    verifiedAt: row.verified_at,
    rating: Number((row as any).rating ?? 5.0),
    reviewCount: Number((row as any).review_count ?? 0),
    logoUrl: row.logo_url ? resolveStorageUrl(row.logo_url, BUCKET_GOAT_IMAGES) : null,
    bannerUrl: row.banner_url ? resolveStorageUrl(row.banner_url, BUCKET_GOAT_IMAGES) : null,
    goatListingLimit: Number(row.goat_listing_limit ?? 2),
    farmCode: row.farm_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const FarmRepository = {
  /**
   * Fetches all approved partner & ammal farms for the public directory.
   */
  async getApprovedFarms(): Promise<Farm[]> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('status', 'APPROVED')
      .order('is_ammal_own_farm', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approved farms:', error);
      throw error;
    }

    return (data || []).map(mapFarmRow);
  },

  /**
   * Fetches single farm by ID.
   */
  async getFarmById(id: string): Promise<Farm | null> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching farm by id:', error);
      throw error;
    }

    if (!data) return null;
    return mapFarmRow(data);
  },

  /**
   * Fetches farm owned by a specific user.
   */
  async getFarmByOwnerId(ownerId: string): Promise<Farm | null> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching farm by ownerId:', error);
      return null;
    }

    if (!data) return null;
    return mapFarmRow(data);
  },

  /**
   * Registers a new partner farm application.
   */
  async registerFarm(
    farmData: Database['public']['Tables']['farms']['Insert']
  ): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .insert({
        ...farmData,
        status: 'PENDING',
        is_ammal_own_farm: false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error registering farm:', error);
      throw error;
    }

    return mapFarmRow(data);
  },

  /**
   * Updates an existing farm profile.
   */
  async updateFarm(
    id: string,
    updates: Database['public']['Tables']['farms']['Update']
  ): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating farm:', error);
      throw error;
    }

    return mapFarmRow(data);
  },
};
