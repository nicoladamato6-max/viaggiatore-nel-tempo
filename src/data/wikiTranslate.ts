// Traduzione dei nomi territorio per il globo.
// Strategia: lookup statico prima (istantaneo), Wikipedia langlinks come fallback.

// ── Lookup statico EN → IT ────────────────────────────────────────────────────
// Copre stati moderni, empire storici e territori ricorrenti nelle mappe GeoJSON.
// Case-insensitive (normalizzato in lowercase nella funzione translate).
const STATIC_IT: Record<string, string> = {
  // ── Paesi moderni ──────────────────────────────────────────────────────────
  'italy': 'Italia', 'france': 'Francia', 'germany': 'Germania',
  'spain': 'Spagna', 'portugal': 'Portogallo', 'united kingdom': 'Regno Unito',
  'great britain': 'Gran Bretagna', 'england': 'Inghilterra', 'scotland': 'Scozia',
  'wales': 'Galles', 'ireland': 'Irlanda', 'netherlands': 'Paesi Bassi',
  'holland': 'Olanda', 'belgium': 'Belgio', 'luxembourg': 'Lussemburgo',
  'switzerland': 'Svizzera', 'austria': 'Austria', 'hungary': 'Ungheria',
  'poland': 'Polonia', 'czechia': 'Cechia', 'czech republic': 'Repubblica Ceca',
  'slovakia': 'Slovacchia', 'denmark': 'Danimarca', 'sweden': 'Svezia',
  'norway': 'Norvegia', 'finland': 'Finlandia', 'iceland': 'Islanda',
  'estonia': 'Estonia', 'latvia': 'Lettonia', 'lithuania': 'Lituania',
  'belarus': 'Bielorussia', 'ukraine': 'Ucraina', 'russia': 'Russia',
  'moldova': 'Moldova', 'romania': 'Romania', 'bulgaria': 'Bulgaria',
  'serbia': 'Serbia', 'croatia': 'Croazia', 'slovenia': 'Slovenia',
  'bosnia and herzegovina': 'Bosnia ed Erzegovina', 'kosovo': 'Kosovo',
  'montenegro': 'Montenegro', 'albania': 'Albania', 'north macedonia': 'Macedonia del Nord',
  'macedonia': 'Macedonia', 'greece': 'Grecia', 'cyprus': 'Cipro', 'malta': 'Malta',
  'turkey': 'Turchia', 'georgia': 'Georgia', 'armenia': 'Armenia',
  'azerbaijan': 'Azerbaigian', 'kazakhstan': 'Kazakistan', 'uzbekistan': 'Uzbekistan',
  'kyrgyzstan': 'Kirghizistan', 'tajikistan': 'Tagikistan', 'turkmenistan': 'Turkmenistan',
  'afghanistan': 'Afghanistan', 'iran': 'Iran', 'iraq': 'Iraq', 'syria': 'Siria',
  'lebanon': 'Libano', 'jordan': 'Giordania', 'israel': 'Israele',
  'palestine': 'Palestina', 'saudi arabia': 'Arabia Saudita', 'yemen': 'Yemen',
  'oman': 'Oman', 'united arab emirates': 'Emirati Arabi Uniti', 'qatar': 'Qatar',
  'bahrain': 'Bahrein', 'kuwait': 'Kuwait', 'egypt': 'Egitto', 'libya': 'Libia',
  'tunisia': 'Tunisia', 'algeria': 'Algeria', 'morocco': 'Marocco',
  'western sahara': 'Sahara Occidentale', 'mauritania': 'Mauritania',
  'mali': 'Mali', 'niger': 'Niger', 'chad': 'Ciad', 'sudan': 'Sudan',
  'south sudan': 'Sudan del Sud', 'ethiopia': 'Etiopia', 'eritrea': 'Eritrea',
  'djibouti': 'Gibuti', 'somalia': 'Somalia', 'kenya': 'Kenya',
  'uganda': 'Uganda', 'rwanda': 'Ruanda', 'burundi': 'Burundi',
  'tanzania': 'Tanzania', 'mozambique': 'Mozambico', 'malawi': 'Malawi',
  'zambia': 'Zambia', 'zimbabwe': 'Zimbabwe', 'botswana': 'Botswana',
  'namibia': 'Namibia', 'south africa': 'Sudafrica', 'lesotho': 'Lesotho',
  'eswatini': 'Eswatini', 'swaziland': 'Swaziland',
  'madagascar': 'Madagascar', 'comoros': 'Comore',
  'angola': 'Angola', 'democratic republic of the congo': 'Repubblica Democratica del Congo',
  'republic of the congo': 'Repubblica del Congo', 'gabon': 'Gabon',
  'cameroon': 'Camerun', 'nigeria': 'Nigeria', 'benin': 'Benin',
  'togo': 'Togo', 'ghana': 'Ghana', "côte d'ivoire": "Costa d'Avorio",
  "ivory coast": "Costa d'Avorio", 'liberia': 'Liberia',
  'sierra leone': 'Sierra Leone', 'guinea': 'Guinea',
  'guinea-bissau': 'Guinea-Bissau', 'senegal': 'Senegal',
  'gambia': 'Gambia', 'cape verde': 'Capo Verde',
  'burkina faso': 'Burkina Faso', 'central african republic': 'Repubblica Centrafricana',
  'equatorial guinea': 'Guinea Equatoriale',
  'pakistan': 'Pakistan', 'india': 'India', 'nepal': 'Nepal',
  'bhutan': 'Bhutan', 'bangladesh': 'Bangladesh', 'sri lanka': 'Sri Lanka',
  'myanmar': 'Birmania', 'thailand': 'Tailandia', 'vietnam': 'Vietnam',
  'cambodia': 'Cambogia', 'laos': 'Laos', 'malaysia': 'Malaysia',
  'indonesia': 'Indonesia', 'philippines': 'Filippine', 'china': 'Cina',
  'mongolia': 'Mongolia', 'north korea': 'Corea del Nord',
  'south korea': 'Corea del Sud', 'japan': 'Giappone', 'taiwan': 'Taiwan',
  'united states': 'Stati Uniti', 'united states of america': 'Stati Uniti d\'America',
  'canada': 'Canada', 'mexico': 'Messico', 'cuba': 'Cuba',
  'haiti': 'Haiti', 'jamaica': 'Giamaica',
  'dominican republic': 'Repubblica Dominicana', 'guatemala': 'Guatemala',
  'belize': 'Belize', 'honduras': 'Honduras', 'el salvador': 'El Salvador',
  'nicaragua': 'Nicaragua', 'costa rica': 'Costa Rica', 'panama': 'Panamá',
  'colombia': 'Colombia', 'venezuela': 'Venezuela', 'guyana': 'Guyana',
  'suriname': 'Suriname', 'brazil': 'Brasile', 'peru': 'Perù',
  'ecuador': 'Ecuador', 'bolivia': 'Bolivia', 'paraguay': 'Paraguay',
  'chile': 'Cile', 'argentina': 'Argentina', 'uruguay': 'Uruguay',
  'australia': 'Australia', 'new zealand': 'Nuova Zelanda',
  // ── Epoche antiche ─────────────────────────────────────────────────────────
  'roman empire': 'Impero romano', 'eastern roman empire': 'Impero romano d\'Oriente',
  'western roman empire': 'Impero romano d\'Occidente',
  'byzantine empire': 'Impero bizantino', 'ottoman empire': 'Impero ottomano',
  'holy roman empire': 'Sacro Romano Impero', 'carolingian empire': 'Impero carolingio',
  'frankish empire': 'Impero franco', 'kingdom of the franks': 'Regno dei Franchi',
  'achaemenid empire': 'Impero achemenide', 'persian empire': 'Impero persiano',
  'sasanian empire': 'Impero sasanide', 'parthian empire': 'Impero partico',
  'macedonian empire': 'Impero macedone', 'seleucid empire': 'Impero seleucide',
  'ptolemaic kingdom': 'Regno tolemaico', 'ancient egypt': 'Antico Egitto',
  'carthage': 'Cartagine', 'mesopotamia': 'Mesopotamia',
  'babylonian empire': 'Impero babilonese', 'neo-babylonian empire': 'Impero neo-babilonese',
  'assyrian empire': 'Impero assiro', 'akkadian empire': 'Impero accadico',
  'sumeria': 'Sumeria', 'sumer': 'Sumer', 'hittite empire': 'Impero ittita',
  'phoenicia': 'Fenicia', 'ancient greece': 'Grecia antica',
  'kingdom of macedon': 'Regno di Macedonia',
  'mongol empire': 'Impero mongolo', 'golden horde': 'Orda d\'oro',
  'timurid empire': 'Impero timuride', 'ilkhanate': 'Ilkhanato',
  'caliphate': 'Califfato', 'umayyad caliphate': 'Califfato omayyade',
  'abbasid caliphate': 'Califfato abbaside', 'fatimid caliphate': 'Califfato fatimide',
  'arab empire': 'Impero arabo', 'arabia': 'Arabia',
  'safavid empire': 'Impero safavide', 'mughal empire': 'Impero Moghul',
  'maurya empire': 'Impero Maurya', 'gupta empire': 'Impero Gupta',
  'han dynasty': 'Dinastia Han', 'tang dynasty': 'Dinastia Tang',
  'song dynasty': 'Dinastia Song', 'yuan dynasty': 'Dinastia Yuan',
  'ming dynasty': 'Dinastia Ming', 'qing dynasty': 'Dinastia Qing',
  'mali empire': 'Impero del Mali', 'songhai empire': 'Impero Songhai',
  'aztec empire': 'Impero azteco', 'inca empire': 'Impero inca',
  'maya': 'Maya', 'inca': 'Inca', 'aztec': 'Aztechi',
  // ── Rinascimento / Età Moderna ─────────────────────────────────────────────
  'republic of venice': 'Repubblica di Venezia', 'venice': 'Venezia',
  'duchy of milan': 'Ducato di Milano', 'milan': 'Milano',
  'republic of florence': 'Repubblica di Firenze', 'florence': 'Firenze',
  'duchy of tuscany': 'Ducato di Toscana', 'tuscany': 'Toscana',
  'grand duchy of tuscany': 'Granducato di Toscana',
  'papal states': 'Stato Pontificio', 'republic of genoa': 'Repubblica di Genova',
  'genoa': 'Genova', 'duchy of savoy': 'Ducato di Savoia', 'savoy': 'Savoia',
  'duchy of parma': 'Ducato di Parma', 'parma': 'Parma',
  'duchy of modena': 'Ducato di Modena', 'modena': 'Modena',
  'kingdom of naples': 'Regno di Napoli', 'naples': 'Napoli',
  'kingdom of sicily': 'Regno di Sicilia', 'sicily': 'Sicilia',
  'kingdom of the two sicilies': 'Regno delle Due Sicilie',
  'kingdom of sardinia': 'Regno di Sardegna', 'sardinia': 'Sardegna',
  'kingdom of lombardy-venetia': 'Regno Lombardo-Veneto',
  'principality of monaco': 'Principato di Monaco', 'monaco': 'Monaco',
  'republic of san marino': 'Repubblica di San Marino', 'san marino': 'San Marino',
  'swiss confederation': 'Confederazione svizzera',
  'habsburg empire': 'Impero asburgico', 'habsburg monarchy': 'Monarchia asburgica',
  'austrian empire': 'Impero austriaco', 'austro-hungarian empire': 'Impero austro-ungarico',
  'austria-hungary': 'Austria-Ungheria',
  'kingdom of france': 'Regno di Francia', 'kingdom of spain': 'Regno di Spagna',
  'kingdom of portugal': 'Regno del Portogallo',
  'kingdom of england': 'Regno d\'Inghilterra',
  'kingdom of scotland': 'Regno di Scozia',
  'kingdom of ireland': 'Regno d\'Irlanda',
  'kingdom of sweden': 'Regno di Svezia', 'kingdom of denmark': 'Regno di Danimarca',
  'kingdom of norway': 'Regno di Norvegia', 'kingdom of poland': 'Regno di Polonia',
  'kingdom of hungary': 'Regno d\'Ungheria', 'kingdom of bohemia': 'Regno di Boemia',
  'kingdom of prussia': 'Regno di Prussia',
  'polish-lithuanian commonwealth': 'Confederazione polacco-lituana',
  'duchy of warsaw': 'Ducato di Varsavia',
  'confederation of the rhine': 'Confederazione del Reno',
  'russian empire': 'Impero russo', 'kingdom of russia': 'Zar di Russia',
  'tsardom of russia': 'Zarato russo',
  'spanish empire': 'Impero spagnolo', 'portuguese empire': 'Impero portoghese',
  'british empire': 'Impero britannico', 'british india': 'India britannica',
  'dutch empire': 'Impero olandese', 'french empire': 'Impero francese',
  'first french empire': 'Primo Impero francese',
  'second french empire': 'Secondo Impero francese',
  'kingdom of italy': 'Regno d\'Italia', 'italian republic': 'Repubblica italiana',
  'german empire': 'Impero tedesco', 'weimar republic': 'Repubblica di Weimar',
  'soviet union': 'Unione Sovietica', 'ussr': 'URSS',
  'kingdom of württemberg': 'Regno di Württemberg',
  'kingdom of bavaria': 'Regno di Baviera', 'bavaria': 'Baviera',
  'kingdom of hanover': 'Regno di Hannover', 'hanover': 'Hannover',
  'kingdom of saxony': 'Regno di Sassonia', 'saxony': 'Sassonia',
  'grand duchy of warsaw': 'Granducato di Varsavia',
  'grand duchy of luxembourg': 'Granducato di Lussemburgo',
  'maratha empire': 'Impero Maratha', 'delhi sultanate': 'Sultanato di Delhi',
  'zulu kingdom': 'Regno Zulu', 'ashanti empire': 'Impero Ashanti',
  'abyssinia': 'Abissinia',
};

