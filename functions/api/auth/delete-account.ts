// POST /api/auth/delete-account — hard-delete utente autenticato (GDPR Art. 17)
// Verifica il token delegando a Supabase Auth API (supporta ECC P-256 e HS256)
import { json } from '../_shared';

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}

interface PagesContext { request: Request; env: Env }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY } = env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return json({ error: 'Supabase non configurato sul server' }, 503);
  }

  const auth  = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'Non autenticato' }, 401);

  // Verifica token via Supabase Auth API (funziona con ECC P-256 e HS256)
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!userRes.ok) return json({ error: 'Token non valido o scaduto' }, 401);

  const userData = await userRes.json() as { id?: string };
  const userId   = userData.id;
  if (!userId) return json({ error: 'Utente non trovato nel token' }, 400);

  // Hard-delete via Admin API (richiede service_role key)
  const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method:  'DELETE',
    headers: {
      'apikey':        SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!deleteRes.ok) {
    const body = await deleteRes.text().catch(() => '');
    return json({ error: `Errore eliminazione: ${body}` }, 500);
  }

  return json({ ok: true });
};
