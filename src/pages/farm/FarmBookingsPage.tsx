import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { BookingRepository } from '@/repositories/BookingRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import {
  CalendarCheck,
  PhoneCall,
  CheckCircle,
  XCircle,
  Check,
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
      <SEOHead title="Bookings & Orders Received | Farm Admin" path="/farm/bookings" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">
            Bookings & Reservations Received
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage buyer reservations, verify holds with booking codes, and mark completed sales
          </p>
        </div>

        {/* Tab Filters */}
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
              className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <CalendarCheck className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Orders in this View</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Holding reservations and confirmed purchases placed by buyers will show here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isHold = b.status === 'RESERVED' || b.status === 'PENDING';
              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{b.goatName}</h3>
                        <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                        <Badge
                          variant={
                            b.status === 'CONFIRMED'
                              ? 'default'
                              : isHold
                              ? 'secondary'
                              : b.status === 'COMPLETED'
                              ? 'slate'
                              : 'destructive'
                          }
                          className="text-[10px] font-bold"
                        >
                          {b.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                        <span>
                          Customer: <strong className="text-slate-900">{b.customerName}</strong>
                        </span>
                        <span>• Phone: {b.customerPhone || 'N/A'}</span>
                        <span>• Ordered {formatDateTime(b.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Hold Verification Code
                      </span>
                      <span className="font-mono font-black text-lg text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-lg border border-emerald-200">
                        {b.bookingCode || 'AGF-HOLD'}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 mt-1">
                        {formatCurrency(b.totalPrice)}
                      </span>
                    </div>
                  </div>

                  {b.customerNotes && (
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Buyer Notes: </span>
                      "{b.customerNotes}"
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {b.customerPhone && (
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Call Buyer ({b.customerPhone})</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isHold && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                            isLoading={updatingId === b.id}
                            onClick={() => handleStatusUpdate(b.id, 'CONFIRMED')}
                          >
                            <Check className="h-3.5 w-3.5" /> Confirm Deal
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                            isLoading={updatingId === b.id}
                            onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Release Hold
                          </Button>
                        </>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs gap-1"
                          isLoading={updatingId === b.id}
                          onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Mark Delivered & Sold
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
