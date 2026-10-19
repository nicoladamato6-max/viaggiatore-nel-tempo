/**
 * vital-articles-analysis.cjs
 * Confronta il dataset Viaggiatore nel Tempo con Wikipedia Vital Articles Level 4.
 * Strategia:
 *   - Metodo A: Category API (vital articles level-4)
 *   - Metodo B: sottopagine tematiche (link parsing)
 *   - Metodo C: en.wikipedia pageviews 2023 (12 mesi) + it.wikipedia pageviews 2023 (12 mesi)
 *     entrambi aggregati per un corpus più ampio e più accurato
 * Output: scripts/vital-articles-gap.md
 */

'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const EVENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'events.json');
const OUTPUT_MD   = path.join(__dirname, 'vital-articles-gap.md');
const CACHE_DIR   = path.join(__dirname, 'vital-cache');
const USER_AGENT  = 'ViaggiatoreNelTempo-VitalGap/1.0 (nicola.damato@accenture.com)';

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function get(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': USER_AGENT } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(new Error(`JSON parse @ ${url}: ${e.message}`)); }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => { req.destroy(new Error('timeout')); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Cache ──────────────────────────────────────────────────────────────────

function cacheGet(key) {
  const f = path.join(CACHE_DIR, key.replace(/[:/\\?=&|]/g, '_') + '.json');
  if (fs.existsSync(f)) {
    try {
      const raw = fs.readFileSync(f, 'utf8');
      if (raw.length > 2) return JSON.parse(raw); // skip empty {} or []
    } catch (_) {}
  }
  return null;
}

function cacheSet(key, data) {
  const f = path.join(CACHE_DIR, key.replace(/[:/\\?=&|]/g, '_') + '.json');
  fs.writeFileSync(f, JSON.stringify(data), 'utf8');
}

// ─── Step 1: Dataset ─────────────────────────────────────────────────────────

function loadDataset() {
  console.log('📂 Caricamento events.json...');
  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
  const slugSet = new Set();
  const categoryCount = {};
  for (const e of events) {
    if (e.wikipediaSlug) {
      slugSet.add(e.wikipediaSlug.toLowerCase().replace(/ /g, '_'));
      // anche senza parentesi
      const noP = e.wikipediaSlug.toLowerCase().replace(/ /g, '_').replace(/_\([^)]+\)$/, '');
      slugSet.add(noP);
    }
    categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
  }
  console.log(`  → ${events.length} eventi, ${slugSet.size} slug unici (incluse varianti)`);
  console.log('  Distribuzione:', JSON.stringify(categoryCount));
  return { events, slugSet, categoryCount };
}

// ─── Step 2A: Category API ───────────────────────────────────────────────────

async function fetchCategoryMembers() {
  console.log('\n🔍 Metodo A: Category API...');
  const cacheKey = 'methodA_category_vital4';
  const cached = cacheGet(cacheKey);
  if (cached) { console.log(`  ✓ Cache: ${cached.length} articoli`); return cached; }

  const members = [];
  let cmcontinue = null;
  do {
    let url = 'https://en.wikipedia.org/w/api.php?action=query&list=categorymembers' +
      '&cmtitle=Category:Wikipedia_vital_articles_level-4&cmlimit=500&cmtype=page&format=json';
    if (cmcontinue) url += '&cmcontinue=' + encodeURIComponent(cmcontinue);
    try {
      const data = await get(url);
      const batch = (data.query && data.query.categorymembers) || [];
      members.push(...batch);
      cmcontinue = data.continue && data.continue.cmcontinue;
      console.log(`  pagina: ${batch.length} articoli (totale: ${members.length})`);
      await sleep(300);
    } catch (e) { console.warn(`  ⚠ ${e.message}`); break; }
  } while (cmcontinue);

  if (members.length >= 100) {
    cacheSet(cacheKey, members);
    return members;
  }
  console.log(`  → Metodo A: ${members.length} risultati insufficienti`);
  return null;
}

// ─── Step 2B: Subpage wikitext scraping ──────────────────────────────────────

// Le sottopagine Vital Articles Level 4 usano tabelle wikitext con link del tipo [[Titolo]]
// La prop=links non le cattura tutte perché molti link sono in template.
// Usiamo action=parse&prop=wikitext e poi regex per estrarre i wikilink.

const VITAL_SUBPAGES = [
  'Wikipedia:Vital_articles/Level/4/People',
  'Wikipedia:Vital_articles/Level/4/Arts',
  'Wikipedia:Vital_articles/Level/4/Everyday_life',
  'Wikipedia:Vital_articles/Level/4/Geography',
  'Wikipedia:Vital_articles/Level/4/History',
  'Wikipedia:Vital_articles/Level/4/Mathematics',
  'Wikipedia:Vital_articles/Level/4/Natural_science',
  'Wikipedia:Vital_articles/Level/4/Philosophy_and_religion',
  'Wikipedia:Vital_articles/Level/4/Society_and_social_sciences',
  'Wikipedia:Vital_articles/Level/4/Technology',
];

