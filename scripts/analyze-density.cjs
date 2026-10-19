'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Macro-ere (da historicalPeriods.ts) ───────────────────────────────────
const MACRO_ERAS = [
  { name: '🌌 Universo primordiale', start: -13_800_000_000, end: -4_600_000_000 },
  { name: '🌍 Terra primordiale',    start:  -4_600_000_000, end:   -541_000_000 },
  { name: '🐟 Era Paleozoica',       start:    -541_000_000, end:   -252_000_000 },
  { name: '🦕 Era Mesozoica',        start:    -252_000_000, end:    -66_000_000 },
  { name: '🦎 Era Cenozoica',        start:     -66_000_000, end:     -2_500_000 },
  { name: '🦴 Preistoria',           start:      -2_500_000, end:         -3_500 },
  { name: '📜 Età Antica',           start:          -3_500, end:            476 },
  { name: '🏰 Medioevo',             start:             476, end:           1492 },
  { name: '🎨 Età Moderna',          start:            1492, end:           1789 },
  { name: '⚙️ Età Contemporanea',    start:            1789, end:           2025 },
];

// ── Sottocategorie storiche (da historicalPeriods.ts) ─────────────────────
const SUBCATEGORIES = [
  // Preistoria
  { name: 'Paleolitico Inferiore', start: -2_500_000, end:  -300_000 },
  { name: 'Paleolitico Medio',     start:   -300_000, end:   -40_000 },
  { name: 'Paleolitico Superiore', start:    -40_000, end:   -10_000 },
  { name: 'Mesolitico',            start:    -10_000, end:    -8_000 },
  { name: 'Neolitico',             start:     -8_000, end:    -3_500 },
  { name: 'Età del Rame',          start:     -4_500, end:    -3_300 },
  { name: 'Età del Bronzo',        start:     -3_300, end:    -1_200 },
  { name: 'Età del Ferro',         start:     -1_200, end:      -600 },
  // Età Antica
  { name: 'Civiltà Mesopotamiche', start:     -3_500, end:      -539 },
  { name: 'Antico Egitto',         start:     -3_100, end:       -30 },
  { name: 'Grecia Arcaica',        start:       -800, end:      -500 },
  { name: 'Grecia Classica',       start:       -500, end:      -323 },
  { name: 'Ellenismo',             start:       -323, end:       -31 },
  { name: 'Roma Monarchica',       start:       -753, end:      -509 },
  { name: 'Repubblica Romana',     start:       -509, end:       -27 },
  { name: 'Impero Romano',         start:        -27, end:       476 },
  // Medioevo
  { name: 'Alto Medioevo',         start:        476, end:      1000 },
  { name: 'Età Carolingia',        start:        800, end:       887 },
  { name: 'Età Feudale',           start:        900, end:      1100 },
  { name: 'Basso Medioevo',        start:       1000, end:      1492 },
  { name: 'Età Comunale',          start:       1000, end:      1300 },
  { name: 'Età delle Crociate',    start:       1096, end:      1291 },
  { name: 'Umanesimo',             start:       1350, end:      1492 },
  { name: 'Primo Rinascimento',    start:       1400, end:      1492 },
  // Età Moderna
  { name: 'Rinascimento',          start:       1492, end:      1600 },
  { name: 'Riforma Protestante',   start:       1517, end:      1648 },
  { name: 'Controriforma',         start:       1545, end:      1648 },
  { name: 'Monarchie Assolute',    start:       1600, end:      1789 },
  { name: 'Riv. Scientifica',      start:       1543, end:      1700 },
  { name: 'Illuminismo',           start:       1715, end:      1789 },
  // Età Contemporanea
  { name: 'Età delle Rivoluzioni', start:       1789, end:      1815 },
  { name: 'Restaurazione',         start:       1815, end:      1848 },
  { name: 'Risorgimento',          start:       1815, end:      1871 },
  { name: 'Riv. Industriale',      start:       1760, end:      1914 },
  { name: 'Imperialismo',          start:       1870, end:      1914 },
  { name: 'Belle Époque',          start:       1871, end:      1914 },
  { name: 'I Guerra Mondiale',     start:       1914, end:      1918 },
  { name: 'Tra le due guerre',     start:       1919, end:      1939 },
  { name: 'II Guerra Mondiale',    start:       1939, end:      1945 },
  { name: 'Guerra Fredda',         start:       1947, end:      1991 },
  { name: 'Globalizzazione',       start:       1991, end:      2001 },
  { name: 'Era Digitale',          start:       2001, end:      2025 },
];

