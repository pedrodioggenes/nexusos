import { supabase } from '@/integrations/supabase/client';

/**
 * Send a push notification to a user via the send-push edge function.
 * Fails silently — push is best-effort.
 */
export async function sendPushToUser(params: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  tag?: string;
}) {
  try {
    await supabase.functions.invoke('send-push', {
      body: {
        user_id: params.userId,
        title: params.title,
        body: params.body,
        data: params.data,
        tag: params.tag,
      },
    });
  } catch (e) {
    // Push is best-effort, don't block the main flow
    console.warn('[Push] Failed to send:', e);
  }
}
