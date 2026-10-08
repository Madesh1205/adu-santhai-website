import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { DEFAULT_GOAT_IMAGE_FALLBACK } from '@/components/common/FallbackGoatImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import {
  CalendarCheck,
  Clock,
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  User,
  Building2,
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isExpiring, setIsExpiring] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminRepository.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
      return;
    }
    setUpdatingId(bookingId);
    try {
      await AdminRepository.updateBookingStatusAdmin(bookingId, newStatus, `Updated by Super Admin`);
      await loadBookings();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExpireOverdue = async () => {
    setIsExpiring(true);
    try {
      const releasedCount = await AdminRepository.expireOverdueBookings();
      alert(`Cleanup completed. ${releasedCount} expired hold(s) were released.`);
      await loadBookings();
    } catch (err) {
      console.error('Failed to expire overdue bookings:', err);
      alert('Failed to execute overdue bookings cleanup.');
    } finally {
      setIsExpiring(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    // Status filter
    if (filterTab === 'HOLDS' && b.status !== 'RESERVED' && b.status !== 'PENDING') return false;
    if (filterTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
    if (filterTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;
    if (filterTab === 'CANCELLED' && b.status !== 'CANCELLED' && b.status !== 'EXPIRED') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = (b.bookingCode || '').toLowerCase().includes(q);
      const matchCustomer = (b.customerName || '').toLowerCase().includes(q) || (b.customerPhone || '').includes(q);
      const matchGoat = (b.goatName || '').toLowerCase().includes(q) || (b.goatCode || '').toLowerCase().includes(q);
      const matchFarm = (b.farmName || '').toLowerCase().includes(q);
      return matchCode || matchCustomer || matchGoat || matchFarm;
    }

    return true;
  });

  return (
    <>
      <SEOHead title="Platform Bookings Moderation | Super Admin" path="/admin/bookings" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform Reservations & Orders</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Supervise all 24-hour reservation holds, direct farmer transactions, and dispute resolutions
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExpireOverdue}
              disabled={isExpiring}
              className="text-xs font-bold gap-1.5"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isExpiring ? 'animate-spin' : ''}`} />
              <span>Release Overdue Holds</span>
            </Button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
            {[
              { id: 'ALL', label: `All (${bookings.length})` },
              { id: 'HOLDS', label: `Active Holds (${bookings.filter((b) => b.status === 'RESERVED' || b.status === 'PENDING').length})` },
              { id: 'CONFIRMED', label: `Confirmed (${bookings.filter((b) => b.status === 'CONFIRMED').length})` },
              { id: 'COMPLETED', label: `Completed (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
              { id: 'CANCELLED', label: `Cancelled/Expired (${bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`rounded-xl px-3.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === tab.id
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, customer, goat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No bookings match your filter"
            description="There are currently no customer reservations or completed orders in this category."
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isHold = b.status === 'RESERVED' || b.status === 'PENDING';
              const isConfirmed = b.status === 'CONFIRMED';
              const isCompleted = b.status === 'COMPLETED';

              return (
                <div
                  key={b.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={b.goatPhoto || DEFAULT_GOAT_IMAGE_FALLBACK}
                          alt={b.goatName || 'Goat'}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_GOAT_IMAGE_FALLBACK;
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {b.bookingCode || 'AGF-HOLD'}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{b.goatName}</span>
                          <span className="text-[11px] text-slate-500">({b.goatBreed})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Created {formatDateTime(b.createdAt)} • Ear Tag #{b.goatCode || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isHold
                            ? 'reserved'
                            : isConfirmed
                            ? 'verified'
                            : isCompleted
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-xs uppercase"
                      >
                        {b.status}
                      </Badge>
                      <span className="font-black text-sm text-slate-900 ml-2">
                        {formatCurrency(b.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Customer, Farm, & Notes Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <User className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Customer</span>
                      </div>
                      <p className="font-semibold text-slate-900">{b.customerName || 'Direct Buyer'}</p>
                      <p className="text-slate-500">{b.customerPhone || 'No phone provided'}</p>
                      <p className="text-slate-500">{b.customerEmail || ''}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Building2 className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Breeder Farm</span>
                      </div>
                      <p className="font-semibold text-slate-900">{b.farmName}</p>
                      <p className="text-slate-500">Farm Code: #{b.farmCode}</p>
                      <p className="text-slate-500">{b.farmContact}</p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Clock className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Reservation Timeline</span>
                      </div>
                      <p className="text-slate-600">Hold Expires: {formatDateTime(b.holdExpiresAt)}</p>
                      {b.customerNotes && (
                        <p className="text-slate-500 italic mt-1">"{b.customerNotes}"</p>
                      )}
                    </div>
                  </div>

                  {/* Super Admin Status Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-xs text-slate-500">
                      {b.adminNotes && (
                        <span>Admin Note: <strong className="text-slate-700">{b.adminNotes}</strong></span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isHold && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                            disabled={updatingId === b.id}
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Confirm Order</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                            disabled={updatingId === b.id}
                            className="text-xs font-bold gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel & Release</span>
                          </Button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                            disabled={updatingId === b.id}
                            className="text-xs font-bold gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Mark Completed / Sold</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                            disabled={updatingId === b.id}
                            className="text-xs font-bold gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel Order</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
