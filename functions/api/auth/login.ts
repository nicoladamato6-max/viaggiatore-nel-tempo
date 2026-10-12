// POST /api/auth/login — autentica un utente esistente
import { json, signJWT, hashPassword, type Env } from '../_shared';

interface PagesContext { request: Request; env: Env }

interface StoredUser { id: string; email: string; passwordHash: string; salt: string; role: string }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  if (!env.VIAGGIATORE_KV) return json({ error: 'KV non configurato' }, 503);
  if (!env.JWT_SECRET)     return json({ error: 'JWT_SECRET non configurato' }, 503);

  let body: { email?: string; password?: string };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Body JSON non valido' }, 400); }

  const email    = (body.email    ?? '').trim().toLowerCase();
  const password =  body.password ?? '';
  if (!email || !password) return json({ error: 'Credenziali mancanti' }, 400);

  const raw = await env.VIAGGIATORE_KV.get(`user:${email}`);
  if (!raw) return json({ error: 'Email o password errati' }, 401);

  const user = JSON.parse(raw) as StoredUser;
  const hash = await hashPassword(password, user.salt);
  if (hash !== user.passwordHash) return json({ error: 'Email o password errati' }, 401);

  const token = await signJWT({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET);
  return json({ token, user: { id: user.id, email: user.email, role: user.role } });
};

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
