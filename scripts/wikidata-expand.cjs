'use strict';
const fs   = require('fs');
const path = require('path');

const ENDPOINT      = 'https://query.wikidata.org/sparql';
const EXISTING_PATH = path.join(__dirname, '../src/data/events.json');
const OUTPUT_PATH   = path.join(__dirname, '../src/data/wikidata-candidates.json');
const DELAY_MS      = 1500;

// Gap da colmare rispetto al dataset attuale (3546 entità)
const TARGETS = {
  storia:    900,
  scienza:   1100,
  arte:      750,
  musica:    900,
  filosofia: 370,
  sport:     820,
  geologia:  250,
  cosmo:     110,
};

const existing       = JSON.parse(fs.readFileSync(EXISTING_PATH, 'utf8'));
const existingTitles = new Set(existing.map(e => e.title.toLowerCase().replace(/\s+/g,' ').trim()));
console.log(`Dataset esistente: ${existing.length} entità`);
console.log(`Target nuove entità: ${Object.values(TARGETS).reduce((a,b)=>a+b,0)}\n`);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function extractYear(val) {
  if (!val) return null;
  // Formato Wikidata con segno esplicito: +1969-06-15T... o -0044-03-15T...
  let m = val.match(/^([+-])0*(\d+)-/);
  if (m) return m[1] === '-' ? -parseInt(m[2], 10) : parseInt(m[2], 10);
  // Formato ISO standard (date moderne senza segno): 1969-06-15T...
  m = val.match(/^(\d{4})-\d{2}-\d{2}/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function parsePoint(val) {
  if (!val) return null;
  const m = val.match(/Point\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)/);
  if (!m) return null;
  const lng = parseFloat(m[1]), lat = parseFloat(m[2]);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Math.round(lat * 1e4) / 1e4, lng: Math.round(lng * 1e4) / 1e4 };
}

function qid(uri) { return uri ? uri.replace('http://www.wikidata.org/entity/', '') : null; }

async function sparql(query, label) {
  const url = ENDPOINT + '?query=' + encodeURIComponent(query) + '&format=json';
  process.stdout.write(`  → ${label}... `);
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55000);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ViaggiatoreNelTempo/1.0 (nicola.damato@accenture.com)',
        'Accept': 'application/sparql-results+json',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.status === 429) throw new Error('HTTP 429');
    if (!res.ok)            throw new Error(`HTTP ${res.status}`);
    return (await res.json()).results.bindings;
  } catch (err) { clearTimeout(timer); throw err; }
}

async function sparqlRetry(query, label, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try { return await sparql(query, label); }
    catch (err) {
      if (i < retries) {
        const wait = (i + 1) * 4000;
        console.log(`errore (${err.message}), retry ${i+1} dopo ${wait/1000}s...`);
        await sleep(wait);
      } else { throw err; }
    }
  }
}

function makeCandidate(b, category, tipo, titlesSoFar) {
  const id = qid(b.item?.value);
  if (!id) return null;
  const title = b.itemLabel?.value;
  if (!title || /^Q\d+$/.test(title)) return null;

  const year = extractYear(b.birth?.value)
    || extractYear(b.death?.value && !b.birth?.value ? b.death.value : null)
    || extractYear(b.eventDate?.value)
    || extractYear(b.startDate?.value)
    || extractYear(b.inception?.value)
    || null;
  if (year === null) return null; // scarta sempre entità senza anno

  const titleKey = title.toLowerCase().replace(/\s+/g,' ').trim();
  if (existingTitles.has(titleKey) || titlesSoFar.has(titleKey)) return null;

  const coord = parsePoint(b.coord?.value) || parsePoint(b.coordPlace?.value);

  return {
    id:           `wd-${id}`,
    title,
    description:  (b.itemDescription?.value || '').slice(0, 400),
    year,
    lat:          coord?.lat ?? null,
    lng:          coord?.lng ?? null,
    category,
    tipo,
    wikipediaSlug: null,
    isCosmic:     category === 'cosmo',
    _sitelinks:   parseInt(b.sitelinks?.value || '0'),
  };
}

// ── Query builder ─────────────────────────────────────────────────────────────

