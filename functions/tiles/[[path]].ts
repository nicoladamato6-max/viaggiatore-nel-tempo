// Proxy per tile storiche antiche — bypassa CORS di dh.gu.se in produzione CF Pages.
// In CF Pages Functions, [[path]] cattura tutto il sub-path come array di segmenti.
export const onRequest: (ctx: {
  request: Request;
  params: Record<string, string | string[]>;
}) => Promise<Response> = async ({ request, params }) => {
  const raw = params.path;
  const path = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
  const upstream = `https://dh.gu.se/tiles/${path}`;

  const res = await fetch(upstream, {
    method: request.method,
    headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
  });

  const headers = new Headers(res.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(res.body, { status: res.status, headers });
};
