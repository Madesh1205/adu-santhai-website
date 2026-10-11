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
import { Bell, CheckCheck, AlertCircle, ArrowUpRight, RefreshCw, Trash2, X } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNREAD' | 'BOOKINGS' | 'APPROVALS' | 'PAYMENTS' | 'SYSTEM'>('ALL');
  const [isClearing, setIsClearing] = useState<boolean>(false);

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
    const isSuperAdmin = profile?.role === 'SUPER_ADMIN';
    const isFarmAdmin = profile?.role === 'FARM_ADMIN';

    // Resolve workflow-specific routes before generic farm/goat detail links.
    if (type.includes('BOOKING') || type.includes('ORDER') || type.includes('RESERVATION')) {
      if (isSuperAdmin) return '/admin/bookings';
      if (isFarmAdmin) return '/farm/bookings';
      return '/my-bookings';
    }
    if (type.includes('REPORT') && isSuperAdmin) return '/admin/reports';
    if (type.includes('USER') && isSuperAdmin) return '/admin/users';
    if ((type.includes('APPROVAL') || type.includes('APPLICATION') || type.includes('PAYMENT')) && isSuperAdmin) {
      return type.includes('FARM') || type.includes('APPLICATION') ? '/admin/farms' : '/admin/goats';
    }
    if (type.includes('GOAT') && linkId) {
      if (isSuperAdmin && (type.includes('PENDING') || type.includes('LISTING'))) return '/admin/goats';
      return `/goats/${encodeURIComponent(linkId)}`;
    }
    if (type.includes('FARM') && linkId) {
      if (isSuperAdmin && (type.includes('PENDING') || type.includes('APPLICATION'))) return '/admin/farms';
      return `/farms/${encodeURIComponent(linkId)}`;
    }
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

  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    setErrorMsg(null);
    setBusyId(notificationId);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications((previous) => previous.filter((item) => item.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setErrorMsg('Could not delete this notification. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return;
    if (!window.confirm('Delete all your notifications? This cannot be undone.')) return;
    setIsClearing(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      setErrorMsg('Could not clear notifications. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const getNotificationCategory = (notification: AppNotification) => {
    const type = `${notification.linkType || ''} ${notification.eventKey || ''} ${notification.title} ${notification.body}`.toUpperCase();
    if (/PAYMENT|PAID|FEE/.test(type)) return 'PAYMENTS';
    if (/APPROVAL|APPROVED|REJECTED|REPORT|APPLICATION|MODERATION/.test(type)) return 'APPROVALS';
    if (/BOOKING|RESERVATION|HOLD|ORDER/.test(type)) return 'BOOKINGS';
    return 'SYSTEM';
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filterTab === 'UNREAD') return !notification.isRead;
    if (filterTab === 'ALL') return true;
    return getNotificationCategory(notification) === filterTab;
  });

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

          <div className="flex flex-wrap items-center gap-2">
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
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={isClearing}
                className="gap-1.5 text-xs font-bold shrink-0 text-red-700 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isClearing ? 'Clearing…' : 'Clear all'}</span>
              </Button>
            )}
          </div>
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
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter notifications">
              {[
                { id: 'ALL', label: 'All', count: notifications.length },
                { id: 'UNREAD', label: 'Unread', count: unreadCount },
                { id: 'BOOKINGS', label: 'Bookings', count: notifications.filter((n) => getNotificationCategory(n) === 'BOOKINGS').length },
                ...(profile?.role === 'CUSTOMER' ? [] : [{ id: 'APPROVALS', label: 'Approvals', count: notifications.filter((n) => getNotificationCategory(n) === 'APPROVALS').length }]),
                { id: 'PAYMENTS', label: 'Payments', count: notifications.filter((n) => getNotificationCategory(n) === 'PAYMENTS').length },
                { id: 'SYSTEM', label: 'System', count: notifications.filter((n) => getNotificationCategory(n) === 'SYSTEM').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterTab(tab.id as typeof filterTab)}
                  aria-pressed={filterTab === tab.id}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    filterTab === tab.id ? 'bg-emerald-800 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <Bell className="mx-auto h-7 w-7 text-slate-400" />
                <p className="mt-2 font-bold text-slate-800">No matching notifications</p>
                <p className="mt-1 text-sm text-slate-500">Choose another filter to see more updates.</p>
              </div>
            ) : <div className="space-y-2.5">
            {filteredNotifications.map((n) => (
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
                  <div className="flex shrink-0 items-center gap-2 self-start">
                    <button
                      type="button"
                      onClick={() => handleNotificationOpen(n)}
                      disabled={busyId === n.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-emerald-900 transition-colors hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
                      aria-label={getNotificationPath(n.linkType, n.linkId) ? `Open notification: ${n.title}` : `Mark notification as read: ${n.title}`}
                    >
                      {busyId === n.id ? 'Opening…' : getNotificationPath(n.linkType, n.linkId) ? 'View details' : n.isRead ? 'Read' : 'Mark as read'}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNotification(n.id)}
                      disabled={busyId === n.id}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      aria-label={`Delete notification: ${n.title}`}
                      title="Delete notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>}
          </div>
        )}
      </div>
    </>
  );
};
