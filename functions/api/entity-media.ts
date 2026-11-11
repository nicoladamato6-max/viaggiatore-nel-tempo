// GET /api/entity-media?title=...&year=...&locale=it
// Aggrega media da 9 sorgenti open/gratuite.
// Sorgenti senza chiave: Archive, Met Museum, Wikimedia Commons
// Sorgenti con chiave gratuita: YouTube, Europeana, DPLA, Smithsonian, OpenVerse

interface MediaEnv {
  YOUTUBE_API_KEY?:     string;
  EUROPEANA_API_KEY?:   string;
  DPLA_API_KEY?:        string;
  SMITHSONIAN_API_KEY?: string;
  OPENVERSE_API_KEY?:   string;
}

interface MediaItem {
  type:         'video' | 'image' | 'audio';
  title:        string;
  url:          string;
  thumbnail?:   string;
  source:       'youtube' | 'archive' | 'europeana' | 'met' | 'wikimedia' | 'dpla' | 'smithsonian' | 'openverse';
  year?:        string;
  description?: string;
}

interface PagesContext {
  request: Request;
  env: MediaEnv;
}

function cors(status = 200) {
  return new Response(null, {
    status,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function interleave(...arrays: MediaItem[][]): MediaItem[] {
  const result: MediaItem[] = [];
  const max = Math.max(...arrays.map(a => a.length), 0);
  for (let i = 0; i < max; i++) {
    for (const arr of arrays) {
      if (arr[i]) result.push(arr[i]);
    }
  }
  return result;
}

// ── Internet Archive (nessuna chiave) ────────────────────────────────────────
async function fetchArchive(query: string, locale: string): Promise<MediaItem[]> {
  try {
    const lang = locale === 'it' ? 'ita' : 'eng';
    const q = encodeURIComponent(`(${query}) AND mediatype:(movies OR audio) AND language:(${lang} OR und)`);
    const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,mediatype,year&rows=5&output=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json() as { response?: { docs?: { identifier: string; title?: string; mediatype?: string; year?: string }[] } };
    return (data.response?.docs ?? [])
      .filter(d => d.identifier)
      .map(d => ({
        type:      d.mediatype === 'audio' ? 'audio' : 'video',
        title:     d.title ?? d.identifier,
        url:       `https://archive.org/details/${d.identifier}`,
        thumbnail: `https://archive.org/services/img/${d.identifier}`,
        source:    'archive',
        year:      d.year,
      } satisfies MediaItem));
  } catch { return []; }
}

// ── Met Museum (nessuna chiave) ───────────────────────────────────────────────
async function fetchMet(query: string): Promise<MediaItem[]> {
  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!searchRes.ok) return [];
    const { objectIDs } = await searchRes.json() as { objectIDs?: number[] };
    if (!objectIDs?.length) return [];

    const objects = await Promise.all(
      objectIDs.slice(0, 5).map(id =>
        fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, {
          signal: AbortSignal.timeout(3000),
        }).then(r => r.ok ? r.json() : null).catch(() => null)
      )
    );

    return (objects as (Record<string, unknown> | null)[])
      .filter(o => o?.primaryImageSmall)
      .map(o => ({
        type:        'image',
        title:       (o!.title as string) ?? query,
        url:         (o!.objectURL as string) ?? `https://www.metmuseum.org/art/collection/search/${o!.objectID}`,
        thumbnail:   o!.primaryImageSmall as string,
        source:      'met',
        year:        o!.objectDate ? String(o!.objectDate).replace(/\D.*/, '') : undefined,
        description: (o!.artistDisplayName as string) || undefined,
      } satisfies MediaItem));
  } catch { return []; }
}

// ── Wikimedia Commons (nessuna chiave) ───────────────────────────────────────
async function fetchWikimedia(query: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams({
      action:       'query',
      generator:    'search',
      gsrnamespace: '6',
      gsrsearch:    query,
      gsrlimit:     '6',
      prop:         'imageinfo',
      iiprop:       'url|mime',
      iiurlwidth:   '400',
      format:       'json',
      origin:       '*',
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      query?: { pages?: Record<string, { title?: string; imageinfo?: [{ url?: string; thumburl?: string; mime?: string }] }> }
    };
    return Object.values(data.query?.pages ?? {})
      .filter(p => p.imageinfo?.[0]?.url && p.imageinfo[0].mime?.startsWith('image/'))
      .map(p => ({
        type:      'image',
        title:     (p.title ?? '').replace(/^File:/, '').replace(/_/g, ' ').replace(/\.[^.]+$/, ''),
        url:       p.imageinfo![0].url!,
        thumbnail: p.imageinfo![0].thumburl ?? p.imageinfo![0].url,
        source:    'wikimedia',
      } satisfies MediaItem));
  } catch { return []; }
}

