import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { SEOHead } from '@/components/common/SEOHead';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/lib/utils';
import type { AppNotification } from '@/types';
import { Bell, CheckCheck, AlertCircle, ArrowUpRight, RefreshCw } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await NotificationRepository.getNotifications(user.id, 50);
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setErrorMsg('Could not load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  // Keep the web notification center current while it is open, matching the
  // Android app's live notification updates.
  useEffect(() => {
    if (!user) return;
    return NotificationRepository.subscribeToNotifications(user.id, (notification) => {
      setNotifications((previous) => {
        if (previous.some((item) => item.id === notification.id)) return previous;
        return [notification, ...previous].slice(0, 50);
      });
    });
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      setErrorMsg('Could not mark notifications as read. Please try again.');
    }
  };

  const getNotificationPath = (linkType: string | null, linkId: string | null) => {
    if (!linkType) return null;
    const type = linkType.toUpperCase();
    if (type.includes('GOAT') && linkId) return `/goats/${encodeURIComponent(linkId)}`;
    if (type.includes('FARM') && linkId) return `/farms/${encodeURIComponent(linkId)}`;
    if (type.includes('BOOKING') || type.includes('ORDER')) {
      if (profile?.role === 'SUPER_ADMIN') return '/admin/bookings';
      if (profile?.role === 'FARM_ADMIN' || type.includes('FARM')) return '/farm/bookings';
      return '/my-bookings';
    }
    if (type.includes('REPORT') && profile?.role === 'SUPER_ADMIN') return '/admin/reports';
    if (type.includes('USER') && profile?.role === 'SUPER_ADMIN') return '/admin/users';
    return null;
  };

  const handleNotificationOpen = async (notification: AppNotification) => {
    if (!user || busyId) return;
    setErrorMsg(null);
    const targetPath = getNotificationPath(notification.linkType, notification.linkId);
    setBusyId(notification.id);
    try {
      if (!notification.isRead) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id)
          .eq('user_id', user.id);
        if (error) throw error;
        setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n));
      }
      if (targetPath) navigate(targetPath);
    } catch (err) {
      console.error('Failed to open notification:', err);
      setErrorMsg('Could not update this notification. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <SEOHead title="Notifications | Adu Santhai" path="/notifications" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <Badge variant="earth" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Updates on your reservations, listing approvals, and breeder inquiries.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs font-bold shrink-0"
            >
              <CheckCheck className="h-4 w-4 text-emerald-800" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>

        {errorMsg && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
            <button type="button" onClick={loadNotifications} className="ml-auto inline-flex items-center gap-1 font-bold underline">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="You are all caught up! You'll receive real-time updates here when you reserve goats or receive responses from breeders."
          />
        ) : (
          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl border p-4 transition-all duration-150 ${
                  !n.isRead
                    ? 'border-emerald-200 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      {!n.isRead && (
                        <span aria-label="Unread" className="flex h-2 w-2 rounded-full bg-emerald-800" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificationOpen(n)}
                    disabled={busyId === n.id}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900 transition-colors hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
                    aria-label={getNotificationPath(n.linkType, n.linkId) ? `Open notification: ${n.title}` : `Mark notification as read: ${n.title}`}
                  >
                    {busyId === n.id ? 'Opening…' : getNotificationPath(n.linkType, n.linkId) ? 'View details' : n.isRead ? 'Read' : 'Mark as read'}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