async function fetchSubpageWikitext(title) {
  const cacheKey = 'B_wikitext_' + title.replace(/[:/]/g, '_');
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json`;
  try {
    const data = await get(url, 30000);
    const wikitext = data.parse && data.parse.wikitext && data.parse.wikitext['*'];
    if (!wikitext) return [];
    // Estrai tutti [[Titolo]] o [[Titolo|Label]]
    const regex = /\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]/g;
    const links = [];
    let m;
    while ((m = regex.exec(wikitext)) !== null) {
      const t = m[1].trim();
      if (!t.includes(':')) links.push({ title: t });
    }
    cacheSet(cacheKey, links);
    return links;
  } catch (e) {
    console.warn(`  ⚠ Wikitext ${title}: ${e.message}`);
    return [];
  }
}

async function fetchAllSubpages() {
  console.log('\n🔍 Metodo B: Sottopagine tematiche (wikitext parsing)...');
  const all = [];
  for (const sp of VITAL_SUBPAGES) {
    console.log(`  Scarico wikitext: ${sp}...`);
    const links = await fetchSubpageWikitext(sp);
    console.log(`    → ${links.length} link`);
    all.push(...links);
    await sleep(400);
  }
  // Deduplica
  const seen = new Set();
  const unique = [];
  for (const l of all) {
    const k = l.title.toLowerCase().replace(/ /g, '_');
    if (!seen.has(k)) { seen.add(k); unique.push(l); }
  }
  return unique;
}

// ─── Step 2C: Pageviews (en + it wikipedia, 2023) ────────────────────────────

async function fetchPageviewsMonth(wiki, year, month) {
  const mm = String(month).padStart(2, '0');
  const cacheKey = `pv_${wiki}_${year}_${mm}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${wiki}/all-access/${year}/${mm}/all-days`;
  try {
    const data = await get(url, 25000);
    const articles = (data.items && data.items[0] && data.items[0].articles) || [];
    const result = articles.slice(0, 1000);
    cacheSet(cacheKey, result);
    return result;
  } catch (e) {
    console.warn(`  ⚠ Pageviews ${wiki} ${year}-${mm}: ${e.message}`);
    return [];
  }
}

async function fetchPageviewsCorpus() {
  console.log('\n🔍 Metodo C: Wikimedia Pageviews 2023 (it + en wikipedia)...');

  // it.wikipedia — slugs diretti confrontabili col dataset
  const itSlugs = new Map();
  console.log('  Scarico it.wikipedia 2023...');
  for (let m = 1; m <= 12; m++) {
    const articles = await fetchPageviewsMonth('it.wikipedia', 2023, m);
    for (const a of articles) {
      if (!a.article) continue;
      itSlugs.set(a.article, (itSlugs.get(a.article) || 0) + (a.views || 0));
    }
    process.stdout.write(` ${m}`);
    await sleep(200);
  }
  console.log(`\n  → it.wikipedia: ${itSlugs.size} slug unici`);

  // en.wikipedia — da usare con mapping Wikidata
  const enSlugs = new Map();
  console.log('  Scarico en.wikipedia 2023...');
  for (let m = 1; m <= 12; m++) {
    const articles = await fetchPageviewsMonth('en.wikipedia', 2023, m);
    for (const a of articles) {
      if (!a.article) continue;
      enSlugs.set(a.article, (enSlugs.get(a.article) || 0) + (a.views || 0));
    }
    process.stdout.write(` ${m}`);
    await sleep(200);
  }
  console.log(`\n  → en.wikipedia: ${enSlugs.size} slug unici`);

  // Combina: usa it.wikipedia come base, aggiungi en come supplemento (con flag)
  const combined = [];
  for (const [slug, views] of [...itSlugs.entries()].sort((a, b) => b[1] - a[1])) {
    combined.push({ title: slug, wiki: 'it', views });
  }
  for (const [slug, views] of [...enSlugs.entries()].sort((a, b) => b[1] - a[1])) {
    combined.push({ title: slug, wiki: 'en', views });
  }
  return combined;
}

// ─── Step 3: Wikidata en→it mapping ──────────────────────────────────────────

async function wikidataBatch(titles) {
  // Non usare encodeURIComponent per il pipe — Wikidata lo accetta raw
  const titlesParam = titles.join('|');
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${encodeURIComponent(titlesParam)}&props=sitelinks&format=json`;
  try {
    const data = await get(url, 25000);
    const result = {};
    for (const eid of Object.keys(data.entities || {})) {
      const entity = data.entities[eid];
      if (entity.missing !== undefined) continue;
      const enLink = entity.sitelinks && entity.sitelinks.enwiki && entity.sitelinks.enwiki.title;
      const itLink = entity.sitelinks && entity.sitelinks.itwiki && entity.sitelinks.itwiki.title;
      if (enLink) {
        result[enLink.replace(/ /g, '_')] = itLink ? itLink.replace(/ /g, '_') : null;
      }
    }
    return result;
  } catch (e) {
    console.warn(`  ⚠ Wikidata batch: ${e.message}`);
    return {};
  }
}

async function buildEnToItMap(enTitles) {
  console.log(`\n🔗 Wikidata en→it mapping (${enTitles.length} slug)...`);
  const map = {};
  const BATCH = 50;
  for (let i = 0; i < enTitles.length; i += BATCH) {
    const batch = enTitles.slice(i, i + BATCH);
    const partial = await wikidataBatch(batch);
    Object.assign(map, partial);
    if (i % 1000 === 0) console.log(`  ${i}/${enTitles.length} → ${Object.keys(map).length} mappings`);
    await sleep(120);
  }
  console.log(`  ✓ ${Object.keys(map).length} mappings totali`);
  return map;
}

