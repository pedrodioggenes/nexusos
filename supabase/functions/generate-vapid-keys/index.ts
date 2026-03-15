import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Generates a VAPID key pair for Web Push notifications.
 * Run once, then save the keys as secrets.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Generate ECDSA P-256 key pair
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      true,
      ['sign', 'verify']
    );

    const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

    // Convert to base64url format used by Web Push
    const publicKeyBase64 = publicKeyJwk.x && publicKeyJwk.y
      ? btoa(String.fromCharCode(...new Uint8Array([4, ...base64UrlToBytes(publicKeyJwk.x), ...base64UrlToBytes(publicKeyJwk.y)])))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      : '';

    return new Response(
      JSON.stringify({
        publicKey: publicKeyBase64,
        privateKeyJwk: JSON.stringify(privateKeyJwk),
        instructions: 'Save VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as secrets, then delete this function.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function base64UrlToBytes(base64url: string): number[] {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return Array.from(binary, c => c.charCodeAt(0));
}
