'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIG
// ============================================================
const EVENTS_PATH = path.join(__dirname, '..', 'src', 'data', 'events.json');
const OUTPUT_PATH = path.join(__dirname, 'wikipedia-gap-analysis.md');
const USER_AGENT = 'ViaggiatoreNelTempo-WikiGap/1.0 (nicola.damato@accenture.com)';
const MONTHS = ['01', '02', '03', '04'];
const MIN_VIEWS = 50000;

// ============================================================
// HELPER: HTTP GET con promise
// ============================================================
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    };
    https.get(url, opts, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ============================================================
// HELPER: normalizza slug per confronto
// ============================================================
function normalizeSlug(slug) {
  if (!slug) return '';
  return slug.replace(/_/g, ' ').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
}

// ============================================================
// BLACKLIST: slug da escludere totalmente
// ============================================================
const BLACKLIST_SLUGS_EXACT = new Set([
  // Navigazione/portali
  'Pagina_principale', 'Wikipedia', 'Portale:Italia', 'Special:Search',
  // Politici in carica (2024)
  'Giorgia_Meloni', 'Matteo_Salvini', 'Antonio_Tajani', 'Elly_Schlein', 'Giuseppe_Conte',
  'Roberto_Calderoli', 'Guido_Crosetto', 'Adolfo_Urso', 'Francesco_Lollobrigida',
  'Joe_Biden', 'Donald_Trump', 'Kamala_Harris', 'Vladimir_Putin', 'Xi_Jinping',
  'Volodymyr_Zelensky', 'Emmanuel_Macron', 'Olaf_Scholz', 'Rishi_Sunak',
  'Benjamin_Netanyahu', 'Sergio_Mattarella',
  // Cantanti pop contemporanei attivi
  'Taylor_Swift', 'Billie_Eilish', 'Ariana_Grande', 'Ed_Sheeran', 'Dua_Lipa',
  'The_Weeknd', 'Bad_Bunny', 'Drake', 'Post_Malone', 'Harry_Styles',
  'Olivia_Rodrigo', 'Sabrina_Carpenter', 'Beyoncé', 'Rihanna', 'Lady_Gaga',
  'Justin_Bieber', 'Miley_Cyrus', 'Selena_Gomez', 'Katy_Perry',
  'Ghali_(rapper)', 'Geolier', 'Annalisa_(cantante)', 'Irama', 'Diodato_(cantante)',
  'Dargen_D\'Amico', 'Santi_Francesi', 'Bnkr44', 'La_Sad', 'BigMama',
  'Alfa_(rapper)', 'Marco_Mengoni', 'Emma_Marrone', 'Alessandra_Amoroso',
  'Loredana_Bertè', 'Fiorella_Mannoia', 'Ricchi_e_Poveri', 'Gazzelle_(cantante)',
  'Pino_D\'Angiò',
  // Serie TV / film 2022-2024
  'Fallout_(serie_televisiva)', 'Fallout_(serie)', 'Baby_Reindeer',
  'Il_problema_dei_tre_corpi', 'Il_problema_dei_3_corpi',
  'Povere_creature!', 'La_zona_d\'interesse', 'Saltburn_(film)',
  'Fabbricante_di_lacrime_(film)', 'C\'è_ancora_domani', 'Mare_fuori',
  'Don_Matteo', 'The_Bear', 'Succession', 'House_of_the_Dragon',
  // Calcio contemporaneo
  'Cristiano_Ronaldo', 'Lionel_Messi', 'Kylian_Mbappé', 'Erling_Haaland',
  'Vinicius_Jr.', 'Jude_Bellingham', 'Jannik_Sinner', 'Carlos_Alcaraz',
  'Novak_Djokovic',
  // Personaggi di cronaca 2024
  'Chico_Forti', 'Jeffrey_Epstein', 'Aleksej_Naval\'nyj', 'Joe_Barone',
  'Francesca_Fagnani', 'Rocco_Siffredi', 'Ilenia_Pastorelli',
  'Clara_Soccini', 'Laura_Valente', 'Matilda_De_Angelis',
  'Michele_Morrone', 'Amadeus_(conduttore_televisivo)',
  'Francesco_Calzona', 'Julen_Lopetegui', 'Tiago_Djaló',
  // Allenatori/dirigenti sport 2024
  // Reality/talent show
  'Grande_Fratello', 'Isola_dei_famosi', 'X_Factor', 'Amici_(programma_televisivo)',
  // Competizioni sportive 2024
  'Supercoppa_italiana', 'Albo_d\'oro_del_Festival_di_Sanremo',
  // Tech e aziende
  'ChatGPT', 'OpenAI', 'Amazon', 'Facebook', 'Instagram', 'TikTok', 'Twitter',
  'Google', 'Apple_Inc.', 'Microsoft', 'Tesla_Inc.', 'Bitcoin', 'Ethereum',
  // COVID
  'Pandemia_di_COVID-19', 'SARS-CoV-2',
  // Guerra attuale
  'Invasione_russa_dell\'Ucraina',
  // Ricorrenze/giornate (non entità storiche)
  'Giornata_internazionale_della_donna', 'Festa_del_papà', 'Festa_della_mamma',
  'Giornata_della_memoria', 'Giornata_mondiale',
  // Altre pagine funzionali
  'RAI', 'Rai', 'Mediaset',
  // Personaggi contemporanei con meno rilevanza storica
  'Giovanni_Allevi', 'Mango_(cantante)',
  'Sandra_Milo', 'Franco_Califano', 'Gigliola_Cinquetti',
]);

// Pattern che identificano pagine da escludere
const BLACKLIST_PATTERNS = [
  // Pagine speciali Wikipedia
  /^speciale:/i, /^special:/i, /^wikipedia:/i, /^portale:/i,
  /^categoria:/i, /^file:/i, /^modello:/i, /^help:/i, /^discussione:/i,
  // Stagioni sportive
  /stagione\s+\d{4}/i, /\d{4}-\d{2,4}\s+(serie|league|premier|bundesliga|ligue)/i,
  // Film/serie con anni recenti nel titolo
  /\(film\s+202[0-9]\)/i, /\(serie\s+202[0-9]\)/i,
  // Edizioni di eventi (Sanremo 2024, Euro 2024, ecc.)
  /festival\s+di\s+sanremo\s+202/i, /euro\s+202/i, /olimpiadi\s+202/i,
  /coppa\s+del\s+mondo\s+202/i, /champions\s+league\s+202/i,
  // Competizioni 2024
  /australian\s+open\s+202/i, /roland\s+garros\s+202/i, /wimbledon\s+202/i,
  // Annate
  /^\d{4}$/,
  // Wikipedia talk/meta
  /^(user|talk|template|help|file|category|portal):/i,
];

// Parole chiave nei titoli che indicano attualità da escludere
const CONTEMPORARY_TITLE_PATTERNS = [
  // Reality e talent show
  /grande\s+fratello/i, /x\s+factor/i, /isola\s+dei\s+famosi/i,
  // Giornate commemorative generiche (non specifiche eventi storici)
  /giornata\s+(internazionale|mondiale|europea)/i,
  // Classifiche, albi, statistiche
  /albo\s+d.oro/i, /classifica\s+/i,
  // Rete TV
  /\b(rai\s*[12345]|rete\s*4|canale\s*5|italia\s*1)\b/i,
];

// ============================================================
// LISTA DI ENTITÀ STORICAMENTE RILEVANTI DA PROMUOVERE
// (anche se il classificatore automatico potrebbe non riconoscerle)
// ============================================================
const KNOWN_HISTORICAL = {
  'Gigi_Riva': { category: 'sport', tipo: 'persona', year: 1944, note: 'Leggenda del calcio italiano, miglior marcatore azzurro di sempre, morto 2024' },
  'Goffredo_Mameli': { category: 'storia', tipo: 'persona', year: 1827, note: 'Poeta e patriota del Risorgimento, autore dell\'inno nazionale italiano' },
  'Franz_Beckenbauer': { category: 'sport', tipo: 'persona', year: 1945, note: 'Il Kaiser, leggenda del calcio tedesco, campione del mondo 1974, morto 2024' },
  'Dino_Grandi': { category: 'storia', tipo: 'persona', year: 1895, note: 'Politico italiano, ruolo chiave nella caduta di Mussolini 1943' },
  'Strage_di_Acca_Larenzia': { category: 'storia', tipo: 'evento', year: 1978, note: 'Episodio cruciale della violenza politica italiana' },
  'Disastro_aereo_delle_Ande': { category: 'storia', tipo: 'evento', year: 1972, note: 'Uno dei più famosi incidenti aerei della storia, sopravvissenza estrema' },
  'Anniversario_della_liberazione_d\'Italia': { category: 'storia', tipo: 'evento', year: 1945, note: '25 aprile, festa della Liberazione italiana' },
  'La_Storia_(romanzo)': { category: 'arte', tipo: 'opera', year: 1974, note: 'Romanzo di Elsa Morante, capolavoro della letteratura italiana del XX secolo' },
  'Massacri_delle_foibe': { category: 'storia', tipo: 'evento', year: 1945, note: 'Eccidio di italiani da parte dei partigiani jugoslavi, episodio fondamentale storia italiana' },
  'Griselda_Blanco': { category: 'storia', tipo: 'persona', year: 1943, note: 'La "Madrina della cocaina", figura storica del narcotraffico, morta 2012' },
  'Akira_Toriyama': { category: 'arte', tipo: 'persona', year: 1955, note: 'Mangaka, creatore di Dragon Ball, figura iconica della cultura pop mondiale, morto 2024' },
  'Alda_Merini': { category: 'arte', tipo: 'persona', year: 1931, note: 'Poetessa italiana, una delle voci più importanti della poesia italiana del Novecento' },
  'Vittorio_Emanuele_di_Savoia_(1937)': { category: 'storia', tipo: 'persona', year: 1937, note: 'Figlio dell\'ultimo re d\'Italia, personaggio controverso della storia repubblicana' },
  'Carla_Bruni': { category: 'arte', tipo: 'persona', year: 1967, note: 'Cantautrice e modella italiana, ex prima donna di Francia, figura culturale rilevante' },
  'Andreas_Brehme': { category: 'sport', tipo: 'persona', year: 1960, note: 'Segnò il gol decisivo nella finale Mondiali 1990 Italia-Germania, morto 2024' },
  'Roberto_Cavalli': { category: 'arte', tipo: 'persona', year: 1940, note: 'Stilista italiano di fama mondiale, morto 2024' },
  'John_Travolta': { category: 'arte', tipo: 'persona', year: 1954, note: 'Attore iconico, protagonista di Saturday Night Fever e Grease' },
  'Associazione_Calcio_Milan': { category: 'sport', tipo: 'organizzazione', year: 1899, note: 'Uno dei club calcistici più titolati al mondo, simbolo del calcio italiano' },
  'Associazione_Sportiva_Roma': { category: 'sport', tipo: 'organizzazione', year: 1927, note: 'Club calcistico storico della capitale italiana' },
  'Juventus_Football_Club': { category: 'sport', tipo: 'organizzazione', year: 1897, note: 'Club calcistico più titolato d\'Italia' },
  'Football_Club_Internazionale_Milano': { category: 'sport', tipo: 'organizzazione', year: 1908, note: 'Club calcistico di Milano, tra i più vittoriosi in Europa' },
  'Società_Sportiva_Calcio_Napoli': { category: 'sport', tipo: 'organizzazione', year: 1926, note: 'Squadra di calcio con tre scudetti, molto popolare in Italia' },
  'Grande_Slam_(tennis)': { category: 'sport', tipo: 'evento', year: 1924, note: 'I quattro tornei più importanti del tennis mondiale' },
  'Riccardo_Cocciante': { category: 'musica', tipo: 'persona', year: 1946, note: 'Cantautore italiano, autore di Notre Dame de Paris, figura storica della musica italiana' },
  'Pino_Daniele': { category: 'musica', tipo: 'persona', year: 1955, note: 'Musicista napoletano, uno dei più grandi cantautori italiani, morto 2015' },
};

// ============================================================
// CLASSIFICATORE migliorato
// ============================================================
function classifyEntry(slug, titleLower) {
  // Prima verifica se è in KNOWN_HISTORICAL
  if (KNOWN_HISTORICAL[slug]) {
    const kh = KNOWN_HISTORICAL[slug];
    return {
      tipo: kh.tipo,
      category: kh.category,
      isHistorical: true,
      note: kh.note,
      year: kh.year,
    };
  }

  const t = titleLower;

  // Tipo
  let tipo = 'persona';
  if (/\b(battaglia|guerra|rivoluzione|conflitto|assedio|bombardamento|liberazione|genocidio|olocausto|conquista|invasione|strage|eccidio|attentato|attacco|bombardamento|sommossa)\b/.test(t)) tipo = 'evento';
  else if (/\b(massacro|disastro|naufragio|affondamento|terremoto|eruzione|inondazione|catastrofe)\b/.test(t)) tipo = 'evento';
  else if (/\b(anniversario|celebrazione|ricorrenza|giornata|festa della)\b/.test(t) && !/\b(cantante|musicista|artista)\b/.test(t)) tipo = 'evento';
  else if (/\b(movimento|rinascimento|illuminismo|romanticismo|realismo|impressionismo|cubismo|fascismo|nazismo|comunismo|socialismo|liberalismo|romanticismo|umanesimo)\b/.test(t)) tipo = 'movimento';
  else if (/\b(romanzo|poema|affresco|dipinto|scultura|libro|trattato|costituzione|manifesto|codice|opera|sinfonia|concerto|balletto)\b/.test(t)) tipo = 'opera';
  else if (/\b(scoperta|invenzione|teoria|legge di|principio|calcolo|geometria|fisica|chimica|biologia|astronomia|relatività|quantistica|evoluzione|dna)\b/.test(t)) tipo = 'scoperta';
  else if (/\b(palazzo|cattedrale|basilica|tempio|piramide|anfiteatro|foro|castello|mura|monumento|colosseo|pantheon|colonna|torre|ponte|acquedotto|statua)\b/.test(t)) tipo = 'luogo';
  else if (/\b(football club|associazione calcio|società sportiva|associazione sportiva|atletico|real madrid|fc|ac\s+milan|inter\s+milan|juventus|chelsea|arsenal|liverpool|manchester)\b/.test(t)) tipo = 'organizzazione';
  else if (/\b(grande slam|world cup|olimpiadi|campionato mondiale|campionato europeo|super bowl|tour de france)\b/.test(t)) tipo = 'evento';

  // Categoria
  let category = 'storia';
  if (/\b(pittore|scultore|architetto|regista|attore|attrice|designer|stilista|fotografo|sceneggiatore|cineasta)\b/.test(t) ||
      /\b(affresco|dipinto|quadro|scultura|fotografia|cinema|film|manga|fumetto)\b/.test(t) ||
      /\b(leonardo|michelangelo|raffaello|donatello|tiziano|caravaggio|rembrandt|picasso|monet|matisse|goya|velázquez|botticelli|rubens|vermeer|klimt|dali|warhol)\b/.test(t)) {
    category = 'arte';
  } else if (/\b(compositore|musicista|cantante|cantautore|musicologo|direttore d.orchestra|pianista|violinista)\b/.test(t) ||
      /\b(sinfonia|opera lirica|jazz|rock|pop|musica classica|canzone|album|ballata)\b/.test(t) ||
      /\b(beethoven|mozart|bach|verdi|puccini|chopin|schubert|brahms|wagner|tchaikovsky|debussy|handel|vivaldi|monteverdi)\b/.test(t)) {
    category = 'musica';
  } else if (/\b(scienziato|fisico|chimico|biologo|matematico|naturalista|medico|astronomo|geologo|inventore)\b/.test(t) ||
      /\b(teoria della|scoperta di|invenzione|brevetto|esperimento|laboratorio)\b/.test(t) ||
      /\b(galileo|newton|einstein|darwin|copernico|pasteur|curie|fleming|turing|tesla|edison|mendel|lavoisier|faraday|maxwell|planck|bohr)\b/.test(t)) {
    category = 'scienza';
  } else if (/\b(filosofo|filosofia|metafisica|epistemologia|etica|logica|stoicismo|epicureismo|esistenzialismo)\b/.test(t) ||
      /\b(platone|aristotele|socrate|cartesio|kant|hegel|nietzsche|locke|hume|rousseau|voltaire|marx|spinoza|leibniz|schopenhauer|kierkegaard|heidegger)\b/.test(t)) {
    category = 'filosofia';
  } else if (/\b(atleta|calciatore|tennista|nuotatore|pugile|ciclista|sprinter|allenatore|arbitro|olimpionico)\b/.test(t) ||
      /\b(calcio|tennis|nuoto|atletica|boxing|ciclismo|formula 1|maratona|basket|baseball|rugby|football americano|pallavolo)\b/.test(t) ||
      /\b(football club|associazione calcio|società sportiva|grande slam|wimbledon|roland garros)\b/.test(t)) {
    category = 'sport';
  } else if (/\b(pianeta|stella|galassia|cosmo|universo|astronomia|buco nero|cometa|nebulosa|supernova|telescopio|orbita|sistema solare|asteroide)\b/.test(t)) {
    category = 'cosmo';
  } else if (/\b(terramoto|vulcano|eruzione|geologia|fossile|glaciazione|estinzione|meteorite|asteroide|roccia|minerale|ghiacciaio|era glaciale)\b/.test(t)) {
    category = 'geologia';
  }

  return { tipo, category, isHistorical: false, note: null, year: null };
}

// ============================================================
// Stima anno da slug/titolo
// ============================================================
function estimateYear(slug, titleLower, known) {
  if (known) return known;

  // Anno esplicito nello slug
  const m4 = slug.match(/\((\d{4})\)/);
  if (m4) {
    const y = parseInt(m4[1]);
    if (y > 1000 && y < 2000) return y;
  }

  const t = titleLower;
  if (/platone|aristotele|socrate|pericle|tucidide|demostene/.test(t)) return -380;
  if (/cesare|augusto|cicerone|virgilio|orazio|nerone|trajano|marco\s+aurelio/.test(t)) return 50;
  if (/medievale|crociata|carlo\s+magno|dante|giotto|tommaso\s+d.aquino/.test(t)) return 1200;
  if (/rinascimento|leonardo|michelangelo|raffaello|colombo|erasmo/.test(t)) return 1490;
  if (/caravaggio|galileo|newton|bacone|locke|spinoza|leibniz/.test(t)) return 1650;
  if (/voltaire|rousseau|kant|mozart|bach|haydn|illuminismo/.test(t)) return 1750;
  if (/beethoven|napoleon|garibaldi|darwin|marx|tolstoj|dickens|hugo/.test(t)) return 1850;
  if (/prima\s+guerra|einstein|picasso|jazz|1900|novecento/.test(t)) return 1910;
  if (/seconda\s+guerra|shoah|olocausto|resistenza/.test(t)) return 1942;
  if (/anni\s*50|anni\s*60|anni\s*70|anni\s*80/.test(t)) return 1965;
  return null;
}

// ============================================================
// FILTRO STORICO: determina se un articolo è storicamente rilevante
// ============================================================
function isHistoricallyRelevant(slug, titleLower) {
  // Se in KNOWN_HISTORICAL, è rilevante
  if (KNOWN_HISTORICAL[slug]) return true;

  const t = titleLower;

  // Pattern chiari di NON-storico (attualità)
  const nonHistoricalPatterns = [
    // Artisti/cantanti pop contemporanei
    /\b(rapper|trap|hip.hop|influencer|youtuber|tiktoker)\b/i,
    // Programmi TV attivi
    /\b(grande fratello|x factor|talent|reality|conduttore televisivo|presentatore)\b/i,
    // Giornate internazionali generiche
    /giornata (internazionale|mondiale|europea) (della|del|dello|dei|delle)/i,
    // Albi d'oro / classifiche
    /^(albo d.oro|classifica|lista dei)/i,
    // Stagioni sportive con anno
    /stagione \d{4}/i,
    // Film con anno recente
    /\(film (202[0-9]|201[5-9])\)/i,
    // Serie TV con anno
    /\(serie (televisiva )?(202[0-9]|201[5-9])\)/i,
    // Olimpiadi future/recenti
    /olimpiadi (estive|invernali) 202/i,
    // Campionati recenti
    /(campionato|coppa|lega) \d{4}/i,
  ];

  if (nonHistoricalPatterns.some(p => p.test(t))) return false;

  // Pattern chiari di STORICO
  const historicalPatterns = [
    // Figure storiche per professione
    /\b(storico|filosofo|re|imperatore|faraone|papa|doge|condottiero|esploratore|conquistador|rivoluzionario|patriota)\b/i,
    // Periodi storici
    /\b(medioevo|rinascimento|barocco|illuminismo|romanticismo|risorgimento|antiquità|preistoria)\b/i,
    // Tipi di evento storico
    /\b(battaglia|guerra|rivoluzione|trattato|manifesto|scoperta|invenzione|fondazione|conquista|colonia)\b/i,
    /\b(strage|massacro|genocidio|olocausto|eccidio|shoah|pogrom)\b/i,
    // Costruzioni storiche
    /\b(cattedrale|basilica|tempio|piramide|anfiteatro|castello|fortezza|palazzo)\b/i,
    // Organizzazioni storiche
    /\b(football club|associazione calcio|società sportiva)\b/i,
    // Eventi sportivi storici
    /\b(grande slam|olimpiadi classiche|tour de france|giro d.italia)\b/i,
    // Disastri storici famosi
    /\b(disastro|naufragio|affondamento|incidente aereo)\b/i,
  ];

  if (historicalPatterns.some(p => p.test(t))) return true;

  // Se è una persona, richiede più contesto
  // Per default, considera storiche le persone con queste professioni nel titolo
  const historicalProfessions = /\b(scienziato|fisico|chimico|biologo|matematico|astronomo|inventore|naturalista|medico|pittore|scultore|architetto|compositore|scrittore|poeta|filosofo|storico|musicologo|calciatore|tennista|pugile|ciclista|sprinter|olimpionico)\b/i;
  if (historicalProfessions.test(t)) return true;

  // Non classificato esplicitamente → considera non rilevante storicamente
  // (meglio escludere che includere attualità)
  return false;
}

// ============================================================
// PRIORITÀ
// ============================================================
function getPriority(views) {
  if (views >= 200000) return 'HIGH';
  if (views >= 100000) return 'MEDIUM';
  return 'LOW';
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('📂 Lettura events.json...');
  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));

  const catDist = {};
  const tipoDist = {};
  const existingSlugs = new Set();

  for (const ev of events) {
    if (ev.wikipediaSlug) {
      existingSlugs.add(normalizeSlug(ev.wikipediaSlug));
      const noParens = ev.wikipediaSlug.replace(/_/g, ' ').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
      existingSlugs.add(noParens);
      // Anche bare slug lowercase
      existingSlugs.add(ev.wikipediaSlug.toLowerCase());
    }
    catDist[ev.category] = (catDist[ev.category] || 0) + 1;
    tipoDist[ev.tipo] = (tipoDist[ev.tipo] || 0) + 1;
  }

  console.log(`✅ Trovate ${events.length} entità esistenti, ${existingSlugs.size} slug unici (incluse varianti)`);

  // ============================================================
  // FETCH WIKIPEDIA PAGEVIEWS
  // ============================================================
  const viewsMap = {};

  for (const month of MONTHS) {
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/it.wikipedia/all-access/2024/${month}/all-days`;
    console.log(`🌐 Scaricamento Wikipedia top views 2024/${month}...`);

    let data;
    try {
      data = await httpGet(url);
    } catch (err) {
      console.error(`  ⚠️  Errore per il mese ${month}:`, err.message);
      continue;
    }

    const articles = data?.items?.[0]?.articles || [];
    console.log(`  📰 ${articles.length} articoli ricevuti per ${month}`);

    for (const art of articles) {
      const slug = art.article;
      const views = art.views || 0;
      if (!viewsMap[slug]) viewsMap[slug] = { total: 0, months: 0 };
      viewsMap[slug].total += views;
      viewsMap[slug].months += 1;
    }
  }

  console.log(`📈 Totale slug unici da Wikipedia: ${Object.keys(viewsMap).length}`);

  // ============================================================
  // FILTRA E CLASSIFICA CANDIDATI
  // ============================================================
  const candidates = [];
  let excludedBlacklist = 0;
  let excludedAlreadyPresent = 0;
  let excludedNotHistorical = 0;
  let excludedLowViews = 0;

  for (const [slug, info] of Object.entries(viewsMap)) {
    const avgViews = Math.round(info.total / info.months);

    if (avgViews < MIN_VIEWS) { excludedLowViews++; continue; }

    const normalized = normalizeSlug(slug);
    const withoutParens = slug.replace(/_/g, ' ').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
    const slugLower = slug.toLowerCase();

    // Già presente?
    if (existingSlugs.has(normalized) || existingSlugs.has(withoutParens) || existingSlugs.has(slugLower)) {
      excludedAlreadyPresent++;
      continue;
    }

    // Blacklist slug esatti
    if (BLACKLIST_SLUGS_EXACT.has(slug)) { excludedBlacklist++; continue; }

    // Blacklist pattern
    const titleLower = slug.replace(/_/g, ' ').toLowerCase();
    if (BLACKLIST_PATTERNS.some(p => p.test(titleLower))) { excludedBlacklist++; continue; }
    if (CONTEMPORARY_TITLE_PATTERNS.some(p => p.test(titleLower))) { excludedBlacklist++; continue; }

    // Filtra pagine speciali (Namespace: prefix)
    if (/^[A-Za-z][a-zA-Z]+:/.test(slug)) { excludedBlacklist++; continue; }

    // Filtro storico
    if (!isHistoricallyRelevant(slug, titleLower)) { excludedNotHistorical++; continue; }

    // Classifica
    const cls = classifyEntry(slug, titleLower);
    const estimatedYear = estimateYear(slug, titleLower, cls.year);
    const priority = getPriority(avgViews);

    // Bilanciamento
    const isUnderrepresented = ['sport', 'cosmo', 'filosofia'].includes(cls.category) ||
                               ['luogo', 'organizzazione'].includes(cls.tipo);

    let justification = '';
    if (cls.note) justification = cls.note + '. ';
    else if (cls.category === 'sport') justification = 'Categoria sport sottorappresentata (2.6%). ';
    else if (cls.category === 'cosmo') justification = 'Categoria cosmo sottorappresentata (1.8%). ';
    else if (cls.category === 'filosofia') justification = 'Categoria filosofia sottorappresentata (4.4%). ';
    else if (cls.tipo === 'luogo') justification = 'Tipo luogo sottorappresentato (1.8%). ';
    else if (cls.tipo === 'organizzazione') justification = 'Tipo organizzazione sottorappresentato (0.9%). ';
    justification += `${avgViews.toLocaleString('it-IT')} viste/mese su Wikipedia italiana 2024.`;

    candidates.push({
      slug,
      title_it: slug.replace(/_/g, ' '),
      estimated_year: estimatedYear,
      suggested_category: cls.category,
      suggested_tipo: cls.tipo,
      monthly_views: avgViews,
      priority,
      justification,
      helps_balance: isUnderrepresented,
      is_known_historical: cls.isHistorical,
    });
  }

  candidates.sort((a, b) => b.monthly_views - a.monthly_views);

  console.log(`\n📊 Statistiche filtraggio:`);
  console.log(`   Già presenti nel dataset: ${excludedAlreadyPresent}`);
  console.log(`   In blacklist: ${excludedBlacklist}`);
  console.log(`   Non storicamente rilevanti: ${excludedNotHistorical}`);
  console.log(`   Sotto soglia viste: ${excludedLowViews}`);
  console.log(`\n🎯 Candidati finali: ${candidates.length}`);
  console.log(`   HIGH (>200k): ${candidates.filter(c => c.priority === 'HIGH').length}`);
  console.log(`   MEDIUM (100-200k): ${candidates.filter(c => c.priority === 'MEDIUM').length}`);
  console.log(`   LOW (50-100k): ${candidates.filter(c => c.priority === 'LOW').length}`);
  console.log(`   Colmano lacune: ${candidates.filter(c => c.helps_balance).length}`);

  // ============================================================
  // GENERA REPORT MARKDOWN
  // ============================================================
  const highCandidates = candidates.filter(c => c.priority === 'HIGH');
  const mediumCandidates = candidates.filter(c => c.priority === 'MEDIUM');

  // Analisi per disciplina (HIGH candidati)
  const catAnalysis = {};
  for (const c of highCandidates) {
    if (!catAnalysis[c.suggested_category]) catAnalysis[c.suggested_category] = [];
    catAnalysis[c.suggested_category].push(c);
  }
  // Aggiungi anche MEDIUM per le categorie vuote
  for (const c of mediumCandidates) {
    if (!catAnalysis[c.suggested_category]) catAnalysis[c.suggested_category] = [];
    // Non aggiungerli alla lista HIGH ma tieni traccia per il conteggio
  }

  // Top 20 raccomandazioni bilanciate
  // 1. Prima i candidati che colmano lacune (HIGH+MEDIUM)
  // 2. Poi i restanti HIGH per popolarità
  const balanceFirst = candidates.filter(c => c.helps_balance).slice(0, 10);
  const balanceSlugs = new Set(balanceFirst.map(c => c.slug));
  const popularRest = highCandidates.filter(c => !balanceSlugs.has(c.slug)).slice(0, 10);
  const top20 = [...balanceFirst, ...popularRest].slice(0, 20);

  function tableRow(c) {
    const year = c.estimated_year != null
      ? (c.estimated_year < 0 ? `${Math.abs(c.estimated_year)} a.C.` : c.estimated_year)
      : '—';
    const bal = c.helps_balance ? '✓ Lacuna' : '';
    const views = c.monthly_views.toLocaleString('it-IT');
    return `| ${c.slug} | ${c.title_it} | ${year} | ${c.suggested_category} | ${c.suggested_tipo} | ${views} | ${bal} |`;
  }

  const catDistribuzione = {
    storia: { pct: 47.8, count: 1421 },
    arte: { pct: 15.3, count: 454 },
    scienza: { pct: 13.4, count: 399 },
    musica: { pct: 9.9, count: 294 },
    geologia: { pct: 5.0, count: 148 },
    filosofia: { pct: 4.4, count: 131 },
    sport: { pct: 2.6, count: 76 },
    cosmo: { pct: 1.8, count: 53 },
  };

  const allCategories = ['storia', 'arte', 'scienza', 'musica', 'geologia', 'filosofia', 'sport', 'cosmo'];

  const md = `# Analisi delle Lacune — Viaggiatore nel Tempo vs Wikipedia

> Generato il ${new Date().toISOString().slice(0, 10)} | Fonte: Wikimedia Pageviews API 2024 (gen–apr)

---

## 1. Metodologia

1. **Dataset attuale**: \`src/data/events.json\` — ${events.length} entità, circa ${Math.round(existingSlugs.size / 2)} slug Wikipedia unici.
2. **Fonte Wikipedia**: API Wikimedia Pageviews — top 1000 articoli per mese su Wikipedia italiana, mesi gennaio–aprile 2024 (${Object.keys(viewsMap).length} slug unici totali analizzati).
3. **Aggregazione**: media delle viste mensili su tutti i mesi disponibili.
4. **Filtri applicati**:
   - Escluse pagine di navigazione/portali Wikipedia
   - Esclusi politici in carica 2024 (Meloni, Biden, Putin, ecc.)
   - Esclusi cantanti pop contemporanei attivi (Ghali, Geolier, Annalisa, ecc.)
   - Escluse serie TV e film recenti (Fallout, Baby Reindeer, ecc.)
   - Esclusi eventi sportivi 2024 (Euro 2024, Australian Open 2024, ecc.)
   - Esclusi personaggi di cronaca 2024 (Chico Forti, Jeffrey Epstein, ecc.)
   - Escluse giornate commemorative generiche
   - Incluse solo entità storicamente rilevanti: persone morte prima del ~2010, eventi storici, luoghi, movimenti, organizzazioni storiche
5. **Soglia di rilevanza**: ≥ 50.000 viste/mese medie.
6. **Entità conosciute**: lista manuale di 25+ entità storiche prioritarie con classificazione corretta.

---

## 2. Distribuzione attuale del dataset

| Categoria | Conteggio | % | Stato |
|-----------|-----------|---|-------|
| storia | 1.421 | 47.8% | Sovrarappresentata |
| arte | 454 | 15.3% | OK |
| scienza | 399 | 13.4% | OK |
| musica | 294 | 9.9% | OK |
| geologia | 148 | 5.0% | OK |
| filosofia | 131 | 4.4% | ⚠️ Sottorappresentata |
| sport | 76 | 2.6% | ⚠️ Lacuna critica |
| cosmo | 53 | 1.8% | ⚠️ Lacuna critica |

| Tipo | Conteggio | % | Stato |
|------|-----------|---|-------|
| persona | 1.206 | 40.5% | Dominante |
| evento | 567 | 19.1% | OK |
| opera | 542 | 18.2% | OK |
| scoperta | 416 | 14.0% | OK |
| movimento | 164 | 5.5% | OK |
| luogo | 54 | 1.8% | ⚠️ Sottorappresentato |
| organizzazione | 27 | 0.9% | ⚠️ Lacuna critica |

---

## 3. Top candidati HIGH priority (>200.000 viste/mese)

| Slug | Titolo IT | Anno | Categoria | Tipo | Views/mese | Bilanciamento |
|------|-----------|------|-----------|------|------------|---------------|
${highCandidates.slice(0, 50).map(tableRow).join('\n')}

*(${highCandidates.length} candidati HIGH totali${highCandidates.length > 50 ? '; mostrati i primi 50' : ''})*

---

## 4. Top 30 candidati MEDIUM priority (100.000–200.000 viste/mese)

| Slug | Titolo IT | Anno | Categoria | Tipo | Views/mese | Bilanciamento |
|------|-----------|------|-----------|------|------------|---------------|
${mediumCandidates.slice(0, 30).map(tableRow).join('\n')}

*(${mediumCandidates.length} candidati MEDIUM totali${mediumCandidates.length > 30 ? '; mostrati i primi 30' : ''})*

---

## 5. Analisi per disciplina

${allCategories.map(cat => {
  const dist = catDistribuzione[cat] || { pct: 0, count: 0 };
  const highItems = catAnalysis[cat] || [];
  const mediumItems = mediumCandidates.filter(c => c.suggested_category === cat);
  const lacunaFlag = dist.pct < 5 ? ' ⚠️ LACUNA CRITICA' : (dist.pct < 10 ? ' ⚠️ SOTTORAPPRESENTATA' : '');
  const impact = dist.pct < 5 ? '**ALTO** — ogni aggiunta riduce significativamente la sottorappresentazione'
    : dist.pct < 10 ? '**Moderato** — categoria presente ma non dominante'
    : 'Neutro — categoria già ben rappresentata; aggiungere solo entità molto rilevanti';

  return `### ${cat.charAt(0).toUpperCase() + cat.slice(1)}${lacunaFlag}
- Peso attuale nel dataset: **${dist.pct}%** (${dist.count} entità)
- Candidati HIGH trovati: **${highItems.length}**
- Candidati MEDIUM trovati: **${mediumItems.length}**
${highItems.length > 0 ? `- Top candidati HIGH: ${highItems.slice(0, 3).map(i => `*${i.title_it}* (${i.monthly_views.toLocaleString('it-IT')} viste/mese)`).join(', ')}` : '- Nessun candidato HIGH identificato'}
- Impatto aggiunta nuove entità: ${impact}
`;
}).join('\n')}

---

## 6. Raccomandazione finale — Top 20 entità assolutamente da aggiungere

**Criterio**: priorità a:
1. Entità che colmano lacune di categorie/tipi sottorappresentati (sport, cosmo, filosofia; luogo, organizzazione)
2. Massima popolarità su Wikipedia italiana (= massimo interesse degli utenti)
3. Inequivocabile rilevanza storica

| # | Slug | Titolo | Anno | Cat | Tipo | Views/mese | Motivazione |
|---|------|--------|------|-----|------|------------|-------------|
${top20.map((c, i) => {
  const year = c.estimated_year != null
    ? (c.estimated_year < 0 ? `${Math.abs(c.estimated_year)} a.C.` : c.estimated_year) : '—';
  return `| ${i + 1} | \`${c.slug}\` | ${c.title_it} | ${year} | **${c.suggested_category}** | ${c.suggested_tipo} | ${c.monthly_views.toLocaleString('it-IT')} | ${c.justification} |`;
}).join('\n')}