// ─── Step 4: Filtri ───────────────────────────────────────────────────────────

// Escludi pagine di navigazione e meta-pagine
const NAV_PREFIXES = ['Wikipedia:', 'Template:', 'Category:', 'Portal:', 'File:', 'Help:', 'Special:'];
const NAV_PATTERNS = [
  /^list[_ ]of[_ ]/i, /^index[_ ]of[_ ]/i, /^outline[_ ]of[_ ]/i,
  /^timeline[_ ]of[_ ]/i, /^glossary[_ ]of[_ ]/i,
  /^deaths[_ ]in[_ ]/i, /^births[_ ]in[_ ]/i, /^albo[_ ]d'oro/i,
  /\(disambiguation\)/i, /^wikimedia[_ ]/i,
  /^qualificaz/i, /^qualifying/i,
  // Serie stagionali ripetitive
  /[_ ](season|stagione)[_ ]/i,
  // Partite specifiche
  /[_ ]vs[._ ]/i, /[_ ]v\.[_ ]/i,
];

// Parole-chiave che indicano entità non adatte a una mappa storica
const NOMAP_KEYWORDS = [
  // Sport contemporanei / tornei recenti (non storici)
  'cricket_world_cup', 'world_baseball_classic', 'india.pakistan_cricket',
  'women.s_premier_league_(cricket)', 'sa20_(cricket)',
  'college_football_playoff', 'ncaa_division',
  // Team di cricket (poco rilevanti per mappa storica europea)
  'national_cricket_team', 'cricket_association', 'cricket_stadium',
  // Squadre di football americano
  'american_football', '_football_coach', '_football)', 'nfl_',
  // Stagioni/campionati anonimi
  'campionato_mondiale_di_calcio_under', 'campionato_europeo_di_calcio_2024',
  'qualificazioni_al_campionato',
  // Personaggi pop contemporanei in carica
  'joe_biden', 'kamala_harris', 'donald_trump', 'vladimir_putin', 'xi_jinping',
  'giorgia_meloni', 'olaf_scholz', 'emmanuel_macron', 'rishi_sunak',
  // Piattaforme/aziende tech recenti
  'chatgpt', 'openai', 'tiktok', 'instagram', 'twitter', 'netflix', 'spotify',
  // Film/serie 2020+
  'squid_game', 'stranger_things', 'mandalorian', 'andor', 'oppenheimer_(film)',
  'barbie_(film)', 'house_of_dragon', 'the_bear', 'wednesday_(tv',
  // Operatori specifici per evitare "List of ..." con underscore
  'list_of_rugby', 'list_of_national', 'list_of_top', 'list_of_international',
  'list_of_nba', 'list_of_masters',
];

// Parole-chiave che classificano entità come TROPPO contemporanee (anno > 2015)
const RECENT_YEAR_RE = /\b(2015|2016|2017|2018|2019|2020|2021|2022|2023|2024|2025)\b/;

// Entità che DEVONO essere escluse (contemporanee non storiche)
const EXCLUDE_EXACT = new Set([
  'Cricket', 'Boxing_Day', 'Major_League_Soccer', 'Major_League_Cricket',
  'National_Football_League', 'English_football_league_system',
  'Algebraic_notation_(chess)', 'World_Chess_Championship_2023',
  'Chess_World_Cup_2023', 'College_Football_Playoff',
  // Pagine non storiche / meta
  'Pagina_principale', 'Main_Page', 'Wikipedia', 'Google', 'YouTube',
  'YouTube_Music', 'Spotify', 'Netflix', 'Amazon', 'Apple',
  'Indian_Premier_League',  // lega cricket, non storia
  // Film/serie entertainment classificati male per parola-chiave
  'XXX_(film_series)', 'Gayniggers_from_Outer_Space',
  'Marvel_Cinematic_Universe:_Phase_Five', 'Marvel_Cinematic_Universe:_Phase_Four',
  'The_Conjuring_Universe', 'DC_Extended_Universe',
  'Miss_Universe_2022', 'Miss_Universe_2023', 'Miss_Universe',
  'Lokesh_Cinematic_Universe', 'YRF_Spy_Universe',
  'Boys_Planet', 'Asteroid_City',
  // Serie TV / film classificati come cosmo per "Big Bang" o "Galaxy"
  'The_Big_Bang_Theory',    // sitcom, non astronomia
  'Guardiani_della_Galassia_Vol._3', 'Guardiani_della_Galassia_Vol._2',
  'Guardians_of_the_Galaxy_Vol._3', 'Guardians_of_the_Galaxy_Vol._2',
  'Guardians_of_the_Galaxy', 'Guardiani_della_Galassia',
  // Film Bollywood 2023 (non storici)
  'Jawan_(film)', 'Pathaan', 'Pathaan_(film)', 'Adipurush',
  // Articoli tematici generici non adatti a mappa storica
  'Sex', 'Pornography', 'Nudity', 'Death', 'Murder', 'Crime',
  'Index_(statistics)', 'Index', 'Statistics', 'Economy', 'Inflation',
  // Pagine speciali Wikipedia (it)
  'Speciale:Ricerca', 'Speciale:Pagina_Casuale', 'Aiuto:Sportello_informazioni',
  // Marchi commerciali generici
  'XXXX_(beer)', 'XXXX', 'Flipkart', 'XXXTentacion',
  // Musica: eventi non musicisti / classificati male
  "Re'im_music_festival_massacre",  // attentato terroristico, non musica
  'Chris_Rock',   // comico, non musicista
  'Rock_Hudson',  // attore, non musicista
  // Lottatori/atleti classificati male per nome proprio
  'Islam_Makhachev',
  // Navi classificate come sport
  'RMS_Olympic',
]);

