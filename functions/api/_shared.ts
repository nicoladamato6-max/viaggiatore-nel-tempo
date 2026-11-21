// Shared utilities for Cloudflare Pages Functions

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Env {
  VIAGGIATORE_KV: any;   // KVNamespace — injected by Cloudflare binding
  JWT_SECRET: string;
}

// ── Base64-url helpers (UTF-8 safe) ──────────────────────────────────────────

function objToB64url(obj: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlToObj(s: string): Record<string, unknown> {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - pad.length % 4) % 4;
  const bin = atob(pad + '='.repeat(padding));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

// ── HMAC-SHA256 ───────────────────────────────────────────────────────────────

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// ── JWT ───────────────────────────────────────────────────────────────────────

export async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = objToB64url({ alg: 'HS256', typ: 'JWT' });
  const body   = objToB64url({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days
  });
  const sig = await hmac(`${header}.${body}`, secret);
  return `${header}.${body}.${sig}`;
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const expected = await hmac(`${parts[0]}.${parts[1]}`, secret);
    if (expected !== parts[2]) return null;
    const payload = b64urlToObj(parts[1]);
    if ((payload.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// ── Password hashing (PBKDF2) ─────────────────────────────────────────────────

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100_000, hash: 'SHA-256' },
    key, 256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

// ── Response helpers ──────────────────────────────────────────────────────────

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// ── Auth extraction ───────────────────────────────────────────────────────────

export async function getAuthUser(request: Request, env: Env): Promise<Record<string, unknown> | null> {
  const auth  = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !env.JWT_SECRET) return null;
  return verifyJWT(token, env.JWT_SECRET);
}

// ── Rate limiting (sliding window counter in KV) ──────────────────────────────
// Returns a 429 Response if the limit is exceeded, null otherwise.
// Key format: rl:{ip}:{endpoint}:{window_number}  TTL: windowSeconds*2
// Abuse events (last 100) are stored in rl:abuse_events for the admin panel.

export async function checkRateLimit(
  request: Request,
  endpoint: string,
  env: { VIAGGIATORE_KV?: any },
  limit: number,
  windowSeconds: number,
): Promise<Response | null> {
  if (!env.VIAGGIATORE_KV) return null;
  const ip  = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? 'unknown';
  const win = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${ip}:${endpoint}:${win}`;
  const count = parseInt(await env.VIAGGIATORE_KV.get(key) ?? '0');
  if (count >= limit) {
    try {
      const abuseKey = 'rl:abuse_events';
      const existing = JSON.parse(await env.VIAGGIATORE_KV.get(abuseKey) ?? '[]') as unknown[];
      existing.push({ ip, endpoint, timestamp: new Date().toISOString() });
      await env.VIAGGIATORE_KV.put(abuseKey, JSON.stringify(existing.slice(-100)), { expirationTtl: 86400 });
    } catch { /* non-fatal */ }
    console.warn(`[rate-limit] blocked ${ip} on ${endpoint} (count: ${count})`);
    return new Response(JSON.stringify({
      error:      'rate_limit_exceeded',
      message:    'Troppe richieste. Riprova tra qualche minuto.',
      retryAfter: windowSeconds,
      endpoint,
    }), {
      status: 429,
      headers: {
        'Content-Type':                 'application/json',
        'Access-Control-Allow-Origin':  '*',
        'Retry-After':                  String(windowSeconds),
      },
    });
  }
  await env.VIAGGIATORE_KV.put(key, String(count + 1), { expirationTtl: windowSeconds * 2 });
  return null;
}
