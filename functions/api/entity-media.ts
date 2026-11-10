// GET /api/entity-media?title=...&year=...&locale=it
// Aggrega media da Internet Archive, YouTube (opt.), Europeana (opt.)
// Ogni sorgente è opzionale: se la chiave API manca viene saltata silenziosamente.

interface MediaEnv {
  YOUTUBE_API_KEY?:  string;
  EUROPEANA_API_KEY?: string;
}

// Tipo condiviso — definizione autoritativa in src/types/index.ts
interface MediaItem {
  type:         'video' | 'image' | 'audio';
  title:        string;
  url:          string;
  thumbnail?:   string;
  source:       'youtube' | 'archive' | 'europeana';
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

// ── Internet Archive (nessuna chiave richiesta) ───────────────────────────────
async function fetchArchive(query: string, locale: string): Promise<MediaItem[]> {
  try {
    const lang = locale === 'it' ? 'ita' : 'eng';
    const q = encodeURIComponent(`(${query}) AND mediatype:(movies OR audio) AND language:(${lang} OR und)`);
    const url = `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,mediatype,year&rows=6&output=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json() as { response?: { docs?: { identifier: string; title?: string; mediatype?: string; year?: string }[] } };
    const docs = data.response?.docs ?? [];
    return docs
      .filter(d => d.identifier)
      .map(d => ({
        type:      d.mediatype === 'audio' ? 'audio' : 'video',
        title:     d.title ?? d.identifier,
        url:       `https://archive.org/details/${d.identifier}`,
        thumbnail: `https://archive.org/services/img/${d.identifier}`,
        source:    'archive',
        year:      d.year,
      } satisfies MediaItem));
  } catch {
    return [];
  }
}

// ── YouTube Data API v3 ───────────────────────────────────────────────────────
async function fetchYouTube(query: string, locale: string, key: string): Promise<MediaItem[]> {
  try {
    const suffix = locale === 'it' ? ' storia documentario' : ' history documentary';
    const params = new URLSearchParams({
      part:             'snippet',
      q:                query + suffix,
      type:             'video',
      maxResults:       '5',
      key,
      relevanceLanguage: locale,
      videoEmbeddable:  'true',
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
  } catch {
    return [];
  }
}

// ── Europeana (patrimonio culturale europeo) ──────────────────────────────────
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
        thumbnail: it.edmPreview?.[0],
        source:    'europeana',
        year:      it.year?.[0],
      } satisfies MediaItem));
  } catch {
    return [];
  }
}

// ── Handler principale ────────────────────────────────────────────────────────
export async function onRequest({ request, env }: PagesContext) {
  if (request.method === 'OPTIONS') return cors();
  if (request.method !== 'GET') return jsonRes({ error: 'Method not allowed' }, 405);

  const { searchParams } = new URL(request.url);
  const title  = (searchParams.get('title')  ?? '').trim();
  const locale = (searchParams.get('locale') ?? 'it').trim();

  if (!title) return jsonRes({ error: 'title required' }, 400);

  // Lancia tutte le sorgenti in parallelo — quelle senza chiave vengono saltate
  const [archive, youtube, europeana] = await Promise.all([
    fetchArchive(title, locale),
    env.YOUTUBE_API_KEY  ? fetchYouTube(title, locale, env.YOUTUBE_API_KEY)   : Promise.resolve<MediaItem[]>([]),
    env.EUROPEANA_API_KEY ? fetchEuropeana(title, env.EUROPEANA_API_KEY)       : Promise.resolve<MediaItem[]>([]),
  ]);

  // Interleave: 2 youtube → 2 archive → 2 europeana → …
  const items: MediaItem[] = [];
  const max = Math.max(youtube.length, archive.length, europeana.length);
  for (let i = 0; i < max; i++) {
    if (youtube[i])   items.push(youtube[i]);
    if (youtube[i+1]) items.push(youtube[i+1]);
    if (archive[i])   items.push(archive[i]);
    if (europeana[i]) items.push(europeana[i]);
  }

  return jsonRes({ items: items.slice(0, 12) });
}