type LanglinksPage = {
  title: string;
  langlinks?: { lang: string; '*': string }[];
};

// Cache Wikipedia: `${lang}:${english_name}` → nome tradotto
const wikiCache = new Map<string, string>();

/**
 * Traduce un array di nomi inglesi nel locale target.
 * Prima controlla il lookup statico (istantaneo), poi Wikipedia langlinks per il resto.
 */
export async function translateTerritoryNames(
  names: string[],
  targetLang: string,
  signal: AbortSignal,
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  if (targetLang === 'en') {
    for (const n of names) results.set(n, n);
    return results;
  }

  const needsWiki: string[] = [];

  for (const n of names) {
    const key = `${targetLang}:${n}`;
    if (wikiCache.has(key)) {
      results.set(n, wikiCache.get(key)!);
      continue;
    }

    // Controlla lookup statico (case-insensitive)
    const staticTranslation = targetLang === 'it'
      ? STATIC_IT[n.toLowerCase()]
      : undefined;

    if (staticTranslation) {
      wikiCache.set(key, staticTranslation);
      results.set(n, staticTranslation);
    } else {
      needsWiki.push(n);
    }
  }

  // Wikipedia langlinks batch per i nomi non trovati nel lookup statico
  for (let i = 0; i < needsWiki.length; i += 50) {
    if (signal.aborted) break;
    const batch = needsWiki.slice(i, i + 50);
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
          redirects?:  { from: string; to: string }[];
          pages?: Record<string, LanglinksPage>;
        };
      };

      // Mappa titolo normalizzato → nome originale dal GeoJSON
      const titleToOrig: Record<string, string> = {};
      for (const n of batch) {
        titleToOrig[n.replace(/ /g, '_')] = n;
        titleToOrig[n] = n;
      }
      for (const norm of data.query?.normalized ?? []) {
        const orig = titleToOrig[norm.from] ?? norm.from.replace(/_/g, ' ');
        titleToOrig[norm.to] = orig;
        titleToOrig[norm.to.replace(/ /g, '_')] = orig;
      }
      for (const redir of data.query?.redirects ?? []) {
        const orig = titleToOrig[redir.from] ?? redir.from.replace(/_/g, ' ');
        titleToOrig[redir.to] = orig;
        titleToOrig[redir.to.replace(/ /g, '_')] = orig;
      }

      for (const page of Object.values(data.query?.pages ?? {})) {
        const link = page.langlinks?.find(l => l.lang === targetLang);
        if (!link) continue;
        const origName = titleToOrig[page.title] ?? titleToOrig[page.title.replace(/ /g, '_')] ?? page.title;
        wikiCache.set(`${targetLang}:${origName}`, link['*']);
        results.set(origName, link['*']);
      }
    } catch {
      // ignora errori di rete — il nome inglese resta come fallback
    }
  }

  // Fallback: nomi non trovati restano in inglese
  for (const n of names) {
    if (!results.has(n)) results.set(n, n);
  }

  return results;
}