const ALL_CATEGORIES = ['storia', 'arte', 'musica', 'scienza', 'geologia', 'cosmo', 'filosofia', 'sport'];
const ALL_TIPI = ['persona', 'evento', 'movimento', 'organizzazione', 'opera', 'luogo', 'scoperta'];

function getMacroEra(year) {
  for (const era of MACRO_ERAS) {
    if (year >= era.start && year < era.end) return era.name;
  }
  return MACRO_ERAS[MACRO_ERAS.length - 1].name;
}

function getSubEpochs(year) {
  return SUBCATEGORIES.filter(s => year >= s.start && year < s.end).map(s => s.name);
}

function zeroCounts(keys) {
  const obj = {};
  for (const k of keys) obj[k] = 0;
  return obj;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function p25(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * 0.25);
  return sorted[idx];
}

// ── Wikipedia API ─────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'ViaggiatoreNelTempo-Analysis/1.0 (nicola.damato@accenture.com)',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function fetchWikipediaLengths(slugs) {
  // Returns map: slug -> length (bytes). Missing = -1.
  const result = {};
  for (const s of slugs) result[s] = -1;

  const titleParam = slugs.map(s => encodeURIComponent(s.replace(/_/g, ' '))).join('|');
  const url = `https://it.wikipedia.org/w/api.php?action=query&prop=info&inprop=length&titles=${titleParam}&format=json&redirects=1`;

  try {
    const data = await httpsGet(url);
    const pages = data.query && data.query.pages ? data.query.pages : {};
    // Handle normalizations/redirects
    const normalized = {};
    if (data.query && data.query.normalized) {
      for (const n of data.query.normalized) normalized[n.to] = n.from;
    }
    if (data.query && data.query.redirects) {
      for (const r of data.query.redirects) normalized[r.to] = r.from;
    }

    for (const page of Object.values(pages)) {
      if (page.missing !== undefined) continue;
      const length = page.length || 0;
      const title = page.title;
      // Try to match back to original slug
      const slug = title.replace(/ /g, '_');
      if (result.hasOwnProperty(slug)) {
        result[slug] = length;
      } else {
        // Try via normalization
        const origTitle = normalized[title];
        if (origTitle) {
          const origSlug = origTitle.replace(/ /g, '_');
          if (result.hasOwnProperty(origSlug)) result[origSlug] = length;
        }
        // Try case-insensitive match
        for (const s of slugs) {
          if (s.toLowerCase() === slug.toLowerCase()) { result[s] = length; break; }
        }
      }
    }
  } catch (e) {
    console.warn(`  [WARN] Wikipedia batch failed: ${e.message}`);
  }
  return result;
}

async function fetchAllLengths(events) {
  const slugMap = {}; // slug -> length
  const slugsNeeded = [...new Set(events.map(e => e.wikipediaSlug).filter(Boolean))];
  const batches = [];
  for (let i = 0; i < slugsNeeded.length; i += 50) {
    batches.push(slugsNeeded.slice(i, i + 50));
  }
  console.log(`Fetching Wikipedia lengths for ${slugsNeeded.length} slugs in ${batches.length} batches...`);

  for (let i = 0; i < batches.length; i++) {
    if (i > 0 && i % 10 === 0) console.log(`  Batch ${i}/${batches.length}...`);
    const res = await fetchWikipediaLengths(batches[i]);
    Object.assign(slugMap, res);
    if (i < batches.length - 1) await sleep(500);
  }
  console.log(`Done fetching Wikipedia data.`);
  return slugMap;
}

