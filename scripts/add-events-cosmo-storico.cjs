const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../src/data/events.json');
const existing = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const newEvents = [
  // ── Astronomia mesopotamica ──────────────────────────────────────────
  {
    "id": "cosmo-calendario-lunare-sumer",
    "title": "Calendario lunare sumero",
    "year": -3000,
    "lat": 30.96,
    "lng": 46.10,
    "category": "cosmo",
    "description": "I Sumeri di Mesopotamia elaborano attorno al 3000 a.C. il primo calendario lunare strutturato della storia, dividendo l'anno in 12 mesi di 29 o 30 giorni ciascuno. I sacerdoti-astronomi di Ur osservano sistematicamente le fasi della Luna per sincronizzare i cicli agricoli e religiosi. Per compensare lo scarto rispetto all'anno solare viene introdotto periodicamente un mese intercalare, gettando le basi dell'astronomia osservativa. Questa tradizione sarà ereditata da Babilonesi, Ebrei e, indirettamente, da tutta l'astronomia occidentale.",
    "wikipediaSlug": "Sumerian_calendar",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-enuma-anu-enlil",
    "title": "Enuma Anu Enlil — tavole astronomiche babilonesi",
    "year": -1700,
    "lat": 32.54,
    "lng": 44.42,
    "category": "cosmo",
    "description": "L'Enuma Anu Enlil è una raccolta di circa 70 tavole cuneiformi babilonesi che catalogano presagi celesti — eclissi, posizioni planetarie, fenomeni meteoritici — e le loro presunte conseguenze per il regno. Redatte attorno al 1700 a.C. e aggiornate per secoli, costituiscono il più antico corpus sistematico di astronomia-astrologia del mondo antico. I sacerdoti-astronomi babilonesi osservano la Luna e i pianeti visibili a occhio nudo con una precisione sorprendente, accumulando dati che secoli dopo permetteranno di calcolare cicli e previsioni. Queste tavole influenzano profondamente l'astronomia greca e, attraverso di essa, la scienza europea medievale.",
    "wikipediaSlug": "Enuma_Anu_Enlil",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "cosmo-ciclo-saros",
    "title": "Il ciclo di Saros — eclissi previste dai Caldei",
    "year": -700,
    "lat": 32.54,
    "lng": 44.42,
    "category": "cosmo",
    "description": "Attorno al 700 a.C. gli astronomi caldei di Babilonia identificano il ciclo di Saros: un periodo di 18 anni, 11 giorni e 8 ore dopo il quale il Sole, la Luna e la Terra tornano in configurazioni quasi identiche, permettendo di prevedere le eclissi. Questa scoperta è il risultato di secoli di osservazioni sistematiche registrate nelle tavole cuneiformi e rappresenta il primo esempio di astronomia predittiva nella storia umana. I Caldei non comprendono le cause fisiche del fenomeno, ma l'efficacia empirica del ciclo è straordinaria. Il ciclo di Saros è ancora oggi utilizzato dagli astronomi per classificare le sequenze di eclissi.",
    "wikipediaSlug": "Saros_(astronomy)",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-zodiaco-babilonese",
    "title": "Zodiaco babilonese — le 12 costellazioni dell'eclittica",
    "year": -600,
    "lat": 32.54,
    "lng": 44.42,
    "category": "cosmo",
    "description": "Attorno al 600 a.C. gli astronomi babilonesi formalizzano lo zodiaco dividendo l'eclittica — il percorso apparente del Sole nel cielo — in 12 settori di 30° ciascuno, associando a ognuno una costellazione. Il sistema nasce da secoli di osservazione dei movimenti dei pianeti lungo questa banda celeste e risponde all'esigenza di creare un sistema di riferimento per la previsione astronomica e astrologica. Ogni segno zodiacale corrisponde approssimativamente a un mese del calendario solare. Lo zodiaco babilonese è trasmesso ai Greci, poi agli Arabi e infine all'Europa medievale, sopravvivendo fino ai giorni nostri.",
    "wikipediaSlug": "Babylonian_astrology",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  // ── Astronomia egizia ────────────────────────────────────────────────
  {
    "id": "cosmo-calendario-solare-egizio",
    "title": "Calendario solare egizio — 365 giorni",
    "year": -2800,
    "lat": 30.13,
    "lng": 31.34,
    "category": "cosmo",
    "description": "Gli Egizi sviluppano attorno al 2800 a.C. uno dei primi calendari solari della storia, suddiviso in 365 giorni distribuiti in 12 mesi di 30 giorni più 5 giorni epagomeni, intercalati alla fine dell'anno. Il calendario è sincronizzato con la levata eliaca di Sirio (Sothis), la stella più luminosa del cielo, che coincide con l'inizio dell'inondazione del Nilo, fondamentale per l'agricoltura. Questo sistema è di gran lunga più preciso dei calendari lunari contemporanei e anticipa il calendario giuliano di oltre due millenni. L'influenza del calendario egizio si avverte nel calendario romano riformato da Giulio Cesare nel 46 a.C.",
    "wikipediaSlug": "Egyptian_calendar",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-piramidi-orione",
    "title": "Allineamento delle piramidi di Giza con Orione",
    "year": -2560,
    "lat": 29.97,
    "lng": 31.13,
    "category": "cosmo",
    "description": "Le tre grandi piramidi di Giza, costruite attorno al 2560 a.C. sotto i faraoni Cheope, Chefren e Micerino, mostrano un allineamento astronomico deliberato: i loro assi principali puntano al nord celeste e la disposizione relativa delle tre piramidi rispecchia quella delle tre stelle della cintura di Orione. Gli Egizi identificavano Orione con Osiride, dio della resurrezione e dell'aldilà, e l'allineamento celeste era parte del progetto cosmico del complesso funerario. Le aperture interne delle piramidi erano calibrate per orientarsi verso specifiche stelle circumpolari e verso Orione. La precisione di questi allineamenti testimonia una conoscenza astronomica raffinata e un progetto architettonico-cosmologico di straordinaria ambizione.",
    "wikipediaSlug": "Orion_correlation_theory",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "cosmo-decani-stellari",
    "title": "Decani stellari — le 36 stelle dell'anno egizio",
    "year": -2100,
    "lat": 25.68,
    "lng": 32.65,
    "category": "cosmo",
    "description": "Attorno al 2100 a.C. gli astronomi egizi sviluppano il sistema dei decani: 36 gruppi di stelle (o singole stelle) che sorgono all'orizzonte orientale prima dell'alba ogni 10 giorni, scandendo l'anno in 36 periodi. Ogni decade è associata a un decanale, una divinità stellare con funzioni protettive. I decani costituiscono una forma di orologio astronomico notturno: la posizione di una stella decana all'alba permetteva di determinare il giorno dell'anno con buona approssimazione. Questo sistema è rappresentato nei coperchi di sarcofagi e nei soffitti di tombe reali, dove il cielo notturno viene riprodotto come mappa cosmica. I decani egizi influenzano l'astrologia ellenistica e, attraverso di essa, la tradizione magico-astrologica europea.",
    "wikipediaSlug": "Decan",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  // ── Astronomia greca ─────────────────────────────────────────────────
  {
    "id": "cosmo-talete-eclissi",
    "title": "Talete di Mileto — prima eclissi solare prevista",
    "year": -585,
    "lat": 37.53,
    "lng": 27.27,
    "category": "cosmo",
    "description": "Nel 585 a.C. il filosofo Talete di Mileto predice con successo un'eclissi solare, un evento che, secondo Erodoto, mette fine a una battaglia tra Lidi e Medi per lo stupore dei combattenti. La previsione sarebbe stata possibile sfruttando la conoscenza del ciclo di Saros, forse appresa dai Babilonesi durante i suoi viaggi. Talete è considerato il primo filosofo naturale dell'Occidente: cercava spiegazioni razionali dei fenomeni celesti in luogo di interpretazioni mitologiche. L'episodio segna un momento fondativo nella storia della scienza: l'astronomia come strumento di previsione razionale del futuro.",
    "wikipediaSlug": "Thales_of_Miletus",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-pitagora-sfericita",
    "title": "Pitagora — sfericità della Terra",
    "year": -500,
    "lat": 39.08,
    "lng": 17.12,
    "category": "cosmo",
    "description": "Pitagora di Samo, vissuto nel VI-V secolo a.C. e operante nella Magna Grecia a Crotone, è tradizionalmente accreditato come il primo a sostenere che la Terra è una sfera. L'ipotesi nasceva da ragionamenti filosofici e geometrici: la forma sferica era considerata la più perfetta e dunque adeguata al cosmo. La comunità pitagorica sviluppò una cosmologia in cui i corpi celesti si muovono in cerchi perfetti e producono, con il loro moto, una «musica delle sfere» inudibile all'orecchio umano. L'idea della Terra sferica, elaborata e dimostrata più rigorosamente da Aristotele e Eratostene, diventa il punto di partenza di tutta l'astronomia greca successiva.",
    "wikipediaSlug": "Pythagoras",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-anassagora-sole",
    "title": "Anassagora — il Sole come corpo incandescente",
    "year": -450,
    "lat": 37.98,
    "lng": 23.73,
    "category": "cosmo",
    "description": "Anassagora di Clazomene, attivo ad Atene verso il 450 a.C., propone una spiegazione rivoluzionaria del Sole: non una divinità, ma una massa di pietra o metallo incandescente, più grande del Peloponneso, che brucia a causa del suo moto rapido. Sostiene che la Luna riflette la luce solare — intuizione corretta — e interpreta le eclissi come il passaggio della Luna davanti al Sole. Per queste idee, considerate empie, viene processato ad Atene e costretto all'esilio. Anassagora rappresenta il punto di rottura tra la concezione divina degli astri e il loro studio come corpi fisici naturali.",
    "wikipediaSlug": "Anaxagoras",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-eudosso-sfere",
    "title": "Eudosso di Cnido — le sfere omocentriche",
    "year": -370,
    "lat": 36.67,
    "lng": 27.38,
    "category": "cosmo",
    "description": "Attorno al 370 a.C. il matematico e astronomo Eudosso di Cnido elabora il primo modello matematico del cosmo: un sistema di sfere omocentriche concentriche, centrate sulla Terra, i cui moti combinati spiegano i movimenti apparenti del Sole, della Luna e dei cinque pianeti allora noti. Il modello impiega 27 sfere distinte, ciascuna con un asse di rotazione diverso, e rappresenta il primo tentativo di descrivere il cielo con equazioni geometriche invece di semplici narrazioni. Pur incapace di spiegare le variazioni di luminosità dei pianeti (la prova che cambiano distanza dalla Terra), il sistema di Eudosso è il capostipite della modellistica astronomica matematica. La sua influenza pervade tutta la cosmologia aristotelica e tolemaica.",
    "wikipediaSlug": "Eudoxus_of_Cnidus",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-aristotele-geocentrico",
    "title": "Aristotele — la cosmologia geocentrica",
    "year": -350,
    "lat": 37.98,
    "lng": 23.73,
    "category": "cosmo",
    "description": "Attorno al 350 a.C. Aristotele sistematizza la cosmologia geocentrica nel trattato «Del Cielo» (De Caelo): la Terra è sferica, immobile al centro dell'universo, circondata da sfere celesti concentriche di etere immutabile che trasportano i pianeti e le stelle fisse. Il cosmo aristotelico è finito, eterno e gerarchicamente ordinato: la corruzione e il cambiamento appartengono solo al mondo sublunare. Aristotele fornisce anche argomenti osservativi a sostegno della sfericità terrestre (ombra circolare durante le eclissi lunari, diversa altezza delle stelle ai diversi latitudini). Questa visione cosmica, assorbita dalla scolastica medievale e dalla Chiesa, dominerà la cultura europea per quasi due millenni, fino alla rivoluzione copernicana.",
    "wikipediaSlug": "Aristotle",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-aristarco-eliocentrismo",
    "title": "Aristarco di Samo — il primo eliocentrismo",
    "year": -270,
    "lat": 37.75,
    "lng": 26.98,
    "category": "cosmo",
    "description": "Aristarco di Samo, astronomo greco vissuto intorno al 310-230 a.C., propone il primo modello eliocentrico documentato della storia: il Sole è al centro dell'universo, la Terra ruota su se stessa ogni giorno e orbita attorno al Sole in un anno. Per spiegare l'assenza di parallasse stellare visibile, Aristarco ipotizza che le stelle fisse siano a distanze immensamente maggiori di quanto si pensasse. Utilizza metodi geometrici per stimare le dimensioni relative e le distanze della Luna e del Sole, ottenendo risultati qualitativamente corretti. La sua teoria viene respinta dai contemporanei — incluso Archimede, che la riporta senza accettarla — e dovrà aspettare quasi 1800 anni per essere riscoperta da Copernico.",
    "wikipediaSlug": "Aristarchus_of_Samos",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-eratostene-terra",
    "title": "Eratostene — misura della circonferenza terrestre",
    "year": -240,
    "lat": 31.20,
    "lng": 29.90,
    "category": "cosmo",
    "description": "Attorno al 240 a.C. Eratostene di Cirene, bibliotecario della grande biblioteca di Alessandria, misura con straordinaria precisione la circonferenza della Terra usando ombre e geometria. Sapendo che a Syene (odierna Assuan) il Sole era allo zenit al solstizio d'estate, misura l'angolo dell'ombra di un palo ad Alessandria nello stesso momento, ottiene circa 7,2° e calcola la circonferenza come 252 000 stadi, corrispondente a circa 40 000 km — molto vicino al valore reale. Il metodo è elegante nella sua semplicità: presuppone solo la sfericità terrestre e la distanza tra le due città. È uno dei risultati scientifici più notevoli dell'antichità e testimonia la straordinaria fioritura intellettuale di Alessandria ellenistica.",
    "wikipediaSlug": "Eratosthenes",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-ipparco-catalogo",
    "title": "Ipparco — catalogo stellare e precessione degli equinozi",
    "year": -150,
    "lat": 40.42,
    "lng": 29.72,
    "category": "cosmo",
    "description": "Ipparco di Nicea, il più grande astronomo greco del II secolo a.C., compila il primo catalogo stellare sistematico con le posizioni di circa 850 stelle e introduce la scala di magnitudini per misurarne la luminosità, sistema ancora in uso nella forma moderna. Confrontando le sue osservazioni con quelle babilonesi precedenti, scopre la precessione degli equinozi: l'asse terrestre descrive lentamente un cono nel tempo (un giro completo in circa 26 000 anni), facendo slittare la posizione dei punti equinoziali rispetto alle stelle. Ipparco sviluppa anche un modello matematico del moto lunare di grande accuratezza, utilizzando per la prima volta la trigonometria in astronomia. Le sue opere, in gran parte perdute, sono la fonte principale di Tolomeo e costituiscono il fondamento dell'astronomia matematica greca.",
    "wikipediaSlug": "Hipparchus",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-tolomeo-almagesto",
    "title": "Tolomeo — l'Almagesto e il sistema geocentrico",
    "year": 150,
    "lat": 31.20,
    "lng": 29.90,
    "category": "cosmo",
    "description": "Claudio Tolomeo, astronomo greco-egizio del II secolo d.C. attivo ad Alessandria, redige l'Almagesto («il grande trattato»), la summa dell'astronomia antica: 13 libri che raccolgono e sistematizzano secoli di osservazioni greche e babilonesi in un modello matematico geocentrico di straordinaria potenza predittiva. Il sistema tolemaico utilizza cerchi deferenti, epicicli ed equanti per riprodurre con precisione le posizioni apparenti dei pianeti e prevederne i movimenti futuri. Sebbene fisicamente errato nella sua struttura (la Terra non è al centro del sistema solare), il modello è matematicamente efficiente: le tavole planetarie tolemaiche restano in uso per oltre 1400 anni. L'Almagesto è il testo astronomico fondamentale del Medioevo europeo e islamico e verrà superato solo con la rivoluzione copernicana del XVI secolo.",
    "wikipediaSlug": "Almagest",
    "isCosmic": false,
    "tipo": "opera"
  },
  // ── Astronomia islamica ──────────────────────────────────────────────
  {
    "id": "cosmo-al-battani",
    "title": "Al-Battani — correzione delle tavole di Tolomeo",
    "year": 900,
    "lat": 35.95,
    "lng": 39.01,
    "category": "cosmo",
    "description": "Muhammad ibn Jabir al-Battani, astronomo arabo operante a Raqqa (nell'odierna Siria) nell'IX-X secolo, conduce osservazioni sistematiche del Sole, della Luna e dei pianeti per oltre 40 anni, producendo misurazioni che correggono e superano quelle di Tolomeo. Determina con notevole precisione la lunghezza dell'anno solare, l'inclinazione dell'eclittica e l'eccentricità dell'orbita solare, e calcola che il punto di massima distanza della Terra dal Sole si è spostato rispetto all'epoca di Tolomeo, intuendo il moto dell'apogeo solare. Le sue tavole astronomiche (al-Zij al-Sabi) sono tradotte in latino nel XII secolo e restano un riferimento imprescindibile per gli astronomi europei medievali. Al-Battani è considerato il più grande astronomo del mondo islamico medievale.",
    "wikipediaSlug": "Al-Battani",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-al-biruni-raggio",
    "title": "Al-Biruni — misura del raggio terrestre",
    "year": 1000,
    "lat": 33.55,
    "lng": 68.42,
    "category": "cosmo",
    "description": "Il poligrafo persiano Al-Biruni (973-1048), uno degli intelletti più universali del Medioevo islamico, perfeziona attorno al 1000 d.C. un metodo ingegnoso per misurare il raggio della Terra: dall'angolo di depressione dell'orizzonte visto da una collina di altezza nota ricava il raggio terrestre senza bisogno di misurare lunghe distanze orizzontali. Il risultato ottenuto — circa 6 339 km — è straordinariamente vicino al valore reale di 6 371 km. Al-Biruni conduce le sue osservazioni durante la campagna militare di Mahmud di Ghazni in India e documenta il metodo nel «Kitab al-Qanun al-Mas'udi». È anche uno dei primi a ipotizzare che l'America possa esistere come continente a ovest dell'Europa.",
    "wikipediaSlug": "Biruni",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-ibn-al-haytham",
    "title": "Ibn al-Haytham — Ottica e astronomia",
    "year": 1020,
    "lat": 30.05,
    "lng": 31.25,
    "category": "cosmo",
    "description": "Ibn al-Haytham (Alhazen), fisico e astronomo arabo vissuto tra il 965 e il 1040, compone il «Kitab al-Manazir» (Libro dell'Ottica), opera fondamentale per la comprensione della luce, della visione e degli strumenti ottici, con importanti ricadute in astronomia. Stabilisce che la visione avviene perché la luce viaggia dall'oggetto all'occhio e non viceversa, confutando la teoria di Euclide e Tolomeo. Applica questo principio all'astronomia atmosferica: studia la rifrazione della luce stellare nell'atmosfera terrestre e spiega il fenomeno del crepuscolo. La sua critica al sistema tolemaico, in cui evidenzia contraddizioni fisiche nel modello degli epicicli, anticipa alcune questioni che Copernico e Galileo affronteranno cinque secoli dopo.",
    "wikipediaSlug": "Ibn_al-Haytham",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-osservatorio-maragha",
    "title": "Osservatorio di Maragha — astronomia islamica matura",
    "year": 1259,
    "lat": 37.40,
    "lng": 46.24,
    "category": "cosmo",
    "description": "Nel 1259 il califfo ilkhanide Hulagu Khan fonda a Maragha, nell'odierno Iran nord-occidentale, uno dei più grandi osservatori astronomici del mondo medievale, affidandone la direzione a Nasir al-Din al-Tusi. L'osservatorio raccoglie i migliori astronomi islamici dell'epoca e produce le «Tavole ilkhanidi» (Zij-i Ilkhani), un catalogo di oltre 1000 stelle con posizioni aggiornate rispetto a Tolomeo. Al-Tusi sviluppa anche il cosiddetto «coppia di al-Tusi», uno strumento matematico per eliminare alcune delle contraddizioni fisiche del sistema tolemaico; questa soluzione influenza direttamente Copernico, che la riprende nel De Revolutionibus. L'osservatorio di Maragha rappresenta il culmine dell'astronomia islamica medievale e un ponte verso la rivoluzione scientifica europea.",
    "wikipediaSlug": "Maragheh_observatory",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "cosmo-ulugh-beg",
    "title": "Ulugh Beg — osservatorio di Samarcanda, 994 stelle",
    "year": 1437,
    "lat": 39.65,
    "lng": 66.97,
    "category": "cosmo",
    "description": "Il principe timuride Ulugh Beg, governatore di Samarcanda e appassionato astronomo, fa costruire tra il 1420 e il 1429 uno dei più grandi osservatori pre-telescopici del mondo, dotato di un sestante murale di 40 metri di raggio. Attorno al 1437 pubblica il suo «Zij-i Sultani», catalogo stellare che riporta le posizioni di 994 stelle con un'accuratezza superiore a quella di Tolomeo e paragonabile alle misurazioni di Tycho Brahe un secolo e mezzo dopo. Ulugh Beg determina anche la lunghezza dell'anno siderale con un errore inferiore a un minuto. Assassinato dal figlio nel 1449, il suo osservatorio viene distrutto, ma le sue tavole astronomiche sono tradotte in latino nel XVII secolo e riconosciute come un contributo fondamentale all'astronomia globale.",
    "wikipediaSlug": "Ulugh_Beg",
    "isCosmic": false,
    "tipo": "persona"
  },
  // ── Rivoluzione astronomica europea ─────────────────────────────────
  {
    "id": "cosmo-copernico-rivoluzione",
    "title": "Copernico — De Revolutionibus, l'eliocentrismo moderno",
    "year": 1543,
    "lat": 54.37,
    "lng": 19.68,
    "category": "cosmo",
    "description": "Nel 1543, anno della sua morte, il canonico polacco Niccolò Copernico pubblica «De Revolutionibus Orbium Coelestium», in cui propone che il Sole — non la Terra — si trova al centro dell'universo, e che la Terra ruota su se stessa ogni giorno e compie un'orbita solare in un anno. Il sistema copernicano elimina l'equante tolemaico e semplifica la struttura del cosmo pur mantenendo le orbite circolari, e spiega in modo naturale il moto retrogrado apparente dei pianeti esterni. L'opera provoca una delle più profonde rivoluzioni concettuali della storia umana — «la rivoluzione copernicana» — abbattendo la visione geocentrica che aveva dominato per quasi due millenni. La sua teoria, sviluppata e corretta da Galileo, Keplero e Newton, porta alla nascita dell'astronomia moderna.",
    "wikipediaSlug": "Nicolaus_Copernicus",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "cosmo-tycho-brahe",
    "title": "Tycho Brahe — osservazioni precise senza telescopio",
    "year": 1572,
    "lat": 55.90,
    "lng": 12.70,
    "category": "cosmo",
    "description": "L'astronomo danese Tycho Brahe, operante tra il 1572 e il 1601 nell'osservatorio di Uraniborg (isola di Hven, Danimarca) e poi a Praga, accumula con strumenti di sua progettazione le osservazioni astronomiche più accurate dell'era pre-telescopica, con errori inferiori a 2 minuti d'arco. Nel 1572 osserva e documenta una «stella nuova» (supernova) nella costellazione di Cassiopea, dimostrando che il cielo stellare — contrariamente all'insegnamento aristotelico — è soggetto a cambiamenti. Propone un sistema «ticonico» intermedio, in cui i pianeti ruotano attorno al Sole e il Sole attorno alla Terra, come compromesso tra Tolomeo e Copernico. I suoi dati, ereditati da Johannes Keplero, permettono a quest'ultimo di formulare le tre leggi del moto planetario.",
    "wikipediaSlug": "Tycho_Brahe",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-galileo-telescopio",
    "title": "Galileo — telescopio, lune di Giove, fasi di Venere",
    "year": 1610,
    "lat": 45.41,
    "lng": 11.88,
    "category": "cosmo",
    "description": "Nel 1609-1610, a Padova e poi a Firenze, Galileo Galilei punta per primo un telescopio verso il cielo con intento sistematico e scientifico, scoprendo montagne sulla Luna, macchie sul Sole, quattro satelliti di Giove (le lune medicee) e le fasi di Venere. Le fasi di Venere — impossibili nel sistema tolemaico ma necessarie in quello copernicano — costituiscono la prima prova osservativa diretta che Venere orbita attorno al Sole. I satelliti di Giove dimostrano che non tutti i corpi celesti ruotano attorno alla Terra. Queste scoperte, pubblicate nel «Sidereus Nuncius» (1610) e nelle «Lettere sulle macchie solari» (1613), forniscono prove cruciali a favore del sistema copernicano e scatenano il conflitto con la Chiesa che porterà al processo del 1633.",
    "wikipediaSlug": "Galileo_Galilei",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-keplero-leggi",
    "title": "Keplero — le tre leggi del moto planetario",
    "year": 1609,
    "lat": 50.08,
    "lng": 14.43,
    "category": "cosmo",
    "description": "Tra il 1609 e il 1619, lavorando a Praga sui dati di Tycho Brahe, il matematico tedesco Johannes Keplero enuncia le tre leggi del moto planetario: i pianeti seguono orbite ellittiche con il Sole in uno dei fuochi (1ª legge, 1609); il raggio vettore pianeta-Sole spazza aree uguali in tempi uguali (2ª legge, 1609); il quadrato del periodo orbitale è proporzionale al cubo del semiasse maggiore (3ª legge, 1619). Abbandonando i cerchi perfetti — un dogma dalla Grecia antica — Keplero scopre che la natura segue ellissi, inaugurando la meccanica celeste matematica. Le sue leggi, spiegate fisicamente da Newton attraverso la legge di gravitazione universale, costituiscono ancora oggi la base del calcolo delle orbite di satelliti, sonde e pianeti.",
    "wikipediaSlug": "Johannes_Kepler",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-newton-gravitazione",
    "title": "Newton — Principia Mathematica e gravitazione universale",
    "year": 1687,
    "lat": 52.20,
    "lng": 0.12,
    "category": "cosmo",
    "description": "Nel 1687 Isaac Newton pubblica i «Philosophiae Naturalis Principia Mathematica», opera che unifica la meccanica terrestre e la meccanica celeste in un'unica legge di gravitazione universale: ogni massa attrae ogni altra massa con una forza proporzionale al prodotto delle masse e inversamente proporzionale al quadrato della distanza. Newton dimostra matematicamente che le leggi di Keplero derivano necessariamente dalla sua legge di gravitazione, e spiega le maree, la precessione degli equinozi e le orbite delle comete. I Principia fondano la fisica classica e dominano la scienza per oltre due secoli, fino alla relatività generale di Einstein. Newton porta a compimento la rivoluzione scientifica iniziata da Copernico, trasformando l'astronomia in una scienza matematica di precisione assoluta.",
    "wikipediaSlug": "Philosophiae_Naturalis_Principia_Mathematica",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "cosmo-halley-cometa",
    "title": "Halley — periodicità delle comete e gravitazione",
    "year": 1705,
    "lat": 51.50,
    "lng": -0.12,
    "category": "cosmo",
    "description": "Nel 1705 l'astronomo inglese Edmond Halley pubblica la «Synopsis Astronomia Cometicae», in cui applica le leggi di Newton alle comete storiche e dimostra che le comete apparse nel 1531, 1607 e 1682 sono in realtà la stessa cometa che percorre un'orbita ellittica attorno al Sole con un periodo di circa 76 anni, prevedendo il suo ritorno per il 1758. Halley muore nel 1742, ma la cometa torna puntualmente nel 1758-1759, confermando in modo spettacolare la teoria newtoniana della gravitazione. La «Cometa di Halley» diventa il simbolo della capacità predittiva della scienza moderna. Halley contribuisce anche al calcolo della distanza Terra-Sole attraverso i transiti di Venere, e scopre il moto proprio delle stelle.",
    "wikipediaSlug": "Edmond_Halley",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-herschel-urano",
    "title": "William Herschel — scoperta di Urano",
    "year": 1781,
    "lat": 51.38,
    "lng": -2.36,
    "category": "cosmo",
    "description": "Il 13 marzo 1781, dall'orto della sua casa a Bath (Inghilterra), l'astronomo William Herschel scopre con il suo telescopio artigianale Urano, il primo pianeta identificato con uno strumento ottico nella storia — tutti i pianeti precedenti (Mercurio, Venere, Marte, Giove, Saturno) erano noti sin dall'antichità a occhio nudo. Inizialmente Herschel lo scambia per una cometa, ma le osservazioni successive rivelano un'orbita quasi circolare: è un pianeta. La scoperta raddoppia le dimensioni note del sistema solare e dimostra che il cosmo può ancora riservare sorprese inesplorate. Herschel e sua sorella Caroline costruiscono telescopi sempre più potenti e catalogano oltre 2500 nebulose e ammassi stellari, fondando l'astronomia stellare moderna.",
    "wikipediaSlug": "William_Herschel",
    "isCosmic": false,
    "tipo": "persona"
  },
  // ── Astronomia moderna (1800–1950) ───────────────────────────────────
  {
    "id": "cosmo-fraunhofer-spettroscopia",
    "title": "Fraunhofer — spettroscopia e composizione delle stelle",
    "year": 1814,
    "lat": 48.14,
    "lng": 11.58,
    "category": "cosmo",
    "description": "Nel 1814 l'ottico tedesco Joseph von Fraunhofer, studiando la luce solare attraverso un prisma ad alta risoluzione, cataloga oltre 570 righe scure nello spettro solare — le «righe di Fraunhofer» — corrispondenti alle lunghezze d'onda assorbite da elementi chimici specifici nell'atmosfera del Sole. Questa scoperta apre la via alla spettroscopia astronomica: analizzando la luce di una stella è possibile determinarne la composizione chimica, la temperatura, la velocità e altre proprietà fisiche senza alcun contatto diretto. Grazie alla spettroscopia, nel XIX secolo gli astronomi dimostrano che le stelle sono composte degli stessi elementi chimici presenti sulla Terra — un risultato straordinario che unifica fisicamente il cosmo. La spettroscopia diventa il principale strumento dell'astrofisica moderna.",
    "wikipediaSlug": "Fraunhofer_lines",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-nettuno-scoperta",
    "title": "Adams e Le Verrier — scoperta di Nettuno per calcolo",
    "year": 1846,
    "lat": 52.52,
    "lng": 13.40,
    "category": "cosmo",
    "description": "Nel 1846 il matematico francese Urbain Le Verrier e il britannico John Couch Adams, indipendentemente, predicono la posizione di un pianeta sconosciuto a partire dalle perturbazioni orbitali di Urano, non spiegabili con la sola gravità del Sole e dei pianeti noti. Il 23 settembre 1846, a Berlino, l'astronomo Johann Galle punta il telescopio nella posizione indicata da Le Verrier e trova Nettuno a meno di 1° dalla previsione. È il trionfo della meccanica celeste newtoniana: un pianeta «scoperto con la penna» prima ancora che con il telescopio. Nettuno è il quinto pianeta più grande del sistema solare e il più lontano dalla Terra. La sua scoperta rafforza la fiducia nel metodo scientifico come strumento di previsione e indagine della realtà.",
    "wikipediaSlug": "Discovery_of_Neptune",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-einstein-relativita",
    "title": "Einstein — Relatività Generale e geometria del cosmo",
    "year": 1915,
    "lat": 52.52,
    "lng": 13.40,
    "category": "cosmo",
    "description": "Nel novembre 1915 Albert Einstein presenta alla Prussian Academy of Sciences le equazioni di campo della Relatività Generale, la teoria che ridefinisce la gravità come curvatura dello spazio-tempo causata dalla presenza di massa ed energia. La nuova teoria supera la gravitazione newtoniana e predice fenomeni nuovi: la deflessione della luce vicino a masse (confermata dall'eclissi del 1919), il redshift gravitazionale delle frequenze luminose, e la precessione del perielio di Mercurio (rimasta inspiegata per decenni). Le equazioni di Einstein ammettono soluzioni cosmologiche che descrivono un universo in espansione o in contrazione — anticipando le scoperte di Hubble. La Relatività Generale è il fondamento della cosmologia moderna, dall'universo in espansione ai buchi neri alle onde gravitazionali.",
    "wikipediaSlug": "General_relativity",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-hubble-galassie",
    "title": "Hubble — le galassie oltre la Via Lattea",
    "year": 1923,
    "lat": 34.22,
    "lng": -118.06,
    "category": "cosmo",
    "description": "Nel 1923 Edwin Hubble, utilizzando il telescopio da 100 pollici del Monte Wilson (California), identifica nella nebulosa di Andromeda una stella cefeide variabile — un tipo di stella la cui luminosità intrinseca è nota — e ne calcola la distanza: circa 900 000 anni luce (il valore moderno è 2,5 milioni). Questo valore è enormemente superiore alle dimensioni della Via Lattea, dimostrando definitivamente che Andromeda è una galassia separata, non una nebulosa appartenente alla nostra galassia. Il risultato, pubblicato nel 1924, risolve il «Grande Dibattito» che divideva la comunità astronomica e trasforma radicalmente l'immagine dell'universo: la Via Lattea non è l'universo intero, ma una delle innumerevoli galassie che lo popolano.",
    "wikipediaSlug": "Edwin_Hubble",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-lemaitre-big-bang",
    "title": "Lemaître — il nucleo primordiale e l'origine dell'universo",
    "year": 1927,
    "lat": 50.88,
    "lng": 4.70,
    "category": "cosmo",
    "description": "Nel 1927 il sacerdote e fisico belga Georges Lemaître pubblica una soluzione alle equazioni di Einstein in cui l'universo è in espansione, e nel 1931 propone la sua ipotesi rivoluzionaria: se l'universo si espande, nel passato doveva essere più piccolo e più caldo, fino a un istante iniziale in cui tutta la materia ed energia era concentrata in un «nucleo primordiale» di dimensioni subatomiche. Questa idea, inizialmente derisa come «Big Bang» dal fisico Fred Hoyle, diventa il fondamento della cosmologia moderna. Lemaître è anche il primo a ricavare indipendentemente la legge di proporzionalità tra velocità di recessione e distanza delle galassie, anticipando Hubble. La sua teoria trova conferma nel 1965 con la scoperta della radiazione cosmica di fondo a microonde.",
    "wikipediaSlug": "Georges_Lemaître",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "cosmo-hubble-espansione",
    "title": "Hubble — la legge dell'espansione dell'universo",
    "year": 1929,
    "lat": 34.22,
    "lng": -118.06,
    "category": "cosmo",
    "description": "Nel 1929 Edwin Hubble pubblica la scoperta più rivoluzionaria della cosmologia del XX secolo: le galassie si allontanano da noi con una velocità proporzionale alla loro distanza (legge di Hubble-Lemaître). Misurando il redshift spettrale di 46 galassie e confrontandolo con le loro distanze stimate, Hubble dimostra che l'universo è in espansione uniforme in tutte le direzioni. Questo risultato implica che, proiettando il moto all'indietro nel tempo, tutte le galassie convergono in un punto iniziale — confermando la teoria del Big Bang di Lemaître. La costante di Hubble (H₀), che misura il tasso di espansione, è ancora oggi uno dei parametri cosmologici più studiati e dibattuti. La scoperta dell'espansione universale cambia per sempre la nostra immagine del cosmo: non è statico ed eterno, ma ha una storia e un inizio.",
    "wikipediaSlug": "Hubble%27s_law",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-penzias-wilson-cmb",
    "title": "Penzias e Wilson — fondo cosmico a microonde",
    "year": 1965,
    "lat": 40.36,
    "lng": -74.18,
    "category": "cosmo",
    "description": "Nel 1965 i fisici americani Arno Penzias e Robert Wilson, lavorando con un'antenna a microonde dei Bell Labs a Holmdel (New Jersey), rilevano un rumore di fondo isotropo e persistente a 2,725 K proveniente uniformemente da ogni direzione del cielo. Inizialmente attribuito a escrementi di piccioni nell'antenna, il segnale corrisponde esattamente alla radiazione cosmica di fondo prevista dalla teoria del Big Bang: il «bagliore» termico residuo dell'universo primordiale, circa 380 000 anni dopo l'evento iniziale. La scoperta, per cui Penzias e Wilson ricevono il Nobel nel 1978, costituisce la prova osservativa definitiva del Big Bang e segna la fine del modello cosmologico stazionario. Lo studio dettagliato della CMB (Cosmic Microwave Background) da parte dei satelliti COBE, WMAP e Planck ha rivelato le fluttuazioni primordiali da cui si sono formate le grandi strutture dell'universo.",
    "wikipediaSlug": "Cosmic_microwave_background",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  // ── Astronomia contemporanea ─────────────────────────────────────────
  {
    "id": "cosmo-hubble-telescopio-spaziale",
    "title": "Telescopio spaziale Hubble — occhi oltre l'atmosfera",
    "year": 1990,
    "lat": 28.39,
    "lng": -80.60,
    "category": "cosmo",
    "description": "Il 24 aprile 1990 lo Space Shuttle Discovery mette in orbita il telescopio spaziale Hubble, il primo grande osservatorio ottico al di sopra dell'atmosfera terrestre, a circa 570 km di quota. Dopo la correzione dell'aberrazione dello specchio primario (1993), Hubble rivoluziona l'astronomia con immagini di nitidezza senza precedenti: misura con precisione la costante di Hubble, fotografa la collisione della cometa Shoemaker-Levy 9 con Giove, rivela migliaia di galassie nelle Hubble Deep Field (1995), documenta l'espansione accelerata dell'universo grazie alle supernove di tipo Ia, e studia l'atmosfera dei pianeti extrasolari. Operativo per oltre 35 anni, Hubble è lo strumento astronomico che più di ogni altro ha avvicinato il grande pubblico alla bellezza e alla complessità del cosmo.",
    "wikipediaSlug": "Hubble_Space_Telescope",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "cosmo-primo-esopianeta",
    "title": "51 Pegasi b — il primo pianeta extrasolare confermato",
    "year": 1995,
    "lat": 46.20,
    "lng": 6.15,
    "category": "cosmo",
    "description": "Il 6 ottobre 1995 gli astronomi svizzeri Michel Mayor e Didier Queloz annunciano a Ginevra la scoperta di 51 Pegasi b, il primo pianeta confermato attorno a una stella di tipo solare al di fuori del sistema solare. Il pianeta è rilevato tramite il metodo della velocità radiale: la sua gravità induce un oscillazione periodica misurabile della stella madre nello spettro luminoso. 51 Pegasi b è un «Giove caldo» — un gigante gassoso che orbita a soli 0,05 UA dalla sua stella con un periodo di 4,2 giorni — una configurazione completamente inaspettata che costringe a ripensare i modelli di formazione planetaria. Mayor e Queloz ricevono il Premio Nobel per la Fisica nel 2019. Da quella scoperta è esplosa l'esopianetologia: ad oggi sono confermati oltre 5700 pianeti extrasolari.",
    "wikipediaSlug": "51_Pegasi_b",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-energia-oscura",
    "title": "Energia oscura — l'espansione accelerata dell'universo",
    "year": 1998,
    "lat": 42.36,
    "lng": -71.09,
    "category": "cosmo",
    "description": "Nel 1998 due team indipendenti di astrofisici — il Supernova Cosmology Project e il High-Z Supernova Search Team — pubblicano la scoperta sconvolgente che l'universo non si espande a velocità decrescente, come previsto dalla gravità, ma si espande in modo accelerato. La prova viene dalle distanze delle supernove di tipo Ia ad alto redshift, che appaiono più lontane del previsto. L'accelerazione è attribuita a una misteriosa forma di energia, denominata «energia oscura», che permea lo spazio e contrasta la gravità su scale cosmologiche. L'energia oscura costituirebbe circa il 68% del contenuto energetico totale dell'universo. La scoperta, per cui Saul Perlmutter, Brian Schmidt e Adam Riess ricevono il Nobel nel 2011, è considerata uno dei risultati scientifici più sorprendenti del XX secolo.",
    "wikipediaSlug": "Dark_energy",
    "isCosmic": false,
    "tipo": "scoperta"
  },
  {
    "id": "cosmo-foto-buco-nero-eht",
    "title": "Prima fotografia di un buco nero — Event Horizon Telescope",
    "year": 2019,
    "lat": 19.82,
    "lng": -155.47,
    "category": "cosmo",
    "description": "Il 10 aprile 2019 la collaborazione Event Horizon Telescope (EHT) — una rete globale di radiotelescopi che simula un telescopio delle dimensioni della Terra — pubblica la prima immagine diretta di un buco nero: l'ombra del buco nero supermassiccio M87*, nel centro della galassia Messier 87, a 55 milioni di anni luce di distanza e con una massa 6,5 miliardi di volte quella del Sole. L'immagine, rossa e sfumata, mostra l'anello di luce attorno alla regione da cui nulla, nemmeno la luce, può sfuggire, confermando visivamente previsioni della Relatività Generale attese da decenni. Nel 2022 EHT pubblica anche l'immagine di Sgr A*, il buco nero al centro della Via Lattea. Queste immagini rappresentano una frontiera storica: la prima osservazione diretta di oggetti che Einstein stesso riteneva impossibili da vedere.",
    "wikipediaSlug": "Event_Horizon_Telescope",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "cosmo-jwst-webb",
    "title": "Telescopio James Webb — l'universo primordiale in infrarosso",
    "year": 2021,
    "lat": 5.16,
    "lng": -52.65,
    "category": "cosmo",
    "description": "Il 25 dicembre 2021 il telescopio spaziale James Webb (JWST) viene lanciato da Kourou, nella Guyana Francese, e posizionato nel punto di Lagrange L2 a 1,5 milioni di km dalla Terra. Con il suo specchio segmentato da 6,5 metri di diametro e la sensibilità nell'infrarosso, JWST è progettato per vedere le primissime galassie dell'universo, formate poche centinaia di milioni di anni dopo il Big Bang. Le prime immagini scientifiche, rilasciate nel luglio 2022, mostrano galassie a redshift mai raggiunti da Hubble, strutture atmosferiche di pianeti extrasolari, e nubi di polvere interstellare in formazione stellare con dettagli mai visti. JWST sta già mettendo alla prova i modelli cosmologici standard, rilevando galassie mature più antiche del previsto e riscrivendo la comprensione dell'universo primordiale.",
    "wikipediaSlug": "James_Webb_Space_Telescope",
    "isCosmic": false,
    "tipo": "evento"
  }
];

const existingIds = new Set(existing.map(function(e) { return e.id; }));
const toAdd = newEvents.filter(function(e) {
  if (existingIds.has(e.id)) { console.log('Skip: ' + e.id); return false; }
  return true;
});
const merged = existing.concat(toAdd);
fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2), 'utf8');
console.log('Added ' + toAdd.length + ' events. Total: ' + merged.length);
