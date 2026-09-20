import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ReportRepository } from '@/repositories/ReportRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import type { PlatformReport, ReportStatus } from '@/types';
import { Check, X, ShieldAlert } from 'lucide-react';

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
          <h1 className="text-2xl font-black text-slate-900">
            Platform Incident Flags & Reports ({reports.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            User reports submitted regarding inaccurate weights, false pedigrees, or breeder misconduct
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Reports Logged</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The marketplace has no unresolved user flags or listing violations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">
                        {report.targetType} REPORT
                      </Badge>
                      <h4 className="font-bold text-slate-900 text-sm">{report.reason}</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Reported by: <strong>{report.reporterName}</strong> • {formatDateTime(report.createdAt)}
                    </p>
                  </div>

                  <Badge
                    variant={
                      report.status === 'RESOLVED'
                        ? 'default'
                        : report.status === 'PENDING'
                        ? 'secondary'
                        : 'slate'
                    }
                    className="text-[10px]"
                  >
                    {report.status}
                  </Badge>
                </div>

                {report.description && (
                  <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    "{report.description}"
                  </p>
                )}

                {report.resolutionNotes && (
                  <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-xs text-emerald-900">
                    <strong>Resolution Notes: </strong> {report.resolutionNotes}
                  </div>
                )}

                {report.status === 'PENDING' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                      isLoading={actionId === report.id}
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                    >
                      <Check className="h-3.5 w-3.5" /> Resolve Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-slate-600"
                      isLoading={actionId === report.id}
                      onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
