// GET /api/auth/me — restituisce il profilo dell'utente autenticato
import { json, getAuthUser, type Env } from '../_shared';

interface PagesContext { request: Request; env: Env }

export const onRequestGet = async ({ request, env }: PagesContext): Promise<Response> => {
  const user = await getAuthUser(request, env);
  if (!user) return json({ error: 'Non autenticato' }, 401);
  return json({ user: { id: user.sub, email: user.email, role: user.role } });
};
