// Proxy per tile storiche antiche — bypassa CORS di dh.gu.se in produzione CF Pages.
// Timeout 5s + 204 silenzioso su errore: Cesium non logga "Failed to obtain image tile".
export const onRequest: (ctx: {
  request: Request;
  params: Record<string, string | string[]>;
}) => Promise<Response> = async ({ request, params }) => {
  const raw = params.path;
  const path = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
  const upstream = `https://dh.gu.se/tiles/${path}`;

  try {
    const res = await fetch(upstream, {
      method: request.method,
      headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return new Response(null, {
        status: 204,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400');
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
};
