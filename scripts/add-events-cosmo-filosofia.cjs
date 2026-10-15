/**
 * Arricchimento cosmo (~20) e filosofia (~20)
 * Colma le lacune non coperte da Wikipedia IT top-2024:
 * - cosmo: astronomi chiave e scoperte moderne
 * - filosofia: filosofia islamica medievale, orientale, scolastica europea, moderna pre-illuminismo
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

var existingSlugs = new Set(events.map(function(e){ return (e.wikipediaSlug||'').toLowerCase(); }));

var newEvents = [

  // ── COSMO ─────────────────────────────────────────────────────────────────

  {
    id: 'cosmo-fill-001',
    title: 'Tycho Brahe',
    year: 1546,
    lat: 55.9075, lng: 12.6900,
    category: 'cosmo', tipo: 'persona',
    description: 'Tycho Brahe (1546–1601) fu l\'astronomo danese che, prima dell\'invenzione del telescopio, realizzò le osservazioni astronomiche più precise della storia. Dal suo osservatorio sull\'isola di Hven catalogò la posizione di oltre 1000 stelle con un margine di errore inferiore a un minuto d\'arco. Le sue misurazioni della posizione di Marte, lasciate in eredità a Keplero, permisero a quest\'ultimo di formulare le tre leggi del moto planetario. Nel 1572 osservò una nuova stella nella costellazione di Cassiopea, dimostrando che il cielo stellato non era immutabile.',
    wikipediaSlug: 'Tycho_Brahe',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-002',
    title: 'William Herschel — Scoperta di Urano',
    year: 1781,
    lat: 51.3837, lng: -2.3599,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 13 marzo 1781 l\'astronomo William Herschel (1738–1822), osservando il cielo da Bath con un telescopio autocostruito, scoprì un oggetto celeste che si muoveva lentamente: era Urano, il settimo pianeta del Sistema Solare, il primo scoperto con il telescopio nella storia. Herschel in origine lo scambiò per una cometa, ma i calcoli orbitali confermarono la natura planetaria dell\'oggetto. Fu anche il primo a catalogare le nebulose e i sistemi stellari doppi, gettando le basi dell\'astronomia stellare moderna.',
    wikipediaSlug: 'William_Herschel',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-003',
    title: 'Henrietta Swan Leavitt — Le stelle cefeidi',
    year: 1912,
    lat: 42.3745, lng: -71.1189,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1912 Henrietta Swan Leavitt (1868–1921), astronoma dell\'Osservatorio di Harvard, pubblicò la relazione periodo-luminosità delle stelle cefeidi: le cefeidi più brillanti pulsano più lentamente. Questa scoperta fornì alla prima volta un metodo affidabile per misurare le distanze cosmiche. Edwin Hubble la usò nel 1924 per dimostrare che la Galassia di Andromeda si trovava al di fuori della Via Lattea, rivoluzionando la comprensione della scala dell\'universo. Leavitt era "computatrice" al Harvard Observatory, lavoro che allora era riservato alle donne.',
    wikipediaSlug: 'Henrietta_Swan_Leavitt',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-004',
    title: 'Cecilia Payne-Gaposchkin — La composizione delle stelle',
    year: 1925,
    lat: 42.3745, lng: -71.1189,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1925 Cecilia Payne-Gaposchkin (1900–1979) dimostrò nella sua tesi di dottorato ad Harvard che le stelle sono composte principalmente di idrogeno ed elio, non di metalli come si credeva. La sua scoperta fu inizialmente respinta dalla comunità scientifica maschile, ma fu in seguito riconosciuta come una delle più importanti del XX secolo. Otto Struve la definì "la tesi di dottorato più brillante mai scritta in astronomia". Aprì la strada all\'astrofisica delle stelle e alla comprensione della nucleosintesi stellare.',
    wikipediaSlug: 'Cecilia_Payne-Gaposchkin',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-005',
    title: 'Vera Rubin — La materia oscura nelle galassie',
    year: 1970,
    lat: 38.9339, lng: -77.0671,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Negli anni \'70 l\'astronoma americana Vera Rubin (1928–2016) misurò con precisione le curve di rotazione di decine di galassie spirali, scoprendo che le stelle nelle regioni esterne orbitano troppo velocemente rispetto a quanto la massa visibile potrebbe produrre. L\'unica spiegazione è l\'esistenza di una grande quantità di "materia oscura" non luminosa che pervade le galassie. La scoperta di Rubin fornì la prova osservativa più diretta della materia oscura, che oggi si stima costituisca il 27% del contenuto energetico dell\'universo. Candidata più volte al Nobel, non vinse mai il premio.',
    wikipediaSlug: 'Vera_Rubin',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-006',
    title: 'Jocelyn Bell Burnell — Scoperta dei pulsar',
    year: 1967,
    lat: 52.1658, lng: 0.0427,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1967 la radioastronoma Jocelyn Bell Burnell (1943), studentessa di dottorato a Cambridge, scoprì il primo pulsar: una sorgente radio che emetteva impulsi elettromagnetici regolari ogni 1,3 secondi con precisione da orologio atomico. I pulsar si rivelarono essere stelle di neutroni in rapida rotazione, residui di esplosioni di supernova. Il suo supervisore Antony Hewish ricevette il Premio Nobel 1974 per la scoperta; Bell Burnell, ritenuta semplice "tecnica", fu esclusa in una delle più controverse omissioni nella storia del Nobel.',
    wikipediaSlug: 'Jocelyn_Bell_Burnell',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-007',
    title: 'Georges Lemaître — Teoria del Big Bang',
    year: 1927,
    lat: 50.8798, lng: 4.7005,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1927 il sacerdote e astrofisico belga Georges Lemaître (1894–1966) propose per primo che l\'universo è in espansione, derivando matematicamente la velocità di recessione delle galassie dalla relatività generale di Einstein. Nel 1931 sviluppò l\'ipotesi dell\'"atomo primordiale": l\'universo aveva avuto origine da uno stato iniziale di densità infinita, che oggi chiamiamo Big Bang. Einstein inizialmente rifiutò la sua idea ("la sua matematica è impeccabile, ma la sua fisica è abominevole"), per poi ricredersi completamente dopo le osservazioni di Hubble.',
    wikipediaSlug: 'Georges_Lema%C3%AEtre',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-008',
    title: 'Karl Schwarzschild — La soluzione del buco nero',
    year: 1916,
    lat: 50.1109, lng: 8.6821,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1916, mentre combatteva sul fronte russo durante la Prima Guerra Mondiale, il fisico tedesco Karl Schwarzschild (1873–1916) risolse esattamente le equazioni di campo di Einstein per un corpo sferico massiccio, ottenendo la prima soluzione esatta della relatività generale. Questa soluzione descriveva per la prima volta matematicamente un buco nero: un oggetto così denso che nulla, nemmeno la luce, può sfuggire alla sua gravità. Il "raggio di Schwarzschild" prende il suo nome. Schwarzschild morì pochi mesi dopo al fronte, a causa di una malattia contratta in trincea.',
    wikipediaSlug: 'Karl_Schwarzschild',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-009',
    title: 'Penzias e Wilson — Radiazione cosmica di fondo',
    year: 1965,
    lat: 40.3629, lng: -74.1856,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1965 Arno Penzias e Robert Wilson, ingegneri dei Bell Laboratories nel New Jersey, scoprirono per caso la radiazione cosmica di fondo a microonde (CMB): un debole rumore radio uniforme in ogni direzione del cielo. Tentando di eliminarlo dai loro strumenti, compresero che proveniva dallo spazio profondo. La CMB è l\'eco del Big Bang: la radiazione emessa 380.000 anni dopo la nascita dell\'universo, quando i fotoni si disaccoppiarono dalla materia. La scoperta confermò definitivamente la teoria del Big Bang. Penzias e Wilson ricevettero il Nobel 1978.',
    wikipediaSlug: 'Radiazione_cosmica_di_fondo',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-010',
    title: 'LIGO — Prima rilevazione di onde gravitazionali',
    year: 2016,
    lat: 46.4551, lng: -119.4075,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 14 settembre 2015 (annunciato nel febbraio 2016) il rivelatore LIGO registrò la prima onda gravitazionale della storia: la distorsione dello spaziotempo prodotta dalla fusione di due buchi neri di circa 30 masse solari avvenuta 1,3 miliardi di anni fa. Il segnale durò 0,2 secondi e deformò lo spaziotempo di meno di un millesimo del diametro di un protone. Einstein aveva predetto l\'esistenza delle onde gravitazionali nel 1916, ma riteneva impossibile rilevarle. Kip Thorne, Rainer Weiss e Barry Barish ricevettero il Nobel 2017.',
    wikipediaSlug: 'LIGO',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-011',
    title: 'Event Horizon Telescope — Prima immagine di un buco nero',
    year: 2019,
    lat: 19.8968, lng: -155.5828,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 10 aprile 2019 la collaborazione internazionale Event Horizon Telescope pubblicò la prima immagine diretta di un buco nero: la regione attorno all\'orizzonte degli eventi di M87*, un buco nero di 6,5 miliardi di masse solari al centro della galassia M87, a 55 milioni di anni luce. L\'immagine fu ottenuta collegando in sincronia 8 radiotelescopi distribuiti su quattro continenti, creando virtualmente un telescopio della dimensione della Terra. Nel 2022 seguì l\'immagine di Sagittarius A*, il buco nero al centro della nostra galassia.',
    wikipediaSlug: 'Event_Horizon_Telescope',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-012',
    title: '51 Pegasi b — Primo esopianeta intorno a una stella solare',
    year: 1995,
    lat: 46.2044, lng: 6.1432,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 6 ottobre 1995 gli astronomi svizzeri Michel Mayor e Didier Queloz annunciarono dalla Haute-Provence Observatory la scoperta di 51 Pegasi b: il primo pianeta extrasolare confermato in orbita attorno a una stella simile al Sole. Il pianeta, un "Giove caldo" che completa un\'orbita in soli 4,2 giorni a 0,05 UA dalla sua stella, rivoluzionò la cosmologia. Da allora sono stati scoperti oltre 5.500 esopianeti. Mayor e Queloz ricevettero il Nobel per la Fisica 2019.',
    wikipediaSlug: '51_Pegasi_b',
    isCosmic: true
  },

  {
    id: 'cosmo-fill-013',
    title: 'Sistema TRAPPIST-1 — Sette pianeti rocciosi',
    year: 2017,
    lat: 50.6326, lng: 5.5797,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel febbraio 2017 l\'astronomia mondiale rimase stupita dall\'annuncio di un sistema con sette pianeti rocciosi in orbita attorno alla nana ultra-fredda TRAPPIST-1, a soli 39 anni luce dalla Terra. Tre di questi pianeti si trovano nella zona abitabile della stella, dove l\'acqua potrebbe esistere in forma liquida. Scoperto tramite il metodo del transito dal telescopio belga TRAPPIST (TRAnsiting Planets and PlanetesImals Small Telescope) all\'osservatorio di Liegi, il sistema è diventato il principale candidato per la ricerca di vita extraterrestre.',
    wikipediaSlug: 'TRAPPIST-1',
    isCosmic: true
  },

  {
    id: 'cosmo-fill-014',
    title: 'SN 1987A — La supernova più vicina del XX secolo',
    year: 1987,
    lat: -29.0146, lng: -70.6927,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 23 febbraio 1987, per la prima volta in 400 anni, una supernova fu visibile ad occhio nudo: SN 1987A, nella Grande Nube di Magellano a soli 168.000 anni luce di distanza. Fu anche la prima supernova da cui furono rilevati neutrini: tre rivelatori sotterranei registrarono 25 neutrini in 13 secondi, confermando i modelli teorici del collasso stellare. L\'onda di espansione del gas espulso è ancora visibile oggi con il Telescopio Hubble, crescendo a una velocità di 30 milioni di km/h. La stella progenitrice era una supergigante blu, contraddicendo le previsioni teoriche.',
    wikipediaSlug: 'SN_1987A',
    isCosmic: true
  },

  {
    id: 'cosmo-fill-015',
    title: 'Energia oscura — L\'espansione accelerata dell\'universo',
    year: 1998,
    lat: 37.8716, lng: -122.2727,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1998 due team di astronomi guidati da Saul Perlmutter (Berkeley) e da Brian Schmidt e Adam Riess scoprirono che l\'espansione dell\'universo non sta rallentando come previsto, ma sta accelerando. Misurando le distanze di supernove di tipo Ia lontanissime, trovarono che sono più fioche del previsto: l\'universo si espande sempre più velocemente. Questo implica l\'esistenza di una misteriosa "energia oscura" che pervade lo spazio e spinge le galassie ad allontanarsi sempre più rapidamente. Si stima rappresenti il 68% dell\'energia totale dell\'universo. Nobel 2011.',
    wikipediaSlug: 'Energia_oscura',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-016',
    title: 'Subrahmanyan Chandrasekhar — Il limite delle nane bianche',
    year: 1931,
    lat: 13.0827, lng: 80.2707,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1931, a soli 19 anni durante la traversata in nave dall\'India all\'Inghilterra, Subrahmanyan Chandrasekhar (1910–1995) calcolò che una stella di massa superiore a 1,4 masse solari non può terminare la propria vita come nana bianca: collasserà inevitabilmente in uno stato ancora più denso, una stella di neutroni o un buco nero. Questo limite — chiamato "limite di Chandrasekhar" — è fondamentale per la comprensione dell\'evoluzione stellare e delle supernove. Il grande Arthur Eddington rifiutò pubblicamente la sua teoria, ma la storia gli diede torto: Nobel 1983.',
    wikipediaSlug: 'Subrahmanyan_Chandrasekhar',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-017',
    title: 'Karl Jansky — Nascita della radioastronomia',
    year: 1931,
    lat: 40.6840, lng: -74.1789,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1931 Karl Jansky (1905–1950), ingegnere dei Bell Labs, stava studiando i disturbi radio che interferivano con le comunicazioni transatlantiche quando notò un segnale misterioso con un periodo di 23 ore e 56 minuti — esattamente il periodo di rotazione della Terra rispetto alle stelle fisse. Localizzò la sorgente nella costellazione del Sagittario: il centro della Via Lattea. Aveva scoperto che gli oggetti celesti emettono onde radio, fondando la radioastronomia. Questa nuova finestra sul cosmo avrebbe portato alla scoperta delle quasar, dei pulsar e della radiazione cosmica di fondo.',
    wikipediaSlug: 'Karl_Jansky',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-018',
    title: 'Osservatorio di Arecibo',
    year: 1963,
    lat: 18.3442, lng: -66.7528,
    category: 'cosmo', tipo: 'luogo',
    description: 'Inaugurato nel 1963 a Porto Rico, il radiotelescopio di Arecibo fu per decenni il più grande del mondo con i suoi 305 metri di diametro. Fu costruito in una depressione naturale carsica e utilizzò il movimento di rotazione terrestre per coprire diverse porzioni di cielo. Contribuì a scoperte fondamentali: la prima mappa radar di Venere, il primo sistema planetario extraterrestre (intorno a una pulsar), e trasmise nel 1974 il "Messaggio di Arecibo", un segnale radio inviato verso l\'ammasso di stelle M13 come tentativo di comunicazione con civiltà extraterrestri. Crollò nel 2020.',
    wikipediaSlug: 'Osservatorio_di_Arecibo',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-019',
    title: 'Inflazione cosmica — Teoria di Alan Guth',
    year: 1980,
    lat: 42.3601, lng: -71.0942,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Nel 1980 il fisico americano Alan Guth propose la teoria dell\'inflazione cosmica: nell\'istante immediatamente successivo al Big Bang (10⁻³¶ secondi), l\'universo subì un\'espansione esponenziale rapidissima, moltiplicando le sue dimensioni di un fattore 10²¶ in meno di un secondo. Questo spiega tre grandi misteri cosmologici: perché il cielo appare uniforme in ogni direzione (problema dell\'orizzonte), perché la geometria dell\'universo sembra piatta (problema della piattezza), e perché non vediamo monopoli magnetici. L\'inflazione prevede anche le fluttuazioni quantistiche che divennero le strutture dell\'universo.',
    wikipediaSlug: 'Inflazione_cosmica',
    isCosmic: false
  },

  {
    id: 'cosmo-fill-020',
    title: 'Telescopio spaziale Hubble — Lancio in orbita',
    year: 1990,
    lat: 28.5728, lng: -80.6490,
    category: 'cosmo', tipo: 'scoperta',
    description: 'Il 24 aprile 1990 lo Space Shuttle Discovery mise in orbita il Telescopio Spaziale Hubble a 547 km di quota. Libero dall\'atmosfera terrestre, Hubble ha rivoluzionato l\'astronomia: ha determinato con precisione la costante di Hubble, ha catturato le prime immagini di profondi campi stellari rivelando miliardi di galassie primordiali, ha fotografato la nascita e la morte delle stelle, e ha contribuito alla scoperta dell\'energia oscura. Un difetto iniziale dello specchio (corretto nel 1993 dalla missione di servizio SM1) rese la riparazione di Hubble uno dei momenti più spettacolari della storia dell\'esplorazione spaziale.',
    wikipediaSlug: 'Telescopio_spaziale_Hubble',
    isCosmic: false
  },

  // ── FILOSOFIA ────────────────────────────────────────────────────────────

  {
    id: 'filo-fill-001',
    title: 'Avicenna (Ibn Sina)',
    year: 980,
    lat: 39.7747, lng: 64.4286,
    category: 'filosofia', tipo: 'persona',
    description: 'Ibn Sina, latinizzato in Avicenna (980–1037), fu il più grande filosofo e medico del mondo islamico medievale. Il suo "Canone della Medicina" rimase il testo medico di riferimento in Europa e nel mondo islamico per sei secoli. In filosofia elaborò un sistema aristotelico-neoplatonico originale, introducendo argomenti capitali come quello del "Uomo volante" (prova dell\'esistenza dell\'anima indipendente dal corpo). La sua sintesi di Aristotele e Platone in chiave islamica influenzò profondamente Tommaso d\'Aquino e l\'intera scolastica europea.',
    wikipediaSlug: 'Avicenna',
    isCosmic: false
  },

  {
    id: 'filo-fill-002',
    title: 'Averroè (Ibn Rushd)',
    year: 1126,
    lat: 37.8882, lng: -4.7794,
    category: 'filosofia', tipo: 'persona',
    description: 'Ibn Rushd, noto in Occidente come Averroè (1126–1198), nacque a Cordova nell\'Andalusia islamica. Scrisse commentari così profondi e sistematici sull\'opera di Aristotele da essere soprannominato semplicemente "il Commentatore". Affermò che ragione e fede non sono in contraddizione: esistono verità filosofiche e verità religiose che percorrono strade diverse. Il suo pensiero, tradotto in latino nel XII-XIII secolo, aprì l\'aristotelismo ai pensatori europei e fu talmente dirompente da generare una corrente eretica — l\'averroismo latino — condannata dalla Chiesa nel 1277.',
    wikipediaSlug: 'Averro%C3%A8',
    isCosmic: false
  },

  {
    id: 'filo-fill-003',
    title: 'Al-Ghazali — La crisi della filosofia razionalista',
    year: 1095,
    lat: 36.2981, lng: 59.6057,
    category: 'filosofia', tipo: 'persona',
    description: 'Al-Ghazali (1058–1111), nato a Tūs in Persia, fu il pensatore che più di ogni altro segnò la svolta del pensiero islamico medievale. Nella sua opera "L\'incoerenza dei filosofi" (Tahafut al-Falasifa) demolì sistematicamente le pretese della filosofia razionalista — in particolare quella di Avicenna e Al-Farabi — di poter dimostrare verità teologiche con la ragione. Dopo una crisi mistica, lasciò l\'insegnamento e divenne sufi. La sua sintesi di giurisprudenza, teologia e mistica nel "Rivivificazione delle scienze religiose" resta una delle opere fondamentali dell\'Islam.',
    wikipediaSlug: 'Al-Ghazali',
    isCosmic: false
  },

  {
    id: 'filo-fill-004',
    title: 'Al-Farabi — Il Secondo Maestro',
    year: 870,
    lat: 44.7988, lng: 66.1397,
    category: 'filosofia', tipo: 'persona',
    description: 'Al-Farabi (c. 872–950), originario del Turkestan, fu soprannominato "il Secondo Maestro" dopo Aristotele per la profondità della sua filosofia. Fu il fondatore della filosofia politica islamica: nella sua opera "La città virtuosa" immaginò uno stato ideale governato dal filosofo-profeta, sintetizzando Platone con il pensiero islamico. Classificò le scienze, gettò le basi della logica e della teoria musicale islamica. Le sue opere di cosmologia e metafisica influenzarono profondamente Avicenna, che le considerò indispensabili per comprendere la Metafisica di Aristotele.',
    wikipediaSlug: 'Al-Farabi',
    isCosmic: false
  },

  {
    id: 'filo-fill-005',
    title: 'Maimonide — Guida dei Perplessi',
    year: 1190,
    lat: 37.8882, lng: -4.7794,
    category: 'filosofia', tipo: 'persona',
    description: 'Mosè Maimonide (1138–1204), nato a Cordova e rifugiatosi in Egitto dopo la persecuzione almohade, fu il più grande filosofo ebraico medievale. La sua opera "Guida dei Perplessi" (Moreh Nevukhim, 1190) tentò di conciliare la filosofia aristotelica con la teologia ebraica, affrontando problemi come la compatibilità tra la creazione biblica del mondo e l\'eternità aristotelica della materia. Influenzò enormemente Tommaso d\'Aquino e la scolastica cristiana. I suoi "Tredici principi di fede" sono ancora recitati nelle liturgie ebraiche ortodosse.',
    wikipediaSlug: 'Maimonide',
    isCosmic: false
  },

  {
    id: 'filo-fill-006',
    title: 'Guglielmo di Ockham — Il Rasoio',
    year: 1320,
    lat: 51.2832, lng: -0.4267,
    category: 'filosofia', tipo: 'persona',
    description: 'Guglielmo di Ockham (c. 1287–1347), frate francescano inglese, è celebre per il principio metodologico noto come "rasoio di Ockham": non bisogna moltiplicare gli enti al di là del necessario (Entia non sunt multiplicanda praeter necessitatem). Questo principio di parsimonia intellettuale è uno dei pilastri del pensiero scientifico moderno. In filosofia difese il nominalismo: i concetti universali non hanno esistenza reale, ma sono solo nomi. In politica contestò l\'autorità temporale del papato, anticipando le idee della Riforma. Venne scomunicato e fuggì ad Avignone, poi alla corte di Ludovico il Bavaro.',
    wikipediaSlug: 'Guglielmo_di_Occam',
    isCosmic: false
  },

  {
    id: 'filo-fill-007',
    title: 'Francesco Bacone — Novum Organum',
    year: 1620,
    lat: 51.5074, lng: -0.1278,
    category: 'filosofia', tipo: 'persona',
    description: 'Francesco Bacone (1561–1626), Lord Cancelliere d\'Inghilterra, rivoluzionò il metodo della conoscenza con il "Novum Organum" (1620): la scienza deve basarsi sull\'osservazione sistematica e sull\'induzione sperimentale, non sulla deduzione astratta da principi aristotelici. Identificò i quattro "idola" (idoli) che distorcono il pensiero umano: della tribù, della caverna, del foro e del teatro. La sua visione della conoscenza come strumento di dominio sulla natura ("sapere è potere") gettò le basi epistemologiche della rivoluzione scientifica e dell\'empirismo britannico.',
    wikipediaSlug: 'Francesco_Bacone',
    isCosmic: false
  },

  {
    id: 'filo-fill-008',
    title: 'Baruch Spinoza — Etica',
    year: 1677,
    lat: 52.3676, lng: 4.9041,
    category: 'filosofia', tipo: 'persona',
    description: 'Baruch Spinoza (1632–1677), filosofo ebreo-olandese espulso dalla comunità ebraica di Amsterdam per eresia, elaborò uno dei sistemi filosofici più rigorosi della storia. Nella sua opera principale "Etica" (1677, postuma) dimostrò, more geometrico, l\'esistenza di un\'unica sostanza infinita che identifica con Dio e la Natura (Deus sive Natura). Il suo panteismo radicale, il determinismo assoluto e la critica biblica lo resero il filosofo più temuto del XVII secolo. Albert Einstein dichiarò di credere nel "Dio di Spinoza". Anticipò l\'Illuminismo, la psicologia moderna e la critica delle religioni.',
    wikipediaSlug: 'Baruch_Spinoza',
    isCosmic: false
  },

  {
    id: 'filo-fill-009',
    title: 'Gottfried Wilhelm Leibniz',
    year: 1646,
    lat: 52.3759, lng: 9.7320,
    category: 'filosofia', tipo: 'persona',
    description: 'Gottfried Wilhelm Leibniz (1646–1716), filosofo e matematico tedesco, fu uno dei più grandi intelletti universali della storia. Inventò indipendentemente da Newton il calcolo infinitesimale (con una notazione — dy/dx — ancora usata oggi). In filosofia elaborò la teoria delle monadi: l\'universo è composto da sostanze spirituali semplici, ciascuna che riflette l\'intero universo secondo la propria prospettiva. Il suo ottimismo — "viviamo nel migliore dei mondi possibili" — fu duramente criticato da Voltaire nel "Candido". Anticipò la logica moderna e l\'informatica con i suoi studi sul calcolo binario.',
    wikipediaSlug: 'Gottfried_Wilhelm_von_Leibniz',
    isCosmic: false
  },

  {
    id: 'filo-fill-010',
    title: 'Blaise Pascal',
    year: 1623,
    lat: 45.7797, lng: 3.0863,
    category: 'filosofia', tipo: 'persona',
    description: 'Blaise Pascal (1623–1662), matematico, fisico e filosofo francese, fu un genio che bruciò in soli 39 anni. Inventò la prima macchina calcolatrice meccanica (la Pascalina), dimostrò con esperimenti il peso dell\'atmosfera, e fondò con Fermat la teoria della probabilità. In filosofia lasciò i "Pensieri" (Pensées), raccolta di riflessioni apologetiche sul Cristianesimo. Introdusse la celebre "scommessa di Pascal": anche se Dio non fosse dimostrabile razionalmente, conviene credere in lui perché la posta in gioco (la vita eterna) giustifica il rischio. Visse gli ultimi anni in austerità mistica dopo una profonda conversione.',
    wikipediaSlug: 'Blaise_Pascal',
    isCosmic: false
  },

  {
    id: 'filo-fill-011',
    title: 'Confucio',
    year: -551,
    lat: 35.5973, lng: 116.9917,
    category: 'filosofia', tipo: 'persona',
    description: 'Confucio (551–479 a.C.), nato a Qufu nello stato di Lu (Cina orientale), fu il pensatore che più profondamente modellò la civiltà cinese e asiatica orientale. La sua filosofia, raccolta negli "Analetti" dai suoi discepoli, pone al centro la coltivazione morale individuale, la rettitudine nei rapporti sociali (padre-figlio, sovrano-suddito, marito-moglie, fratello maggiore-minore, amico-amico) e il governo illuminato basato sulla virtù. Il confucianesimo divenne dottrina di stato in Cina per oltre duemila anni e rimane la base culturale di Cina, Giappone, Corea e Vietnam.',
    wikipediaSlug: 'Confucio',
    isCosmic: false
  },

  {
    id: 'filo-fill-012',
    title: 'Laozi — Tao Te Ching',
    year: -600,
    lat: 33.7851, lng: 114.5476,
    category: 'filosofia', tipo: 'persona',
    description: 'Laozi (VI secolo a.C.), figura seminale e in parte leggendaria della filosofia cinese, è il presunto autore del "Tao Te Ching" (Il libro della Via e della Virtù), testo fondante del Taoismo. L\'opera, di soli 5000 caratteri, espone una visione del mondo basata sul Tao (la Via): il principio originario e inesprimibile che regola l\'universo. Il saggio taoista agisce attraverso il wu wei (non-azione), seguendo il flusso naturale delle cose senza forzare. Il Taoismo influenzò profondamente la medicina, l\'arte, la politica e la spiritualità cinese, e in Occidente il pensiero ecologico moderno.',
    wikipediaSlug: 'Laozi',
    isCosmic: false
  },

  {
    id: 'filo-fill-013',
    title: 'Adi Shankara — Advaita Vedanta',
    year: 788,
    lat: 10.2133, lng: 76.3671,
    category: 'filosofia', tipo: 'persona',
    description: 'Adi Shankara (788–820), nato nel Kerala, è il più grande filosofo dell\'India classica. In soli 32 anni di vita rivoluzionò il pensiero indù elaborando l\'Advaita Vedanta (non-dualismo): l\'unica realtà assoluta è Brahman, lo spirito infinito; il mondo materiale e il sé individuale (Atman) sono identici a Brahman. La molteplicità apparente del mondo è Maya, illusione. Shankara percorse l\'India intera a piedi dibattendo con i dotti di ogni corrente, fondò quattro monasteri nei quattro angoli del subcontinente e commentò le Upanishad, la Bhagavad Gita e i Brahma Sutra. Il suo sistema domina ancora la teologia indù.',
    wikipediaSlug: 'Adi_Shankara',
    isCosmic: false
  },

  {
    id: 'filo-fill-014',
    title: 'Nagarjuna — La filosofia del Vuoto',
    year: 150,
    lat: 16.0, lng: 80.0,
    category: 'filosofia', tipo: 'persona',
    description: 'Nagarjuna (II sec. d.C.), monaco buddista dell\'India meridionale, è il più importante filosofo del Buddhismo Mahayana dopo il Buddha stesso. La sua scuola Madhyamaka ("Via di mezzo") elaborò la dottrina della Sunyata (vuoto): tutti i fenomeni sono privi di esistenza intrinseca, esistono solo in relazione ad altri fenomeni (dipendenza originale). Con i "Mūlamadhyamakakārikā" dimostrò per via logica che ogni concetto filosofico — inclusi quelli di Dio, io, causa, tempo — si contraddice se analizzato rigorosamente. Il suo pensiero influenzò tutte le scuole buddhiste successive in Cina, Tibet, Giappone.',
    wikipediaSlug: 'Nagarjuna',
    isCosmic: false
  },

  {
    id: 'filo-fill-015',
    title: 'George Berkeley — Esse est percipi',
    year: 1710,
    lat: 51.8985, lng: -8.4756,
    category: 'filosofia', tipo: 'persona',
    description: 'George Berkeley (1685–1753), vescovo anglicano irlandese, propose uno dei sistemi filosofici più audaci della storia: l\'idealismo immaterialista. La sua tesi principale, "esse est percipi" (essere è essere percepito), sostiene che non esiste una realtà materiale esterna alla mente: le cose esistono solo in quanto percepite da una mente. Questa posizione, che sembra assurda, ha radici nell\'empirismo di Locke ed elimina il problema del dualismo mente-materia. La sua filosofia influenzò Kant, Schopenhauer e il dibattito moderno sulla coscienza. La città di Berkeley in California fu nominata in suo onore.',
    wikipediaSlug: 'George_Berkeley',
    isCosmic: false
  },

  {
    id: 'filo-fill-016',
    title: 'Anselmo d\'Aosta — L\'argomento ontologico',
    year: 1078,
    lat: 45.7397, lng: 7.4253,
    category: 'filosofia', tipo: 'persona',
    description: 'Anselmo d\'Aosta (1033–1109), nato in Valle d\'Aosta e poi arcivescovo di Canterbury, elaborò nel "Proslogion" (1078) l\'argomento ontologico per dimostrare l\'esistenza di Dio: Dio è ciò di cui non si può pensare nulla di maggiore; se Dio esistesse solo nella mente, sarebbe possibile pensare qualcosa di maggiore (Dio esistente anche nella realtà); quindi Dio deve necessariamente esistere. Questo argomento è stato discusso ininterrottamente per 1000 anni da Gaunilone a Kant a Gödel, e rimane uno dei temi più dibattuti della filosofia analitica. Anselmo fu anche il fondatore della teologia scolastica ("fides quaerens intellectum").',
    wikipediaSlug: 'Anselmo_d\'Aosta',
    isCosmic: false
  },

  {
    id: 'filo-fill-017',
    title: 'Concilio di Nicea — Il Credo cristiano',
    year: 325,
    lat: 40.4269, lng: 29.7199,
    category: 'filosofia', tipo: 'evento',
    description: 'Nel 325 d.C. l\'imperatore Costantino I convocò a Nicea (odierna İznik, Turchia) il primo concilio ecumenico della storia cristiana. Riunì oltre 300 vescovi da tutto l\'Impero per risolvere la controversia ariana: Ario sosteneva che Cristo era una creatura subordinata al Padre; Atanasio e la maggioranza affermavano la piena divinità. Il concilio stabilì che il Figlio è "consostanziale" (homoousios) al Padre e formulò il Credo Niceno, recitato ancora oggi in miliardi di liturgie cristiane. Determinò anche la data della Pasqua. Fu il momento fondativo della teologia cristiana ortodossa e della Chiesa istituzionale.',
    wikipediaSlug: 'Concilio_di_Nicea',
    isCosmic: false
  },

  {
    id: 'filo-fill-018',
    title: 'Giovanni Calvino — L\'Istituzione della Religione Cristiana',
    year: 1536,
    lat: 46.2044, lng: 6.1432,
    category: 'filosofia', tipo: 'persona',
    description: 'Giovanni Calvino (1509–1564), teologo e riformatore francese rifugiatosi a Ginevra, plasmò con le sue dottrine una delle principali correnti del Protestantesimo. La sua opera fondamentale "Institutio Christianae Religionis" (1536) elaborò la dottrina della predestinazione assoluta: Dio ha predestinato ab aeterno alcuni esseri umani alla salvezza e altri alla dannazione, indipendentemente dalle opere umane. Trasformò Ginevra in una "città di Dio" riformata con rigide norme morali. Il calvinismo si diffuse in Francia (ugonotti), Scozia (presbiteriani), Paesi Bassi e Inghilterra, influenzando profondamente la cultura protestante e l\'etica capitalista descritta da Max Weber.',
    wikipediaSlug: 'Giovanni_Calvino',
    isCosmic: false
  },

  {
    id: 'filo-fill-019',
    title: 'Concilio di Trento',
    year: 1545,
    lat: 46.0748, lng: 11.1217,
    category: 'filosofia', tipo: 'evento',
    description: 'Il Concilio di Trento (1545–1563), convocato da papa Paolo III nella città trentina allora sotto il Sacro Romano Impero, fu la risposta cattolica alla Riforma Protestante e il più importante concilio della storia moderna della Chiesa. Definì dogmaticamente il canone della Bibbia, la dottrina della giustificazione (contro il sola fide luterano), il valore dei sette sacramenti e il ruolo della tradizione ecclesiastica accanto alla Scrittura. Avviò la Controriforma: riorganizzò la formazione dei sacerdoti con i seminari, riformò la liturgia, vietò abusi come la vendita delle indulgenze e diede impulso all\'arte barocca come strumento di evangelizzazione.',
    wikipediaSlug: 'Concilio_di_Trento',
    isCosmic: false
  },

  {
    id: 'filo-fill-020',
    title: 'Duns Scoto — Lo scotismo',
    year: 1295,
    lat: 55.7767, lng: -2.3482,
    category: 'filosofia', tipo: 'persona',
    description: 'Giovanni Duns Scoto (c. 1266–1308), frate francescano scozzese, fu il principale avversario filosofico di Tommaso d\'Aquino nella scolastica medievale. Contro il realismo moderato tomista sostenne un realismo più radicale delle nature comuni. Introdusse il concetto di "haecceitas" (ecceità): il principio di individuazione che rende ogni ente unico e irripetibile. Dimostrò l\'Immacolata Concezione di Maria con argomenti filosofici (poi dogma nel 1854). Per la sottigliezza dei suoi ragomenti fu soprannominato "Doctor Subtilis". Ironia della storia: il termine inglese "dunce" (stupido) deriva dal suo nome, usato dai detrattori per i suoi seguaci.',
    wikipediaSlug: 'Duns_Scoto',
    isCosmic: false
  }

];

// ── Aggiunta con verifica duplicati ───────────────────────────────────────────
var before = events.length;
var added = [];
var skipped = [];

newEvents.forEach(function(ev) {
  var slug = (ev.wikipediaSlug || '').toLowerCase();
  if (existingSlugs.has(slug)) {
    skipped.push(ev.title + ' [dup: ' + ev.wikipediaSlug + ']');
  } else {
    events.push(ev);
    existingSlugs.add(slug);
    added.push(ev.category + '/' + ev.tipo + ' — ' + ev.title + ' (' + ev.year + ')');
  }
});

fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');

console.log('\n=== ARRICCHIMENTO COSMO + FILOSOFIA ===');
console.log('  Prima:    ' + before);
console.log('  Aggiunti: ' + added.length);
console.log('  Saltati:  ' + skipped.length + ' (dup)');
console.log('  Dopo:     ' + events.length);

if (added.length) { console.log('\nAggiunti:'); added.forEach(function(s){ console.log('  + ' + s); }); }
if (skipped.length) { console.log('\nSaltati:'); skipped.forEach(function(s){ console.log('  - ' + s); }); }

var cat = {}, tip = {};
events.forEach(function(e){ cat[e.category]=(cat[e.category]||0)+1; tip[e.tipo||'?']=(tip[e.tipo||'?']||0)+1; });
console.log('\nCategorie:');
Object.keys(cat).sort(function(a,b){return cat[b]-cat[a];}).forEach(function(k){ console.log('  ' + k + ': ' + cat[k] + ' (' + (cat[k]/events.length*100).toFixed(1) + '%)'); });
console.log('Tipi:');
Object.keys(tip).sort(function(a,b){return tip[b]-tip[a];}).forEach(function(k){ console.log('  ' + k + ': ' + tip[k] + ' (' + (tip[k]/events.length*100).toFixed(1) + '%)'); });