// ── YouTube Data API v3 ───────────────────────────────────────────────────────
async function fetchYouTube(query: string, locale: string, key: string): Promise<MediaItem[]> {
  try {
    const suffix = locale === 'it' ? ' storia documentario' : ' history documentary';
    const params = new URLSearchParams({
      part:              'snippet',
      q:                 query + suffix,
      type:              'video',
      maxResults:        '5',
      key,
      relevanceLanguage: locale,
      videoEmbeddable:   'true',
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      items?: { id?: { videoId?: string }; snippet?: { title?: string; thumbnails?: { medium?: { url?: string } }; publishedAt?: string } }[]
    };
    return (data.items ?? [])
      .filter(it => it.id?.videoId)
      .map(it => ({
        type:      'video',
        title:     it.snippet?.title ?? 'Video',
        url:       `https://www.youtube.com/watch?v=${it.id!.videoId}`,
        thumbnail: it.snippet?.thumbnails?.medium?.url,
        source:    'youtube',
        year:      it.snippet?.publishedAt?.slice(0, 4),
      } satisfies MediaItem));
  } catch { return []; }
}

// ── Europeana ─────────────────────────────────────────────────────────────────
async function fetchEuropeana(query: string, key: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams({
      query,
      rows:      '5',
      wskey:     key,
      media:     'true',
      thumbnail: 'true',
      type:      'IMAGE',
      profile:   'minimal',
    });
    const res = await fetch(`https://api.europeana.eu/record/v2/search.json?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      items?: { id?: string; title?: string[]; edmPreview?: string[]; year?: string[]; guid?: string }[]
    };
    return (data.items ?? [])
      .filter(it => it.edmPreview?.[0])
      .map(it => ({
        type:      'image',
        title:     it.title?.[0] ?? query,
        url:       it.guid ?? `https://www.europeana.eu/item${it.id}`,
        thumbnail: it.edmPreview![0],
        source:    'europeana',
        year:      it.year?.[0],
      } satisfies MediaItem));
  } catch { return []; }
}

// ── DPLA — Digital Public Library of America (chiave gratuita) ───────────────
async function fetchDPLA(query: string, key: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams({
      q:         query,
      api_key:   key,
      page_size: '5',
      fields:    'id,sourceResource,object',
    });
    const res = await fetch(`https://api.dp.la/v2/items?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      docs?: { id?: string; object?: string; sourceResource?: { title?: string[]; date?: { displayDate?: string }; description?: string[] } }[]
    };
    return (data.docs ?? [])
      .filter(d => d.object)
      .map(d => ({
        type:        'image',
        title:       d.sourceResource?.title?.[0] ?? query,
        url:         `https://dp.la/item/${d.id}`,
        thumbnail:   d.object,
        source:      'dpla',
        year:        d.sourceResource?.date?.displayDate?.slice(0, 4),
        description: d.sourceResource?.description?.[0],
      } satisfies MediaItem));
  } catch { return []; }
}

// ── Smithsonian Open Access (chiave gratuita) ─────────────────────────────────
async function fetchSmithsonian(query: string, key: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams({
      q:                 query,
      api_key:           key,
      rows:              '5',
      online_media_type: 'Images',
    });
    const res = await fetch(`https://api.si.edu/openaccess/api/v1.0/search?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      response?: { rows?: { id?: string; title?: string; content?: { descriptiveNonRepeating?: { online_media?: { media?: { thumbnail?: string }[] }; record_link?: string } } }[] }
    };
    return (data.response?.rows ?? [])
      .filter(r => r.content?.descriptiveNonRepeating?.online_media?.media?.[0]?.thumbnail)
      .map(r => ({
        type:      'image',
        title:     r.title ?? query,
        url:       r.content?.descriptiveNonRepeating?.record_link ?? `https://collections.si.edu/search/results.htm?q=${encodeURIComponent(query)}`,
        thumbnail: r.content!.descriptiveNonRepeating!.online_media!.media![0].thumbnail,
        source:    'smithsonian',
      } satisfies MediaItem));
  } catch { return []; }
}

// ── OpenVerse — Creative Commons (chiave gratuita, anonimo rate-limited) ──────
async function fetchOpenVerse(query: string, key?: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams({
      q:            query,
      page_size:    '5',
      license_type: 'commercial,modification',
    });
    const headers: Record<string, string> = { 'User-Agent': 'ViaggiatoreNelTempo/1.0' };
    if (key) headers['Authorization'] = `Bearer ${key}`;
    const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
      signal: AbortSignal.timeout(5000),
      headers,
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      results?: { id?: string; title?: string; url?: string; thumbnail?: string; creator?: string }[]
    };
    return (data.results ?? [])
      .filter(r => r.url)
      .map(r => ({
        type:        'image',
        title:       r.title ?? query,
        url:         r.url!,
        thumbnail:   r.thumbnail ?? r.url,
        source:      'openverse',
        description: r.creator,
      } satisfies MediaItem));
  } catch { return []; }
}

// ── Handler principale ────────────────────────────────────────────────────────
export async function onRequest({ request, env }: PagesContext) {
  if (request.method === 'OPTIONS') return cors();
  if (request.method !== 'GET') return jsonRes({ error: 'Method not allowed' }, 405);

  const { searchParams } = new URL(request.url);
  const title  = (searchParams.get('title')  ?? '').trim();
  const locale = (searchParams.get('locale') ?? 'it').trim();

  if (!title) return jsonRes({ error: 'title required' }, 400);

  const [archive, met, wikimedia, youtube, europeana, dpla, smithsonian, openverse] = await Promise.all([
    fetchArchive(title, locale),
    fetchMet(title),
    fetchWikimedia(title),
    env.YOUTUBE_API_KEY     ? fetchYouTube(title, locale, env.YOUTUBE_API_KEY)         : Promise.resolve<MediaItem[]>([]),
    env.EUROPEANA_API_KEY   ? fetchEuropeana(title, env.EUROPEANA_API_KEY)             : Promise.resolve<MediaItem[]>([]),
    env.DPLA_API_KEY        ? fetchDPLA(title, env.DPLA_API_KEY)                       : Promise.resolve<MediaItem[]>([]),
    env.SMITHSONIAN_API_KEY ? fetchSmithsonian(title, env.SMITHSONIAN_API_KEY)         : Promise.resolve<MediaItem[]>([]),
    fetchOpenVerse(title, env.OPENVERSE_API_KEY),
  ]);

  const items = interleave(youtube, met, wikimedia, archive, europeana, dpla, smithsonian, openverse);
  return jsonRes({ items: items.slice(0, 12) });
}
