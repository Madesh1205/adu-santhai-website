import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { BookingRepository } from '@/repositories/BookingRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Booking } from '@/types';
import {
  CalendarCheck,
  Clock,
  PhoneCall,
  XCircle,
  ExternalLink,
} from 'lucide-react';

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Hold Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      isExpired ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900 border border-amber-300'
    }`}>
      <Clock className="h-3.5 w-3.5 animate-pulse" />
      <span>{timeLeft}</span>
    </div>
  );
}

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await BookingRepository.getCustomerBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelReservation = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this 24-hour reservation hold? The goat will become available for other buyers.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await BookingRepository.updateBookingStatus(bookingId, 'CANCELLED', 'Cancelled by customer');
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Could not cancel booking. Please try again or contact farm.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <SEOHead title="My Goat Reservations | Adu Santhai" path="/my-bookings" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Goat Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your authoritative 24-hour holding codes and coordinate farm inspections
          </p>
        </div>

        {loading ? (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Reservations Placed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reserved any goats. Browse our verified marketplace to place zero-risk 24-hour holds on premium livestock.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {bookings.map((b) => {
              const isHold = b.status === 'RESERVED' || b.status === 'PENDING';
              return (
                <div
                  key={b.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Goat Info */}
                      <div className="flex items-start gap-4">
                        <img
                          src={b.goatPhoto || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80'}
                          alt={b.goatName}
                          className="h-20 w-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">{b.goatName}</h3>
                            <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Breed: <strong className="text-slate-800">{b.goatBreed}</strong> • Farm: <strong className="text-slate-800">{b.farmName}</strong>
                          </p>
                          <p className="text-xs text-slate-400">
                            Booked on {formatDateTime(b.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Booking Code & Status */}
                      <div className="flex flex-col sm:items-end gap-2">
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
                          className="text-xs font-bold"
                        >
                          {b.status}
                        </Badge>

                        <div className="flex flex-col sm:items-end">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                            Booking Code
                          </span>
                          <span className="font-mono font-black text-lg text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-lg border border-emerald-200">
                            {b.bookingCode || 'AGF-HOLD'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Hold Status Bar */}
                    {isHold && (
                      <div className="mt-5 rounded-2xl bg-amber-50/70 border border-amber-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-amber-950">Active 24-Hour Hold Window:</span>
                            <CountdownTimer expiresAt={b.holdExpiresAt} />
                          </div>
                          <p className="text-xs text-amber-800">
                            Please contact breeder <strong>{b.farmName}</strong> to verify health records or schedule your farm visit before the hold expires.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {b.farmContact && (
                            <a
                              href={`tel:${b.farmContact}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                            >
                              <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Call Farm</span>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelReservation(b.id)}
                            isLoading={cancellingId === b.id}
                            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancel Hold
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                      <div className="flex items-center gap-4">
                        <span>
                          Price Snapshot: <strong className="text-slate-900 font-bold">{formatCurrency(b.totalPrice)}</strong>
                        </span>
                        {b.customerNotes && (
                          <span className="truncate max-w-xs italic text-slate-400">
                            "{b.customerNotes}"
                          </span>
                        )}
                      </div>

                      {b.goatId && (
                        <Link
                          to={`/goats/${b.goatId}`}
                          className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                        >
                          <span>View Goat Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
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
