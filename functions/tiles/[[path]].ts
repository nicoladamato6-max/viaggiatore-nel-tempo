// Proxy per tile storiche antiche — bypassa CORS di dh.gu.se in produzione CF Pages
export const onRequest: (ctx: { request: Request; params: Record<string, string> }) => Promise<Response> =
  async ({ request, params }) => {
    const path = params.path ?? '';
    const upstream = `https://dh.gu.se/tiles/${path}`;

    const upstreamReq = new Request(upstream, {
      method: request.method,
      headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
    });

    const res = await fetch(upstreamReq);

    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400');

    return new Response(res.body, { status: res.status, headers });
  };