---

## 7. Statistiche dell'analisi

| Metrica | Valore |
|---------|--------|
| Articoli Wikipedia analizzati (4 mesi) | ${Object.keys(viewsMap).length.toLocaleString('it-IT')} slug unici |
| Slug già presenti nel dataset | ~${Math.round(existingSlugs.size / 2).toLocaleString('it-IT')} |
| Esclusi (blacklist + attualità) | ${excludedBlacklist} |
| Esclusi (già presenti) | ${excludedAlreadyPresent} |
| Esclusi (non storicamente rilevanti) | ${excludedNotHistorical} |
| Esclusi (sotto soglia 50k viste) | ${excludedLowViews} |
| **Candidati totali sopra soglia** | **${candidates.length}** |
| HIGH priority (>200k viste/mese) | ${highCandidates.length} |
| MEDIUM priority (100–200k) | ${mediumCandidates.length} |
| LOW priority (50–100k) | ${candidates.filter(c => c.priority === 'LOW').length} |
| Candidati che colmano lacune | ${candidates.filter(c => c.helps_balance).length} |

---

## 8. Note metodologiche e limitazioni

- **Falsi negativi**: alcuni articoli storicamente rilevanti potrebbero essere stati esclusi se il loro slug/titolo non contiene parole-chiave riconoscibili come "storiche". Consigliato un review manuale del report.
- **Falsi positivi**: nonostante la blacklist estesa, potrebbero esserci candidati ancora troppo contemporanei. Verificare prima dell'inserimento.
- **Stagionalità**: i mesi gen–apr 2024 hanno bias verso eventi del primo trimestre (eventi invernali, Sanremo, ecc.).
- **Classificazione automatica**: categoria e tipo suggeriti sono approssimazioni; la classificazione finale va validata manualmente.
- **KNOWN_HISTORICAL**: 25+ entità hanno classificazione manuale verificata (marcate con ✓ Lacuna dove applicabile).

---

*Report generato da \`scripts/wikipedia-gap.cjs\` — Viaggiatore nel Tempo*
`;

  fs.writeFileSync(OUTPUT_PATH, md, 'utf8');
  console.log(`\n✅ Report scritto in: ${OUTPUT_PATH}`);
  console.log(`\n📋 Top 10 candidati per viste:`);
  candidates.slice(0, 10).forEach((c, i) => {
    const badge = c.helps_balance ? '[LACUNA]' : '';
    console.log(`   ${i+1}. ${c.title_it} — ${c.monthly_views.toLocaleString()} viste/mese [${c.suggested_category}/${c.suggested_tipo}] ${badge}`);
  });
}

main().catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
