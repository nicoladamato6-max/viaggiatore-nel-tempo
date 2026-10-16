'use strict';
/**
 * fix-wikidata-quality.cjs
 *
 * Per ogni entry wd-QXXX in events.json:
 *  1. Recupera il wikipediaSlug (itwiki o enwiki) via Wikidata API  (batch 50)
 *  2. Recupera coordinate: P625 diretto → luogo di nascita (P19) → luogo (P276)  (SPARQL batch 50)
 *  3. Rimuove le entry che rimangono senza né slug né coordinate
 *  4. Salva events.json aggiornato
 *
 * Poi eseguire manualmente: node scripts/split-chunks.cjs
 */

const fs   = require('fs');
const path = require('path');

const EVENTS_PATH = path.join(__dirname, '../src/data/events.json');
const BATCH       = 50;
const DELAY_MS    = 800;
const SPARQL_EP   = 'https://query.wikidata.org/sparql';
const WD_API      = 'https://www.wikidata.org/w/api.php';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parsePoint(val) {
  if (!val) return null;
  const m = val.match(/Point\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
  if (!m) return null;
  const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 };
}

// ── 1. Recupera sitelinks Wikipedia via Wikidata API ─────────────────────────
async function fetchSitelinks(qids) {
  // qids = ['Q1067', 'Q868', ...]
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids:    qids.join('|'),
    props:  'sitelinks',
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
    // Preferenza: itwiki → enwiki
    const slug = sl.itwiki?.title || sl.enwiki?.title || null;
    if (slug) result[qid] = slug.replace(/ /g, '_');
  }
  return result;
}

// ── 2. Recupera coordinate via SPARQL ────────────────────────────────────────
async function fetchCoords(qids) {
  // qids = ['Q1067', 'Q868', ...]
  const values = qids.map(q => `wd:${q}`).join(' ');
  const query = `
SELECT ?item ?coord ?birthCoord ?locCoord WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P625 ?coord }
  OPTIONAL { ?item wdt:P19  ?bp  . ?bp  wdt:P625 ?birthCoord }
  OPTIONAL { ?item wdt:P276 ?loc . ?loc wdt:P625 ?locCoord   }
}`;
  const url = `${SPARQL_EP}?query=${encodeURIComponent(query)}&format=json`;
  const ctrl  = new AbortController();
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
      if (result[qid]) continue; // tieni il primo risultato (solitamente il migliore)
      const coord =
        parsePoint(b.coord?.value) ||
        parsePoint(b.birthCoord?.value) ||
        parsePoint(b.locCoord?.value);
      if (coord) result[qid] = coord;
    }
    return result;
  } finally { clearTimeout(timer); }
}

// ── 3. Utility batch ─────────────────────────────────────────────────────────
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
        const wait = (i + 1) * 5000;
        console.log(`  ✗ ${label}: ${err.message} — retry ${i+1} fra ${wait/1000}s`);
        await sleep(wait);
      } else {
        console.log(`  ✗ ${label}: fallito dopo ${retries} tentativi — skip`);
        return {};
      }
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
  console.log(`Caricati ${events.length} eventi\n`);

  // Separa voci Wikidata da voci custom
  const wdEvents  = events.filter(e => e.id.startsWith('wd-'));
  const custEvents = events.filter(e => !e.id.startsWith('wd-'));

  // Voci che mancano di slug o coordinate
  const needSlug  = wdEvents.filter(e => !e.wikipediaSlug);
  const needCoord = wdEvents.filter(e => e.lat == null || e.lng == null);

  console.log(`Voci Wikidata: ${wdEvents.length}`);
  console.log(`  Mancano slug: ${needSlug.length}`);
  console.log(`  Mancano coordinate: ${needCoord.length}\n`);

  // ── FASE 1: slug ────────────────────────────────────────────────────────────
  const slugMap = {};
  const slugBatches = chunks(needSlug.map(e => e.id.replace('wd-', '')), BATCH);
  console.log(`Fase 1: recupero slug (${slugBatches.length} batch da ${BATCH})...`);
  for (let i = 0; i < slugBatches.length; i++) {
    const batch = slugBatches[i];
    process.stdout.write(`  batch ${i+1}/${slugBatches.length}... `);
    const map = await retryFetch(() => fetchSitelinks(batch), `slug batch ${i+1}`);
    Object.assign(slugMap, map);
    console.log(`${Object.keys(map).length} trovati`);
    if (i < slugBatches.length - 1) await sleep(DELAY_MS);
  }
  console.log(`Slug recuperati: ${Object.keys(slugMap).length}/${needSlug.length}\n`);

  // ── FASE 2: coordinate ──────────────────────────────────────────────────────
  const coordMap = {};
  const coordBatches = chunks(needCoord.map(e => e.id.replace('wd-', '')), BATCH);
  console.log(`Fase 2: recupero coordinate (${coordBatches.length} batch da ${BATCH})...`);
  for (let i = 0; i < coordBatches.length; i++) {
    const batch = coordBatches[i];
    process.stdout.write(`  batch ${i+1}/${coordBatches.length}... `);
    const map = await retryFetch(() => fetchCoords(batch), `coord batch ${i+1}`);
    Object.assign(coordMap, map);
    console.log(`${Object.keys(map).length} trovate finora`);
    if (i < coordBatches.length - 1) await sleep(DELAY_MS);
  }
  console.log(`Coordinate recuperate: ${Object.keys(coordMap).length}/${needCoord.length}\n`);

  // ── FASE 3: aggiorna eventi ─────────────────────────────────────────────────
  let updatedSlug = 0, updatedCoord = 0, removed = 0;
  const updatedWd = [];
  for (const e of wdEvents) {
    const qid = e.id.replace('wd-', '');

    // Aggiorna slug se trovato
    if (!e.wikipediaSlug && slugMap[qid]) {
      e.wikipediaSlug = slugMap[qid];
      updatedSlug++;
    }

    // Aggiorna coordinate se trovate
    if ((e.lat == null || e.lng == null) && coordMap[qid]) {
      e.lat = coordMap[qid].lat;
      e.lng = coordMap[qid].lng;
      updatedCoord++;
    }

    // Rimuovi entry senza né slug né coordinate (inutilizzabile)
    if (!e.wikipediaSlug && (e.lat == null || e.lng == null)) {
      removed++;
      continue;
    }

    updatedWd.push(e);
  }

  const finalEvents = [...custEvents, ...updatedWd];

  console.log(`── Risultati ──────────────────────────────────────`);
  console.log(`Slug aggiornati:         ${updatedSlug}`);
  console.log(`Coordinate aggiornate:   ${updatedCoord}`);
  console.log(`Entry rimosse (inutili): ${removed}`);
  console.log(`Dataset finale:          ${finalEvents.length} eventi`);
  console.log(`  - Custom:              ${custEvents.length}`);
  console.log(`  - Wikidata (salvati):  ${updatedWd.length}`);

  // Statistiche qualità finale
  const noSlugFinal  = finalEvents.filter(e => !e.wikipediaSlug).length;
  const noCoordFinal = finalEvents.filter(e => e.lat == null).length;
  console.log(`\nQualità finale:`);
  console.log(`  Senza slug:      ${noSlugFinal}`);
  console.log(`  Senza coordinate: ${noCoordFinal}`);

  // ── FASE 4: salva ────────────────────────────────────────────────────────────
  fs.writeFileSync(EVENTS_PATH, JSON.stringify(finalEvents, null, 2));
  console.log(`\n✓ events.json salvato (${finalEvents.length} eventi)`);
  console.log('Esegui ora: node scripts/split-chunks.cjs');
})();
