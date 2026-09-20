import { supabase, resolveStorageUrl } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { Goat, GoatFilterCriteria, Breed } from '@/types';
import { calculateFinalPrice } from '@/types';

type GoatRow = Database['public']['Tables']['goats']['Row'] & {
  farms?: {
    id: string;
    name: string;
    farm_code: string;
    location_district: string;
    location_state: string;
    contact_phone: string;
    is_ammal_own_farm: boolean;
  } | null;
  goat_images?: {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }[] | null;
};

export function mapGoatRow(row: GoatRow): Goat {
  const images = (row.goat_images || []).slice().sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const photos = images.map((img) => resolveStorageUrl(img.image_url)).filter(Boolean);
  const primaryPhoto = photos[0] || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80';
  const discount = Number(row.discount_percentage ?? 0);
  const price = Number(row.price);
  const finalPrice = calculateFinalPrice(price, discount);

  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farms?.name ?? 'Ammal Farm',
    farmCode: row.farms?.farm_code ?? 'FARM-001',
    farmLocation: row.farms ? `${row.farms.location_district}, ${row.farms.location_state}` : 'Tiruvannamalai, Tamil Nadu',
    farmContact: row.farms?.contact_phone ?? '+91 63808 98358',
    name: row.name,
    breedId: row.breed_id,
    breedName: row.breed_name,
    gender: row.gender,
    ageMonths: Number(row.age_months),
    weightKg: Number(row.weight_kg),
    purpose: row.purpose,
    price,
    discountPercentage: discount,
    finalPrice,
    hasDiscount: discount > 0,
    status: row.status,
    description: row.description,
    vaccinationStatus: row.vaccination_status,
    dewormedDate: row.dewormed_date,
    parentageFatherTag: row.parentage_father_tag,
    parentageMotherTag: row.parentage_mother_tag,
    isApprovedByAdmin: row.is_approved_by_admin,
    isFeatured: row.is_featured,
    rating: Number(row.rating ?? 5.0),
    reviewCount: Number(row.review_count ?? 0),
    goatCode: row.goat_code,
    photos,
    primaryPhoto,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const GoatRepository = {
  /**
   * Fetches public approved goats with comprehensive filtering and sorting.
   */
  async getApprovedGoats(filter?: GoatFilterCriteria): Promise<Goat[]> {
    let query = supabase
      .from('goats')
      .select(`
        *,
        farms (
          id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
        ),
        goat_images (
          id, image_url, is_primary, display_order
        )
      `)
      .eq('is_approved_by_admin', true)
      .eq('status', 'AVAILABLE');

    if (filter) {
      if (filter.breed && filter.breed !== 'ALL') {
        query = query.ilike('breed_name', `%${filter.breed}%`);
      }
      if (filter.gender && filter.gender !== 'ALL') {
        query = query.eq('gender', filter.gender);
      }
      if (filter.purpose && filter.purpose !== 'ALL') {
        query = query.eq('purpose', filter.purpose);
      }
      if (filter.farmId) {
        query = query.eq('farm_id', filter.farmId);
      }
      if (filter.minPrice !== undefined && filter.minPrice > 0) {
        query = query.gte('price', filter.minPrice);
      }
      if (filter.maxPrice !== undefined && filter.maxPrice > 0) {
        query = query.lte('price', filter.maxPrice);
      }
      if (filter.minAgeMonths !== undefined) {
        query = query.gte('age_months', filter.minAgeMonths);
      }
      if (filter.maxAgeMonths !== undefined) {
        query = query.lte('age_months', filter.maxAgeMonths);
      }
      if (filter.minWeightKg !== undefined) {
        query = query.gte('weight_kg', filter.minWeightKg);
      }
      if (filter.maxWeightKg !== undefined) {
        query = query.lte('weight_kg', filter.maxWeightKg);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const term = filter.searchQuery.trim();
        query = query.or(`name.ilike.%${term}%,breed_name.ilike.%${term}%,goat_code.ilike.%${term}%`);
      }

      // Sorting
      switch (filter.sortBy) {
        case 'price_low_high':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high_low':
          query = query.order('price', { ascending: false });
          break;
        case 'weight_heaviest':
          query = query.order('weight_kg', { ascending: false });
          break;
        case 'age_youngest':
          query = query.order('age_months', { ascending: true });
          break;
        case 'top_rated':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error in getApprovedGoats:', error);
      throw error;
    }

    return (data as GoatRow[] || []).map(mapGoatRow);
  },

  /**
   * Fetches featured goats for the homepage carousel.
   */
  async getFeaturedGoats(limit: number = 6): Promise<Goat[]> {
    const { data, error } = await supabase
      .from('goats')
      .select(`
        *,
        farms (
          id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
        ),
        goat_images (
          id, image_url, is_primary, display_order
        )
      `)
      .eq('is_approved_by_admin', true)
      .eq('status', 'AVAILABLE')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured goats:', error);
      return [];
    }

    return (data as GoatRow[] || []).map(mapGoatRow);
  },

  /**
   * Fetches single goat by ID.
   */
  async getGoatById(id: string): Promise<Goat | null> {
    const { data, error } = await supabase
      .from('goats')
      .select(`
        *,
        farms (
          id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
        ),
        goat_images (
          id, image_url, is_primary, display_order
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching goat by id:', error);
      throw error;
    }

    if (!data) return null;
    return mapGoatRow(data as GoatRow);
  },

  /**
   * Fetches goats belonging to a specific farm (for public farm profile).
   */
  async getGoatsByFarm(farmId: string): Promise<Goat[]> {
    const { data, error } = await supabase
      .from('goats')
      .select(`
        *,
        farms (
          id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
        ),
        goat_images (
          id, image_url, is_primary, display_order
        )
      `)
      .eq('farm_id', farmId)
      .eq('is_approved_by_admin', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching farm goats:', error);
      return [];
    }

    return (data as GoatRow[] || []).map(mapGoatRow);
  },

  /**
   * Fetches all goats for a farm admin dashboard (including DRAFT, PENDING, RESERVED, SOLD).
   */
  async getMyFarmGoats(farmId: string): Promise<Goat[]> {
    const { data, error } = await supabase
      .from('goats')
      .select(`
        *,
        farms (
          id, name, farm_code, location_district, location_state, contact_phone, is_ammal_own_farm
        ),
        goat_images (
          id, image_url, is_primary, display_order
        )
      `)
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching farm goats for admin:', error);
      throw error;
    }

    return (data as GoatRow[] || []).map(mapGoatRow);
  },

  /**
   * Creates a new goat listing and associates its uploaded photos.
   */
  async createGoatListing(
    goatData: Database['public']['Tables']['goats']['Insert'],
    imageUrls: string[]
  ): Promise<string> {
    const { data, error } = await supabase
      .from('goats')
      .insert(goatData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating goat listing:', error);
      throw error;
    }

    const goatId = data.id;

    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url, idx) => ({
        goat_id: goatId,
        image_url: url,
        is_primary: idx === 0,
        display_order: idx,
      }));

      const { error: imgErr } = await supabase
        .from('goat_images')
        .insert(imageRecords);

      if (imgErr) {
        console.warn('Warning inserting images:', imgErr);
      }
    }

    return goatId;
  },

  /**
   * Updates an existing goat listing.
   */
  async updateGoatListing(
    id: string,
    updates: Database['public']['Tables']['goats']['Update'],
    imageUrls?: string[]
  ): Promise<void> {
    const { error } = await supabase
      .from('goats')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating goat listing:', error);
      throw error;
    }

    if (imageUrls) {
      // Clear existing images and re-insert
      await supabase.from('goat_images').delete().eq('goat_id', id);
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, idx) => ({
          goat_id: id,
          image_url: url,
          is_primary: idx === 0,
          display_order: idx,
        }));
        await supabase.from('goat_images').insert(imageRecords);
      }
    }
  },

  /**
   * Secure deletion of goat listing calling PostgreSQL RPC: delete_goat_listing_secure
   */
  async deleteGoatListing(id: string): Promise<boolean> {
    // Attempt RPC delete
    const { data, error } = await (supabase.rpc as any)('delete_goat_listing_secure', {
      p_goat_id: id,
    });

    if (error) {
      console.warn('RPC delete_goat_listing_secure failed, trying standard delete:', error);
      const { error: directErr } = await supabase.from('goats').delete().eq('id', id);
      if (directErr) throw directErr;
      return true;
    }

    return Boolean(data);
  },

  /**
   * Fetches active breeds list.
   */
  async getBreeds(): Promise<Breed[]> {
    const { data, error } = await supabase
      .from('breeds')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching breeds:', error);
      return [];
    }

    return (data || []).map((b) => ({
      id: b.id,
      name: b.name,
      origin: b.origin,
      primaryPurpose: b.primary_purpose,
      description: b.description,
      avgWeightKg: b.avg_weight_kg ? Number(b.avg_weight_kg) : null,
      isActive: b.is_active ?? true,
    }));
  },
};
