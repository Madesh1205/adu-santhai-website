import { supabase } from '@/lib/supabase/client';
import type { AppNotification } from '@/types';

export const NotificationRepository = {
  /**
   * Fetches latest notifications for a user.
   */
  async getNotifications(userId: string, limit: number = 20): Promise<AppNotification[]> {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Notifications fetch notice:', error.message || error);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        body: row.body,
        linkType: row.link_type,
        linkId: row.link_id,
        isRead: row.is_read ?? false,
        eventKey: row.event_key,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.warn('Notifications fetch network fallback:', err);
      return [];
    }
  },

  /**
   * Gets unread notification count.
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.warn('Unread count query notice:', error.message || error);
        return 0;
      }

      return count ?? 0;
    } catch (err) {
      console.warn('Unread count network fallback:', err);
      return 0;
    }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (!notificationId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.warn('Mark notification as read notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Mark notification as read network fallback:', err);
    }
  },

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.warn('Mark all notifications as read notice:', error.message || error);
      }
    } catch (err) {
      console.warn('Mark all notifications as read network fallback:', err);
    }
  },

  /**
   * Subscribes to real-time notifications for a user via Supabase Realtime channel.
   * Returns an unsubscribe cleanup function.
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: AppNotification) => void
  ): () => void {
    if (!userId) return () => {};
    try {
      const channelName = `realtime-notifications-${userId}-${Date.now()}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload: any) => {
            if (payload?.new) {
              const notif: AppNotification = {
                id: payload.new.id,
                userId: payload.new.user_id,
                title: payload.new.title,
                body: payload.new.body,
                linkType: payload.new.link_type,
                linkId: payload.new.link_id,
                isRead: payload.new.is_read ?? false,
                eventKey: payload.new.event_key,
                createdAt: payload.new.created_at,
              };
              onNotification(notif);
            }
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Ignore
        }
      };
    } catch (err) {
      console.warn('Subscribe to notifications fallback:', err);
      return () => {};
    }
  },
};