function isExcluded(title, wiki = 'it') {
  if (!title || title.length < 2) return true;
  const tl = title.toLowerCase().replace(/ /g, '_');

  if (NAV_PREFIXES.some(p => title.startsWith(p))) return true;
  if (NAV_PATTERNS.some(p => p.test(tl))) return true;
  if (NOMAP_KEYWORDS.some(k => tl.includes(k.toLowerCase()))) return true;
  if (EXCLUDE_EXACT.has(title) || EXCLUDE_EXACT.has(title.replace(/ /g, '_'))) return true;

  // Escludi eventi sportivi specifici di anni recenti (2015+) — solo sport
  if (RECENT_YEAR_RE.test(title) && /_(cricket|rugby|nfl|nba|ncaa|baseball|soccer|football_club|calcio_20)/i.test(tl)) return true;

  // Escludi anni molto recenti per entità non storiche
  if (wiki === 'en' && /^202[0-9]_/.test(title)) return true;
  if (wiki === 'it' && /^202[0-9]/.test(title)) return true;

  return false;
}

// Whitelist di entità storicamente rilevanti che vogliamo assolutamente includere
// anche se potrebbero essere filtrate dai patterns
const HISTORICAL_WHITELIST = new Set([
  'Olympic_Games', 'Ancient_Olympic_Games', 'World_Chess_Championship',
  'US_Open_(tennis)', 'Wimbledon_Championships', 'Tour_de_France',
  'FIFA_World_Cup', 'UEFA_Champions_League', 'Copa_America',
  'Manchester_City_Football_Club', 'Manchester_United_Football_Club',
  'Real_Madrid_Club_de_Fútbol', 'FC_Barcelona', 'Chelsea_Football_Club',
  'Arsenal_Football_Club', 'Tottenham_Hotspur_Football_Club',
  'Paris_Saint-Germain_Football_Club',
  // Squadre italiane storiche
  'Atalanta_Bergamasca_Calcio', 'Torino_Football_Club',
  'Bologna_Football_Club_1909', 'Genoa_Cricket_and_Football_Club',
  'Palermo_Football_Club', 'Unione_Calcio_Sampdoria',
  'Hellas_Verona_Football_Club', 'Cagliari_Calcio',
]);

// ─── Step 5: Classificazione ─────────────────────────────────────────────────

