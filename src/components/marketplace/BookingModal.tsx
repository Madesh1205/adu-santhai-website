import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Goat } from '@/types';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency, formatAge } from '@/lib/utils';
import { BookingRepository, type BookingHoldResult } from '@/repositories/BookingRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import confetti from 'canvas-confetti';
import { Clock, CheckCircle2, Phone, AlertCircle, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  goat: Goat | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ goat, isOpen, onClose }) => {
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

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
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
          ? 'Your reservation hold has been securely registered in the system.'
          : 'Hold this goat exclusively for 24 hours while you coordinate farm inspection.'
      }
      className="max-w-lg"
    >
      {result ? (
        /* Success Confirmation View */
        <div className="py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Authoritative Booking Code
          </span>
          <div className="mt-1 inline-block rounded-xl bg-emerald-50 px-5 py-2.5 border-2 border-emerald-500 font-mono text-2xl font-black text-emerald-800 tracking-wider">
            {result.bookingCode || 'AGF-SUCCESS'}
          </div>

          <p className="mt-3 text-sm text-slate-600">
            This goat is now reserved under your name for <strong>24 hours</strong>. No other buyer can book or purchase this goat during your hold window.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Phone className="h-4 w-4 text-emerald-600" />
              <span>Contact Breeder: {goat.farmName}</span>
            </div>
            <p>Direct Phone: <a href={`tel:${goat.farmContact}`} className="font-bold text-emerald-700 hover:underline">{goat.farmContact}</a></p>
            <p>Farm Location: {goat.farmLocation}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              onClick={() => {
                handleClose();
                navigate('/my-bookings');
              }}
            >
              Go to My Bookings <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* Booking Review & Placement View */
        <div className="space-y-4 pt-2">
          {/* Goat Summary Strip */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
            <img
              src={goat.primaryPhoto}
              alt={goat.name}
              className="h-16 w-16 rounded-lg object-cover bg-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 truncate">{goat.name}</h4>
                <span className="font-mono text-xs text-slate-400">#{goat.goatCode}</span>
              </div>
              <p className="text-xs text-slate-500">
                {goat.breedName} • {goat.gender} • {formatAge(goat.ageMonths)} • {goat.weightKg} kg
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-extrabold text-emerald-700">
                  {formatCurrency(goat.finalPrice)}
                </span>
                {goat.hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(goat.price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* How Hold Works Banner */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Zero-Risk 24-Hour Hold Guarantee</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Placing a hold is <strong>100% free</strong>. It locks this goat exclusively for you for 24 hours. You can inspect the goat at the farm or verify via video call. If not confirmed within 24 hours, the hold automatically expires with no penalty.
            </p>
          </div>

          {/* Customer info preview */}
          {user && (
            <div className="rounded-lg border border-slate-200 p-3 bg-white text-xs">
              <span className="font-semibold text-slate-700">Your Booking Contact Info:</span>
              <p className="text-slate-600 mt-0.5">
                {profile?.name || user.email} {profile?.phone ? `• ${profile.phone}` : ''}
              </p>
            </div>
          )}

          {/* Notes textarea */}
          <div>
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Notes or Visit Plan (Optional)
            </label>
            <Textarea
              id="notes"
              placeholder="e.g., Planning to visit farm tomorrow morning, or requesting WhatsApp video call..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-700">
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={handleConfirmHold}
              isLoading={isSubmitting}
            >
              Confirm 24h Hold
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
