// POST /api/refresh — triggers Wikidata pipeline (admin only)
import { json, getAuthUser, type Env } from './_shared';
import { fetchWikidataEvents } from './_wikidata';

interface PagesContext {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  // Auth check: admin only
  const user = await getAuthUser(context.request, context.env);
  if (!user || user.role !== 'admin') {
    return json({ error: 'Accesso riservato agli amministratori' }, 403);
  }

  if (!context.env.VIAGGIATORE_KV) {
    return json({ error: 'KV non configurato — aggiungi il binding VIAGGIATORE_KV nel pannello Cloudflare Pages' }, 503);
  }

  // Run Wikidata pipeline in background so the response returns immediately
  context.waitUntil(
    (async () => {
      try {
        const events = await fetchWikidataEvents();
        await context.env.VIAGGIATORE_KV.put('events', JSON.stringify({
          events,
          count:       events.length,
          lastRefresh: Date.now(),
        }));
      } catch (err) {
        console.error('Wikidata refresh failed:', err);
      }
    })(),
  );

  return json({ message: 'Refresh avviato — i nuovi eventi appariranno entro 30 secondi', status: 'started' }, 202);
};

// OPTIONS preflight
export const onRequestOptions = async (): Promise<Response> =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