// Persone con data di nascita (birth obbligatorio)
function qPerson(occ, minLinks, limit) {
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?birth ?coord ?sitelinks WHERE {
  ?item wdt:P106 wd:${occ} ; wdt:P569 ?birth ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= ${minLinks})
  OPTIONAL { ?item wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT ${limit}`;
}

// Istanze di un tipo con data (data obbligatoria per ridurre rumore)
function qEvent(type, dateProp, minLinks, limit) {
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?eventDate ?coord ?coordPlace ?sitelinks WHERE {
  ?item wdt:P31 wd:${type} ; wdt:${dateProp} ?eventDate ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= ${minLinks})
  OPTIONAL { ?item wdt:P625 ?coord }
  OPTIONAL { ?item wdt:P276 ?pl . ?pl wdt:P625 ?coordPlace }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT ${limit}`;
}

// Istanze con data di inizio (P580), per guerre/conflitti/rivoluzioni
function qEventStart(type, minLinks, limit) {
  return `
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?startDate ?coord ?coordPlace ?sitelinks WHERE {
  ?item wdt:P31 wd:${type} ; wdt:P580 ?startDate ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= ${minLinks})
  OPTIONAL { ?item wdt:P625 ?coord }
  OPTIONAL { ?item wdt:P276 ?pl . ?pl wdt:P625 ?coordPlace }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT ${limit}`;
}

// ── Definizione query ─────────────────────────────────────────────────────────
const QUERIES = [

  // ── SCIENZA (gap ~1100) ───────────────────────────────────────────────────
  { category:'scienza', tipo:'persona', label:'fisici',         query: qPerson('Q169470', 8, 500) },
  { category:'scienza', tipo:'persona', label:'matematici',     query: qPerson('Q170790', 8, 500) },
  { category:'scienza', tipo:'persona', label:'chimici',        query: qPerson('Q593644', 8, 400) },
  { category:'scienza', tipo:'persona', label:'biologi',        query: qPerson('Q864503', 8, 400) },
  { category:'scienza', tipo:'persona', label:'ingegneri',      query: qPerson('Q81096',  8, 400) },
  { category:'scienza', tipo:'persona', label:'astronomi',      query: qPerson('Q11063',  8, 400) },
  { category:'scienza', tipo:'persona', label:'medici',         query: qPerson('Q39631',  8, 400) },
  { category:'scienza', tipo:'persona', label:'naturalisti',    query: qPerson('Q822778', 8, 300) },
  { category:'scienza', tipo:'persona', label:'psicologi',      query: qPerson('Q212980', 8, 300) },
  { category:'scienza', tipo:'persona', label:'geologi',        query: qPerson('Q520549', 8, 300) },
  { category:'scienza', tipo:'scoperta', label:'invenzioni',    query: qEvent('Q483247', 'P571', 8, 400) },
  { category:'scienza', tipo:'scoperta', label:'scoperte scient.', query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?eventDate ?sitelinks WHERE {
  ?item wdt:P31 wd:Q47740 ; wdt:P585 ?eventDate ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 8)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 300` },
  { category:'scienza', tipo:'scoperta', label:'Nobel fisica',  query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?birth ?coord ?sitelinks WHERE {
  ?item wdt:P166 wd:Q38104 ; wdt:P569 ?birth ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 5)
  OPTIONAL { ?item wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 200` },
  { category:'scienza', tipo:'scoperta', label:'Nobel chimica', query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?birth ?coord ?sitelinks WHERE {
  ?item wdt:P166 wd:Q44585 ; wdt:P569 ?birth ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 5)
  OPTIONAL { ?item wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 200` },

  // ── MUSICA (gap ~900) ─────────────────────────────────────────────────────
  { category:'musica', tipo:'persona', label:'compositori',     query: qPerson('Q36834',   8, 500) },
  { category:'musica', tipo:'persona', label:'cantanti',        query: qPerson('Q177220',  8, 500) },
  { category:'musica', tipo:'persona', label:'musicisti',       query: qPerson('Q639669',  8, 400) },
  { category:'musica', tipo:'persona', label:'chitarristi',     query: qPerson('Q855091',  8, 300) },
  { category:'musica', tipo:'persona', label:'pianisti',        query: qPerson('Q486748',  8, 300) },
  { category:'musica', tipo:'opera',   label:'album',           query: qEvent('Q482994', 'P577', 15, 500) },
  { category:'musica', tipo:'opera',   label:'opere liriche',   query: qEvent('Q1344',   'P577', 10, 300) },
  { category:'musica', tipo:'opera',   label:'bande musicali',  query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?inception ?sitelinks WHERE {
  ?item wdt:P31 wd:Q215380 ; wdt:P571 ?inception ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 15)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 300` },
  { category:'musica', tipo:'opera',   label:'singoli/canzoni', query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?eventDate ?sitelinks WHERE {
  ?item wdt:P31 wd:Q7366 ; wdt:P577 ?eventDate ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 20)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 400` },
  { category:'musica', tipo:'opera',   label:'festival musicali', query:`
SELECT DISTINCT ?item ?itemLabel ?itemDescription ?startDate ?coord ?sitelinks WHERE {
  ?item wdt:P31 wd:Q908445 ; wdt:P580 ?startDate ; wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= 10)
  OPTIONAL { ?item wdt:P625 ?coord }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en" }
}
ORDER BY DESC(?sitelinks) LIMIT 200` },

  // ── ARTE (gap ~750) ───────────────────────────────────────────────────────
  { category:'arte', tipo:'persona', label:'pittori',            query: qPerson('Q1028181', 8, 500) },
  { category:'arte', tipo:'persona', label:'scultori',           query: qPerson('Q1281618', 8, 400) },
  { category:'arte', tipo:'persona', label:'architetti',         query: qPerson('Q42973',   8, 400) },
  { category:'arte', tipo:'persona', label:'registi',            query: qPerson('Q2526255', 8, 400) },
  { category:'arte', tipo:'persona', label:'scrittori',          query: qPerson('Q36180',   8, 500) },
  { category:'arte', tipo:'persona', label:'poeti',              query: qPerson('Q49757',   8, 300) },
  { category:'arte', tipo:'persona', label:'fotografi',          query: qPerson('Q33231',   8, 300) },
  { category:'arte', tipo:'opera',   label:'dipinti',            query: qEvent('Q3305213', 'P571', 15, 400) },
  { category:'arte', tipo:'opera',   label:'romanzi',            query: qEvent('Q7725634', 'P577', 15, 400) },
  { category:'arte', tipo:'opera',   label:'film celebri',       query: qEvent('Q11424',   'P577', 20, 400) },
  { category:'arte', tipo:'opera',   label:'sculture',           query: qEvent('Q860861',  'P571', 10, 300) },

  // ── FILOSOFIA (gap ~370) ──────────────────────────────────────────────────
  { category:'filosofia', tipo:'persona', label:'filosofi',      query: qPerson('Q4964182', 6, 500) },
  { category:'filosofia', tipo:'persona', label:'teologi',       query: qPerson('Q1234713', 6, 300) },
  { category:'filosofia', tipo:'persona', label:'economisti',    query: qPerson('Q188094',  6, 300) },
  { category:'filosofia', tipo:'persona', label:'sociologi',     query: qPerson('Q2198907', 6, 200) },
  { category:'filosofia', tipo:'opera',   label:'opere filos.',  query: qEvent('Q234460',  'P577', 10, 300) },
  { category:'filosofia', tipo:'opera',   label:'testi religios.',query: qEvent('Q179461',  'P577', 10, 200) },

  // ── SPORT (gap ~820) ──────────────────────────────────────────────────────
  { category:'sport', tipo:'persona', label:'calciatori',        query: qPerson('Q937857',   10, 500) },
  { category:'sport', tipo:'persona', label:'cestisti',          query: qPerson('Q3665646',  10, 400) },
  { category:'sport', tipo:'persona', label:'tennisti',          query: qPerson('Q10833314', 10, 400) },
  { category:'sport', tipo:'persona', label:'nuotatori',         query: qPerson('Q10843402', 10, 300) },
  { category:'sport', tipo:'persona', label:'ciclisti',          query: qPerson('Q2309784',  10, 300) },
  { category:'sport', tipo:'persona', label:'pugili',            query: qPerson('Q12840545', 10, 300) },
  { category:'sport', tipo:'persona', label:'atletica leggera',  query: qPerson('Q11513337', 10, 300) },
  { category:'sport', tipo:'persona', label:'ginnasti',          query: qPerson('Q14089670', 10, 200) },
  { category:'sport', tipo:'persona', label:'sciatori',          query: qPerson('Q13570573', 10, 200) },
  { category:'sport', tipo:'evento',  label:'Olimpiadi',         query: qEventStart('Q159821',  5, 200) },
  { category:'sport', tipo:'evento',  label:'mondiali calcio',   query: qEventStart('Q27020041',5, 100) },
  { category:'sport', tipo:'evento',  label:'Tour de France',    query: qEventStart('Q33281',   5, 100) },
  { category:'sport', tipo:'evento',  label:'Giro d\'Italia',    query: qEventStart('Q68086',   5, 100) },

  // ── STORIA (gap ~900) ─────────────────────────────────────────────────────
  { category:'storia', tipo:'persona', label:'politici',         query: qPerson('Q82955',    8, 500) },
  { category:'storia', tipo:'persona', label:'monarchi',         query: qPerson('Q116',      8, 400) },
  { category:'storia', tipo:'persona', label:'militari',         query: qPerson('Q189290',   8, 400) },
  { category:'storia', tipo:'persona', label:'imperatori',       query: qPerson('Q193196',   8, 300) },
  { category:'storia', tipo:'persona', label:'papi',             query: qPerson('Q1160318',  5, 300) },
  { category:'storia', tipo:'persona', label:'esploratori',      query: qPerson('Q11900058', 8, 300) },
  { category:'storia', tipo:'evento',  label:'battaglie',        query: qEvent('Q178561', 'P585', 8, 500) },
  { category:'storia', tipo:'evento',  label:'guerre',           query: qEventStart('Q198',   8, 400) },
  { category:'storia', tipo:'evento',  label:'rivoluzioni',      query: qEventStart('Q10931', 8, 300) },
  { category:'storia', tipo:'evento',  label:'trattati di pace', query: qEventStart('Q131569',8, 300) },
  { category:'storia', tipo:'evento',  label:'attentati',        query: qEvent('Q3561', 'P585', 8, 200) },
  { category:'storia', tipo:'evento',  label:'elezioni storiche',query: qEvent('Q40231', 'P585', 10, 200) },

  // ── GEOLOGIA (gap ~250, solo eventi datati) ───────────────────────────────
  { category:'geologia', tipo:'evento', label:'terremoti',       query: qEvent('Q7944',  'P585', 6, 500) },
  { category:'geologia', tipo:'evento', label:'eruzioni volcani.',query: qEvent('Q45507', 'P585', 6, 400) },
  { category:'geologia', tipo:'evento', label:'tsunami',         query: qEvent('Q8068',  'P585', 6, 200) },
  { category:'geologia', tipo:'evento', label:'alluvioni stor.', query: qEvent('Q8068',  'P585', 6, 100) },

  // ── COSMO (gap ~110) ─────────────────────────────────────────────────────
  { category:'cosmo', tipo:'scoperta', label:'missioni spaziali',query: qEventStart('Q2247863', 5, 300) },
  { category:'cosmo', tipo:'scoperta', label:'sonde spaziali',   query: qEventStart('Q26529',   5, 200) },
  { category:'cosmo', tipo:'scoperta', label:'satelliti artif.', query: qEventStart('Q39495',   5, 200) },
  { category:'cosmo', tipo:'scoperta', label:'comete',           query: qEvent('Q3559', 'P575', 5, 150) },
  { category:'cosmo', tipo:'scoperta', label:'asteroidi noti',   query: qEvent('Q3863', 'P575', 8, 150) },
  { category:'cosmo', tipo:'scoperta', label:'telescopi',        query: qEvent('Q4213', 'P571', 5, 100) },
];

// ── Salvataggio intermedio ────────────────────────────────────────────────────
function savePartial(candidates) {
  const sorted = [...candidates].sort((a, b) => (b._sitelinks || 0) - (a._sitelinks || 0));
  const countByCat = {};
  const out = [];
  for (const c of sorted) {
    const cur = countByCat[c.category] || 0;
    if (cur >= (TARGETS[c.category] || Infinity)) continue;
    countByCat[c.category] = cur + 1;
    const { _sitelinks, ...rest } = c;
    out.push(rest);
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  return out.length;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const allCandidates = [];
  const titlesSoFar   = new Set();
  const countByCat    = {};
  let   queryIdx      = 0;

  for (const q of QUERIES) {
    queryIdx++;
    let bindings;
    try {
      bindings = await sparqlRetry(q.query, `[${queryIdx}/${QUERIES.length}] ${q.label}`);
      console.log(`${bindings.length} grezzi`);
    } catch (err) {
      console.error(`SKIP (${err.message})`);
      await sleep(DELAY_MS);
      continue;
    }

    let added = 0;
    for (const b of bindings) {
      const c = makeCandidate(b, q.category, q.tipo, titlesSoFar);
      if (!c) continue;
      allCandidates.push(c);
      titlesSoFar.add(c.title.toLowerCase().replace(/\s+/g,' ').trim());
      countByCat[q.category] = (countByCat[q.category] || 0) + 1;
      added++;
    }
    console.log(`    ${added} validi  (totale sessione: ${allCandidates.length})`);

    if (queryIdx % 5 === 0) {
      const saved = savePartial(allCandidates);
      console.log(`  [checkpoint] ${saved} candidati in wikidata-candidates.json`);
    }

    await sleep(DELAY_MS);
  }

  const finalCount = savePartial(allCandidates);

  console.log('\n=== RIEPILOGO FINALE ===');
  for (const [cat, target] of Object.entries(TARGETS)) {
    const found = countByCat[cat] || 0;
    const fin   = Math.min(found, target);
    const pct   = Math.round(fin / target * 100);
    console.log(`  ${cat.padEnd(12)} trovati: ${String(found).padStart(5)}  → selezionati: ${String(fin).padStart(5)}/${target}  (${pct}%)`);
  }
  console.log(`\nTotale selezionati: ${finalCount}`);
  console.log(`Dataset finale stimato: ${existing.length + finalCount} entità`);
  console.log('\nStep successivi:');
  console.log('  node scripts/wikidata-import.cjs');
  console.log('  node scripts/split-chunks.cjs');
}

main().catch(err => { console.error('\nFATALE:', err); savePartial([]); process.exit(1); });
