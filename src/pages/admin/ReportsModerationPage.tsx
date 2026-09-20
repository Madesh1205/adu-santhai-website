import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ReportRepository } from '@/repositories/ReportRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/lib/utils';
import type { PlatformReport, ReportStatus } from '@/types';
import { Flag, Check, Clock } from 'lucide-react';

export const ReportsModerationPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ReportRepository.getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    const notes = prompt(`Enter resolution notes for this report (${status}):`, 'Verified and resolved by administration.');
    if (notes === null) return;

    setActionId(reportId);
    try {
      await ReportRepository.updateReportStatus(reportId, status, notes, user?.id);
      await loadReports();
    } catch (err) {
      console.error('Failed to update report:', err);
      alert('Failed to update report status.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <SEOHead title="Dispute & Flag Reports | Super Admin" path="/admin/reports" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Listing Incident Reports ({reports.length})
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Buyer flags regarding inaccurate weights, false pedigrees, or breeder misconduct
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No Buyer Reports Filed"
            description="The marketplace is running smoothly with zero active flags or complaints."
          />
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isPending = report.status === 'PENDING';
              const isResolved = report.status === 'RESOLVED';

              return (
                <div
                  key={report.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {report.targetTitle || `Target ID: ${report.targetId}`}
                      </span>
                      <Badge
                        variant={
                          isPending ? 'reserved' : isResolved ? 'verified' : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {report.status}
                      </Badge>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">
                        Reason: {report.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(report.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 leading-relaxed">
                    "{report.description || 'No additional details provided by buyer.'}"
                  </p>

                  {report.resolutionNotes && (
                    <p className="text-xs text-emerald-800 bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
                      <strong>Admin Resolution:</strong> {report.resolutionNotes}
                    </p>
                  )}

                  {isPending && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="font-bold text-xs gap-1"
                        onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                        disabled={actionId === report.id}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Mark Resolved</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-600 hover:bg-slate-100"
                        onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                        disabled={actionId === report.id}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