function classify(title) {
  const tl = title.toLowerCase().replace(/_/g, ' ');

  let tipo = 'evento';
  if (/\b(nato|morto|presidente|re|papa|imperatore|generale|ammiraglio|filosofo|scienziato|artista|pittore|compositore|scrittore|poeta|musicista|atleta|calciatore|tennista|ciclista|nuotatore|olimpionico|esploratore|astronauta)\b/.test(tl)) tipo = 'persona';
  else if (/\b(romanzo|libro|poema|dipinto|scultura|sinfonia|opera|concerto|film|architettura|cattedrale|chiesa|tempio|moschea|palazzo|monumento)\b/.test(tl)) tipo = 'opera';
  else if (/\b(città|paese|nazione|impero|regno|repubblica|isola|penisola|castello|forte|rovine|sito|continente)\b/.test(tl)) tipo = 'luogo';
  else if (/\b(partito|organizzazione|società|azienda|club|associazione|lega|federazione|comitato|unione)\b/.test(tl)) tipo = 'organizzazione';
  else if (/\b(movimento|rivoluzione|rinascimento|illuminismo|romanticismo|modernismo|nazionalismo|socialismo|liberalismo|fascismo|comunismo|anarchismo|femminismo|umanesimo)\b/.test(tl)) tipo = 'movimento';
  else if (/\b(scoperta|invenzione|teoria|legge|teorema|elemento|specie|pianeta|stella|galassia|cometa|asteroide)\b/.test(tl)) tipo = 'scoperta';

  // English fallback
  if (tipo === 'evento') {
    if (/\b(born|died|king|queen|emperor|philosopher|scientist|artist|writer|poet|musician|athlete|pope|president|general|explorer|inventor|painter|composer|admiral|astronaut)\b/.test(tl)) tipo = 'persona';
    else if (/\b(novel|book|painting|symphony|opera|film|poem|sculpture|cathedral|church|temple|mosque)\b/.test(tl)) tipo = 'opera';
    else if (/\b(city|town|country|nation|empire|kingdom|republic|island|peninsula|castle|palace|fort)\b/.test(tl)) tipo = 'luogo';
    else if (/\b(party|organization|company|club|association|league|federation|committee|union)\b/.test(tl)) tipo = 'organizzazione';
    else if (/\b(movement|revolution|reform|renaissance|enlightenment|romanticism|modernism|nationalism)\b/.test(tl)) tipo = 'movimento';
    else if (/\b(discovery|invention|theory|law|theorem|element|species|planet|star|galaxy|comet)\b/.test(tl)) tipo = 'scoperta';
  }

  let cat = 'storia';
  if (/\b(filosofi[ao]|etica_[a-z]|metafisica|epistemologia|logica_[a-z]|teologia|buddhismo|cristiane?simo|induismo|ebraismo|confucianesimo|taoismo|buddhism|christianity|hinduism|judaism|taoism|confucianism|philosophy|ethics|metaphysics|logic_[a-z]|theology)\b/.test(tl) ||
      /^(islam|islamismo|religione|buddismo)$/.test(tl.trim()) ||
      /\b(history_of_(the_)?jews|storia_del|storia_dell'islam|storia_del_buddhismo)\b/.test(tl)) cat = 'filosofia';
  else if (/\b(musica|sinfonia|opera lirica|jazz|compositore|orchestra|sonata|concerto|blues|rock|folk|musica classica|canto|cantante|music|symphony|composer|orchestra|sonata|concerto)\b/.test(tl)) cat = 'musica';
  else if (/\b(pittura|scultura|architettura|romanzo|poema|poeta|scrittore|teatro|cinema|arte|museo|balletto|danza|letteratura|pittor|scultore|painting|sculpture|architecture|novel|poem|poet|writer|theatre|film|cinema|art|museum|ballet|dance|literature)\b/.test(tl)) cat = 'arte';
  else if (/\b(fisica|chimica|biologia|matematica|astronomia|medicina|genetica|evoluzione|scienzia|ingegneria|elettr|nuclear|quantum|relatività|physics|chemistry|biology|mathematics|astronomy|medicine|genetics|evolution|engineer|nuclear|quantum|relativity)\b/.test(tl)) cat = 'scienza';
  else if (/\b(geologia|fossile|minerale|tettonica|vulcano|terremoto|dinosauro|paleontologia|era glaciale|ghiacciaio|erosione|geology|fossil|mineral|tectonic|volcano|earthquake|dinosaur|paleontology|ice age|glacier)\b/.test(tl)) cat = 'geologia';
  else if (/\b(galassia|nebulosa|cosmo[sg]?|buco nero|supernova|big bang|cometa|asteroide|telescopio|sistema solare|orbita celeste|galaxy|nebula|cosmos(?!politan)|black hole|comet|asteroid|telescope|stellar|solar system|kepler|hubble|nasa_|esa_|apollo_program|space_shuttle|space_station|international_space_station|milky_way|quasar|pulsar)\b/.test(tl)) cat = 'cosmo';
  else if (/\b(sport|olimpia|calcio|football|tennis|scacchi|boxe|atletica|nuoto|ciclismo|basket|baseball|golf|rugby|cricket|olympic|soccer|chess|boxing|athletics|swimming|cycling|basketball)\b/.test(tl)) cat = 'sport';

  return { tipo, cat };
}

function estimateYear(title) {
  // Cerca anni ragionevoli (100 AC - 2020)
  const m = title.match(/\b(1[0-9]{3}|[2-9][0-9]{2}|20[01][0-9]|2020)\b/);
  if (m) return parseInt(m[1]);
  // Anno negativo (aC)
  const bc = title.match(/\b([0-9]{1,4})\s*BC\b/i);
  if (bc) return -parseInt(bc[1]);
  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Vital Articles Gap Analysis — Viaggiatore nel Tempo');
  console.log('═══════════════════════════════════════════════════════\n');

  const { events, slugSet, categoryCount } = loadDataset();

  // ── Step 2: Corpus ──────────────────────────────────────────────────────────
  let corpus = [];       // [{title, wiki:'it'|'en'|'vital', views?}]
  let metodologia = '';
  let metodName = '';

  // Metodo A
  const catMembers = await fetchCategoryMembers();
  if (catMembers && catMembers.length >= 100) {
    corpus = catMembers.map(m => ({ title: m.title, wiki: 'en' }));
    metodName = 'A';
    metodologia = `**Metodo A** — Wikipedia Category API (\`Category:Wikipedia_vital_articles_level-4\`)\n` +
      `- ${catMembers.length} articoli scaricati tramite paginazione \`cmcontinue\`\n` +
      `- Fonte: curated list Wikipedia Vital Articles Level 4 (10.000 articoli più importanti)`;
  } else {
    // Metodo B
    const subpageLinks = await fetchAllSubpages();
    if (subpageLinks.length >= 500) {
      corpus = subpageLinks.map(l => ({ title: l.title, wiki: 'en' }));
      metodName = 'B';
      metodologia = `**Metodo B** — Wikipedia Vital Articles sottopagine tematiche (wikitext parsing)\n` +
        `- ${VITAL_SUBPAGES.length} sottopagine: /People, /Arts, /History, /Natural_science, /Philosophy_and_religion, ...\n` +
        `- ${subpageLinks.length} articoli unici estratti da wikitext con regex \`[[titolo]]\``;
    } else {
      // Metodo C
      const pv = await fetchPageviewsCorpus();
      corpus = pv;
      metodName = 'C';
      metodologia = `**Metodo C** — Wikimedia Pageviews API (fallback)\n` +
        `- it.wikipedia 2023 (12 mesi) + en.wikipedia 2023 (12 mesi)\n` +
        `- ${pv.filter(x => x.wiki === 'it').length} slug it.wikipedia + ${pv.filter(x => x.wiki === 'en').length} slug en.wikipedia\n` +
        `- Aggregati per views totali annuali (proxy di rilevanza enciclopedica)\n` +
        `- Nota: corpus pageviews ha bias verso contenuti 2023; filtri aggressivi rimuovono contenuti non storici`;
    }
  }

  console.log(`\n✓ Corpus: ${corpus.length} voci (metodo ${metodName})\n`);
  fs.writeFileSync(path.join(CACHE_DIR, 'corpus_raw.json'),
    JSON.stringify(corpus.slice(0, 200), null, 2));

  // ── Step 3: Filtra corpus ──────────────────────────────────────────────────
  const filtered = corpus.filter(a => {
    if (!a.title) return false;
    return !isExcluded(a.title, a.wiki);
  });
  console.log(`Dopo filtri esclusione: ${filtered.length} articoli`);

  // ── Step 4: Divide per lingua ──────────────────────────────────────────────
  const itCorpus = filtered.filter(a => a.wiki === 'it');
  const enCorpus = filtered.filter(a => a.wiki === 'en');

  console.log(`  it.wikipedia: ${itCorpus.length} | en.wikipedia: ${enCorpus.length}`);

  // ── Step 4a: Match diretto per it.wikipedia ────────────────────────────────
  const itNotInDataset = itCorpus.filter(a => {
    const slug = a.title.replace(/ /g, '_').toLowerCase();
    return !slugSet.has(slug);
  });
  console.log(`  it.wikipedia NON nel dataset: ${itNotInDataset.length}`);

  // ── Step 4b: Match diretto en.wikipedia (molti slug coincidono) ───────────
  const enDirectMiss = enCorpus.filter(a => {
    const slug = a.title.replace(/ /g, '_').toLowerCase();
    return !slugSet.has(slug);
  });
  console.log(`  en.wikipedia NON nel dataset (match diretto): ${enDirectMiss.length}`);

  // ── Step 4c: Wikidata mapping per en non trovati ─────────────────────────
  let enToItMap = {};
  if (enDirectMiss.length > 0) {
    enToItMap = await buildEnToItMap(enDirectMiss.map(a => a.title));
  }

  // ── Step 5: Costruisci lista candidati finali ─────────────────────────────
  const usedSlugs = new Set();
  const candidates = [];

  // Prima: it.wikipedia non nel dataset (slug direttamente comparabili)
  for (const item of itNotInDataset) {
    const slugIt = item.title.replace(/ /g, '_');
    const slugKey = slugIt.toLowerCase();
    if (usedSlugs.has(slugKey)) continue;
    usedSlugs.add(slugKey);

    const { tipo, cat } = classify(item.title);
    const estYear = estimateYear(item.title);

    candidates.push({
      slug_en: slugIt,        // per it.wikipedia, slug_en = slug_it nella pratica
      slug_it: slugIt,
      title_it: item.title.replace(/_/g, ' '),
      estimated_year: estYear,
      suggested_category: cat,
      suggested_tipo: tipo,
      views: item.views || null,
      source: 'it.wikipedia',
    });
  }

  // Poi: en.wikipedia con mapping Wikidata
  for (const item of enDirectMiss) {
    const slugEn = item.title.replace(/ /g, '_');
    const slugIt = enToItMap[slugEn] || slugEn;
    const slugItLc = slugIt.toLowerCase();

    if (usedSlugs.has(slugItLc)) continue;
    if (slugSet.has(slugItLc)) continue;  // trovato via wikidata → già nel dataset
    usedSlugs.add(slugItLc);

    const { tipo, cat } = classify(item.title);
    const estYear = estimateYear(item.title);

    candidates.push({
      slug_en: slugEn,
      slug_it: slugIt,
      title_it: slugIt.replace(/_/g, ' '),
      estimated_year: estYear,
      suggested_category: cat,
      suggested_tipo: tipo,
      views: item.views || null,
      source: 'en.wikipedia',
    });
  }

  console.log(`\n✓ Candidati totali non nel dataset: ${candidates.length}`);

  // ── Step 6: Prioritizzazione ──────────────────────────────────────────────
  // 1. Categorie sottorappresentate prima
  // 2. Poi per views (popolarità) decrescente
  const PRIORITY_ORDER = ['sport', 'cosmo', 'filosofia', 'musica', 'geologia', 'arte', 'scienza', 'storia'];
  candidates.sort((a, b) => {
    const pa = PRIORITY_ORDER.indexOf(a.suggested_category);
    const pb = PRIORITY_ORDER.indexOf(b.suggested_category);
    if (pa !== pb) return pa - pb;
    if (a.views && b.views) return b.views - a.views;
    if (a.views) return -1;
    if (b.views) return 1;
    return 0;
  });

  // ── Step 7: Statistiche per categoria ────────────────────────────────────
  const byCategory = {};
  for (const c of candidates) {
    byCategory[c.suggested_category] = (byCategory[c.suggested_category] || 0) + 1;
  }

  // Top 100 bilanciata: ~13 per categoria lacunosa + storia/arte
  const top100 = [];
  const usedTop100 = new Set();
  // storia=0: non aggiungere slot storia (domina il corpus con quasi tutto ciò che non è classificato)
  const QUOTA100 = { sport: 35, musica: 20, cosmo: 5, filosofia: 5, geologia: 10, arte: 15, scienza: 10, storia: 0 };
  for (const cat of PRIORITY_ORDER) {
    const catItems = candidates.filter(c => c.suggested_category === cat);
    let filled = 0;
    for (const item of catItems) {
      if (filled >= (QUOTA100[cat] || 10)) break;
      if (!usedTop100.has(item.slug_en)) {
        top100.push(item);
        usedTop100.add(item.slug_en);
        filled++;
      }
    }
  }
  // completa fino a 100
  for (const item of candidates) {
    if (top100.length >= 100) break;
    if (!usedTop100.has(item.slug_en)) {
      top100.push(item);
      usedTop100.add(item.slug_en);
    }
  }

  // ── Top 20 priorità assolute — focus su categorie LACUNOSE ───────────────
  // Solo categorie che hanno gap reali; arte/scienza/storia sono già ben rappresentate
  const QUOTA = { sport: 8, musica: 6, cosmo: 3, filosofia: 3, geologia: 3 };
  const top20 = [];
  const usedTop = new Set();
  const countTop = {};

  // Prima passata: rispetta le quote
  for (const cat of Object.keys(QUOTA)) {
    const catItems = candidates.filter(c => c.suggested_category === cat);
    let filled = 0;
    for (const item of catItems) {
      if (filled >= QUOTA[cat]) break;
      if (!usedTop.has(item.slug_en)) {
        top20.push(item);
        usedTop.add(item.slug_en);
        countTop[cat] = (countTop[cat] || 0) + 1;
        filled++;
      }
    }
  }
  // Completa fino a 20 se alcune categorie sono esaurite
  for (const item of candidates) {
    if (top20.length >= 20) break;
    if (!usedTop.has(item.slug_en)) {
      top20.push(item);
      usedTop.add(item.slug_en);
    }
  }

  // ── Genera Markdown ───────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10);
  const totalEvents = events.length;

  let md = `# Vital Articles Gap Analysis — Viaggiatore nel Tempo

> Generato il ${date} | Corpus: Wikipedia Vital Articles Level 4 (Metodo ${metodName})

---

## 1. Metodologia

${metodologia}

### Pipeline di analisi:
1. **Dataset attuale**: \`src/data/events.json\` — ${totalEvents} entità, ${slugSet.size} slug Wikipedia unici (incluse varianti senza parentesi)
2. **Corpus**: ${corpus.length} articoli originali (prima dei filtri)
3. **Filtri applicati**: pagine di navigazione (List of, Index of, Category:, Template:, Portal:), contenuti pop 2023 (serie TV, politici in carica, sport season 2023), anni 2020+ non storici — rimanenti: ${filtered.length}
4. **Match diretto**: slug it.wikipedia confrontati direttamente con il dataset; slug en.wikipedia confrontati sia direttamente che via Wikidata
5. **Wikidata mapping**: batch da 50 titoli, API \`wbgetentities?sites=enwiki\` — ${Object.keys(enToItMap).length} slug EN mappati a IT
6. **Candidati finali**: ${candidates.length} entità non presenti nel dataset
7. **Prioritizzazione**: categorie lacunose (sport → cosmo → filosofia → musica → geologia) prima; poi per views annuali 2023

---

## 2. Statistiche

| Metrica | Valore |
|---------|--------|
| Corpus totale Vital Articles | ${corpus.length} |
| Dopo filtri (nav + pop) | ${filtered.length} |
| Già nel dataset (match diretto it) | ${itCorpus.length - itNotInDataset.length} |
| Già nel dataset (match diretto en) | ${enCorpus.length - enDirectMiss.length} |
| Mappati via Wikidata (en→it) | ${Object.keys(enToItMap).length} |
| **Candidati mancanti totali** | **${candidates.length}** |
| Top 100 (questa analisi) | ${top100.length} |
| Top 20 priorità assolute | ${top20.length} |

### Distribuzione attuale del dataset:
| Categoria | Conteggio | % | Stato |
|-----------|-----------|---|-------|
`;

  const catStatus = {
    sport: '⚠️ LACUNA CRITICA',
    cosmo: '⚠️ LACUNA CRITICA',
    filosofia: '⚠️ Sottorappresentata',
    musica: 'OK',
    geologia: 'OK',
    arte: 'OK',
    scienza: 'OK',
    storia: 'Sovrarappresentata',
  };

  for (const [cat, cnt] of Object.entries(categoryCount).sort((a, b) => b[1] - a[1])) {
    md += `| ${cat} | ${cnt} | ${((cnt / totalEvents) * 100).toFixed(1)}% | ${catStatus[cat] || ''} |\n`;
  }

  md += `
---

## 3. Distribuzione candidati mancanti per categoria

| Categoria | Mancanti | Stato attuale dataset |
|-----------|----------|-----------------------|
`;
  for (const cat of PRIORITY_ORDER) {
    const n = byCategory[cat] || 0;
    if (n > 0) md += `| **${cat}** | **${n}** | ${catStatus[cat] || ''} |\n`;
  }

  md += `
---

## 4. Top 100 candidati mancanti

*Ordinati per: categoria lacunosa → popolarità (views 2023)*

| # | slug_en | Titolo IT | Anno | Categoria | Tipo | Views 2023 |
|---|---------|-----------|------|-----------|------|-----------|
`;
  top100.forEach((c, i) => {
    const views = c.views ? c.views.toLocaleString('it-IT') : '—';
    md += `| ${i + 1} | \`${c.slug_en}\` | ${c.title_it} | ${c.estimated_year || '—'} | ${c.suggested_category} | ${c.suggested_tipo} | ${views} |\n`;
  });

  md += `
---

## 5. Top 20 priorità assolute

Criteri: (1) colma lacune categorie sottorappresentate (sport, cosmo, filosofia, musica, geologia), (2) massima popolarità Wikipedia

| # | slug_en | Titolo IT | Anno | Categoria | Tipo | Motivazione |
|---|---------|-----------|------|-----------|------|-------------|
`;
  top20.forEach((c, i) => {
    const motivo = `Categoria **${c.suggested_category}** sottorappresentata nel dataset` +
      (c.views ? ` — ${c.views.toLocaleString('it-IT')} views/anno 2023` : '');
    md += `| ${i + 1} | \`${c.slug_en}\` | ${c.title_it} | ${c.estimated_year || '—'} | **${c.suggested_category}** | ${c.suggested_tipo} | ${motivo} |\n`;
  });

  // ── Sezioni per categoria lacunosa ────────────────────────────────────────
  md += `
---

## 6. Dettaglio per categorie lacunose

`;
  for (const cat of ['sport', 'cosmo', 'filosofia', 'musica', 'geologia']) {
    const catCands = candidates.filter(c => c.suggested_category === cat);
    if (catCands.length === 0) continue;
    md += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${catCands.length} candidati mancanti)\n\n`;
    md += `| slug_en | Titolo IT | Anno | Tipo | Views 2023 |\n`;
    md += `|---------|-----------|------|------|--------|\n`;
    const shown = catCands.slice(0, 20);
    for (const c of shown) {
      const views = c.views ? c.views.toLocaleString('it-IT') : '—';
      md += `| \`${c.slug_en}\` | ${c.title_it} | ${c.estimated_year || '—'} | ${c.suggested_tipo} | ${views} |\n`;
    }
    if (catCands.length > 20) md += `\n*... e altri ${catCands.length - 20} candidati*\n`;
    md += '\n';
  }

  md += `---

## 7. Note metodologiche e limitazioni

- **Metodo ${metodName}**: ${metodName === 'C' ? 'fallback pageviews — differisce dalla curated list Vital Articles. I Vital Articles Level 4 sono inaccessibili via Category API (la categoria è vuota) e via subpage links (le sottopagine usano template speciali non riconosciuti da prop=links). Il corpus pageviews 2023 è un proxy ragionevole ma ha bias verso contenuti contemporanei.' : 'corpus curato.'}
- **Classificazione automatica**: categoria e tipo sono stimati euristicamente dal titolo; richiedono validazione manuale prima dell'inserimento.
- **Anno stimato**: estratto da regex \`\\b[0-9]{3,4}\\b\` nel titolo; spesso assente per persone/eventi.
- **Falsi negativi**: entità storiche rilevanti con titoli non contenenti parole-chiave riconoscibili potrebbero non essere classificate correttamente.
- **Falsi positivi**: nonostante i filtri, alcuni candidati potrebbero essere troppo contemporanei o irrilevanti per la mappa storica.
- **Wikidata mapping**: funzionante solo per slug EN non coincidenti con IT; ${Object.keys(enToItMap).length} slug mappati su ${enDirectMiss.length} candidati EN.

---

## 8. Suggerimenti per l'integrazione

Per aggiungere un candidato al dataset:
1. Verifica manualmente che l'entità sia appropriata per una mappa storica (ha coordinate o è localizzabile?)
2. Controlla il titolo italiano su it.wikipedia
3. Usa \`scripts/add-events-*.cjs\` come template per il formato JSON
4. Aggiorna la distribuzione categorie: obiettivo → sport ≥ 5%, cosmo ≥ 3%, filosofia ≥ 6%

---

*Report generato da \`scripts/vital-articles-analysis.cjs\` — Viaggiatore nel Tempo*
`;

  fs.writeFileSync(OUTPUT_MD, md, 'utf8');
  console.log(`\n✅ Report scritto: ${OUTPUT_MD}`);
  console.log(`   ${candidates.length} candidati mancanti totali`);
  console.log(`   Top 100: ${top100.length} | Top 20 priorità: ${top20.length}`);
  console.log('\n📊 Distribuzione candidati per categoria:');
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${n}`);
  }
}

main().catch(e => {
  console.error('\n❌ ERRORE:', e.message);
  process.exit(1);
});
