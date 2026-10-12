// GET /api/events — returns Wikidata-enriched events from KV cache
import { json, type Env } from './_shared';

export const onRequestGet: (ctx: { env: Env }) => Promise<Response> = async ({ env }) => {
  if (!env.VIAGGIATORE_KV) {
    return json({ events: [], lastRefresh: null, error: 'KV non configurato' }, 503);
  }

  const cached = await env.VIAGGIATORE_KV.get('events', 'json') as {
    events: unknown[];
    lastRefresh: number;
    count: number;
  } | null;

  if (!cached) {
    return json({ events: [], lastRefresh: null, count: 0 });
  }

  return new Response(JSON.stringify(cached), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',  // 5 min browser cache
    },
  });
};
