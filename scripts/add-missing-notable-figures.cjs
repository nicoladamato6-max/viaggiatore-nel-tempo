'use strict';
/**
 * add-missing-notable-figures.cjs
 *
 * Aggiunge al dataset tutti gli umani con >= 40 sitelinks Wikipedia
 * nati prima del 476 d.C. (fine era antica) che NON sono già presenti.
 *
 * Algoritmo:
 *  1. Query SPARQL → tutti gli umani con P569 < 476 e sitelinks >= 40
 *  2. Esclude i QID già in events.json (wd-QXXX)
 *  3. Recupera coordinate: P625 diretto → P19 (luogo nascita) → P276 (luogo)
 *  4. Recupera slug Wikipedia: itwiki > enwiki
 *  5. Aggiunge le entry mancanti come "storia"/"persona"
 *
 * Poi: node scripts/split-chunks.cjs
 */

const fs   = require('fs');
const path = require('path');

const EVENTS_PATH = path.join(__dirname, '../src/data/events.json');
const SPARQL_EP   = 'https://query.wikidata.org/sparql';
const WD_API      = 'https://www.wikidata.org/w/api.php';
const MIN_SITELINKS = 40;
const BATCH = 50;
const DELAY_MS = 900;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parsePoint(val) {
  if (!val) return null;
  const m = val.match(/Point\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
  if (!m) return null;
  const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 };
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function retryFetch(fn, label, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i < retries) {
        const wait = (i + 1) * 6000;
        console.log(`  ✗ ${label}: ${err.message} — retry ${i+1} fra ${wait/1000}s`);
        await sleep(wait);
      } else {
        console.log(`  ✗ ${label}: fallito — skip`);
        return null;
      }
    }
  }
}

// SPARQL: tutti gli umani con >= MIN_SITELINKS nati prima del 476 d.C.
async function queryNotableFigures() {
  const query = `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?birth ?sitelinks WHERE {
  ?item wdt:P31 wd:Q5 ;
        wdt:P569 ?birth ;
        wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= ${MIN_SITELINKS})
  FILTER(?birth < "+0476-01-01T00:00:00Z"^^xsd:dateTime)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks)`;

  const url = `${SPARQL_EP}?query=${encodeURIComponent(query)}&format=json`;
  console.log('Query SPARQL figure notevoli (>= ' + MIN_SITELINKS + ' sitelinks, ante 476)...');
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'ViaggiatoreNelTempo/1.0 (nicola.damato@accenture.com)',
      'Accept': 'application/sparql-results+json',
    },
  });
  if (!res.ok) throw new Error(`SPARQL HTTP ${res.status}`);
  const data = await res.json();
  return data.results.bindings;
}

// Batch: recupera slug Wikipedia (itwiki > enwiki)
async function fetchSitelinks(qids) {
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: qids.join('|'),
    props: 'sitelinks',
    sitefilter: 'itwiki|enwiki',
    format: 'json',
  });
  const res = await fetch(`${WD_API}?${params}`, {
    headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0 (nicola.damato@accenture.com)' },
  });
  if (!res.ok) throw new Error(`API HTTP ${res.status}`);
  const data = await res.json();
  const result = {};
  for (const [qid, entity] of Object.entries(data.entities || {})) {
    if (entity.missing) continue;
    const sl = entity.sitelinks || {};
    const slug = sl.itwiki?.title || sl.enwiki?.title || null;
    if (slug) result[qid] = slug.replace(/ /g, '_');
  }
  return result;
}

// Batch SPARQL: coordinate P625 → P19→P625 → P276→P625
async function fetchCoords(qids) {
  const values = qids.map(q => `wd:${q}`).join(' ');
  const query = `
SELECT ?item ?coord ?birthCoord ?locCoord WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P625 ?coord }
  OPTIONAL { ?item wdt:P19  ?bp  . ?bp  wdt:P625 ?birthCoord }
  OPTIONAL { ?item wdt:P276 ?loc . ?loc wdt:P625 ?locCoord   }
}`;
  const url = `${SPARQL_EP}?query=${encodeURIComponent(query)}&format=json`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ViaggiatoreNelTempo/1.0 (nicola.damato@accenture.com)',
        'Accept': 'application/sparql-results+json',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`SPARQL HTTP ${res.status}`);
    const bindings = (await res.json()).results.bindings;
    const result = {};
    for (const b of bindings) {
      const qid = b.item.value.replace('http://www.wikidata.org/entity/', '');
      if (result[qid]) continue;
      const coord =
        parsePoint(b.coord?.value) ||
        parsePoint(b.birthCoord?.value) ||
        parsePoint(b.locCoord?.value);
      if (coord) result[qid] = coord;
    }
    return result;
  } finally { clearTimeout(timer); }
}

function extractYear(birthStr) {
  if (!birthStr) return null;
  const m = birthStr.match(/^([+-]?\d+)-/);
  if (!m) return null;
  return parseInt(m[1], 10);
}

