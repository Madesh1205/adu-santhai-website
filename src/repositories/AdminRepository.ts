import { supabase } from '@/lib/supabase/client';
import type { PlatformStats, Goat, Farm, Booking, BookingStatus, UserProfile, UserRole } from '@/types';
import { mapGoatRow } from './GoatRepository';
import { mapFarmRow } from './FarmRepository';
import { mapBookingRow } from './BookingRepository';

export const AdminRepository = {
  /**
   * Aggregates real-time platform statistics for the Super Admin dashboard.
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const [
      goatsRes,
      pendingGoatsRes,
      activeFarmsRes,
      pendingFarmsRes,
      suspendedFarmsRes,
      totalBookingsRes,
      activeBookingsRes,
      completedBookingsRes,
      customersRes,
      reportsRes,
    ] = await Promise.all([
      supabase.from('goats').select('*', { count: 'exact', head: true }),
      supabase.from('goats').select('*', { count: 'exact', head: true }).eq('is_approved_by_admin', false),
      supabase.from('farms').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED'),
      supabase.from('farms').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('farms').select('*', { count: 'exact', head: true }).eq('status', 'SUSPENDED'),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'RESERVED', 'CONFIRMED']),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    ]);

    // Sum revenue from completed bookings
    const { data: revData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'COMPLETED');

    const totalRevenue = (revData || []).reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);

    return {
      totalGoats: goatsRes.count ?? 0,
      pendingListings: pendingGoatsRes.count ?? 0,
      activeFarms: activeFarmsRes.count ?? 0,
      pendingFarms: pendingFarmsRes.count ?? 0,
      suspendedFarms: suspendedFarmsRes.count ?? 0,
      totalBookings: totalBookingsRes.count ?? 0,
      activeBookings: activeBookingsRes.count ?? 0,
      completedBookings: completedBookingsRes.count ?? 0,
      totalCustomers: customersRes.count ?? 0,
      totalRevenue,
      totalReports: reportsRes.count ?? 0,
    };
  },

  /**
   * Fetches unapproved goat listings pending moderation.
   */
  async getPendingGoats(): Promise<Goat[]> {
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
      .eq('is_approved_by_admin', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending goats:', error);
      return [];
    }

    return (data || []).map(mapGoatRow);
  },

  /**
   * Approves a goat listing.
   */
  async approveGoat(goatId: string): Promise<void> {
    const { error } = await supabase
      .from('goats')
      .update({
        is_approved_by_admin: true,
        status: 'AVAILABLE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', goatId);

    if (error) {
      console.error('Error approving goat:', error);
      throw error;
    }
  },

  /**
   * Rejects a goat listing.
   */
  async rejectGoat(goatId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('goats')
      .update({
        is_approved_by_admin: false,
        status: 'INACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', goatId);

    if (error) {
      console.error('Error rejecting goat:', error);
      throw error;
    }

    // Log in audit logs
    if (notes) {
      await supabase.from('audit_logs').insert({
        action: 'REJECT_GOAT',
        target_type: 'GOAT',
        target_id: goatId,
        notes,
      });
    }
  },

  /**
   * Toggles featured status of a goat on the homepage.
   */
  async toggleFeatureGoat(goatId: string, isFeatured: boolean): Promise<void> {
    const { error } = await supabase
      .from('goats')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', goatId);

    if (error) {
      console.error('Error toggling featured goat:', error);
      throw error;
    }
  },

  /**
   * Fetches farms pending approval or verification.
   */
  async getPendingFarms(): Promise<Farm[]> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending farms:', error);
      return [];
    }

    return (data || []).map(mapFarmRow);
  },

  /**
   * Approves and verifies a farm.
   */
  async verifyFarm(farmId: string, goatListingLimit: number = 2): Promise<void> {
    const { error } = await supabase
      .from('farms')
      .update({
        status: 'APPROVED',
        verified_at: new Date().toISOString(),
        goat_listing_limit: goatListingLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId);

    if (error) {
      console.error('Error verifying farm:', error);
      throw error;
    }
  },

  /**
   * Suspends a farm from publishing or taking bookings.
   */
  async suspendFarm(farmId: string): Promise<void> {
    const { error } = await supabase
      .from('farms')
      .update({
        status: 'SUSPENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', farmId);

    if (error) {
      console.error('Error suspending farm:', error);
      throw error;
    }
  },

  /**
   * Updates farm listing limit (quota).
   */
  async updateFarmListingLimit(farmId: string, limit: number): Promise<void> {
    const { error } = await supabase
      .from('farms')
      .update({ goat_listing_limit: limit, updated_at: new Date().toISOString() })
      .eq('id', farmId);

    if (error) {
      console.error('Error updating farm quota:', error);
      throw error;
    }
  },

  /**
   * Fetches all platform bookings for the Super Admin management console.
   */
  async getAllBookings(statusFilter?: BookingStatus | 'ALL'): Promise<Booking[]> {
    let query = supabase
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
          id, full_name, phone, email
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching admin bookings:', error);
      throw error;
    }

    return (data || []).map(mapBookingRow);
  },

  /**
   * Super Admin override for booking status.
   */
  async updateBookingStatusAdmin(
    bookingId: string,
    status: BookingStatus,
    adminNotes?: string
  ): Promise<void> {
    // Use the same locked, server-authoritative lifecycle RPCs as Farm Admin.
    // Database authorization allows Super Admins to manage platform bookings.
    let rpcName: 'confirm_booking' | 'complete_booking' | 'cancel_booking';
    const params: Record<string, string | null> = { p_booking_id: bookingId };

    if (status === 'CONFIRMED') {
      rpcName = 'confirm_booking';
    } else if (status === 'COMPLETED') {
      rpcName = 'complete_booking';
    } else if (status === 'CANCELLED') {
      rpcName = 'cancel_booking';
      params.p_reason = adminNotes?.trim() || 'Cancelled by Super Admin';
    } else {
      throw new Error(`Unsupported booking status transition: ${status}`);
    }

    const { error } = await (supabase as any).rpc(rpcName, params);
    if (error) {
      console.error(`Admin booking RPC ${rpcName} failed:`, error);
      throw new Error(error.message || 'Could not update booking status.');
    }
  },

  /**
   * Triggers the database RPC to release overdue holds (> 24 hours).
   */
  async expireOverdueBookings(): Promise<number> {
    const { data, error } = await (supabase.rpc as any)('expire_overdue_bookings');
    if (error) {
      console.warn('RPC expire_overdue_bookings notice:', error);
      return 0;
    }
    return Number(data ?? 0);
  },

  /**
   * Fetches all registered user profiles for Super Admin moderation.
   */
  async getAllProfiles(roleFilter?: UserRole | 'ALL'): Promise<UserProfile[]> {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (roleFilter && roleFilter !== 'ALL') {
      query = query.eq('role', roleFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name || 'Anonymous User',
      phone: row.phone || '',
      role: row.role,
      farmId: row.farm_id,
      avatarUrl: row.avatar_url,
      isSuspended: Boolean(row.is_suspended),
      createdAt: row.created_at,
    }));
  },

  /**
   * Suspends or restores a customer or breeder account.
   */
  async toggleUserSuspension(userId: string, isSuspended: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_suspended: isSuspended,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling user suspension:', error);
      throw error;
    }
  },
};
