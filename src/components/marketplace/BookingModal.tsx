import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Goat } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { formatAge } from '@/lib/utils';
import { BookingRepository, type BookingHoldResult } from '@/repositories/BookingRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle2, Phone, AlertCircle, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  goat: Goat | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: BookingHoldResult) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ goat, isOpen, onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingHoldResult | null>(null);

  if (!goat) return null;

  const handleConfirmHold = async () => {
    if (!user) {
      onClose();
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingResult = await BookingRepository.createBookingHold(
        goat.id,
        customerNotes,
        user.id
      );

      setResult(bookingResult);
      onSuccess?.(bookingResult);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#166534', '#22c55e', '#b7791f', '#dcfce7'],
        });
      } catch (cErr) {
        console.log('Confetti trigger skipped:', cErr);
      }
    } catch (err: any) {
      console.error('Failed to create booking hold:', err);
      setError(err.message || 'Failed to place booking hold. Goat might already be reserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setCustomerNotes('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={result ? 'Reservation Confirmed!' : 'Reserve Goat - 24-Hour Hold'}
      description={
        result
          ? 'Your 24-hour reservation hold has been securely confirmed.'
          : 'Reserve this goat exclusively for 24 hours while you coordinate farm visit or transport.'
      }
      className="max-w-lg"
    >
      {result ? (
        /* Success Confirmation View */
        <div className="py-2 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Authoritative Holding Code
            </span>
            <div className="mt-1.5 inline-block rounded-2xl bg-emerald-50 px-6 py-3 border-2 border-emerald-700 font-mono text-2xl font-black text-emerald-950 tracking-widest">
              {result.bookingCode || 'AGF-SUCCESS'}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
            This goat is now reserved under your account for <strong>24 hours</strong>. No other buyer can book or purchase this goat during your hold window.
          </p>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Phone className="h-4 w-4 text-emerald-800" />
              <span>Breeder: {goat.farmName}</span>
            </div>
            <p>
              Direct Phone:{' '}
              <a href={`tel:${goat.farmContact}`} className="font-bold text-emerald-800 hover:underline">
                {goat.farmContact}
              </a>
            </p>
            <p>Location: {goat.farmLocation || 'Tamil Nadu'}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              className="flex-1 font-bold"
              onClick={() => {
                handleClose();
                navigate('/my-bookings');
              }}
            >
              <span>View in My Reservations</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* Booking Review & Placement View */
        <div className="space-y-4 pt-2">
          {/* Goat Summary Card */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-200">
            <img
              src={goat.primaryPhoto}
              alt={goat.name}
              className="h-16 w-16 rounded-xl object-cover bg-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 truncate text-sm">{goat.name}</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {goat.breedName} • {goat.gender} • {formatAge(goat.ageMonths)} • {goat.weightKg} kg
              </p>
              <div className="mt-1">
                <PriceDisplay
                  price={goat.price}
                  finalPrice={goat.finalPrice}
                  hasDiscount={goat.hasDiscount}
                  discountPercentage={goat.discountPercentage}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Factual 24h Hold Explanation Banner (User Refinement 2) */}
          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Clock className="h-4 w-4 text-emerald-800 shrink-0" />
              <span>24-Hour Reservation Hold</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Placing a hold is <strong>completely free</strong>. It reserves this goat exclusively for you for 24 hours while you coordinate a farm visit or speak with the breeder. If not completed, the hold expires automatically with zero penalty.
            </p>
          </div>

          {/* Customer info preview */}
          {user && (
            <div className="rounded-xl border border-slate-200 p-3 bg-white text-xs">
              <span className="font-bold text-slate-700">Reservation Contact:</span>
              <p className="text-slate-600 mt-0.5">
                {profile?.name || user.email} {profile?.phone ? `• ${profile.phone}` : ''}
              </p>
            </div>
          )}

          {/* Optional notes textarea */}
          <div>
            <label htmlFor="notes" className="block text-xs font-bold text-slate-700 mb-1">
              Visit Plan or Notes for Breeder (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="e.g., Planning to visit farm tomorrow morning, or requesting WhatsApp video call..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1 font-bold"
              onClick={handleConfirmHold}
              isLoading={isSubmitting}
            >
              Confirm 24-Hour Reservation
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