// Determina categoria in base alla descrizione
function guessCategory(description) {
  const d = (description || '').toLowerCase();
  if (/filosof|pensator|saggio/.test(d)) return 'filosofia';
  if (/scienziato|matematico|astronomo|medico|fisico|chimico|naturalista|geografo/.test(d)) return 'scienza';
  if (/pittore|scultore|architetto|artista|poeta|scrittore|drammaturgo|tragediografo|commediografo/.test(d)) return 'arte';
  if (/imperatore|re|faraone|sovrano|monarca|sultano|califfo|papa|vescovo|politico|senatore|console|tribuno/.test(d)) return 'storia';
  if (/generale|condottiero|militare|guerriero|conquistador/.test(d)) return 'storia';
  if (/religioso|profeta|apostolo|santo|vescovo|monaco/.test(d)) return 'storia';
  return 'storia'; // default: storia
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
  console.log(`Dataset corrente: ${events.length} eventi\n`);

  const existingIds = new Set(
    events.filter(e => e.id.startsWith('wd-')).map(e => e.id.replace('wd-', ''))
  );

  // Fase 1: query SPARQL figure notevoli
  const bindings = await retryFetch(() => queryNotableFigures(), 'SPARQL figure notevoli');
  if (!bindings) { console.error('Query fallita, abort.'); process.exit(1); }

  // Filtra label invalidi (Q-number = entità senza label italiano/inglese)
  const candidates = bindings.filter(b => {
    const label = b.itemLabel?.value || '';
    if (/^Q\d+$/.test(label)) return false;
    const qid = b.item.value.replace('http://www.wikidata.org/entity/', '');
    return !existingIds.has(qid);
  });

  console.log(`Trovate: ${bindings.length} figure notevoli`);
  console.log(`Già nel dataset: ${bindings.length - candidates.length}`);
  console.log(`Da aggiungere: ${candidates.length}\n`);

  if (candidates.length === 0) {
    console.log('Nessuna figura da aggiungere.');
    process.exit(0);
  }

  // Estrai QID e anno dalla lista candidati
  const candidateQids = candidates.map(b => b.item.value.replace('http://www.wikidata.org/entity/', ''));

  // Fase 2: slug Wikipedia
  const slugMap = {};
  const slugBatches = chunks(candidateQids, BATCH);
  console.log(`Fase 2: slug Wikipedia (${slugBatches.length} batch)...`);
  for (let i = 0; i < slugBatches.length; i++) {
    process.stdout.write(`  batch ${i+1}/${slugBatches.length}... `);
    const map = await retryFetch(() => fetchSitelinks(slugBatches[i]), `slug batch ${i+1}`);
    if (map) Object.assign(slugMap, map);
    console.log(`${map ? Object.keys(map).length : 0} trovati`);
    if (i < slugBatches.length - 1) await sleep(DELAY_MS);
  }
  console.log(`Slug totali recuperati: ${Object.keys(slugMap).length}/${candidates.length}\n`);

  // Fase 3: coordinate
  const coordMap = {};
  const coordBatches = chunks(candidateQids, BATCH);
  console.log(`Fase 3: coordinate (${coordBatches.length} batch)...`);
  for (let i = 0; i < coordBatches.length; i++) {
    process.stdout.write(`  batch ${i+1}/${coordBatches.length}... `);
    const map = await retryFetch(() => fetchCoords(coordBatches[i]), `coord batch ${i+1}`);
    if (map) Object.assign(coordMap, map);
    console.log(`${map ? Object.keys(map).length : 0} trovate finora`);
    if (i < coordBatches.length - 1) await sleep(DELAY_MS);
  }
  console.log(`Coordinate totali recuperate: ${Object.keys(coordMap).length}/${candidates.length}\n`);

  // Fase 4: costruisci nuove entry
  let added = 0, skipped = 0;
  const newEntries = [];
  for (const b of candidates) {
    const qid = b.item.value.replace('http://www.wikidata.org/entity/', '');
    const label = b.itemLabel?.value || '';
    const desc = b.itemDescription?.value || '';
    const year = extractYear(b.birth?.value);
    const slug = slugMap[qid] || null;
    const coord = coordMap[qid] || null;

    // Salta se non ha né slug né coordinate (entità inutilizzabile)
    if (!slug && !coord) { skipped++; continue; }
    if (year == null) { skipped++; continue; }

    const entry = {
      id: `wd-${qid}`,
      title: label,
      description: desc,
      year,
      lat: coord?.lat ?? null,
      lng: coord?.lng ?? null,
      category: guessCategory(desc),
      tipo: 'persona',
      wikipediaSlug: slug,
      isCosmic: false,
    };
    newEntries.push(entry);
    added++;
  }

  console.log(`── Risultati ───────────────────────────────────────`);
  console.log(`Nuove entry create:   ${added}`);
  console.log(`Saltate (no dati):    ${skipped}`);

  // Top 10 aggiunte
  console.log('\nPrime 10 figure aggiunte:');
  newEntries.slice(0, 10).forEach(e => {
    const sl = bindings.find(b => b.item.value.endsWith(e.id.replace('wd-','')))?.sitelinks?.value || '?';
    console.log(`  ${e.id} | ${sl} sl | ${e.title} (${e.year < 0 ? Math.abs(e.year)+'a.C.' : e.year+'d.C.'}) — ${e.description?.slice(0,50)}`);
  });

  // Salva
  const finalEvents = [...events, ...newEntries];
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(finalEvents, null, 2));
  console.log(`\n✓ events.json salvato: ${finalEvents.length} eventi totali (+${added})`);
  console.log('Esegui ora: node scripts/split-chunks.cjs');
})();