// ── Build stats for a group of events ─────────────────────────────────────
function buildStats(events, slugMap, name, range) {
  const byCategory = zeroCounts(ALL_CATEGORIES);
  const byTipo = zeroCounts(ALL_TIPI);
  const lengths = [];
  const eventsWithLength = [];

  for (const ev of events) {
    const cat = ev.category || 'storia';
    const tipo = ev.tipo || 'evento';
    if (byCategory.hasOwnProperty(cat)) byCategory[cat]++;
    else byCategory[cat] = (byCategory[cat] || 0) + 1;
    if (byTipo.hasOwnProperty(tipo)) byTipo[tipo]++;
    else byTipo[tipo] = (byTipo[tipo] || 0) + 1;

    const len = ev.wikipediaSlug ? (slugMap[ev.wikipediaSlug] || -1) : -1;
    eventsWithLength.push({ ...ev, length: len });
    if (len > 0) lengths.push(len);
  }

  const med = median(lengths);
  const p25v = p25(lengths);

  // Low popularity: bottom 5 among those with length > 0
  const withLen = eventsWithLength.filter(e => e.length > 0).sort((a, b) => a.length - b.length);
  const lowPopularityEvents = withLen.slice(0, 5).map(e => ({
    title: e.title,
    category: e.category,
    tipo: e.tipo,
    year: e.year,
    length: e.length,
    wikipediaSlug: e.wikipediaSlug
  }));

  // Gaps: categories with 0 events (or very few: < 3) that would be historically relevant
  const gaps = [];
  for (const cat of ALL_CATEGORIES) {
    if (byCategory[cat] === 0) gaps.push(`${cat} assente`);
    else if (byCategory[cat] < 3) gaps.push(`${cat} sottorappresentato (${byCategory[cat]})`);
  }

  return {
    name,
    range,
    total: events.length,
    byCategory,
    byTipo,
    medianPopularity: Math.round(med),
    p25Popularity: Math.round(p25v),
    lowPopularityEvents,
    gaps
  };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const eventsPath = path.join(__dirname, '..', 'src', 'data', 'events.json');
  const allEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  console.log(`Loaded ${allEvents.length} events.`);

  // Exclude cosmic events for historical analysis
  const historicalEvents = allEvents.filter(e => !e.isCosmic);
  const cosmicEvents = allEvents.filter(e => e.isCosmic);
  console.log(`Historical events: ${historicalEvents.length}, Cosmic: ${cosmicEvents.length}`);

  // Fetch Wikipedia lengths for historical events
  const slugMap = await fetchAllLengths(historicalEvents);

  // ── Global stats ──────────────────────────────────────────────────────
  const globalByCategory = {};
  const globalByTipo = {};
  for (const ev of allEvents) {
    const cat = ev.category || 'sconosciuto';
    const tipo = ev.tipo || 'sconosciuto';
    globalByCategory[cat] = (globalByCategory[cat] || 0) + 1;
    globalByTipo[tipo] = (globalByTipo[tipo] || 0) + 1;
  }

  // ── Macro-era stats ────────────────────────────────────────────────────
  const macroEraStats = [];
  for (const era of MACRO_ERAS) {
    const eraEvents = historicalEvents.filter(e => e.year >= era.start && e.year < era.end);
    if (eraEvents.length === 0) continue;
    macroEraStats.push(buildStats(eraEvents, slugMap, era.name, [era.start, era.end]));
  }

  // ── Sub-epoch stats ────────────────────────────────────────────────────
  const subEpochStats = [];
  for (const sub of SUBCATEGORIES) {
    const subEvents = historicalEvents.filter(e => e.year >= sub.start && e.year < sub.end);
    if (subEvents.length < 5) continue; // skip near-empty sub-epochs
    subEpochStats.push(buildStats(subEvents, slugMap, sub.name, [sub.start, sub.end]));
  }

  // ── Assemble report ────────────────────────────────────────────────────
  const report = {
    globalStats: {
      total: allEvents.length,
      totalHistorical: historicalEvents.length,
      totalCosmic: cosmicEvents.length,
      byCategory: globalByCategory,
      byTipo: globalByTipo
    },
    macroEras: macroEraStats,
    subEpochs: subEpochStats
  };

  const outPath = path.join(__dirname, 'density-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport written to ${outPath}`);
  console.log(`Macro-eras with data: ${macroEraStats.length}`);
  console.log(`Sub-epochs with data: ${subEpochStats.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
