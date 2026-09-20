import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { BookingRepository } from '@/repositories/BookingRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import {
  CalendarCheck,
  PhoneCall,
} from 'lucide-react';

export const FarmBookingsPage: React.FC = () => {
  const { farm } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<string>('ALL');

  const loadBookings = useCallback(async () => {
    if (!farm) return;
    setLoading(true);
    try {
      const data = await BookingRepository.getFarmBookings(farm.id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load farm bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [farm]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await BookingRepository.updateBookingStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      console.error('Failed to update booking status:', err);
      alert('Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'HOLDS') return b.status === 'RESERVED' || b.status === 'PENDING';
    if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filterTab === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <>
      <SEOHead title="Customer Reservations | Farm Admin" path="/farm/bookings" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reservations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage incoming 24-hour holds, verify holding codes, and confirm customer pickups
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: `All Orders (${bookings.length})` },
            { id: 'HOLDS', label: `Active 24h Holds (${bookings.filter((b) => b.status === 'RESERVED' || b.status === 'PENDING').length})` },
            { id: 'CONFIRMED', label: `Confirmed (${bookings.filter((b) => b.status === 'CONFIRMED').length})` },
            { id: 'COMPLETED', label: `Completed (${bookings.filter((b) => b.status === 'COMPLETED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No orders found"
            description="You don't have any customer holds matching this tab yet."
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
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={b.goatPhoto || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80'}
                        alt={b.goatName || 'Goat'}
                        className="h-16 w-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{b.goatName}</h3>
                          <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Buyer: <strong className="text-slate-800">{b.customerName || 'Direct Customer'}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Placed: {formatDateTime(b.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      <div className="flex items-center gap-2">
                        {isHold && <Badge variant="reserved">24H HOLD ACTIVE</Badge>}
                        {isConfirmed && <Badge variant="verified">CONFIRMED</Badge>}
                        {isCompleted && <Badge variant="default">COMPLETED</Badge>}
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Holding Code
                        </span>
                        <span className="font-mono text-lg font-black text-emerald-950">
                          {b.bookingCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {b.customerNotes && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                      <strong className="text-slate-800 block mb-0.5">Customer Notes:</strong>
                      {b.customerNotes}
                    </div>
                  )}

                  {/* Order Footer & Action Controls */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Agreed Price: </span>
                      <strong className="text-emerald-800 text-sm font-black">
                        {formatCurrency(b.totalPrice)}
                      </strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {b.customerPhone && (
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 font-bold text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-emerald-800" />
                          <span>Call Buyer ({b.customerPhone})</span>
                        </a>
                      )}

                      {isHold && (
                        <Button
                          variant="default"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                          disabled={updatingId === b.id}
                        >
                          Confirm Order
                        </Button>
                      )}

                      {isConfirmed && (
                        <Button
                          variant="default"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                          disabled={updatingId === b.id}
                        >
                          Mark Completed
                        </Button>
                      )}

                      {(isHold || isConfirmed) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                          disabled={updatingId === b.id}
                        >
                          Cancel
                        </Button>
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
