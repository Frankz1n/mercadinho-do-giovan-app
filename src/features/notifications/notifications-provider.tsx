import { useEffect, useRef, type ReactNode } from 'react';

import { useAuth } from '@/features/auth/auth-context';
import { useToast } from '@/features/feedback/toast-context';
import { getNotifications } from '@/features/notifications/expo-notifications-safe';
import {
  registerForPushNotifications,
  unregisterPushToken,
} from '@/features/notifications/register-push';
import { useOrders } from '@/features/orders/orders-context';
import { supabase } from '@/lib/supabase';

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const { refresh } = useOrders();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!user) {
        await unregisterPushToken(tokenRef.current);
        tokenRef.current = null;
        return;
      }

      const token = await registerForPushNotifications(user.id);
      if (!cancelled) {
        tokenRef.current = token;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const Notifications = getNotifications();
    if (!Notifications) {
      return;
    }

    const received = Notifications.addNotificationReceivedListener((notification) => {
      const title =
        notification.request.content.title ??
        notification.request.content.body ??
        'Nova notificação';
      showToast(title, 'default');
    });

    return () => {
      received.remove();
    };
  }, [showToast]);

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }

    const channel = supabase
      .channel('admin-orders-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const code =
            typeof payload.new === 'object' &&
            payload.new &&
            'code' in payload.new &&
            typeof payload.new.code === 'string'
              ? payload.new.code
              : null;
          showToast(
            code ? `Novo pedido na fila · ${code}` : 'Novo pedido na fila',
            'success',
          );
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, isAdmin, showToast, refresh]);

  // Fallback in-app: cliente com app aberto vê toast quando o pedido fica pronto.
  useEffect(() => {
    if (!user || isAdmin) {
      return;
    }

    const channel = supabase
      .channel(`customer-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const next = payload.new;
          if (
            typeof next !== 'object' ||
            !next ||
            !('status' in next) ||
            next.status !== 'ready_for_pickup'
          ) {
            return;
          }

          const code =
            'code' in next && typeof next.code === 'string' ? next.code : null;
          showToast(
            code
              ? `Pedido ${code} pronto para retirada`
              : 'Seu pedido está pronto para retirada',
            'success',
          );
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, isAdmin, showToast, refresh]);

  return children;
}
