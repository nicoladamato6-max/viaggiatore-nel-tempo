// CF Pages Function — proxy per GPlates Web Service (gws.gplates.org)
// Aggiunge CORS header: la API pubblica non li serve, causando blocchi dal browser.
// Cache 30 giorni: i dati paleografici sono statici per definizione.
export const onRequest: (ctx: { request: Request }) => Promise<Response> = async ({ request }) => {
  const incoming = new URL(request.url);
  const upstream = `https://gws.gplates.org/reconstruct/coastlines/${incoming.search}`;

  try {
    const res = await fetch(upstream, {
      method:  request.method,
      headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
    });
    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=2592000'); // 30 giorni
    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
