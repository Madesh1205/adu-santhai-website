import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReportRepository } from '@/repositories/ReportRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import type { ReportTargetType } from '@/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('Incorrect Pricing or Details');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ReportRepository.submitReport({
        targetType,
        targetId,
        reason,
        description,
        reporterId: user?.id,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Report submission failed:', err);
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    setDescription('');
    onClose();
  };

  const reasons = [
    'Incorrect Pricing or Details',
    'Suspicious Breeder or Farm Info',
    'Misleading Health or Vaccination Record',
    'Goat Already Sold or Unavailable',
    'Inappropriate Content or Other',
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? 'Report Submitted' : 'Report Listing / Issue'}
      description={
        submitted
          ? 'Thank you for helping keep Adu Santhai authentic and safe.'
          : `Submit an anonymous flag for ${targetTitle}. Our moderation team investigates within 24 hours.`
      }
      className="max-w-md"
    >
      {submitted ? (
        <div className="py-4 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your report has been flagged to the Super Admin moderation team. If any violations are found, appropriate action will be taken immediately.
          </p>
          <Button variant="default" className="w-full font-bold" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Reason for Report
            </label>
            <div className="space-y-1.5">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition-colors ${
                    reason === r
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-emerald-800"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="details" className="block text-xs font-bold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <Textarea
              id="details"
              placeholder="Provide any specific details or observations..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="flex-1 font-bold"
              isLoading={isSubmitting}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
