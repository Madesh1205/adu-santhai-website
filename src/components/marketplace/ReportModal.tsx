import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReportRepository } from '@/repositories/ReportRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import type { ReportTargetType } from '@/types';
import { Flag, CheckCircle2, AlertCircle } from 'lucide-react';

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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={submitted ? 'Report Submitted' : `Report Listing: ${targetTitle}`}
      description={
        submitted
          ? 'Thank you for helping keep Adu Santhai authentic and safe.'
          : 'Our moderation team investigates all reports within 24 hours.'
      }
      className="max-w-md"
    >
      {submitted ? (
        <div className="py-4 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-600">
            Your report has been logged with our Super Admin moderation panel. We will take appropriate action if the listing violates marketplace trust guidelines.
          </p>
          <Button onClick={handleClose} className="mt-2 w-full">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Incorrect Pricing or Details">Incorrect Pricing or Details</option>
              <option value="Goat Already Sold or Unavailable">Goat Already Sold or Unavailable</option>
              <option value="Breeder Not Responding / False Contact">Breeder Not Responding / False Contact</option>
              <option value="Misleading Photo or Breed Claim">Misleading Photo or Breed Claim</option>
              <option value="Suspected Fraud or Scam">Suspected Fraud or Scam</option>
              <option value="Other Policy Violation">Other Policy Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <Textarea
              placeholder="Provide any context that will help our moderation team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              isLoading={isSubmitting}
              className="flex-1 gap-1"
            >
              <Flag className="h-4 w-4" /> Submit Report
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
