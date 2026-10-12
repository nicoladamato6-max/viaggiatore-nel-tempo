// POST /api/auth/register — crea un nuovo utente
import { json, signJWT, hashPassword, type Env } from '../_shared';

interface PagesContext { request: Request; env: Env }

export const onRequestPost = async ({ request, env }: PagesContext): Promise<Response> => {
  if (!env.VIAGGIATORE_KV) return json({ error: 'KV non configurato' }, 503);
  if (!env.JWT_SECRET)     return json({ error: 'JWT_SECRET non configurato' }, 503);

  let body: { email?: string; password?: string };
  try { body = await request.json() as typeof body; }
  catch { return json({ error: 'Body JSON non valido' }, 400); }

  const email    = (body.email    ?? '').trim().toLowerCase();
  const password =  body.password ?? '';

  if (!email || !password) return json({ error: 'Email e password obbligatorie' }, 400);
  if (password.length < 8)  return json({ error: 'Password minimo 8 caratteri' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Email non valida' }, 400);

  const existing = await env.VIAGGIATORE_KV.get(`user:${email}`);
  if (existing) return json({ error: 'Email già registrata' }, 409);

  // Il primo utente registrato diventa automaticamente admin
  const userList = (await env.VIAGGIATORE_KV.get('user:list', 'json') as string[] | null) ?? [];
  const role     = userList.length === 0 ? 'admin' : 'user';

  const salt         = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);
  const id           = crypto.randomUUID();

  const user = { id, email, passwordHash, salt, role, createdAt: Date.now() };
  await env.VIAGGIATORE_KV.put(`user:${email}`, JSON.stringify(user));
  await env.VIAGGIATORE_KV.put('user:list', JSON.stringify([...userList, email]));

  const token = await signJWT({ sub: id, email, role }, env.JWT_SECRET);
  return json({ token, user: { id, email, role } }, 201);
};

export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
