import React, { useEffect, useState } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/lib/utils';
import type { AppNotification } from '@/types';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await NotificationRepository.getNotifications(user.id, 50);
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await NotificationRepository.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-800" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
