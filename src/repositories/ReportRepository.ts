import { supabase } from '@/lib/supabase/client';
import type { PlatformReport, ReportTargetType, ReportStatus } from '@/types';

export const ReportRepository = {
  /**
   * Submits a new user report/flag against a goat, farm, or review.
   */
  async submitReport(params: {
    targetType: ReportTargetType;
    targetId: string;
    reason: string;
    description?: string;
    reporterId?: string;
  }): Promise<void> {
    const { error } = await supabase.from('reports').insert({
      target_type: params.targetType,
      target_id: params.targetId,
      reason: params.reason,
      description: params.description || null,
      reporter_id: params.reporterId || null,
      status: 'PENDING',
    });

    if (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  },

  /**
   * Fetches all reports for the Super Admin moderation dashboard.
   */
  async getAllReports(): Promise<PlatformReport[]> {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profiles:reporter_id (
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      reporterId: row.reporter_id,
      reporterName: row.profiles?.full_name || row.profiles?.name || 'Anonymous',
      targetType: row.target_type,
      targetId: row.target_id,
      reason: row.reason,
      description: row.description,
      status: row.status,
      resolutionNotes: row.resolution_notes,
      resolvedBy: row.resolved_by,
      createdAt: row.created_at,
    }));
  },

  /**
   * Resolves or dismisses a report.
   */
  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    resolutionNotes?: string,
    resolvedBy?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('reports')
      .update({
        status,
        resolution_notes: resolutionNotes || null,
        resolved_by: resolvedBy || null,
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  },
};
