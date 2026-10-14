/**
 * Aggiunge tutti i candidati dall'analisi Wikipedia Top 2024
 * Fonte: scripts/wikipedia-gap-analysis.md
 * 26 eventi totali: 9 sport + 8 storia + 7 arte + 2 musica
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

var newEvents = [

  // ── SPORT — Lacuna critica (da 2.6% → ~4.5%) ─────────────────────────────

  {
    id: 'wiki-gap-001',
    title: 'Gigi Riva',
    year: 1944,
    lat: 39.2238,
    lng: 9.1217,
    category: 'sport',
    tipo: 'persona',
    description: 'Luigi "Gigi" Riva, detto Rombo di Tuono, è il capocannoniere di tutti i tempi della Nazionale italiana di calcio con 35 gol. Ala sinistra di potenza straordinaria, condusse il Cagliari allo storico scudetto del 1970 e fu protagonista della semifinale Italia-Germania 4-3 ai Mondiali 1970 in Messico. Rifiutò offerte da Juventus e altri grandi club per restare fedele al Cagliari. Morto nel gennaio 2024.',
    wikipediaSlug: 'Gigi_Riva',
    isCosmic: false
  },

  {
    id: 'wiki-gap-002',
    title: 'Società Sportiva Calcio Napoli — Fondazione',
    year: 1926,
    lat: 40.8358,
    lng: 14.2488,
    category: 'sport',
    tipo: 'organizzazione',
    description: 'Fondata nel 1926, la SSC Napoli è una delle squadre di calcio più amate e popolari d\'Italia. Grazie a Diego Armando Maradona vinse i primi due scudetti (1987, 1990) e la Coppa UEFA 1989. Il terzo scudetto arrivò nel 2023, primo dopo 33 anni, scatenando un\'esultanza collettiva senza precedenti in tutto il Paese. Lo stadio San Paolo è stato rinominato Stadio Diego Armando Maradona nel 2020.',
    wikipediaSlug: 'Società_Sportiva_Calcio_Napoli',
    isCosmic: false
  },

  {
    id: 'wiki-gap-003',
    title: 'Franz Beckenbauer',
    year: 1945,
    lat: 48.1351,
    lng: 11.5820,
    category: 'sport',
    tipo: 'persona',
    description: 'Franz Beckenbauer, soprannominato "il Kaiser", è considerato il più grande calciatore tedesco di tutti i tempi. Libero elegante e capace di costruire il gioco dalla difesa, vinse la Coppa del Mondo 1974 da capitano e la conquistò di nuovo nel 1990 da allenatore. Con il Bayern Monaco dominò il calcio europeo negli anni \'70. Unico nella storia ad aver vinto il Mondiale come giocatore e come commissario tecnico. Morto nel gennaio 2024.',
    wikipediaSlug: 'Franz_Beckenbauer',
    isCosmic: false
  },

  {
    id: 'wiki-gap-004',
    title: 'Juventus Football Club — Fondazione',
    year: 1897,
    lat: 45.1096,
    lng: 7.6411,
    category: 'sport',
    tipo: 'organizzazione',
    description: 'Fondata nel 1897 da studenti del Liceo Massimo D\'Azeglio di Torino, la Juventus FC è il club calcistico italiano più titolato con 36 scudetti, 14 Coppe Italia e 2 Champions League (1985, 1996). Soprannominata "la Vecchia Signora", ha collezionato stelle come Boniperti, Charles, Platini, Baggio, Zidane, Del Piero, Buffon, Ronaldo. È il club con il maggior numero di tifosi in Italia.',
    wikipediaSlug: 'Juventus_Football_Club',
    isCosmic: false
  },

  {
    id: 'wiki-gap-005',
    title: 'Football Club Internazionale Milano — Fondazione',
    year: 1908,
    lat: 45.4778,
    lng: 9.1239,
    category: 'sport',
    tipo: 'organizzazione',
    description: 'Fondata nel 1908 da una scissione del Milan Cricket and Football Club, l\'Inter è l\'unica squadra italiana ad essere sempre rimasta in Serie A senza retrocessioni. Ha vinto 20 scudetti, 8 Coppe Italia e 3 Champions League (1964, 1965, 2010). Il Triplete del 2010 sotto José Mourinho — Scudetto, Coppa Italia e Champions League nello stesso anno — è rimasto un evento irripetibile nel calcio italiano.',
    wikipediaSlug: 'Football_Club_Internazionale_Milano',
    isCosmic: false
  },

  {
    id: 'wiki-gap-006',
    title: 'Andreas Brehme',
    year: 1960,
    lat: 53.5511,
    lng: 9.9937,
    category: 'sport',
    tipo: 'persona',
    description: 'Andreas Brehme è il difensore tedesco che segnò il gol più importante della storia dei Mondiali in Italia: il rigore all\'84° minuto della finale di Roma del 1990 che regalò il terzo titolo mondiale alla Germania Ovest battendo l\'Argentina di Maradona per 1-0. Terzino sinistro di grande tecnica, vinse anche la Coppa UEFA 1991 con l\'Inter. Morto nell\'aprile 2024.',
    wikipediaSlug: 'Andreas_Brehme',
    isCosmic: false
  },

  {
    id: 'wiki-gap-007',
    title: 'Associazione Calcio Milan — Fondazione',
    year: 1899,
    lat: 45.4778,
    lng: 9.1239,
    category: 'sport',
    tipo: 'organizzazione',
    description: 'Fondato nel 1899 da Herbert Kilpin e Alfred Edwards come Milan Cricket and Football Club, l\'AC Milan è uno dei club più titolati al mondo con 19 scudetti, 7 Champions League (record europeo condiviso con il Real Madrid), 5 Coppe del Mondo per Club. Ha lanciato stelle come Rivera, Maldini, Van Basten, Gullit, Baresi, Kakà, Shevchenko. Il "Grande Milan" di Sacchi negli anni \'80–\'90 è considerato una delle squadre più forti di tutti i tempi.',
    wikipediaSlug: 'Associazione_Calcio_Milan',
    isCosmic: false
  },

  {
    id: 'wiki-gap-008',
    title: 'Associazione Sportiva Roma — Fondazione',
    year: 1927,
    lat: 41.9341,
    lng: 12.4547,
    category: 'sport',
    tipo: 'organizzazione',
    description: 'Fondata nel 1927 dalla fusione di tre club romani, l\'AS Roma è il principale club calcistico della capitale italiana con 3 scudetti e 9 Coppe Italia. Simbolo della romanità, ha avuto campioni come Falcão, Totti (che vi trascorse tutta la carriera), De Rossi, Bruno Conti. La finale di Coppa dei Campioni 1984 persa ai rigori contro il Liverpool è uno dei momenti più dolorosi della storia del club.',
    wikipediaSlug: 'Associazione_Sportiva_Roma',
    isCosmic: false
  },

  {
    id: 'wiki-gap-009',
    title: 'Grande Slam — I quattro tornei del tennis',
    year: 1924,
    lat: 48.8472,
    lng: 2.2489,
    category: 'sport',
    tipo: 'evento',
    description: 'Il Grande Slam del tennis comprende i quattro tornei più prestigiosi al mondo: Australian Open (Melbourne, gen), Roland Garros (Parigi, mag-giu), Wimbledon (Londra, lug) e US Open (New York, ago-set). Il termine fu coniato nel 1933. Vincere tutti e quattro i tornei nello stesso anno — il "Grand Slam nell\'anno solare" — è la più rara e preziosa impresa del tennis: riuscita solo a Rod Laver (1962 e 1969) e Steffi Graf (1988), che aggiunse anche l\'oro olimpico (Golden Slam).',
    wikipediaSlug: 'Grande_Slam_(tennis)',
    isCosmic: false
  },

  // ── STORIA — molto viste ma non ancora presenti ───────────────────────────

  {
    id: 'wiki-gap-010',
    title: 'Goffredo Mameli',
    year: 1827,
    lat: 44.4056,
    lng: 8.9463,
    category: 'storia',
    tipo: 'persona',
    description: 'Goffredo Mameli (1827–1849) fu poeta e patriota del Risorgimento italiano. A soli 20 anni scrisse "Il Canto degli Italiani" (1847), noto come "Fratelli d\'Italia" o "Inno di Mameli", poi scelto come inno nazionale italiano nel 1946. Partecipò alle Cinque Giornate di Milano e alla difesa della Repubblica Romana, dove morì a 21 anni per le ferite riportate in battaglia. Incarnò l\'ideale romantico del giovane patriota pronto a sacrificare la vita per la patria.',
    wikipediaSlug: 'Goffredo_Mameli',
    isCosmic: false
  },

  {
    id: 'wiki-gap-011',
    title: 'Strage di Acca Larenzia',
    year: 1978,
    lat: 41.8710,
    lng: 12.5580,
    category: 'storia',
    tipo: 'evento',
    description: 'Il 7 gennaio 1978, a Roma in via Acca Larenzia, un attentato rivendicato dai Nuclei Armati per il Contropotere Territoriale uccise tre giovani missini: Franco Bigonzetti, Francesco Ciavatta e Stefano Recchioni. Durante i funerali, un quarto giovane, Maurizio Lupini, fu ucciso dai carabinieri in circostanze controverse. L\'episodio è uno dei momenti più dolorosi degli anni di piombo e rimane un simbolo del terrorismo politico italiano.',
    wikipediaSlug: 'Strage_di_Acca_Larenzia',
    isCosmic: false
  },

  {
    id: 'wiki-gap-012',
    title: 'Anniversario della Liberazione d\'Italia — 25 aprile 1945',
    year: 1945,
    lat: 45.4642,
    lng: 9.1900,
    category: 'storia',
    tipo: 'evento',
    description: 'Il 25 aprile 1945 il Comitato di Liberazione Nazionale Alta Italia proclamò l\'insurrezione generale contro i nazifascisti nel Nord Italia. Entro pochi giorni le principali città — Milano, Torino, Genova — furono liberate dai partigiani prima dell\'arrivo degli Alleati. Mussolini fu catturato e fucilato il 28 aprile. Il 25 aprile è diventato Festa della Liberazione, giornata nazionale celebrata ogni anno in Italia come simbolo della democrazia e della fine del fascismo.',
    wikipediaSlug: 'Anniversario_della_liberazione_d\'Italia',
    isCosmic: false
  },

  {
    id: 'wiki-gap-013',
    title: 'Dino Grandi',
    year: 1895,
    lat: 44.4049,
    lng: 11.5523,
    category: 'storia',
    tipo: 'persona',
    description: 'Dino Grandi (1895–1988) fu uno dei gerarchi fascisti che più contribuì alla caduta di Mussolini. Nella notte del 24-25 luglio 1943, come presidente della Camera dei Fasci, presentò e fece approvare l\'Ordine del Giorno Grandi al Gran Consiglio del Fascismo, revocando i poteri militari a Mussolini. Questo atto segnò la fine del regime fascista. Diplomatico abile, fu anche ambasciatore a Londra negli anni \'30 e ministro degli Esteri.',
    wikipediaSlug: 'Dino_Grandi',
    isCosmic: false
  },

  {
    id: 'wiki-gap-014',
    title: 'Disastro aereo delle Ande',
    year: 1972,
    lat: -34.7741,
    lng: -70.2892,
    category: 'storia',
    tipo: 'evento',
    description: 'Il 13 ottobre 1972, un aereo con la squadra di rugby uruguaiana Old Christians si schiantò sulle Ande a oltre 4.000 metri di altitudine. Dei 45 occupanti, 33 sopravvissero all\'impatto iniziale ma erano bloccati in un ambiente ostile a temperature polari. Dopo 72 giorni, 16 sopravvissuti — tra cui Nando Parrado e Roberto Canessa — furono salvati. Per sopravvivere, i naufraghi si nutrirono dei corpi dei compagni morti. La storia, nota come "il miracolo delle Ande", è una delle più straordinarie sopravvivenze umane della storia.',
    wikipediaSlug: 'Disastro_aereo_delle_Ande',
    isCosmic: false
  },

  {
    id: 'wiki-gap-015',
    title: 'Massacri delle foibe',
    year: 1945,
    lat: 45.6496,
    lng: 13.7681,
    category: 'storia',
    tipo: 'evento',
    description: 'Tra il 1943 e il 1945, i partigiani jugoslavi di Tito perpetrarono massacri sistematici di italiani e oppositori politici nelle foibe — cavità carsiche della Venezia Giulia e dell\'Istria. Le vittime italiane stimate vanno da 3.000 a 11.000. I sopravvissuti e i loro discendenti, tra 250.000 e 350.000 persone, furono costretti a lasciare le terre istriane, dalmate e fiumane nel grande esodo giuliano-dalmata. Il 10 febbraio è il Giorno del Ricordo istituito nel 2004.',
    wikipediaSlug: 'Massacri_delle_foibe',
    isCosmic: false
  },

  {
    id: 'wiki-gap-016',
    title: 'Strage di Erba',
    year: 2006,
    lat: 45.8157,
    lng: 9.2231,
    category: 'storia',
    tipo: 'evento',
    description: 'L\'11 dicembre 2006 a Erba, in provincia di Como, Rosa Bazzi e Olindo Romano massacrarono quattro vicini di casa: Raffaella Castagna, suo figlio Youssef di due anni, la madre Paola Galli e la vicina Valeria Cherubini. L\'unico sopravvissuto, il marito di Valeria, rimase gravemente ferito. La coppia fu condannata all\'ergastolo nel 2011. Il caso, definito dai media "la strage di Erba", divenne uno degli omicidi multipli più noti della cronaca italiana contemporanea, oggetto di libri, documentari e continui dibattiti sulla colpevolezza degli imputati.',
    wikipediaSlug: 'Strage_di_Erba',
    isCosmic: false
  },

  {
    id: 'wiki-gap-017',
    title: 'Vittorio Emanuele di Savoia',
    year: 1937,
    lat: 40.8518,
    lng: 14.2681,
    category: 'storia',
    tipo: 'persona',
    description: 'Vittorio Emanuele di Savoia (1937–2024) fu l\'unico figlio maschio di Umberto II, ultimo re d\'Italia, e di Maria José del Belgio. Nato a Napoli, visse in esilio dopo la nascita della Repubblica Italiana nel 1946, che proibì ai discendenti maschi dei Savoia di entrare in Italia fino al 2002. La sua vita fu segnata da controversie: nel 1978 sparò un colpo di fucile che colpì il giovane Dirk Hamer, che morì due anni dopo. Fu anche coinvolto in inchieste giudiziarie per corruzione e associazione a delinquere. Morto nel 2024.',
    wikipediaSlug: 'Vittorio_Emanuele_di_Savoia_(1937)',
    isCosmic: false
  },

  {
    id: 'wiki-gap-018',
    title: 'Griselda Blanco — La Madrina di Medellín',
    year: 1943,
    lat: 10.3910,
    lng: -75.4794,
    category: 'storia',
    tipo: 'persona',
    description: 'Griselda Blanco (1943–2012), soprannominata "La Madrina" o "La Vedova Nera", fu una delle più spietate narcotrafficanti della storia. Colombiana di Cartagena, dominò il traffico di cocaina verso gli Stati Uniti negli anni \'70 e \'80, accumulando un patrimonio stimato in miliardi di dollari e ordinando decine di omicidi. Precorritrice dei metodi brutali poi adottati da Pablo Escobar, contribuì a creare l\'era del cartello di Medellín. Fu assassinata nel 2012 a Medellín.',
    wikipediaSlug: 'Griselda_Blanco',
    isCosmic: false
  },

  // ── ARTE ──────────────────────────────────────────────────────────────────

  {
    id: 'wiki-gap-019',
    title: 'La Storia — Elsa Morante',
    year: 1974,
    lat: 41.9028,
    lng: 12.4964,
    category: 'arte',
    tipo: 'opera',
    description: '"La Storia" (1974) di Elsa Morante è uno dei romanzi italiani del Novecento più letti e controversi. Ambientato a Roma durante la Seconda Guerra Mondiale e nel dopoguerra, racconta la vita di Ida Ramundo, una maestra vedova, e dei suoi figli travolti dagli eventi storici. Pubblicato da Einaudi, vendette 800.000 copie nel solo primo anno, diventando un caso letterario senza precedenti. La critica si divise: Pier Paolo Pasolini la definì "il più bel romanzo del dopoguerra", altri la contestarono duramente.',
    wikipediaSlug: 'La_Storia_(romanzo)',
    isCosmic: false
  },

  {
    id: 'wiki-gap-020',
    title: 'John Travolta',
    year: 1954,
    lat: 40.8923,
    lng: -73.9736,
    category: 'arte',
    tipo: 'persona',
    description: 'John Travolta (1954) è uno degli attori e ballerini più iconici del cinema americano. La sua fama esplose con "Saturday Night Fever" (1977) e "Grease" (1978), film che definirono l\'estetica e la musica della fine degli anni \'70. Dopo un periodo di declino negli anni \'80, fu rilanciato da Quentin Tarantino in "Pulp Fiction" (1994), una delle più celebri renaissance della storia di Hollywood. La sua danza è entrata nella cultura popolare mondiale.',
    wikipediaSlug: 'John_Travolta',
    isCosmic: false
  },

  {
    id: 'wiki-gap-021',
    title: 'Akira Toriyama',
    year: 1955,
    lat: 35.1815,
    lng: 136.9066,
    category: 'arte',
    tipo: 'persona',
    description: 'Akira Toriyama (1955–2024) fu il mangaka giapponese creatore di Dragon Ball (1984), uno dei manga e anime più venduti e influenti della storia, con oltre 260 milioni di copie vendute. Dragon Ball Z ha plasmato intere generazioni in tutto il mondo, influenzando profondamente la cultura pop globale. Toriyama fu anche il character designer di Dragon Quest, una delle serie di videogiochi più importanti del Giappone. La sua morte nel marzo 2024 fu accolta con un lutto mondiale.',
    wikipediaSlug: 'Akira_Toriyama',
    isCosmic: false
  },

  {
    id: 'wiki-gap-022',
    title: 'Carla Bruni',
    year: 1967,
    lat: 45.0703,
    lng: 7.6869,
    category: 'arte',
    tipo: 'persona',
    description: 'Carla Bruni (1967) è una cantautrice e modella di origini italiane naturalizzata francese. Nata a Torino, fu una delle top model più famose degli anni \'90, poi si reinventò come cantautrice folk di successo con album come "Quelqu\'un m\'a dit" (2002). La sua vita personale fu oggetto di grande attenzione mediatica, culminata nel matrimonio nel 2008 con Nicolas Sarkozy, presidente della Repubblica Francese, ruolo da prima donna che ricoprì con eleganza e riservatezza.',
    wikipediaSlug: 'Carla_Bruni',
    isCosmic: false
  },

  {
    id: 'wiki-gap-023',
    title: 'Roberto Cavalli',
    year: 1940,
    lat: 43.7696,
    lng: 11.2558,
    category: 'arte',
    tipo: 'persona',
    description: 'Roberto Cavalli (1940–2024) fu uno dei più flamboyant e visionari stilisti italiani. Nato a Firenze, fondò il suo brand negli anni \'70 rivoluzionando la moda con le stampe animalier, il jeans decorato e i tessuti stampati su pelliccia. Il suo stile eccessivo e sensuale divenne sinonimo di lusso glamour negli anni \'80 e \'90, amato da star come Jennifer Lopez e Beyoncé. Morto nel 2024, lascia un\'eredità di creatività provocatoria nel fashion italiano.',
    wikipediaSlug: 'Roberto_Cavalli',
    isCosmic: false
  },

  {
    id: 'wiki-gap-024',
    title: 'Alda Merini',
    year: 1931,
    lat: 45.4654,
    lng: 9.1859,
    category: 'arte',
    tipo: 'persona',
    description: 'Alda Merini (1931–2009) è considerata una delle più grandi poetesse italiane del Novecento. Nata a Milano, fu internata in manicomio per undici anni (1965–1972), esperienza che divenne il cuore della sua scrittura più autentica, raccolta in "La Terra Santa" (1984). La sua poesia — intensa, visionaria, capace di trasformare il dolore in bellezza — la rese un simbolo della lotta per i diritti dei malati psichiatrici e della dignità umana nella sofferenza.',
    wikipediaSlug: 'Alda_Merini',
    isCosmic: false
  },

  // ── MUSICA ────────────────────────────────────────────────────────────────

  {
    id: 'wiki-gap-025',
    title: 'Riccardo Cocciante',
    year: 1946,
    lat: 10.8231,
    lng: 106.6297,
    category: 'musica',
    tipo: 'persona',
    description: 'Riccardo Cocciante (1946) è un cantautore italo-francese tra i più amati della musica leggera italiana. Nato a Saigon, si affermò negli anni \'70 con brani come "Bella senz\'anima" e "Margherita". A livello internazionale raggiunse la fama con il musical "Notre-Dame de Paris" (1998), uno degli spettacoli musicali più visti al mondo con oltre 5 milioni di spettatori. La sua voce potente e il gusto per le melodie romantiche lo hanno reso una figura iconica della canzone italiana.',
    wikipediaSlug: 'Riccardo_Cocciante',
    isCosmic: false
  },

  // ── SPORT — Carlos Alcaraz calciatore ─────────────────────────────────────

  {
    id: 'wiki-gap-026',
    title: 'Carlos Alcaraz (calciatore)',
    year: 2002,
    lat: -34.7833,
    lng: -60.7167,
    category: 'sport',
    tipo: 'persona',
    description: 'Carlos Alcaraz (2002) è un centrocampista argentino, non da confondere con il tennista spagnolo omonimo. Nato a San Carlos, Buenos Aires, ha militato in squadre della Superliga argentina prima di approdare in Europa. La sua popolarità su Wikipedia italiana nel 2024 è legata alla confusione mediatica con il tennista Carlos Alcaraz, campione Slam, che portò molti utenti a cercare informazioni sui due personaggi. Come calciatore è un talento emergente del calcio sudamericano.',
    wikipediaSlug: 'Carlos_Alcaraz_(calciatore)',
    isCosmic: false
  }

];

// ── Aggiunta al dataset ────────────────────────────────────────────────────────
var before = events.length;

// Verifica slug duplicati
var existingSlugs = new Set(events.map(function(e) { return (e.wikipediaSlug || '').toLowerCase(); }));

var added = [];
var skipped = [];

newEvents.forEach(function(ev) {
  if (existingSlugs.has((ev.wikipediaSlug || '').toLowerCase())) {
    skipped.push(ev.id + ' — ' + ev.title + ' (slug già presente)');
  } else {
    events.push(ev);
    existingSlugs.add((ev.wikipediaSlug || '').toLowerCase());
    added.push(ev.id + ' — ' + ev.title);
  }
});

fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');

console.log('\n=== AGGIUNTA EVENTI WIKIPEDIA TOP ===');
console.log('  Prima:     ' + before + ' eventi');
console.log('  Aggiunti:  ' + added.length + ' eventi');
console.log('  Saltati:   ' + skipped.length + ' (slug duplicati)');
console.log('  Dopo:      ' + events.length + ' eventi');

if (added.length > 0) {
  console.log('\nAggiunti:');
  added.forEach(function(e) { console.log('  + ' + e); });
}
if (skipped.length > 0) {
  console.log('\nSaltati:');
  skipped.forEach(function(e) { console.log('  - ' + e); });
}

// Distribuzione finale
var catCount = {};
var tipoCount = {};
events.forEach(function(ev) {
  catCount[ev.category] = (catCount[ev.category] || 0) + 1;
  tipoCount[ev.tipo || 'undefined'] = (tipoCount[ev.tipo || 'undefined'] || 0) + 1;
});

console.log('\nDistribuzione categorie:');
Object.keys(catCount).sort(function(a,b){ return catCount[b]-catCount[a]; }).forEach(function(k) {
  console.log('  ' + k + ': ' + catCount[k] + ' (' + (catCount[k]/events.length*100).toFixed(1) + '%)');
});

console.log('\nDistribuzione tipi:');
Object.keys(tipoCount).sort(function(a,b){ return tipoCount[b]-tipoCount[a]; }).forEach(function(k) {
  console.log('  ' + k + ': ' + tipoCount[k] + ' (' + (tipoCount[k]/events.length*100).toFixed(1) + '%)');
});
