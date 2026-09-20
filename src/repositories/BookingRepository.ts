import { supabase, resolveStorageUrl } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { Booking, BookingStatus } from '@/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'] & {
  goats?: {
    id: string;
    name: string;
    goat_code: string;
    breed_name: string;
    goat_images?: { image_url: string; is_primary: boolean }[] | null;
  } | null;
  farms?: {
    id: string;
    name: string;
    farm_code: string;
    contact_phone: string;
  } | null;
  profiles?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
};

export function mapBookingRow(row: BookingRow): Booking {
  const images = row.goats?.goat_images || [];
  const primaryImg = images.find((i) => i.is_primary)?.image_url || images[0]?.image_url;
  const photo = resolveStorageUrl(primaryImg);

  return {
    id: row.id,
    goatId: row.goat_id,
    goatName: row.goats?.name ?? 'Goat',
    goatCode: row.goats?.goat_code ?? '',
    goatBreed: row.goats?.breed_name ?? '',
    goatPhoto: photo,
    farmId: row.farm_id,
    farmName: row.farms?.name ?? 'Ammal Farm',
    farmCode: row.farms?.farm_code ?? '',
    farmContact: row.farms?.contact_phone ?? '',
    customerId: row.customer_id,
    customerName: row.profiles?.name ?? 'Customer',
    customerPhone: row.profiles?.phone ?? '',
    customerEmail: row.profiles?.email ?? '',
    status: row.status,
    bookingDate: row.booking_date,
    holdExpiresAt: row.hold_expires_at,
    totalPrice: Number(row.total_price),
    depositPaid: Number(row.deposit_paid),
    customerNotes: row.customer_notes,
    adminNotes: row.admin_notes,
    confirmedAt: row.confirmed_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    bookingCode: row.booking_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface BookingHoldResult {
  success: boolean;
  bookingId?: string;
  bookingCode?: string;
  holdExpiresAt?: string;
  message?: string;
  error?: string;
}

export const BookingRepository = {
  /**
   * Creates an atomic 24-hour booking hold via PostgreSQL RPC.
   * Row-level locks goat, enforces role restrictions, snapshots discounted price,
   * creates booking with AGF-XXXXXX code, and updates goat to RESERVED.
   */
  async createBookingHold(
    goatId: string,
    customerNotes?: string,
    customerId?: string
  ): Promise<BookingHoldResult> {
    const { data, error } = await supabase.rpc('create_booking_hold', {
      p_goat_id: goatId,
      p_notes: customerNotes || '',
      p_customer_id: customerId,
    });

    if (error) {
      console.error('RPC create_booking_hold error:', error);
      throw new Error(error.message || 'Failed to create booking hold');
    }

    const res = data as any;
    if (res?.success === false || res?.error) {
      throw new Error(res.error || res.message || 'Unable to place booking hold');
    }

    return {
      success: true,
      bookingId: res?.booking_id || res?.id,
      bookingCode: res?.booking_code || res?.code,
      holdExpiresAt: res?.hold_expires_at || res?.expires_at,
      message: res?.message || '24-hour hold confirmed successfully',
    };
  },

  /**
   * Fetches bookings made by a specific customer.
   */
  async getCustomerBookings(customerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        goats (
          id, name, goat_code, breed_name,
          goat_images (image_url, is_primary)
        ),
        farms (
          id, name, farm_code, contact_phone
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }

    return (data as BookingRow[] || []).map(mapBookingRow);
  },

  /**
   * Fetches all bookings for a farm admin dashboard.
   */
  async getFarmBookings(farmId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        goats (
          id, name, goat_code, breed_name,
          goat_images (image_url, is_primary)
        ),
        farms (
          id, name, farm_code, contact_phone
        ),
        profiles:customer_id (
          id, name, phone, email
        )
      `)
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching farm bookings:', error);
      throw error;
    }

    return (data as BookingRow[] || []).map(mapBookingRow);
  },

  /**
   * Updates status of a booking (CONFIRMED, COMPLETED, CANCELLED).
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    adminNotes?: string
  ): Promise<void> {
    const updates: Database['public']['Tables']['bookings']['Update'] = {
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString(),
    };

    if (status === 'CONFIRMED') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'COMPLETED') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'CANCELLED') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select('goat_id')
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }

    // Sync goat status accordingly
    if (updatedBooking?.goat_id) {
      if (status === 'CANCELLED' || status === 'EXPIRED') {
        await supabase
          .from('goats')
          .update({ status: 'AVAILABLE' })
          .eq('id', updatedBooking.goat_id);
      } else if (status === 'COMPLETED') {
        await supabase
          .from('goats')
          .update({ status: 'SOLD' })
          .eq('id', updatedBooking.goat_id);
      } else if (status === 'CONFIRMED') {
        await supabase
          .from('goats')
          .update({ status: 'CONFIRMED' })
          .eq('id', updatedBooking.goat_id);
      }
    }
  },
};
