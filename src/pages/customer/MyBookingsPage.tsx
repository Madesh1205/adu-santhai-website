import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { BookingRepository } from '@/repositories/BookingRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Booking } from '@/types';
import {
  CalendarCheck,
  Clock,
  PhoneCall,
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

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s remaining`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
        isExpired
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
      }`}
    >
      <Clock className={`h-3.5 w-3.5 ${isExpired ? '' : 'animate-pulse text-emerald-800'}`} />
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

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Goat Reservations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your authoritative 24-hour holding codes and coordinate inspection with the breeder.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="You haven't reserved a goat yet"
            description="Browse our verified marketplace and reserve your preferred goat with a 24-hour hold guarantee. No advance payment required."
            actionLabel="Browse Marketplace"
            actionHref="/marketplace"
          />
        ) : (
          <div className="space-y-5">
            {bookings.map((b) => {
              const isHold = b.status === 'RESERVED' || b.status === 'PENDING';
              const isConfirmed = b.status === 'CONFIRMED';
              const isCompleted = b.status === 'COMPLETED';
              const isCancelled = b.status === 'CANCELLED' || b.status === 'EXPIRED';

              return (
                <div
                  key={b.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-700/30 hover:shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Goat Identity */}
                    <div className="flex items-start gap-4">
                      <img
                        src={b.goatPhoto || 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=400&q=80'}
                        alt={b.goatName || 'Reserved Goat'}
                        className="h-20 w-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/goats/${b.goatId}`}
                            className="font-bold text-base text-slate-900 hover:text-emerald-800 transition-colors"
                          >
                            {b.goatName || `Goat #${b.goatCode}`}
                          </Link>
                          <span className="font-mono text-xs text-slate-400">#{b.goatCode}</span>
                        </div>

                        <p className="text-xs text-slate-500">
                          Breeder: <strong className="text-slate-800">{b.farmName}</strong>
                        </p>

                        <div className="pt-1">
                          <span className="text-xs text-slate-400 block">Total Agreed Price:</span>
                          <span className="text-base font-extrabold text-emerald-900">
                            {formatCurrency(b.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Holding Code & Status Badges */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        {isHold && <Badge variant="reserved">24H HOLD ACTIVE</Badge>}
                        {isConfirmed && <Badge variant="verified">CONFIRMED</Badge>}
                        {isCompleted && <Badge variant="default">DELIVERED</Badge>}
                        {isCancelled && <Badge variant="destructive">{b.status}</Badge>}
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Holding Code
                        </span>
                        <span className="font-mono text-lg font-black text-emerald-950 tracking-wider">
                          {b.bookingCode}
                        </span>
                      </div>

                      {/* Live countdown timer for active holds */}
                      {isHold && b.holdExpiresAt && (
                        <CountdownTimer expiresAt={b.holdExpiresAt} />
                      )}
                    </div>
                  </div>

                  {/* Actions & Next Steps */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500">
                      Reserved on: {formatDateTime(b.createdAt)}
                    </div>

                    <div className="flex items-center gap-2">
                      {b.farmContact && (
                        <a
                          href={`tel:${b.farmContact}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5 text-emerald-800" />
                          <span>Call Breeder ({b.farmContact})</span>
                        </a>
                      )}

                      <Link to={`/goats/${b.goatId}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <span>View Listing</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>

                      {isHold && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleCancelReservation(b.id)}
                          disabled={cancellingId === b.id}
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel Hold'}
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
