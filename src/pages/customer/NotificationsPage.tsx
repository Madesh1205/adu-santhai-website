import React, { useEffect, useState } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
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

  return (
    <>
      <SEOHead title="Notifications | Adu Santhai" path="/notifications" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Updates on your 24h booking holds, listing moderation, and farm communications
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="gap-1.5 text-xs font-semibold"
            >
              <CheckCheck className="h-4 w-4 text-emerald-600" />
              <span>Mark All as Read</span>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Notifications Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You'll be alerted here when reservations are confirmed, holds expire, or farm updates occur.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-2xl border p-4 transition-all ${
                  notif.isRead
                    ? 'border-slate-200 bg-white text-slate-700'
                    : 'border-emerald-200 bg-emerald-50/50 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.body}</p>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(notif.createdAt)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
