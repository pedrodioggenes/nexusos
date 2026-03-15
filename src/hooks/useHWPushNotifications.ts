import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// This key will be set after generating VAPID keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

export function useHWPushNotifications() {
  const { user, tenant } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Check support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Register service worker and check existing subscription
  useEffect(() => {
    if (!isSupported || !user?.id) return;

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/hw-sw.js', { scope: '/' });
        registrationRef.current = reg;

        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
          setIsSubscribed(true);
        }
      } catch (e) {
        console.warn('[Push] SW registration failed:', e);
      }
    };

    init();
  }, [isSupported, user?.id]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !user?.id || !tenant?.id || !VAPID_PUBLIC_KEY) {
      console.warn('[Push] Cannot subscribe: missing requirements');
      return false;
    }

    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.warn('[Push] Permission denied');
        return false;
      }

      const reg = registrationRef.current || await navigator.serviceWorker.ready;
      registrationRef.current = reg;

      // Subscribe to push
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Invalid subscription');
      }

      // Save to database
      const { error } = await (supabase as any)
        .from('hw_push_subscriptions')
        .upsert({
          user_id: user.id,
          tenant_id: tenant.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,endpoint' });

      if (error) throw error;

      setIsSubscribed(true);
      return true;
    } catch (e) {
      console.error('[Push] Subscribe error:', e);
      return false;
    }
  }, [isSupported, user?.id, tenant?.id]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    try {
      const reg = registrationRef.current || await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Remove from database
        await (supabase as any)
          .from('hw_push_subscriptions')
          .delete()
          .eq('user_id', user?.id)
          .eq('endpoint', subscription.endpoint);
      }
      setIsSubscribed(false);
    } catch (e) {
      console.error('[Push] Unsubscribe error:', e);
    }
  }, [user?.id]);

  // Auto-subscribe on first load if permission already granted
  useEffect(() => {
    if (isSupported && user?.id && tenant?.id && permission === 'granted' && !isSubscribed && VAPID_PUBLIC_KEY) {
      subscribe();
    }
  }, [isSupported, user?.id, tenant?.id, permission, isSubscribed, subscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    hasVapidKey: !!VAPID_PUBLIC_KEY,
  };
}
