// Wikidata SPARQL pipeline — fetches geocoded historical events

type EventCategory = 'storia' | 'arte' | 'musica' | 'scienza' | 'geologia' | 'cosmo';

export interface WEvent {
  id: string;
  title: string;
  year: number;
  lat: number;
  lng: number;
  category: EventCategory;
  description: string;
  wikipediaSlug: string;
  isCosmic: boolean;
}

interface WikiRow {
  item:             { value: string };
  itemLabel:        { value: string };
  itemDescription?: { value: string };
  year:             { value: string };
  lat:              { value: string };
  lng:              { value: string };
  slug?:            { value: string };
}

const ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'ViaggiatoreNelTempo/1.0 (https://viaggiatore-nel-tempo.pages.dev)';

async function sparql(query: string): Promise<WikiRow[]> {
  try {
    const res = await fetch(
      `${ENDPOINT}?query=${encodeURIComponent(query)}&format=json`,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
        signal:  AbortSignal.timeout(28_000),
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { results: { bindings: WikiRow[] } };
    return data.results.bindings ?? [];
  } catch { return []; }
}

function toEvent(row: WikiRow, category: EventCategory): WEvent | null {
  const lat  = parseFloat(row.lat.value);
  const lng  = parseFloat(row.lng.value);
  const year = parseInt(row.year.value, 10);
  if (isNaN(lat) || isNaN(lng) || isNaN(year)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const qid  = row.item.value.split('/').pop() ?? '';
  if (!qid || row.itemLabel.value.startsWith('Q')) return null; // skip unlabelled items
  const slug = row.slug?.value
    ?? encodeURIComponent(row.itemLabel.value.replace(/\s+/g, '_'));
  return {
    id:           `wd-${qid}`,
    title:        row.itemLabel.value,
    year,
    lat,
    lng,
    category,
    description:  row.itemDescription?.value ?? '',
    wikipediaSlug: slug,
    isCosmic:     false,
  };
}

// Build SPARQL query for given Wikidata type IDs
function buildQuery(types: string[], yearMin: number, yearMax: number, limit: number): string {
  const typeList = types.map(t => `wd:${t}`).join(' ');
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?year ?lat ?lng ?slug WHERE {
  VALUES ?type { ${typeList} }
  ?item wdt:P31 ?type ; wdt:P625 ?coords .
  { ?item wdt:P585 ?date } UNION { ?item wdt:P571 ?date }
  BIND(YEAR(?date) AS ?year)
  FILTER(?year >= ${yearMin} && ?year <= ${yearMax})
  ?coords wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lng .
  OPTIONAL {
    ?article schema:about ?item ; schema:inLanguage "it" ;
             schema:isPartOf <https://it.wikipedia.org/> .
    BIND(REPLACE(STR(?article),"https://it.wikipedia.org/wiki/","") AS ?slug)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
} LIMIT ${limit}`;
}

export async function fetchWikidataEvents(): Promise<WEvent[]> {
  // Run 3 category queries in parallel
  const [battles, disasters, science] = await Promise.all([
    // Battles (Q178561) and wars (Q198)
    sparql(buildQuery(['Q178561', 'Q198', 'Q831'], -500, 2024, 900))
      .then(rows => rows.flatMap(r => { const e = toEvent(r, 'storia'); return e ? [e] : []; })),

    // Natural disasters: earthquake (Q7944), volcanic eruption (Q7581056), flood (Q8068), tsunami (Q83296)
    sparql(buildQuery(['Q7944', 'Q7581056', 'Q8068', 'Q83296', 'Q40244'], -2000, 2024, 500))
      .then(rows => rows.flatMap(r => { const e = toEvent(r, 'geologia'); return e ? [e] : []; })),

    // Scientific discoveries (Q757539) and epidemics (Q11190)
    sparql(buildQuery(['Q757539', 'Q11190', 'Q7725634'], -500, 2024, 400))
      .then(rows => rows.flatMap(r => { const e = toEvent(r, 'scienza'); return e ? [e] : []; })),
  ]);

  // Deduplicate by Wikidata QID
  const seen = new Set<string>();
  return [...battles, ...disasters, ...science].filter(e => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}
