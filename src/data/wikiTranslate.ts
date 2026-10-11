// Traduzione batch dei nomi territorio via Wikipedia langlinks API.
// Una sola chiamata API per batch di 50 nomi — zero librerie esterne.
//
// Flusso: nome inglese dal GeoJSON → langlinks EN→IT → etichetta localizzata.
// I risultati sono cached in memoria per tutta la sessione.

type LanglinksPage = {
  title: string;
  langlinks?: { lang: string; '*': string }[];
};

// Cache persistente: `${lang}:${english_name}` → nome tradotto
const cache = new Map<string, string>();

/**
 * Traduce un array di nomi inglesi nel locale target usando Wikipedia langlinks.
 * Restituisce una Map<englishName, translatedName> — se non trovata, torna il nome inglese.
 */
export async function translateTerritoryNames(
  names: string[],
  targetLang: string,
  signal: AbortSignal,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Inglese → nessuna traduzione necessaria
  if (targetLang === 'en') {
    for (const n of names) results.set(n, n);
    return results;
  }

  const toFetch = names.filter(n => !cache.has(`${targetLang}:${n}`));

  // Batch query a EN Wikipedia per i langlinks verso targetLang (max 50 titoli per request)
  for (let i = 0; i < toFetch.length; i += 50) {
    if (signal.aborted) break;
    const batch = toFetch.slice(i, i + 50);
    try {
      const params = new URLSearchParams({
        action:    'query',
        titles:    batch.map(n => n.replace(/ /g, '_')).join('|'),
        prop:      'langlinks',
        lllang:    targetLang,
        format:    'json',
        origin:    '*',
        redirects: '1',
      });
      const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, { signal });
      if (!res.ok) continue;
      const data = await res.json() as {
        query?: {
          normalized?: { from: string; to: string }[];
          pages?: Record<string, LanglinksPage>;
        };
      };

      // Wikipedia normalizza i titoli (spazi → underscore ecc.); mappa titolo normalizzato → originale
      const normalized: Record<string, string> = {};
      for (const n of data.query?.normalized ?? []) {
        normalized[n.to] = n.from.replace(/_/g, ' ');
      }

      for (const page of Object.values(data.query?.pages ?? {})) {
        const link = page.langlinks?.find(l => l.lang === targetLang);
        if (!link) continue;
        const origName = normalized[page.title] ?? page.title.replace(/_/g, ' ');
        cache.set(`${targetLang}:${origName}`, link['*']);
      }
    } catch {
      // ignora errori di rete — useremo il nome inglese come fallback
    }
  }

  for (const n of names) {
    results.set(n, cache.get(`${targetLang}:${n}`) ?? n);
  }
  return results;
}
