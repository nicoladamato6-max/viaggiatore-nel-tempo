// POST /api/auth/delete-account — hard-delete utente autenticato (GDPR Art. 17)
import { json } from '../_shared';

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_JWT_SECRET?: string;
}

interface PagesContext { request: Request; env: Env }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET } = env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_JWT_SECRET) {
    return json({ error: 'Supabase non configurato sul server' }, 503);
  }

  const auth  = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'Non autenticato' }, 401);

  const payload = await verifySupabaseJWT(token, SUPABASE_JWT_SECRET);
  if (!payload) return json({ error: 'Token non valido o scaduto' }, 401);

  const userId = payload.sub as string;
  if (!userId) return json({ error: 'Utente non trovato nel token' }, 400);

  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method:  'DELETE',
    headers: {
      apikey:        SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return json({ error: `Errore eliminazione: ${body}` }, 500);
  }

  return json({ ok: true });
};

async function verifySupabaseJWT(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const enc  = new TextEncoder();
    const key  = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    );
    const pad = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/');
    const sigBytes = Uint8Array.from(atob(pad(parts[2])), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payloadJson = JSON.parse(atob(pad(parts[1])));
    if ((payloadJson.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return payloadJson;
  } catch { return null; }
}
