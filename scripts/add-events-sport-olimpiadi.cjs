#!/usr/bin/env node
// Aggiunge eventi sport — olimpiadi, mondiali calcio, atleti iconici, sport storici
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../src/data/events.json');
const existing = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const newEvents = [
  // ── MONDIALI DI CALCIO MANCANTI ─────────────────────────────────────────────
  {
    "id": "sport-coppa-mondo-1934",
    "title": "Coppa del Mondo FIFA 1934 — L'Italia di Pozzo",
    "year": 1934,
    "lat": 41.9028,
    "lng": 12.4964,
    "category": "sport",
    "description": "L'Italia ospita e vince il secondo Campionato Mondiale di Calcio, battendo la Cecoslovacchia 2-1 ai supplementari nella finale di Roma il 10 giugno 1934. Il commissario tecnico Vittorio Pozzo costruisce una squadra solida attorno a giocatori come Giuseppe Meazza, Giovanni Ferrari e Angelo Schiavio. È la prima volta che una nazionale vince il Mondiale in casa propria. Quattro anni dopo, a Parigi 1938, Pozzo guiderà l'Italia al secondo titolo consecutivo, un'impresa ancora irripetuta.",
    "wikipediaSlug": "1934_FIFA_World_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── OLIMPIADI INVERNALI MANCANTI ────────────────────────────────────────────
  {
    "id": "sport-olimpiadi-invernali-1928",
    "title": "Giochi Olimpici Invernali di St. Moritz 1928",
    "year": 1928,
    "lat": 46.4982,
    "lng": 9.8358,
    "category": "sport",
    "description": "I II Giochi Olimpici Invernali si svolgono a St. Moritz, in Svizzera, nel febbraio 1928. Per la prima volta partecipano atleti di 25 nazioni. La Norvegia domina la rassegna: il grande Sonja Henie trionfa nel pattinaggio artistico femminile a soli 15 anni, iniziando una dinastia olimpica che durerà fino al 1936. Lo sci alpino non è ancora disciplina olimpica; predominano il nordico, il pattinaggio e il bob. Questi giochi consolidano il formato dei Giochi Invernali come evento quadriennale separato.",
    "wikipediaSlug": "1928_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1932",
    "title": "Giochi Olimpici Invernali di Lake Placid 1932",
    "year": 1932,
    "lat": 44.2795,
    "lng": -73.9799,
    "category": "sport",
    "description": "Lake Placid, nello stato di New York, ospita i III Giochi Olimpici Invernali nel febbraio 1932. Gli Stati Uniti, paese organizzatore, dominano il medagliere. La Grande Depressione riduce la partecipazione internazionale a soli 17 paesi. Il canadese Irving Jaffee vince due ori nel pattinaggio di velocità. Un episodio controverso: le gare di bob vengono disputate con regole americane, suscitando proteste dei team europei. Cinquant'anni dopo, nel 1980, Lake Placid ospiterà nuovamente i Giochi Invernali.",
    "wikipediaSlug": "1932_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1948",
    "title": "Giochi Olimpici Invernali di St. Moritz 1948 — Il Ritorno dopo la Guerra",
    "year": 1948,
    "lat": 46.4982,
    "lng": 9.8358,
    "category": "sport",
    "description": "Dodici anni dopo l'ultima edizione (Garmisch 1936), i Giochi Olimpici Invernali tornano a St. Moritz nel febbraio 1948. Germania e Giappone sono esclusi come paesi sconfitti. L'Unione Sovietica non partecipa ancora. Nonostante le difficoltà del dopoguerra, 28 nazioni e 669 atleti si ritrovano per celebrare il ritorno alla competizione pacifica. Henri Oreiller vince due ori per la Francia nello sci alpino, sport che debutta ufficialmente come disciplina olimpica in questa edizione.",
    "wikipediaSlug": "1948_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1952",
    "title": "Giochi Olimpici Invernali di Oslo 1952 — La Norvegia sul Trono",
    "year": 1952,
    "lat": 59.9139,
    "lng": 10.7522,
    "category": "sport",
    "description": "Oslo ospita i VI Giochi Olimpici Invernali nel febbraio 1952, la prima volta che i Giochi si svolgono in una capitale. La Norvegia domina sulla neve di casa con 7 ori: Hjalmar Andersen trionfa in tre gare di pattinaggio di velocità. Per la prima volta partecipa anche l'Unione Sovietica ai Giochi Olimpici Invernali, cambiando gli equilibri del medagliere. La cerimonia di apertura vede la staffetta con la torcia olimpica partire da Morgedal, luogo di nascita dello sci moderno.",
    "wikipediaSlug": "1952_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1956",
    "title": "Giochi Olimpici Invernali di Cortina d'Ampezzo 1956 — L'Italia Brilla",
    "year": 1956,
    "lat": 46.5360,
    "lng": 12.1359,
    "category": "sport",
    "description": "Cortina d'Ampezzo ospita i VII Giochi Olimpici Invernali nel gennaio-febbraio 1956: prima edizione trasmessa in televisione, una rivoluzione mediatica. L'URSS debutta ai Giochi Invernali e conquista subito il primo posto nel medagliere. L'italiano Toni Sailer vince tre ori in slalom speciale, slalom gigante e discesa libera — impresa straordinaria che fa di lui una leggenda dello sci alpino. La torcia olimpica viene portata da Roma con la fiamma del Campidoglio. Un trionfo organizzativo per l'Italia del dopoguerra.",
    "wikipediaSlug": "1956_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1960",
    "title": "Giochi Olimpici Invernali di Squaw Valley 1960",
    "year": 1960,
    "lat": 39.1968,
    "lng": -120.2356,
    "category": "sport",
    "description": "Squaw Valley, in California, ospita i VIII Giochi Olimpici Invernali nel febbraio 1960. La cerimonia di apertura è prodotta da Walt Disney. Per la prima volta viene utilizzato un sistema di computer IBM per elaborare i risultati in tempo reale. Il bob viene escluso dal programma per mancanza di pista. L'americana Carol Heiss vince l'oro nel pattinaggio artistico; la nazionale USA di hockey su ghiaccio trionfa a sorpresa. È la prima edizione dei Giochi Invernali trasmessa in televisione negli Stati Uniti.",
    "wikipediaSlug": "1960_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1964",
    "title": "Giochi Olimpici Invernali di Innsbruck 1964",
    "year": 1964,
    "lat": 47.2692,
    "lng": 11.4041,
    "category": "sport",
    "description": "Innsbruck, in Austria, ospita i IX Giochi Olimpici Invernali nel gennaio-febbraio 1964. Per la prima volta partecipano atleti di 36 nazioni. Il clima mite crea problemi: l'esercito austriaco trasporta 20.000 blocchi di ghiaccio e 40.000 metri cubi di neve per garantire le piste. La sovietica Lidia Skoblikova vince quattro ori nel pattinaggio di velocità. L'italiano Eugenio Monti, leggenda del bob, vince il bronzo ma soprattutto è ricordato per il gesto sportivo di prestare un bullone al team britannico che lo utilizza per vincere l'oro.",
    "wikipediaSlug": "1964_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1968",
    "title": "Giochi Olimpici Invernali di Grenoble 1968 — Killy Re delle Alpi",
    "year": 1968,
    "lat": 45.1885,
    "lng": 5.7245,
    "category": "sport",
    "description": "Grenoble, in Francia, ospita i X Giochi Olimpici Invernali nel febbraio 1968. Il francese Jean-Claude Killy vince tre ori in tutte le specialità dello sci alpino — impresa eguagliata a Cortina da Sailer nel 1956 — diventando l'eroe di casa. Per la prima volta i drogaggi vengono testati agli atleti. La televisione a colori trasforma l'evento: 600 milioni di spettatori in tutto il mondo. I Giochi vengono distribuiti su più siti nelle Alpi francesi, inaugurando il modello delle edizioni alpine diffuse.",
    "wikipediaSlug": "1968_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1972",
    "title": "Giochi Olimpici Invernali di Sapporo 1972 — L'Asia Debutta",
    "year": 1972,
    "lat": 43.0618,
    "lng": 141.3544,
    "category": "sport",
    "description": "Sapporo, in Giappone, ospita i XI Giochi Olimpici Invernali nel febbraio 1972 — prima volta che i Giochi Invernali si svolgono in Asia. Lo sciatore spagnolo Francisco Fernández Ochoa vince lo slalom speciale — prima medaglia d'oro olimpica invernale per la Spagna. Karl Schranz, campione austriaco, viene squalificato per professionalismo mascherato, aprendo un dibattito sull'amateurismo olimpico. La soviética Galina Kulakova domina il fondo femminile con tre ori.",
    "wikipediaSlug": "1972_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1976",
    "title": "Giochi Olimpici Invernali di Innsbruck 1976",
    "year": 1976,
    "lat": 47.2692,
    "lng": 11.4041,
    "category": "sport",
    "description": "Innsbruck torna ad ospitare i XII Giochi Olimpici Invernali nel febbraio 1976, dopo che Denver (scelta originale) aveva rinunciato per referendum popolare nel 1972. È la prima volta che una città ospita i Giochi Invernali per la seconda volta. Franz Klammer vince la discesa libera davanti al pubblico austriaco in una delle discese più emozionanti della storia olimpica. La sovietica Rosi Mittermaier conquista due ori e un argento in slalom e discesa. L'URSS domina il medagliere generale.",
    "wikipediaSlug": "1976_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1992",
    "title": "Giochi Olimpici Invernali di Albertville 1992",
    "year": 1992,
    "lat": 45.6753,
    "lng": 6.3927,
    "category": "sport",
    "description": "Albertville, in Francia, ospita i XVI Giochi Olimpici Invernali nel febbraio 1992. È l'ultima edizione disputata nello stesso anno dei Giochi Estivi: dal 1994 le due manifestazioni si alternano ogni due anni. Bonnie Blair vince per gli USA nel pattinaggio di velocità; il norvegese Bjørn Dæhlie domina il fondo maschile. L'italiano Alberto Tomba vince l'oro nello slalom gigante, difendendo il titolo di Seul 1988. La Croazia e la Slovenia partecipano per la prima volta come nazioni indipendenti.",
    "wikipediaSlug": "1992_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1998",
    "title": "Giochi Olimpici Invernali di Nagano 1998",
    "year": 1998,
    "lat": 36.6485,
    "lng": 138.1957,
    "category": "sport",
    "description": "Nagano, in Giappone, ospita i XVIII Giochi Olimpici Invernali nel febbraio 1998. Per la prima volta i giocatori NBA partecipano al torneo di hockey su ghiaccio con i team nazionali. Il ceco Dominik Hašek porta la Repubblica Ceca all'oro sorprendente nel hockey. Debutta lo snowboard come disciplina olimpica. Il finlandese Mika Myllylä trionfa nel fondo. Il giapponese Kazuyoshi Funaki vince l'oro nel salto con gli sci davanti al pubblico di casa, scatenando l'entusiasmo della nazione ospitante.",
    "wikipediaSlug": "1998_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2002",
    "title": "Giochi Olimpici Invernali di Salt Lake City 2002",
    "year": 2002,
    "lat": 40.7608,
    "lng": -111.8910,
    "category": "sport",
    "description": "Salt Lake City ospita i XIX Giochi Olimpici Invernali nel febbraio 2002, soli cinque mesi dopo gli attentati dell'11 settembre. I Giochi si svolgono in un clima di tensione e rafforzata sicurezza. Lo scandalo del pattinaggio artistico a coppie — i giudici francesi pilotano i punteggi — porta all'assegnazione di un secondo oro alla coppia canadiana Sale-Pelletier. Il biathleta norvegese Ole Einar Bjørndalen vince quattro ori. Debuttano le specialità di freestyle e i short track diventano più popolari.",
    "wikipediaSlug": "2002_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2006",
    "title": "Giochi Olimpici Invernali di Torino 2006 — L'Italia Splende",
    "year": 2006,
    "lat": 45.0703,
    "lng": 7.6869,
    "category": "sport",
    "description": "Torino ospita i XX Giochi Olimpici Invernali nel febbraio 2006 — seconda volta per l'Italia dopo Cortina 1956. L'atleta italiana Armin Zöggeler vince l'oro nel singolo di slittino per la seconda volta consecutiva. La cerimonia di apertura allo Stadio Olimpico Comunale è uno spettacolo di 2 ore curato da Peter Gabriel e Yoko Ono. L'Italia termina al quinto posto nel medagliere con 5 ori. Lo snowboardista americano Shaun White vince il primo dei suoi ori olimpici nell'halfpipe. Partecipano atleti di 80 nazioni.",
    "wikipediaSlug": "2006_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2010",
    "title": "Giochi Olimpici Invernali di Vancouver 2010",
    "year": 2010,
    "lat": 49.2827,
    "lng": -123.1207,
    "category": "sport",
    "description": "Vancouver ospita i XXI Giochi Olimpici Invernali nel febbraio 2010. La tragedia colpisce i Giochi il giorno delle cerimonie di apertura: il lugger georgiano Nodar Kumaritashvili muore in allenamento. Il Canada vince per la prima volta l'oro nel hockey su ghiaccio maschile in casa, davanti a 22 milioni di telespettatori — la partita più seguita nella storia canadese. Il pattinatore sudcoreano Kim Yu-na stabilisce il record mondiale nel pattinaggio artistico. Il Canada chiude con 14 ori, record assoluto per un paese ospitante.",
    "wikipediaSlug": "2010_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2014",
    "title": "Giochi Olimpici Invernali di Sochi 2014",
    "year": 2014,
    "lat": 43.5853,
    "lng": 39.7203,
    "category": "sport",
    "description": "Sochi, stazione balneare russa sul Mar Nero, ospita i XXII Giochi Olimpici Invernali nel febbraio 2014. Con 51 miliardi di dollari è l'edizione più costosa della storia olimpica. La Russia vince il medagliere con 13 ori — poi parzialmente revocati per doping di stato, il più grave scandalo doping della storia olimpica. Viktor Ahn, patinator sudcoreano naturalizzato russo, vince tre ori. L'olandese Sven Kramer domina il pattinaggio di velocità. La crisi ucraina scoppia pochi giorni dopo la chiusura dei Giochi.",
    "wikipediaSlug": "2014_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2018",
    "title": "Giochi Olimpici Invernali di PyeongChang 2018",
    "year": 2018,
    "lat": 37.5665,
    "lng": 128.3635,
    "category": "sport",
    "description": "PyeongChang, in Corea del Sud, ospita i XXIII Giochi Olimpici Invernali nel febbraio 2018. Momento storico: le due Coree sfilano sotto un'unica bandiera e formano una squadra comune nel hockey su ghiaccio femminile — gesto di distensione diplomatica nella penisola coreana. Lo snowboardista americano Shaun White vince il suo terzo oro nell'halfpipe. I Curling si rivelano uno degli sport più seguiti in streaming. Gli atleti olimpici russi gareggiano sotto la bandiera neutrale OAR per le sanzioni doping.",
    "wikipediaSlug": "2018_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-2022",
    "title": "Giochi Olimpici Invernali di Pechino 2022",
    "year": 2022,
    "lat": 39.9042,
    "lng": 116.4074,
    "category": "sport",
    "description": "Pechino ospita i XXIV Giochi Olimpici Invernali nel febbraio 2022, diventando la prima città ad aver organizzato sia i Giochi Estivi (2008) che quelli Invernali. I Giochi si svolgono in un contesto geopolitico teso — diplomatico boicottaggio da parte di USA, GB, Australia — e nel pieno della pandemia Covid-19, con pubblico limitato. La norvegese Therese Johaug domina il fondo femminile. L'italiana Sofia Goggia vince l'argento in discesa nonostante una caduta 23 giorni prima. La Norvegia vince il medagliere con 16 ori.",
    "wikipediaSlug": "2022_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── ATLETI ICONICI ──────────────────────────────────────────────────────────
  {
    "id": "sport-michael-phelps-1985",
    "title": "Michael Phelps — Il Nuotatore più Decorato della Storia",
    "year": 1985,
    "lat": 39.2904,
    "lng": -76.6122,
    "category": "sport",
    "description": "Michael Phelps nasce a Baltimora, Maryland, il 30 giugno 1985. Con 23 ori, 3 argenti e 2 bronzi olimpici — 28 medaglie totali — è il nuotatore e l'atleta più decorato della storia delle Olimpiadi. Il suo momento più iconico è Pechino 2008, dove vince 8 ori in 8 gare in 9 giorni, superando il record di Mark Spitz. Specialista dello stile libero, del delfino e del misto individuale, stabilisce 39 record del mondo nel corso della carriera. Ritiratosi nel 2016, ha lottato pubblicamente contro la depressione e l'ansia, diventando portavoce della salute mentale degli atleti.",
    "wikipediaSlug": "Michael_Phelps",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-valentino-rossi-1979",
    "title": "Valentino Rossi — Il Dottore della MotoGP",
    "year": 1979,
    "lat": 43.6158,
    "lng": 13.5189,
    "category": "sport",
    "description": "Valentino Rossi nasce a Urbino il 16 febbraio 1979. Con 9 titoli mondiali — 7 nella classe MotoGP — è il pilota di motociclismo più titolato della storia moderna. Soprannominato 'Il Dottore' per la sua capacità di analisi tecnica, vince con Honda (2001-2003) e poi con Yamaha (2004-2005, 2008-2009), dimostrando che il suo talento supera il mezzo. Il 'Ranch' di Tavullia diventa il suo laboratorio permanente. La rivalità con Max Biaggi, poi con Jorge Lorenzo e Marc Márquez, tiene il pubblico con il fiato sospeso per due decenni. Si ritira nel 2021 a 42 anni.",
    "wikipediaSlug": "Valentino_Rossi",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-eddy-merckx-1945",
    "title": "Eddy Merckx — Il Cannibale del Ciclismo",
    "year": 1945,
    "lat": 50.8503,
    "lng": 4.3517,
    "category": "sport",
    "description": "Eddy Merckx nasce a Meensel-Kiezegem, in Belgio, il 17 giugno 1945. Soprannominato 'Il Cannibale' per la sua voracità di vittorie, è universalmente considerato il più grande ciclista di tutti i tempi. In carriera vince 5 Tour de France, 5 Giri d'Italia, 3 Mondiali, 7 classiche. Stabilisce il record dell'ora nel 1972 a Città del Messico (49,431 km), migliorato solo decenni dopo con biciclette tecnologicamente superiori. La sua forza era sia fisica che tattica: sapeva vincere in pianura, in montagna, a cronometro e nelle classiche. La carriera dura dal 1965 al 1978.",
    "wikipediaSlug": "Eddy_Merckx",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-marco-pantani-1970",
    "title": "Marco Pantani — Il Pirata delle Montagne",
    "year": 1970,
    "lat": 44.0647,
    "lng": 12.5676,
    "category": "sport",
    "description": "Marco Pantani nasce a Cesena il 13 gennaio 1970. Scalatore puro con uno stile di attacco inimitabile, vince nel 1998 sia il Tour de France che il Giro d'Italia — 'doppietta' che non si ripeteva dal 1970. Le sue salite sull'Alpe d'Huez e al Galibier nel Tour '98 sono tra le pagine più esaltanti della storia del ciclismo. Nel 1999 viene escluso dal Giro in maglia rosa per valori anomali di ematocrito — pur non essendo squalificato. Il suo declino è rapido e tragico: muore il 14 febbraio 2004 a Rimini per overdose di cocaina, lasciando il mondo dello sport in lutto.",
    "wikipediaSlug": "Marco_Pantani",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-fausto-coppi-1919",
    "title": "Fausto Coppi — Il Campionissimo",
    "year": 1919,
    "lat": 44.6948,
    "lng": 8.5333,
    "category": "sport",
    "description": "Fausto Coppi nasce a Castellania (Alessandria) il 15 settembre 1919. Soprannominato 'Il Campionissimo', è considerato il più grande ciclista italiano del dopoguerra. Vince 5 Giri d'Italia (1940, 1947, 1949, 1952, 1953), 2 Tour de France (1949, 1952) e 3 Mondiali su pista. La rivalità con Gino Bartali — incarnazione di due Italie diverse, laica e cattolica — appassiona una nazione. La sua storia personale è segnata dalla guerra, dalla morte del fratello Serse in corsa, e dalla relazione scandalosa con la 'Dama Bianca'. Muore a 40 anni il 2 gennaio 1960 per malaria contratta durante un safari.",
    "wikipediaSlug": "Fausto_Coppi",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-gino-bartali-1914",
    "title": "Gino Bartali — L'Uomo di Ferro",
    "year": 1914,
    "lat": 43.7696,
    "lng": 11.2558,
    "category": "sport",
    "description": "Gino Bartali nasce a Ponte a Ema, vicino a Firenze, il 18 luglio 1914. 'Ginettaccio', 'l'Uomo di ferro', vince 3 Giri d'Italia (1936, 1938, 1946) e 2 Tour de France (1938, 1948) — il secondo a dieci anni dal primo, 34 anni. La sua vittoria al Tour del 1948, il giorno dell'attentato a Togliatti, è leggenda: si dice che abbia contribuito a calmare le tensioni politiche. Meno noto ma fondamentale: durante la Seconda Guerra Mondiale Bartali nasconde documenti falsi per salvare centinaia di ebrei italiani dalla deportazione. Yad Vashem lo ha riconosciuto 'Giusto tra le Nazioni' nel 2013.",
    "wikipediaSlug": "Gino_Bartali",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-alberto-tomba-1966",
    "title": "Alberto Tomba — La Bomba dello Sci Alpino",
    "year": 1966,
    "lat": 44.4949,
    "lng": 11.3426,
    "category": "sport",
    "description": "Alberto Tomba nasce a San Luca (Bologna) il 19 dicembre 1966. Soprannominato 'La Bomba', è il più grande sciatore alpino della storia italiana e uno dei più carismatici di sempre. Vince 3 ori olimpici: slalom gigante e speciale a Calgary 1988, gigante ad Albertville 1992. La sua versatilità tecnica è straordinaria, ma la sua personalità esuberante lo rende un personaggio mediatico globale. In Coppa del Mondo vince 50 gare — record europeo per un uomo nelle tecniche. La rivalità con i rivali tedeschi e austriaci anima gli anni '80 e '90. Si ritira nel 1998 dopo Nagano.",
    "wikipediaSlug": "Alberto_Tomba",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-michael-schumacher-1969",
    "title": "Michael Schumacher — Il Dominatore della Formula 1",
    "year": 1969,
    "lat": 50.9333,
    "lng": 6.9500,
    "category": "sport",
    "description": "Michael Schumacher nasce a Hürth, in Germania, il 3 gennaio 1969. Con 7 titoli mondiali di Formula 1 — 5 consecutivi con la Ferrari dal 2000 al 2004 — è il pilota più titolato della storia del motorsport insieme a Lewis Hamilton. In carriera vince 91 Gran Premi, un record che Hamilton supera nel 2020. La sua precisione tecnica, la capacità di far sviluppare la macchina e la mentalità vincente lo rendono il modello del pilota moderno. Nel 2013 un grave incidente sugli sci in Val Meribel gli provoca un trauma cranico gravissimo: da allora vive in condizioni di salute riservate dalla famiglia.",
    "wikipediaSlug": "Michael_Schumacher",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-tazio-nuvolari-1892",
    "title": "Tazio Nuvolari — Il Mantovano Volante",
    "year": 1892,
    "lat": 45.1561,
    "lng": 10.7913,
    "category": "sport",
    "description": "Tazio Nuvolari nasce a Castel d'Ario, in provincia di Mantova, il 16 novembre 1892. Soprannominato 'Il Mantovano Volante', è considerato da molti — tra cui Enzo Ferrari e Ferdinand Porsche — il più grande pilota automobilistico di tutti i tempi. Vince due volte la Mille Miglia (1930, 1933), la Targa Florio, il Gran Premio d'Italia, le 24 Ore di Le Mans. La sua vittoria al GP di Germania del 1935 sull'Alfa Romeo contro le inarrestabili Mercedes e Auto Union tedesche davanti ad Adolf Hitler è leggenda. Pilota prima di moto, poi di auto, simboleggia l'eroismo romantico dello sport del motore.",
    "wikipediaSlug": "Tazio_Nuvolari",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-simone-biles-1997",
    "title": "Simone Biles — La più Grande Ginnasta di Sempre",
    "year": 1997,
    "lat": 29.7604,
    "lng": -95.3698,
    "category": "sport",
    "description": "Simone Biles nasce a Columbus (Ohio) il 14 marzo 1997. Con 7 ori olimpici e 30 medaglie mondiali, è la ginnasta più decorata della storia. Il suo vocabolario tecnico include almeno 4 elementi che portano il suo nome nei codici FIG — difficoltà mai tentate da altre ginnaste. A Tokyo 2020 si ritira dalla competizione a squadre per salvaguardare la propria salute mentale — gesto che scatena un dibattito globale e cambia la narrativa sullo sport d'élite. Torna a Parigi 2024 con 4 medaglie tra cui due ori. È anche sopravvissuta all'abuso sessuale sistematico del medico della squadra USA, Larry Nassar.",
    "wikipediaSlug": "Simone_Biles",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-tiger-woods-1975",
    "title": "Tiger Woods — Il Fenomeno del Golf",
    "year": 1975,
    "lat": 33.7879,
    "lng": -117.8531,
    "category": "sport",
    "description": "Tiger Woods nasce a Cypress, California, il 30 dicembre 1975. Con 15 titoli Major e 82 vittorie sul PGA Tour — record assoluto — è considerato il più grande golfista della storia moderna. Nel 1997 vince il Masters di Augusta a soli 21 anni con 12 colpi di vantaggio, record assoluto. La sua dominanza trasforma il golf in uno sport seguito anche da chi non lo pratica. Soprannominato 'Tiger' per un amico vietnamita del padre, ha origini afroamericane, thailandesi, cinesi, olandesi e indiane — simbolo della nuova America multietnica. Gli scandali del 2009 e un grave incidente stradale nel 2021 non cancellano la sua leggenda.",
    "wikipediaSlug": "Tiger_Woods",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-lionel-messi-1987",
    "title": "Lionel Messi — La Pulga che ha Conquistato il Mondo",
    "year": 1987,
    "lat": -32.9468,
    "lng": -60.6393,
    "category": "sport",
    "description": "Lionel Messi nasce a Rosario, Argentina, il 24 giugno 1987. Vincitore di 8 Palloni d'Oro, 4 Champions League con il Barcellona, 10 titoli de Liga, 1 Coppa America (2021) e la Coppa del Mondo 2022 con l'Argentina — l'unico trofeo che mancava alla sua leggenda. Cresciuto nella Masia del Barcellona, dove la cura della sua carenza di ormone della crescita viene pagata dal club, Messi sviluppa un dribbling unico basato sul basso baricentro e l'accelerazione esplosiva. Con 672 gol in 778 partite col Barcellona stabilisce record dopo record. La finale di Qatar 2022 contro la Francia, vinta ai rigori, è considerata la finale più bella della storia dei Mondiali.",
    "wikipediaSlug": "Lionel_Messi",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-cristiano-ronaldo-1985",
    "title": "Cristiano Ronaldo — CR7, il Guerriero del Gol",
    "year": 1985,
    "lat": 32.6669,
    "lng": -16.9241,
    "category": "sport",
    "description": "Cristiano Ronaldo nasce a Funchal, Madeira, il 5 febbraio 1985. Con 5 Palloni d'Oro, 5 Champions League (1 col Manchester United, 4 col Real Madrid), 7 titoli di campionato in 4 paesi diversi e il record assoluto di gol in competizioni ufficiali, è il rivale storico di Messi nel dibattito sul G.O.A.T. della storia del calcio. Il suo fisico straordinario, forgiato da un allenamento ossessivo, gli permette di competere ai massimi livelli fino a 40 anni. Vince con il Portogallo gli Europei 2016 — il più grande risultato della storia del calcio portoghese. CR7 come soprannome nasce dalla sua maglia numero 7.",
    "wikipediaSlug": "Cristiano_Ronaldo",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-lebron-james-1984",
    "title": "LeBron James — Il Re del Basket",
    "year": 1984,
    "lat": 41.0534,
    "lng": -81.5190,
    "category": "sport",
    "description": "LeBron James nasce ad Akron, Ohio, il 30 dicembre 1984. Con 4 titoli NBA (Cleveland 2016, Miami 2012-2013, Los Angeles 2020), 4 MVP delle Finals e 4 MVP della stagione regolare, è il candidato più forte al titolo di miglior giocatore NBA di sempre, in rivalità eterna con Michael Jordan. La sua vittoria del 2016 con Cleveland — da 3-1 sotto nei gironi contro Golden State — è considerata la rimonta più straordinaria della storia NBA. A 40 anni suona il campanello con i Lakers, ancora competitivo. Con il figlio Bronny gioca nella stessa squadra nel 2024, primo padre-figlio nella storia NBA.",
    "wikipediaSlug": "LeBron_James",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-lance-armstrong-1971",
    "title": "Lance Armstrong — Sette Tour e lo Scandalo del Doping",
    "year": 1971,
    "lat": 30.2672,
    "lng": -97.7431,
    "category": "sport",
    "description": "Lance Armstrong nasce a Plano, Texas, il 18 settembre 1971. Sopravvissuto a un cancro ai testicoli con metastasi cerebrali e polmonari (1996), vince sette Tour de France consecutivi dal 1999 al 2005 — impresa atletica apparentemente sovrumana. Diventa il simbolo della rinascita e dell'impossibile superato con la forza di volontà. Nel 2012 l'USADA lo squalifica a vita e revoca tutti i titoli dopo un'indagine che rivela un sistematico programma di doping — EPO, trasfusioni di sangue, ormoni. Armstrong ammette tutto in un'intervista televisiva con Oprah Winfrey nel 2013. La sua storia è tra le cadute più clamorose dello sport moderno.",
    "wikipediaSlug": "Lance_Armstrong",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-rafael-nadal-2001",
    "title": "Rafael Nadal — Il Re della Terra Rossa",
    "year": 2001,
    "lat": 39.5556,
    "lng": 3.1162,
    "category": "sport",
    "description": "Rafael Nadal di Manacor, Maiorca, inizia la sua ascesa tra i professionisti nel 2001 a soli 15 anni. Con 22 titoli del Grande Slam — il record assoluto all'uscita di scena nel 2024 — domina un'era condivisa con Federer e Djokovic nella più competitiva nella storia del tennis. Il suo dominio su Roland Garros è senza precedenti: 14 titoli in 18 partecipazioni. Il gioco iperdinamico, la resistenza fisica leggendaria e la mentalità guerriera lo rendono imbattibile sulla terra rossa. La rivalità con Roger Federer è universalmente considerata la più bella della storia del tennis: 24 precedenti in finali Slam, 14-10 per Nadal.",
    "wikipediaSlug": "Rafael_Nadal",
    "isCosmic": false,
    "tipo": "persona"
  },

  // ── SPORT ITALIANI ──────────────────────────────────────────────────────────
  {
    "id": "sport-giro-ditalia-fondazione-1909",
    "title": "Il Giro d'Italia — Nasce la Corsa Rosa",
    "year": 1909,
    "lat": 45.4654,
    "lng": 9.1859,
    "category": "sport",
    "description": "Il 13 maggio 1909 parte da Milano la prima edizione del Giro d'Italia, organizzata dal giornale La Gazzetta dello Sport che la usa per aumentare le vendite — come aveva già fatto Le Vélo in Francia con il Tour nel 1903. Il percorso di 2.448 km si sviluppa in 8 tappe con partenze notturne. Vince Luigi Ganna, muratore varesino di 26 anni. La 'maglia rosa' — colore del giornale — viene introdotta solo nel 1931. Il Giro diventa subito il secondo grande giro ciclistico del mondo e il più importante evento sportivo italiano dell'anno.",
    "wikipediaSlug": "Giro_d%27Italia",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-superga-1949",
    "title": "La Tragedia di Superga — Il Grande Torino Scompare",
    "year": 1949,
    "lat": 45.0778,
    "lng": 7.7679,
    "category": "sport",
    "description": "Il 4 maggio 1949, alle 17:03, l'aereo che riporta il Grande Torino da Lisbona si schianta contro la basilica di Superga, sulla collina torinese: 31 morti, tra cui l'intera squadra campione d'Italia per 5 anni consecutivi (1942-1949). Valentino Mazzola, il capitano, il più forte calciatore italiano del tempo, muore con i suoi compagni. Il Torino si è fermato a soli quattro giornate dalla fine del campionato — per rispetto, le partite vengono disputate dalle squadre giovanili. La tragedia di Superga rimane il lutto sportivo più profondo d'Italia.",
    "wikipediaSlug": "Superga_air_disaster",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-formula1-prima-stagione-1950",
    "title": "Formula 1 — Nasce il Campionato del Mondo",
    "year": 1950,
    "lat": 52.0786,
    "lng": -1.0169,
    "category": "sport",
    "description": "Il 13 maggio 1950 a Silverstone, in Gran Bretagna, prende il via il primo Gran Premio del Campionato Mondiale di Formula 1, con il Re Giorgio VI in tribuna. Il campionato inaugura una nuova era del motorsport: 6 Gran Premi la prima stagione, vinti principalmente dalle Alfa Romeo italiane. Il primo campione del mondo è l'argentino Juan Manuel Fangio su Alfa Romeo. La Formula 1 diventerà nel tempo lo sport automobilistico più seguito al mondo, combinando tecnologia all'avanguardia, rischio, glamour e grandi rivalità tra piloti e costruttori.",
    "wikipediaSlug": "1950_Formula_One_season",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-ferrari-prima-vittoria-f1-1951",
    "title": "Ferrari — La Prima Vittoria in Formula 1",
    "year": 1951,
    "lat": 44.5333,
    "lng": 11.0333,
    "category": "sport",
    "description": "Il 27 luglio 1951, al Gran Premio di Gran Bretagna di Silverstone, la Ferrari vince la sua prima gara nel Campionato Mondiale di Formula 1 con l'argentino José Froilán González. Enzo Ferrari, 53 anni, piange di gioia e dolore insieme: ha battuto l'Alfa Romeo, la casa per cui aveva corso e lavorato per vent'anni. Da quel momento la Ferrari diventa la scuderia più titolata della Formula 1: 16 titoli costruttori, piloti come Fangio, Lauda, Schumacher, Vettel. Il 'Cavallino Rampante' diventa il simbolo del motorsport mondiale e dell'eccellenza italiana.",
    "wikipediaSlug": "Ferrari_in_Formula_One",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-coppa-del-mondo-sci-fondazione-1966",
    "title": "Coppa del Mondo di Sci Alpino — Nasce il Circuito",
    "year": 1966,
    "lat": 47.3769,
    "lng": 8.5417,
    "category": "sport",
    "description": "Nel 1966 viene istituita la Coppa del Mondo di Sci Alpino, circuito stagionale che premia il miglior sciatore complessivo su tutte le specialità (discesa, super-G, gigante, slalom). La prima edizione, nel 1967, è vinta dal francese Jean-Claude Killy negli uomini e dall'austriaca Nancy Greene nelle donne. L'Italia conquista la coppa con Alberto Tomba negli anni '90, con Pirmin Zurbriggen negli anni '80, e in tempi recenti con Federica Brignone (2020) — prima italiana a vincere la classifica generale assoluta. Il circuito conta oggi oltre 80 gare in 20 paesi.",
    "wikipediaSlug": "Alpine_Ski_World_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── SPORT STORICI E TAPPE FONDAMENTALI ────────────────────────────────────
  {
    "id": "sport-tour-de-france-prima-1903",
    "title": "Tour de France — La Prima Grande Corsa a Tappe",
    "year": 1903,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Il 1° luglio 1903 parte da Montgeron (Parigi) la prima edizione del Tour de France, organizzata dal giornale L'Auto: 6 tappe, 2.428 km, 60 partecipanti. Vince Maurice Garin con 94 ore, 33 minuti e 14 secondi di percorrenza. L'idea nasce dal direttore Géo Lefèvre per battere la concorrenza del rivale Le Vélo: funziona così bene che il giornale concorrente chiude entro l'anno. Il Tour diventa la corsa ciclistica più famosa al mondo e la terza kermesse sportiva più seguita in assoluto dopo le Olimpiadi e i Mondiali di calcio.",
    "wikipediaSlug": "1903_Tour_de_France",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-wimbledon-prima-1877",
    "title": "Wimbledon — Il Primo Torneo di Tennis della Storia",
    "year": 1877,
    "lat": 51.4344,
    "lng": -0.2149,
    "category": "sport",
    "description": "Il 9 luglio 1877 si gioca a Wimbledon, Londra, il primo torneo di tennis della storia moderna: 22 partecipanti, soli uomini, sul prato dell'All England Lawn Tennis and Croquet Club. Vince Spencer Gore, giocando tutto in attacco a rete. L'anno dopo Gore non difende il titolo — dice che il tennis è troppo noioso. Da allora Wimbledon si svolge ogni anno (eccetto 1915-1918 e 1940-1945) diventando il più antico e prestigioso torneo del Grand Slam. Le tradizioni sono rigide: abiti bianchi, fragole con panna, silenzio durante i game.",
    "wikipediaSlug": "The_Championships,_Wimbledon",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-basket-invenzione-1891",
    "title": "James Naismith Inventa il Basket — Il Gioco dei Cesti",
    "year": 1891,
    "lat": 42.1015,
    "lng": -72.5898,
    "category": "sport",
    "description": "Nel dicembre 1891 il professor canadese James Naismith, incaricato di trovare uno sport invernale al chiuso per i suoi studenti a Springfield, Massachusetts, inventa il basket. Appende due cesti di pesche alle balaustre della palestra e redige 13 regole fondamentali. Il gioco si diffonde rapidamente: nel 1936 entra alle Olimpiadi di Berlino; nel 1946 nasce la NBA; oggi conta 450 milioni di praticanti nel mondo. Naismith è l'unico uomo che abbia inventato da solo uno sport olimpico diventato globale.",
    "wikipediaSlug": "James_Naismith",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-nba-fondazione-1946",
    "title": "Fondazione della NBA — Il Basket Professionistico Nasce",
    "year": 1946,
    "lat": 40.7128,
    "lng": -74.0060,
    "category": "sport",
    "description": "Il 6 giugno 1946 a New York viene fondata la Basketball Association of America (BAA), che nel 1949 si fonde con la National Basketball League dando vita alla NBA. La lega nasce per riempire i palazzetti dello sport vuoti durante l'estate. Originariamente 11 squadre nel nord-est degli USA. La NBA diventa globale negli anni '80 con Magic Johnson e Larry Bird, poi con Michael Jordan e il Dream Team olimpico del 1992. Oggi conta 30 franchigie e genera 10 miliardi di dollari l'anno, con giocatori da 42 paesi.",
    "wikipediaSlug": "National_Basketball_Association",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-super-bowl-prima-1967",
    "title": "Il Primo Super Bowl — Nasce la Finale del Football Americano",
    "year": 1967,
    "lat": 34.0195,
    "lng": -118.4912,
    "category": "sport",
    "description": "Il 15 gennaio 1967 al Los Angeles Memorial Coliseum si gioca il primo Super Bowl: i Green Bay Packers di Vince Lombardi battono 35-10 i Kansas City Chiefs. La partita non va sold out — curiosità storica considerando che il Super Bowl è oggi l'evento televisivo più visto degli USA con 115 milioni di spettatori. Il termine 'Super Bowl' viene coniato dall'owner dei Chiefs, Lamar Hunt, ispirandosi al Super Ball, una palla rimbalzante giocattolo del figlio. L'evento diventa anche il palcoscenico pubblicitario più costoso: 30 secondi di spot costano 7 milioni di dollari nel 2024.",
    "wikipediaSlug": "Super_Bowl_I",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-rugby-world-cup-prima-1987",
    "title": "Prima Coppa del Mondo di Rugby 1987",
    "year": 1987,
    "lat": -36.8485,
    "lng": 174.7633,
    "category": "sport",
    "description": "Nel maggio 1987 si svolge in Nuova Zelanda e Australia la prima Coppa del Mondo di Rugby Union. 16 squadre partecipano al torneo inaugurale. La Nuova Zelanda — gli All Blacks — vince il primo titolo mondiale battendo in finale la Francia 29-9 all'Eden Park di Auckland. Il torneo, che si svolge ogni 4 anni, cresce rapidamente: nel 2019 il Giappone ospita il primo Mondiale asiatico, vinto dal Sudafrica. Gli All Blacks sono considerati la squadra più forte e più vincente della storia di qualsiasi sport di squadra.",
    "wikipediaSlug": "1987_Rugby_World_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-paris-roubaix-prima-1896",
    "title": "Parigi-Roubaix — La Regina delle Classiche",
    "year": 1896,
    "lat": 50.6936,
    "lng": 3.1714,
    "category": "sport",
    "description": "Il 19 aprile 1896 si svolge la prima edizione della Parigi-Roubaix, una delle classiche più dure del ciclismo: 257 km da Parigi a Roubaix nel Nord della Francia, su strade di pavé (acciottolato) che filtrano i ciclisti come una prova di sopravvivenza. Vince Josef Fischer in 9 ore e 17 minuti. Soprannominata 'l'Inferno del Nord' per le condizioni brutali del percorso — fango, buche, vibrazione costante — è la classica monumento che più affascina. Eddy Merckx la vince 3 volte; il belga Roger De Vlaeminck 4 volte.",
    "wikipediaSlug": "Paris%E2%80%93Roubaix",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-24ore-lemans-prima-1923",
    "title": "24 Ore di Le Mans — Nasce la Gara di Resistenza",
    "year": 1923,
    "lat": 47.9567,
    "lng": 0.2075,
    "category": "sport",
    "description": "Il 26 maggio 1923 si svolge la prima edizione delle 24 Ore di Le Mans, gara di durata automobilistica sul circuito della Sarthe, in Francia. Vincono André Lagache e René Léonard su Chenard-Walcker. La gara, che dura esattamente un giorno e una notte, diventa la prova suprema per affidabilità e velocità: vince chi percorre più chilometri in 24 ore. Le Mans è anche il banco di prova tecnologico per i costruttori: Ferrari, Porsche, Audi, Toyota si affrontano ogni anno. Ford vince nel 1966 battendo Ferrari — storia raccontata nel film Le Mans '66.",
    "wikipediaSlug": "24_Hours_of_Le_Mans",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-autodromo-monza-1922",
    "title": "Autodromo Nazionale di Monza — Il Tempio della Velocità",
    "year": 1922,
    "lat": 45.6156,
    "lng": 9.2810,
    "category": "sport",
    "description": "Il 28 maggio 1922 viene inaugurato l'Autodromo Nazionale di Monza, vicino a Milano: costruito in soli 110 giorni con 3.500 operai, è ancora oggi uno dei circuiti più veloci della Formula 1. Il primo Gran Premio d'Italia si svolge qui il 10 settembre 1922. Monza è diventata la casa della Ferrari e della tifoseria italiana — i 'tifosi' del Tempio della Velocità. Il circuito cambia configurazione nel tempo ma mantiene i suoi rettilinei lunghissimi che permettono velocità medie superiori ai 260 km/h. La tragedia di Ayrton Senna a Imola 1994 si svolge su un altro autodromo, ma Monza rimane il cuore del motorsport italiano.",
    "wikipediaSlug": "Autodromo_Nazionale_Monza",
    "isCosmic": false,
    "tipo": "luogo"
  },
  {
    "id": "sport-roger-bannister-1954",
    "title": "Roger Bannister — Il Miglio in Meno di 4 Minuti",
    "year": 1954,
    "lat": 51.7520,
    "lng": -1.2577,
    "category": "sport",
    "description": "Il 6 maggio 1954 a Oxford il medico britannico Roger Bannister corre il miglio (1609 metri) in 3 minuti, 59 secondi e 4 decimi — abbattendo per la prima volta nella storia la barriera psicologica dei 4 minuti. La prestazione era considerata ai limiti della fisiologia umana. Bannister è uno studente di medicina e si allena solo un'ora al giorno; corre con tre lepri. Stupefacente: 46 giorni dopo il suo record viene già migliorato da John Landy con 3:57.9. La barriera dei 4 minuti è oggi regolarmente superata da qualsiasi mezzofondista di livello nazionale.",
    "wikipediaSlug": "Roger_Bannister",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-dorando-pietri-1908",
    "title": "Dorando Pietri — La Maratona Olimpica più Drammatica",
    "year": 1908,
    "lat": 51.5074,
    "lng": -0.1278,
    "category": "sport",
    "description": "Il 24 luglio 1908, durante le Olimpiadi di Londra, il pasticcere italiano Dorando Pietri entra allo stadio Olimpico nettamente in testa nella maratona: ma è stremato, disorientato, cade più volte. I giudici di gara lo aiutano a rialzarsi — e lui viene squalificato per assistenza non autorizzata, con la vittoria assegnata all'americano Johnny Hayes. La regina Alexandra è talmente commossa che gli consegna una coppa d'oro speciale. La sua storia ispira una canzone popolare negli USA, scritta da Irving Berlin. Pietri diventa un simbolo mondiale dello spirito olimpico.",
    "wikipediaSlug": "Dorando_Pietri",
    "isCosmic": false,
    "tipo": "persona"
  },

  // ── CAMPIONATI EUROPEI DI CALCIO ────────────────────────────────────────────
  {
    "id": "sport-euro-1960-prima-edizione",
    "title": "UEFA Euro 1960 — Nasce il Campionato Europeo",
    "year": 1960,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Dal 6 al 10 luglio 1960 a Parigi si svolge la prima edizione del Campionato Europeo di Calcio UEFA, allora chiamato 'Coppa Henri Delaunay' in onore del segretario della UEFA che aveva avuto l'idea. Solo 4 squadre si qualificano alla fase finale: la partecipazione è limitata. L'Unione Sovietica batte la Jugoslavia 2-1 ai supplementari vincendo il primo titolo europeo. La Spagna non partecipa per rifiuto politico di giocare contro l'URSS di Krusciov. Il formato crescerà fino alle 24 squadre dell'edizione 2016.",
    "wikipediaSlug": "UEFA_Euro_1960",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-euro-1968-italia",
    "title": "UEFA Euro 1968 — L'Italia Campione d'Europa",
    "year": 1968,
    "lat": 41.9028,
    "lng": 12.4964,
    "category": "sport",
    "description": "Il 10 giugno 1968 l'Italia batte la Jugoslavia 2-0 nella finale replay a Roma (la prima era finita 1-1) vincendo il primo e unico Europeo della sua storia fino al 2021. La semifinale contro l'URSS viene decisa dal lancio della monetina — la prima e ultima volta nella storia dei tornei maggiori. Il centravanti Gigi Riva segna nella finale. Il CT Ferruccio Valcareggi costruisce una squadra equilibrata. L'Italia gioca in casa, al Stadio Olimpico di Roma, davanti al presidente Saragat. La vittoria alimenta l'orgoglio nazionale in un anno convulso di proteste giovanili.",
    "wikipediaSlug": "UEFA_Euro_1968",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-euro-2000-francia",
    "title": "UEFA Euro 2000 — La Francia di Zidane Campione",
    "year": 2000,
    "lat": 50.8503,
    "lng": 4.3517,
    "category": "sport",
    "description": "Il Campionato Europeo 2000, ospitato da Belgio e Olanda, viene vinto dalla Francia — già campione del mondo 1998 — in modo spettacolare. In semifinale i francesi battono il Portogallo con un golden goal di Zinédine Zidane su rigore. In finale contro l'Italia — che conduce 1-0 fino all'89° minuto — la Francia pareggia all'ultimo secondo con Sylvain Wiltord e vince ai supplementari con il golden goal di David Trezeguet. L'Italia è in lacrime: il portiere Toldo è stato eroico, ma non basta. La Francia del 2000 è considerata una delle squadre più forti della storia del calcio.",
    "wikipediaSlug": "UEFA_Euro_2000",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-euro-2020-italia",
    "title": "UEFA Euro 2020 — L'Italia Campione d'Europa dopo 53 Anni",
    "year": 2021,
    "lat": 51.5074,
    "lng": -0.1278,
    "category": "sport",
    "description": "L'11 luglio 2021 a Wembley, Londra — in un torneo posticipato di un anno causa pandemia — l'Italia di Roberto Mancini batte l'Inghilterra ai rigori nella finale degli Europei, vincendo il suo secondo titolo continentale a 53 anni dal primo (1968). L'Italia ha vinto tutte le 34 partite del suo ciclo pre-finale, con un calcio spettacolare e collettivo. Il portiere Donnarumma è eroe nei rigori. In Italia esplode una gioia nazionale dopo anni bui: la mancata qualificazione al Mondiale 2018, la pandemia, la ricostruzione. Il capitano Giorgio Chiellini — 36 anni — alza la coppa.",
    "wikipediaSlug": "UEFA_Euro_2020",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── CHAMPIONS LEAGUE / COPPE EUROPEE ────────────────────────────────────────
  {
    "id": "sport-champions-prima-coppa-1956",
    "title": "La Prima Coppa dei Campioni Europea — Il Real Madrid Domina",
    "year": 1956,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Il 13 giugno 1956 a Parigi, allo Stade du Parc des Princes, il Real Madrid batte lo Stade de Reims 4-3 vincendo la prima Coppa dei Campioni UEFA, l'antenata della Champions League. L'idea del torneo europeo nasce da Gabriel Hanot, giornalista francese de L'Equipe. Il Real Madrid domina le prime cinque edizioni (1956-1960) con Alfredo Di Stéfano, Ferenc Puskás e Paco Gento. La finale del 1960 a Glasgow — Real Madrid 7, Eintracht Frankfurt 3 — è ancora oggi considerata la migliore partita di calcio della storia.",
    "wikipediaSlug": "1955%E2%80%9356_European_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-champions-istanbul-2005",
    "title": "Miracolo di Istanbul 2005 — Liverpool Ribalta il Milan",
    "year": 2005,
    "lat": 41.0082,
    "lng": 28.9784,
    "category": "sport",
    "description": "Il 25 maggio 2005 all'Atatürk Olimpiyat Stadı di Istanbul si gioca la finale di Champions League tra AC Milan e Liverpool. A metà del secondo tempo il Milan è avanti 3-0, la partita sembra chiusa. In soli 6 minuti (54°-60°) il Liverpool segna tre gol con Gerrard, Šmicer e Alonso e pareggia. Ai rigori il portiere Dudek para i tiri di Shevchenko e Pirlo, e il Liverpool vince il suo quinto titolo europeo. La rimonta è considerata la più incredibile della storia del calcio. Il 'Miracolo di Istanbul' entra nell'immaginario collettivo.",
    "wikipediaSlug": "2005_UEFA_Champions_League_final",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-champions-manchester-1999",
    "title": "Treble del Manchester United 1999 — Rimonta al 90°",
    "year": 1999,
    "lat": 50.0755,
    "lng": 14.4378,
    "category": "sport",
    "description": "Il 26 maggio 1999 al Camp Nou di Barcellona, in finale di Champions League, il Manchester United di Sir Alex Ferguson batte il Bayern Monaco 2-1 segnando due gol nel recupero (90° e 93°). Il Bayern era in vantaggio 1-0 dall'inizio e stava già festeggiando. Teddy Sheringham pareggia al 90°, Ole Gunnar Solskjaer segna il 2-1 al 93°. La rimonta all'ultimo secondo — nel giorno del decimo anniversario della morte di Sir Matt Busby — completa il treble storico (Premier League, FA Cup, Champions League) che per i Red Devils non si era mai visto.",
    "wikipediaSlug": "1999_UEFA_Champions_League_final",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── BOXE ────────────────────────────────────────────────────────────────────
  {
    "id": "sport-ali-vs-frazier-1971",
    "title": "Ali vs Frazier — Il Combattimento del Secolo",
    "year": 1971,
    "lat": 40.7128,
    "lng": -74.0060,
    "category": "sport",
    "description": "L'8 marzo 1971 al Madison Square Garden di New York si svolge 'Il Combattimento del Secolo': Muhammad Ali contro Joe Frazier per il titolo mondiale dei pesi massimi. Entrambi imbattuti, entrambi campioni. Ali era stato spogliato del titolo nel 1967 per rifiuto al servizio militare; Frazier era campione ufficiale. 300 milioni di spettatori in tutto il mondo guardano la tv. Vince Frazier per decisione unanima dopo 15 round brutali — primo ko sportivo della carriera di Ali. La rivalità tra i due è personale, politica, razziale: tre combattimenti totali, vinti due a uno da Ali.",
    "wikipediaSlug": "Fight_of_the_Century_(1971)",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-ali-vs-foreman-1974",
    "title": "Il Rumble nella Giungla — Ali Batte Foreman in Zaire",
    "year": 1974,
    "lat": -4.3276,
    "lng": 15.3136,
    "category": "sport",
    "description": "Il 30 ottobre 1974 a Kinshasa, Zaire (oggi Congo), Muhammad Ali affronta il campione mondiale George Foreman considerato imbattibile. Ali usa la tattica 'rope-a-dope': si appoggia alle corde lasciando che Foreman si stanchi a colpirlo, poi scatta all'ottavo round e lo mette KO. Il match, organizzato dal promoter Don King con i fondi del dittatore Mobutu Sese Seko, è il primo grande evento sportivo globale in Africa. Il documentario 'When We Were Kings' (1996) vince l'Oscar. Ali riconquista il titolo mondiale a 32 anni.",
    "wikipediaSlug": "The_Rumble_in_the_Jungle",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── TENNIS ──────────────────────────────────────────────────────────────────
  {
    "id": "sport-steffi-graf-golden-slam-1988",
    "title": "Steffi Graf — Il Golden Slam, Impresa Unica nella Storia",
    "year": 1988,
    "lat": 50.1109,
    "lng": 8.6821,
    "category": "sport",
    "description": "Nel 1988 la tedesca Steffi Graf compie l'unica impresa irripetuta nella storia del tennis: il 'Golden Slam'. Vince i quattro tornei del Grande Slam (Australian Open, Roland Garros, Wimbledon, US Open) e l'oro olimpico ai Giochi di Seul — tutto nello stesso anno. Nessun tennista, uomo o donna, ha mai compiuto questa impresa prima o dopo di lei. Graf vince 22 titoli del Grande Slam in totale (1987-1999) e rimane al primo posto nel ranking mondiale per 377 settimane — un record. Viene considerata la più grande tennista di tutti i tempi da molti esperti.",
    "wikipediaSlug": "Steffi_Graf",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-open-era-tennis-1968",
    "title": "L'Era Open — Il Tennis Professionistico Apre le Porte",
    "year": 1968,
    "lat": 51.4344,
    "lng": -0.2149,
    "category": "sport",
    "description": "Il 1968 è l'anno della rivoluzione nel tennis: i tornei del Grande Slam aprono la partecipazione ai professionisti, fino ad allora esclusi a favore dei soli dilettanti. Il primo torneo dell'Era Open è il Roland Garros nel maggio 1968. Da quel momento il tennis si trasforma: i grandi campioni possono guadagnare dalle vittorie nei tornei. Rod Laver vince il Grande Slam nell'anno del cambiamento. L'Era Open permette il confronto diretto tra tutte le generazioni e crea i grandi tornei commerciali che conosciamo oggi.",
    "wikipediaSlug": "Open_Era",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── OLIMPIADI MOMENTI STORICI ───────────────────────────────────────────────
  {
    "id": "sport-pugno-chiuso-1968",
    "title": "Il Saluto del Black Power — Tommie Smith e John Carlos a Messico 68",
    "year": 1968,
    "lat": 19.4326,
    "lng": -99.1332,
    "category": "sport",
    "description": "Il 16 ottobre 1968 ai Giochi Olimpici di Città del Messico, sul podio dei 200 metri piani, l'americano Tommie Smith (oro) e John Carlos (bronzo) alzano il pugno chiuso guantato di nero durante l'inno americano — gesto di protesta contro la segregazione razziale negli Stati Uniti. Vengono immediatamente espulsi dal Comitato Olimpico Americano e rimpatriati. Il CIO del presidente Brundage li definisce una violazione dello spirito olimpico. Peter Norman, l'argento australiano, indossa un badge OPHR di solidarietà: anche lui pagherà un prezzo per il gesto. Il pugno chiuso diventa icona del movimento per i diritti civili.",
    "wikipediaSlug": "1968_Olympics_Black_Power_salute",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-paralimpiadi-roma-1960",
    "title": "Le Prime Paralimpiadi — Roma 1960, lo Sport Cambia per Sempre",
    "year": 1960,
    "lat": 41.9028,
    "lng": 12.4964,
    "category": "sport",
    "description": "Nel settembre 1960, immediatamente dopo le Olimpiadi, Roma ospita i primi Giochi Paralimpici ufficiali: 400 atleti con disabilità fisica provenienti da 23 paesi. L'idea nasce dal neurologo britannico Sir Ludwig Guttmann, che aveva usato lo sport come terapia per i reduci di guerra feriti alla colonna vertebrale. Le prime gare includono basket, nuoto, atletica e tiro con l'arco. Da quel momento le Paralimpiadi si svolgono nella stessa città dei Giochi Olimpici. Il movimento paralimpico cresce fino a superare oggi 4.400 atleti da 160 paesi — il terzo evento sportivo più grande del mondo.",
    "wikipediaSlug": "1960_Summer_Paralympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-bolt-record-mondiale-2009",
    "title": "Usain Bolt — 9 secondi e 58 a Berlino, Record Assoluto",
    "year": 2009,
    "lat": 52.5200,
    "lng": 13.4050,
    "category": "sport",
    "description": "Il 16 agosto 2009, durante i Campionati Mondiali di Atletica Leggera di Berlino, Usain Bolt corre i 100 metri in 9 secondi e 58 centesimi — record mondiale assoluto ancora in piedi nel 2025. È la corsa più veloce mai misurata nella storia dell'umanità. Bolt aveva già abbassato il record ai Giochi di Pechino 2008 (9.69, poi 9.58) celebrando prima del traguardo con una posa teatrale. Il giamaicano detiene anche il record dei 200 metri (19.19). Con tre ori a Pechino 2008, tre a Londra 2012 e tre a Rio 2016 nei 100, 200 e staffetta 4x100, Bolt è il velocista più titolato e celebre della storia.",
    "wikipediaSlug": "Usain_Bolt_at_the_2009_World_Championships_in_Athletics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-phelps-8-ori-pechino-2008",
    "title": "Michael Phelps — 8 Ori a Pechino 2008, Record Assoluto",
    "year": 2008,
    "lat": 39.9042,
    "lng": 116.4074,
    "category": "sport",
    "description": "Tra il 10 e il 17 agosto 2008, Michael Phelps gareggia e vince 8 gare di nuoto alle Olimpiadi di Pechino — una medaglia d'oro ogni giorno per otto giorni consecutivi. Supera così il record di 7 ori in una sola edizione olimpica stabilito da Mark Spitz a Monaco 1972. La vittoria più sofferta è nella 100m farfalla dove vince con 1/100 di secondo su Michael Cavic. In totale Phelps stabilisce 7 record mondiali in quella settimana. La sua prestazione fisica è analizzata come un fenomeno biologico: apertura alare di 201 cm contro un'altezza di 193 cm, piedi che ruotano come pinne.",
    "wikipediaSlug": "Michael_Phelps_at_the_2008_Summer_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-senna-morte-imola-1994",
    "title": "La Morte di Ayrton Senna a Imola — Il Giorno più Buio della F1",
    "year": 1994,
    "lat": 44.3439,
    "lng": 11.7167,
    "category": "sport",
    "description": "Il 1° maggio 1994, durante il Gran Premio di San Marino a Imola, Ayrton Senna — tre volte campione del mondo di Formula 1 — perde il controllo della sua Williams alla curva del Tamburello e si schianta contro il muro a 211 km/h. Soccorso immediatamente, muore alcune ore dopo per trauma cranico. Ha 34 anni. Il weekend di Imola 1994 è il più tragico della storia moderna del motorsport: il giorno prima era morto il pilota di Formula 2 Roland Ratzenberger. La morte di Senna innesca una rivoluzione sulla sicurezza in Formula 1 che salva molte vite negli anni successivi.",
    "wikipediaSlug": "Death_of_Ayrton_Senna",
    "isCosmic": false,
    "tipo": "evento"
  },

  // ── SPORT ANTICHI ───────────────────────────────────────────────────────────
  {
    "id": "sport-olimpiadi-antiche-fine-393",
    "title": "La Fine dei Giochi Olimpici Antichi — L'Editto di Teodosio",
    "year": 393,
    "lat": 37.6386,
    "lng": 21.6300,
    "category": "sport",
    "description": "Nel 393 d.C. l'imperatore romano Teodosio I emana un editto che proibisce i giochi pagani, ponendo fine ai Giochi Olimpici antichi dopo 1.169 anni di storia (776 a.C. - 393 d.C.). La ragione ufficiale è religiosa: i Giochi erano un rito religioso dedicato a Zeus, incompatibile con il Cristianesimo appena diventato religione di Stato. Il sito di Olimpia viene poi devastato da terremoti e alluvioni, e le strutture vengono sepolte sotto metri di fango per secoli. Bisognerà attendere il 1896 — 1.503 anni dopo — perché Pierre de Coubertin le faccia rinascere ad Atene.",
    "wikipediaSlug": "Ancient_Olympic_Games",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-gladiatori-colosseo-80",
    "title": "Il Colosseo — L'Arena dei Gladiatori a Roma",
    "year": 80,
    "lat": 41.8902,
    "lng": 12.4922,
    "category": "sport",
    "description": "Nell'80 d.C. l'imperatore Tito inaugura il Colosseo (Anfiteatro Flavio) a Roma con 100 giorni di giochi: combattimenti di gladiatori, cacce agli animali esotici (venationes), esecuzioni pubbliche e persino naumachie (battaglie navali simulate). Capace di 50.000-80.000 spettatori, il Colosseo è il più grande anfiteatro mai costruito. I gladiatori — schiavi, prigionieri di guerra, condannati — combattono per la vita e la libertà davanti alle folle. La folla decideva la sorte del vinto col pollice su o giù. Il Colosseo rimane il simbolo di Roma e dell'intrattenimento di massa dell'antichità.",
    "wikipediaSlug": "Colosseum",
    "isCosmic": false,
    "tipo": "luogo"
  },

  // ── FIFA E ORGANIZZAZIONI SPORTIVE ─────────────────────────────────────────
  {
    "id": "sport-fifa-fondazione-1904",
    "title": "Fondazione della FIFA — Il Calcio si Organizza",
    "year": 1904,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Il 21 maggio 1904 a Parigi viene fondata la Fédération Internationale de Football Association (FIFA) da rappresentanti di Francia, Belgio, Danimarca, Paesi Bassi, Spagna, Svezia e Svizzera. L'Inghilterra, che ha inventato il calcio moderno, non partecipa alla riunione — si unirà l'anno dopo. La FIFA ha il compito di unificare le regole del gioco e organizzare competizioni internazionali. Il primo Campionato del Mondo nasce nel 1930. Oggi la FIFA conta 211 paesi membri — più delle Nazioni Unite — ed è una delle organizzazioni sportive più potenti e controverse del mondo.",
    "wikipediaSlug": "FIFA",
    "isCosmic": false,
    "tipo": "organizzazione"
  },
  {
    "id": "sport-americas-cup-prima-1851",
    "title": "America's Cup — La più Antica Coppa Sportiva del Mondo",
    "year": 1851,
    "lat": 50.7192,
    "lng": -1.8808,
    "category": "sport",
    "description": "Il 22 agosto 1851 la goletta americana 'America' vince una regata attorno all'Isola di Wight battendo 15 yacht britannici. La coppa conquistata viene donata al New York Yacht Club con l'incarico di renderla un trofeo permanente di sfida tra nazioni. Nasce così l'America's Cup, la più antica coppa sportiva internazionale tuttora disputata — sei anni più vecchia del primo Wimbledon. La coppa viene difesa dagli Stati Uniti per 132 anni consecutivi (1851-1983) fino alla storica vittoria dell'Australia. L'Italia con Luna Rossa raggiunge la finale nel 2000 e nel 2021.",
    "wikipediaSlug": "America%27s_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-bjorn-borg-1956",
    "title": "Björn Borg — Il Re Svedese di Wimbledon",
    "year": 1956,
    "lat": 59.3293,
    "lng": 18.0686,
    "category": "sport",
    "description": "Björn Borg nasce a Södertälje, Svezia, il 6 giugno 1956. Soprannominato 'Ice Borg' per il sangue freddo leggendario e 'Il Re di Wimbledon' per le cinque vittorie consecutive sull'erba londinese (1976-1980), è considerato il primo tennista moderno nel senso mediatico del termine. Con 11 titoli del Grande Slam — 6 Roland Garros e 5 Wimbledon — domina gli anni Settanta. La rivalità con il focoso americano John McEnroe è una delle più appassionanti della storia del tennis: opposti nel carattere, simili nel talento. Si ritira a soli 26 anni nel 1983, all'apice del successo, dicendo di aver perso la motivazione.",
    "wikipediaSlug": "Björn_Borg",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-mike-tyson-campione-1986",
    "title": "Mike Tyson — Il più Giovane Campione dei Pesi Massimi",
    "year": 1986,
    "lat": 40.6782,
    "lng": -73.9442,
    "category": "sport",
    "description": "Il 22 novembre 1986 a Las Vegas, Mike Tyson batte Trevor Berbick in 2 round e diventa a 20 anni il più giovane campione del mondo dei pesi massimi della storia — record ancora imbattuto. Nato a Brooklyn nel 1966, cresciuto in povertà, scoperto dall'allenatore Cus D'Amato che ne plasma la tecnica, Tyson è un fenomeno fisico e tecnico: attacchi esplosivi, schemi difensivi del 'peek-a-boo', potenza devastante. Regna incontrastato fino alla sconfitta shock con Buster Douglas nel 1990. Dopo arresti, carcere e tracolli, la sua storia diventa simbolo delle contraddizioni del pugilato e della fama.",
    "wikipediaSlug": "Mike_Tyson",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-vuelta-espana-prima-1935",
    "title": "La Vuelta di Spagna — Nasce il Terzo Grande Giro",
    "year": 1935,
    "lat": 40.4168,
    "lng": -3.7038,
    "category": "sport",
    "description": "Nel 1935 si svolge la prima edizione della Vuelta a España, completando la triade dei grandi giri ciclistici insieme al Tour de France (1903) e al Giro d'Italia (1909). La prima edizione copre 3.408 km in 14 tappe. Vince il belga Gustaaf Deloor, che si imporrà anche nell'edizione 1936. Il percorso attraversa le montagne della Penisola Iberica — Pirenei, Sierra Nevada, Picos de Europa — che lo rendono unico per asperità. Campioni come Anquetil, Merckx, Induráin (5 vittorie) e Contador hanno scritto le loro pagine sulla Vuelta.",
    "wikipediaSlug": "Vuelta_a_España",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-rally-dakar-prima-1979",
    "title": "Il Rally Dakar — Nasce la Corsa più Dura del Mondo",
    "year": 1979,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Il 26 dicembre 1978 (prima tappa il 1° gennaio 1979) parte da Parigi la prima edizione del Rally Dakar, organizzato dal pilota francese Thierry Sabine perso nel Sahara durante la Abidjan-Nice 1977. L'idea: una gara attraverso il deserto, da Parigi a Dakar, aperta sia a piloti professionisti che a privati con moto, auto e camion. 182 veicoli partono, 74 arrivano. Vince Cyril Neveu su moto Yamaha. La gara è leggenda per la sua durezza: migliaia di chilometri di sabbia, piste impossibili, caldo e tempeste di sabbia. Dal 2009 si svolge in Sud America per ragioni di sicurezza.",
    "wikipediaSlug": "Dakar_Rally",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-olimpiadi-invernali-1984-sarajevo",
    "title": "Giochi Olimpici Invernali di Sarajevo 1984",
    "year": 1984,
    "lat": 43.8563,
    "lng": 18.4131,
    "category": "sport",
    "description": "Sarajevo, Jugoslavia, ospita i XIV Giochi Olimpici Invernali nel febbraio 1984 — prima e unica volta per un paese comunista non-sovietico. L'organizzazione è impeccabile, i Giochi uno straordinario successo. La statunitense Phil Mahre vince lo slalom speciale; Pirmin Zurbriggen trionfa per la Svizzera. L'italiano Paolino Magoni vince oro nello slalom speciale femminile. Dieci anni dopo, quella stessa Sarajevo sarà devastata dall'assedio più lungo della storia moderna — 44 mesi di guerra (1992-1995). Le strutture olimpiche vengono usate come postazioni militari: un contrasto straziante.",
    "wikipediaSlug": "1984_Winter_Olympics",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-schumacher-ferrari-primo-titolo-2000",
    "title": "Schumacher e Ferrari — Il Primo Titolo Mondiale dopo 21 Anni",
    "year": 2000,
    "lat": 43.7384,
    "lng": 7.4246,
    "category": "sport",
    "description": "Il 22 ottobre 2000 a Suzuka, Giappone, Michael Schumacher vince il suo terzo titolo mondiale di Formula 1 — ma il primo con la Ferrari. La Scuderia di Maranello non vinceva un campionato piloti dal 1979 con Jody Scheckter. L'alleanza tra Schumacher, il direttore tecnico Ross Brawn e il progettista Rory Byrne costruisce una macchina dominante. Da quel momento Ferrari-Schumacher inanellano 5 titoli consecutivi (2000-2004). La vittoria a Suzuka fa piangere Schumacher davanti alle telecamere per la prima e unica volta: è un momento di rara emozione per un atleta famoso per il controllo emotivo assoluto.",
    "wikipediaSlug": "2000_Formula_One_World_Championship",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-coppa-davis-prima-1900",
    "title": "Coppa Davis — La più Antica Competizione a Squadre del Tennis",
    "year": 1900,
    "lat": 42.3601,
    "lng": -71.0589,
    "category": "sport",
    "description": "Nel 1900 a Boston si svolge la prima Coppa Davis, torneo internazionale a squadre di tennis fondato dallo studente americano Dwight Filley Davis, che mette in palio una coppa d'argento acquistata di tasca propria. La prima edizione vede gli USA battere la Gran Bretagna 3-0. La competizione cresce negli anni fino a coinvolgere 135 nazioni — la competizione a squadre di tennis più grande del mondo. Vincitori storici: USA (32), Australia (28), Francia (10). L'Italia vince per la prima volta nel 1976. Dal 2019 il formato cambia radicalmente con la 'Finals' in sede fissa.",
    "wikipediaSlug": "Davis_Cup",
    "isCosmic": false,
    "tipo": "evento"
  },
  {
    "id": "sport-cio-fondazione-1894",
    "title": "Fondazione del CIO — Pierre de Coubertin e il Rinascimento Olimpico",
    "year": 1894,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "sport",
    "description": "Il 23 giugno 1894 alla Sorbona di Parigi, il barone Pierre de Coubertin — pedagogo e storico francese — fonda il Comitato Olimpico Internazionale (CIO) con l'obiettivo di far rivivere i Giochi Olimpici dell'antichità. Coubertin crede nello sport come strumento di pace, amicizia internazionale e formazione del carattere — il motto 'Citius, Altius, Fortius' (più veloce, più alto, più forte) è suo. Due anni dopo, nel 1896, i Giochi si aprono ad Atene. Il CIO, con sede a Losanna, diventa uno dei organismi internazionali più influenti del XX secolo, con poteri economici e politici immensi.",
    "wikipediaSlug": "International_Olympic_Committee",
    "isCosmic": false,
    "tipo": "organizzazione"
  },
  {
    "id": "sport-babe-ruth-1895",
    "title": "Babe Ruth — Il Re del Baseball Americano",
    "year": 1895,
    "lat": 39.2904,
    "lng": -76.6122,
    "category": "sport",
    "description": "George Herman 'Babe' Ruth nasce a Baltimora, Maryland, il 6 febbraio 1895. Giocatore dei New York Yankees dal 1920, è il più grande giocatore di baseball della storia e una delle icone culturali americane del XX secolo. Con 714 fuoricampo in carriera, un record rimasto imbattuto fino al 1974, Ruth trasforma il baseball da sport difensivo a spettacolo offensivo. Il suo stipendio del 1930 — 80.000 dollari — superava quello del presidente Hoover: 'Ho avuto un anno migliore del suo', disse Ruth. La sua figura incarna l'America ruggente degli anni Venti.",
    "wikipediaSlug": "Babe_Ruth",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "sport-ufc-prima-edizione-1993",
    "title": "L'Ultimate Fighting Championship — Nasce la MMA",
    "year": 1993,
    "lat": 39.7392,
    "lng": -104.9903,
    "category": "sport",
    "description": "Il 12 novembre 1993 a Denver, Colorado, si svolge il primo torneo UFC (Ultimate Fighting Championship): 8 combattenti di discipline diverse — karate, boxe, sumo, judo, lotta, kung fu — si scontrano senza regole di peso né limitazioni tecniche per trovare quale arte marziale sia la più efficace. Vince Royce Gracie, judoka brasiliano di 76 kg, battendo avversari molto più grandi con la tecnica Gracie Jiu-Jitsu. L'UFC inizialmente è proibito in molti stati USA come 'troppo violento'. Si evolverà nelle Mixed Martial Arts (MMA) con regole codificate e diventerà uno degli sport in più rapida crescita del XXI secolo.",
    "wikipediaSlug": "UFC_1",
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
