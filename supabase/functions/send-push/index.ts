import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Send Web Push notification to a user's registered devices.
 * Body: { user_id: string, title: string, body: string, data?: object, tag?: string }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, title, body, data, tag } = await req.json();

    if (!user_id || !title) {
      return new Response(
        JSON.stringify({ error: 'user_id and title required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all push subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('hw_push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title,
      body: body || '',
      data: data || {},
      tag: tag || 'hw-notification',
      icon: '/favicon.png',
      badge: '/favicon.png',
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    const privateKeyJwk = JSON.parse(VAPID_PRIVATE_KEY);
    const publicKeyBytes = base64UrlToUint8Array(VAPID_PUBLIC_KEY);

    for (const sub of subscriptions) {
      try {
        const result = await sendWebPush(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          privateKeyJwk,
          publicKeyBytes,
          VAPID_PUBLIC_KEY
        );

        if (result.ok) {
          sent++;
        } else if (result.status === 404 || result.status === 410) {
          // Subscription expired
          expiredEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${result.status}`);
          failed++;
        }
      } catch (e) {
        console.error(`Push error for ${sub.endpoint}:`, e);
        failed++;
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('hw_push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, expired: expiredEndpoints.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send push error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ── Web Push implementation using Web Crypto API ──

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  privateKeyJwk: JsonWebKey,
  _publicKeyBytes: Uint8Array,
  vapidPublicKey: string
): Promise<Response> {
  // Import the VAPID private key for signing
  const signingKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Create VAPID JWT
  const audience = new URL(subscription.endpoint).origin;
  const vapidToken = await createVapidJwt(signingKey, audience, 'mailto:noreply@nexus-os.app');

  // Encrypt payload using Web Push encryption
  const encrypted = await encryptPayload(
    payload,
    base64UrlToUint8Array(subscription.keys.p256dh),
    base64UrlToUint8Array(subscription.keys.auth)
  );

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Content-Length': encrypted.byteLength.toString(),
      'TTL': '86400',
      'Authorization': `vapid t=${vapidToken}, k=${vapidPublicKey}`,
    },
    body: encrypted as unknown as BodyInit,
  });

  return response;
}

async function createVapidJwt(privateKey: CryptoKey, audience: string, subject: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const claims = { aud: audience, exp: now + 86400, sub: subject };

  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const claimsB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const unsignedToken = `${headerB64}.${claimsB64}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const rawSig = derToRaw(new Uint8Array(signature));
  const signatureB64 = uint8ArrayToBase64Url(rawSig);

  return `${unsignedToken}.${signatureB64}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // DER format: 0x30 [total-len] 0x02 [r-len] [r] 0x02 [s-len] [s]
  const raw = new Uint8Array(64);
  let offset = 2; // skip 0x30 and total length

  // Read r
  offset++; // skip 0x02
  let rLen = der[offset++];
  let rOffset = offset;
  if (rLen === 33 && der[rOffset] === 0) { rOffset++; rLen = 32; }
  raw.set(der.subarray(rOffset, rOffset + 32), 0);
  offset = rOffset + (rLen === 33 ? 32 : rLen);

  // Read s
  offset++; // skip 0x02
  let sLen = der[offset++];
  let sOffset = offset;
  if (sLen === 33 && der[sOffset] === 0) { sOffset++; sLen = 32; }
  raw.set(der.subarray(sOffset, sOffset + 32), 32);

  return raw;
}

async function encryptPayload(
  payload: string,
  p256dhKey: Uint8Array,
  authSecret: Uint8Array
): Promise<Uint8Array> {
  // Generate ephemeral ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Import subscriber's public key
  const subscriberKey = await crypto.subtle.importKey(
    'raw',
    p256dhKey as unknown as ArrayBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberKey },
    localKeyPair.privateKey,
    256
  );

  // Export local public key
  const localPublicKey = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPublicKeyBytes = new Uint8Array(localPublicKey);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key using HKDF
  const sharedSecretKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // PRK = HKDF-Extract(auth, shared_secret)
  const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
  const prkMaterial = await crypto.subtle.importKey(
    'raw',
    sharedSecret,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // IKM = HKDF(auth_secret, ecdh_secret, "WebPush: info" || 0x00 || subscriber_key || server_key, 32)
  const ikmInfo = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\0'),
    ...p256dhKey,
    ...localPublicKeyBytes,
  ]);

  const authKey = await crypto.subtle.importKey('raw', authSecret as unknown as ArrayBuffer, { name: 'HKDF' }, false, ['deriveBits']);
  const ikm = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(sharedSecret), info: ikmInfo },
    authKey,
    256
  ));

  const ikmKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);

  // CEK = HKDF(salt, ikm, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const cek = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: cekInfo },
    ikmKey,
    128
  ));

  // Nonce = HKDF(salt, ikm, "Content-Encoding: nonce\0", 12)
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0');
  const nonce = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo },
    ikmKey,
    96
  ));

  // Encrypt with AES-128-GCM
  const encKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);

  // Payload with padding delimiter
  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 2; // padding delimiter

  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    encKey,
    paddedPayload
  ));

  // Build aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, rs);
  header[20] = 65; // key length
  header.set(localPublicKeyBytes, 21);

  const result = new Uint8Array(header.length + encrypted.length);
  result.set(header);
  result.set(encrypted, header.length);

  return result;
}
