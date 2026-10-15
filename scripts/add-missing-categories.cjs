'use strict';
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../src/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
const existingIds = new Set(events.map(e => e.id));
const existingWiki = new Set(events.map(e => e.wikipedia).filter(Boolean));
const existingTitles = new Set(events.map(e => e.title.toLowerCase().trim()));

function add(entry) {
  if (existingIds.has(entry.id)) { console.log('SKIP dup-id:', entry.id); return; }
  if (entry.wikipedia && existingWiki.has(entry.wikipedia)) { console.log('SKIP dup-wiki:', entry.wikipedia); return; }
  if (existingTitles.has(entry.title.toLowerCase().trim())) { console.log('SKIP dup-title:', entry.title); return; }
  events.push(entry);
  existingIds.add(entry.id);
  if (entry.wikipedia) existingWiki.add(entry.wikipedia);
  existingTitles.add(entry.title.toLowerCase().trim());
  console.log('ADD:', entry.title);
}

// ── COSMO ────────────────────────────────────────────────────────────────────
add({
  id: 'cosmo-sn1604-kepler', title: 'Supernova di Keplero — SN 1604',
  year: 1604, lat: 17.01, lng: 263.33, categoria: 'cosmo', tipo: 'evento',
  description: 'L\'ultima supernova visibile a occhio nudo nella Via Lattea, osservata da Keplero per 18 mesi. Segnò la fine del sistema aristotelico delle sfere celesti immutabili.',
  wikipedia: 'SN_1604',
});

// ── FILOSOFIA ────────────────────────────────────────────────────────────────
add({
  id: 'filo-islam-622', title: 'Islam — La Rivelazione a Maometto',
  year: 622, lat: 21.4225, lng: 39.8262, categoria: 'filosofia', tipo: 'evento',
  description: 'La predicazione di Maometto e l\'Egira segnano la nascita dell\'Islam. Nel giro di un secolo la nuova fede si diffonde dall\'Arabia alla Spagna e all\'Asia centrale.',
  wikipedia: 'Islam',
});
add({
  id: 'filo-ebraismo-antico', title: 'Ebraismo — La Torah e il Monoteismo',
  year: -586, lat: 31.7767, lng: 35.2345, categoria: 'filosofia', tipo: 'evento',
  description: 'La distruzione del Primo Tempio e l\'esilio babilonese consolidano la tradizione ebraica scritta. La Torah diventa il fondamento del primo grande monoteismo della storia.',
  wikipedia: 'Ebraismo',
});
add({
  id: 'filo-history-jews-israel', title: 'Storia degli Ebrei in Terra d\'Israele',
  year: -1200, lat: 31.5, lng: 34.8, categoria: 'filosofia', tipo: 'evento',
  description: 'Tremila anni di presenza ebraica nella terra di Canaan/Israele: dall\'insediamento delle tribù, ai regni di Davide e Salomone, alle diaspore, fino al ritorno moderno.',
  wikipedia: 'History_of_the_Jews_and_Judaism_in_the_Land_of_Israel',
});

// ── GEOLOGIA ─────────────────────────────────────────────────────────────────
add({
  id: 'geo-terremoto-turchia-siria-2023', title: 'Terremoto in Turchia e Siria del 2023',
  year: 2023, lat: 37.174, lng: 37.032, categoria: 'geologia', tipo: 'evento',
  description: 'Il sisma del 6 febbraio 2023 (M 7.8) colpisce il sud-est della Turchia e la Siria settentrionale. Oltre 57.000 vittime, uno dei peggiori terremoti del XXI secolo.',
  wikipedia: 'Terremoto_in_Turchia_e_Siria_del_2023',
});
add({
  id: 'geo-terremoto-irpinia-1980', title: 'Terremoto dell\'Irpinia del 1980',
  year: 1980, lat: 40.77, lng: 15.28, categoria: 'geologia', tipo: 'evento',
  description: 'Il 23 novembre 1980 un terremoto di magnitudo 6.9 devasta l\'Irpinia, in Campania. 2914 morti, 280.000 sfollati. Mette in luce i ritardi nei soccorsi e la fragilità sismica del Sud Italia.',
  wikipedia: 'Terremoto_dell\'Irpinia_del_1980',
});
add({
  id: 'geo-terremoto-aquila-2009', title: 'Terremoto dell\'Aquila del 2009',
  year: 2009, lat: 42.354, lng: 13.395, categoria: 'geologia', tipo: 'evento',
  description: 'La notte del 6 aprile 2009 un sisma di M 6.3 distrugge il centro storico dell\'Aquila. 309 vittime. Il processo ai sette membri della Commissione Grandi Rischi suscita un dibattito internazionale.',
  wikipedia: 'Terremoto_dell\'Aquila_del_2009',
});
add({
  id: 'geo-terremoto-valdivia-1960', title: 'Terremoto di Valdivia del 1960',
  year: 1960, lat: -39.858, lng: -73.8, categoria: 'geologia', tipo: 'evento',
  description: 'Il 22 maggio 1960 il sisma di M 9.5 a Valdivia (Cile) è il più potente mai strumentalmente registrato. Il maremoto conseguente colpisce Hawaii, Giappone e Filippine.',
  wikipedia: 'Terremoto_di_Valdivia_del_1960',
});
add({
  id: 'geo-terremoto-oceano-indiano-2004', title: 'Terremoto e maremoto dell\'Oceano Indiano del 2004',
  year: 2004, lat: 3.295, lng: 95.982, categoria: 'geologia', tipo: 'evento',
  description: 'Il 26 dicembre 2004 un sisma di M 9.1 al largo di Sumatra scatena uno tsunami devastante. Oltre 230.000 vittime in 14 Paesi: la catastrofe naturale più mortale del XXI secolo.',
  wikipedia: 'Terremoto_e_maremoto_dell\'Oceano_Indiano_del_2004',
});
add({
  id: 'geo-terremoto-messina-1908', title: 'Terremoto di Messina del 1908',
  year: 1908, lat: 38.19, lng: 15.55, categoria: 'geologia', tipo: 'evento',
  description: 'Il 28 dicembre 1908 un sisma di M 7.1 e il conseguente maremoto distruggono Messina e Reggio Calabria. Tra 75.000 e 200.000 morti: la catastrofe naturale più grave della storia italiana moderna.',
  wikipedia: 'Terremoto_di_Messina_del_1908',
});
add({
  id: 'geo-terremoto-tohoku-2011', title: 'Terremoto e maremoto del Tōhoku del 2011',
  year: 2011, lat: 38.322, lng: 142.369, categoria: 'geologia', tipo: 'evento',
  description: 'L\'11 marzo 2011 un sisma di M 9.1 al largo del Giappone scatena uno tsunami che devasta la costa nordorientale. 19.759 morti, crisi nucleare di Fukushima Daiichi.',
  wikipedia: 'Terremoto_e_maremoto_del_Tōhoku_del_2011',
});
add({
  id: 'geo-terremoto-generico', title: 'Il Terremoto — La Terra che Trema',
  year: null, lat: 0, lng: 0, categoria: 'geologia', tipo: 'evento',
  description: 'I terremoti sono il risultato del movimento delle placche tettoniche. Le zone più sismiche del pianeta (Anello di Fuoco del Pacifico, Dorsale medio-atlantica) coincidono con i confini di placca.',
  wikipedia: 'Terremoto',
});

// ── MUSICA ──────────────────────────────────────────────────────────────────
add({
  id: 'mus-annalisa-cantante', title: 'Annalisa — Voce del Pop Italiano Contemporaneo',
  year: 2011, lat: 44.2007, lng: 8.1589, categoria: 'musica', tipo: 'persona',
  description: 'Annalisa Scarrone (Savona, 1985), cantante e compositrice italiana. Emersa da X Factor 2010, afferma il proprio stile tra pop, elettronica e ballate. Tra le artiste più ascoltate del pop italiano degli anni 2020.',
  wikipedia: 'Annalisa_(cantante)',
});
add({
  id: 'mus-mina-cantante', title: 'Mina — La Tigre di Cremona',
  year: 1958, lat: 45.1347, lng: 10.0201, categoria: 'musica', tipo: 'persona',
  description: "Anna Maria Mazzini, nota come Mina (Busto Arsizio, 1940). Dotata di un'estensione vocale eccezionale, e' considerata la piu' grande voce della musica leggera italiana. Dal 1978 vive in ritiro senza apparizioni pubbliche.",
  wikipedia: 'Mina_(cantante)',
});
add({
  id: 'mus-madonna-cantante', title: 'Madonna — La Regina del Pop',
  year: 1982, lat: 42.3314, lng: -83.0458, categoria: 'musica', tipo: 'persona',
  description: 'Madonna Louise Ciccone (Bay City, 1958) è l\'artista femminile solista con il maggior numero di dischi venduti nella storia. Ha ridefinito l\'immagine pubblica dell\'artista pop, unendo musica, moda e provocazione.',
  wikipedia: 'Madonna_(cantante)',
});
add({
  id: 'mus-tutti-insieme-sound-of-music', title: 'Tutti insieme appassionatamente — Sound of Music',
  year: 1965, lat: 47.8007, lng: 13.0437, categoria: 'musica', tipo: 'opera',
  description: 'Film musicale diretto da Robert Wise (1965), tratto dal musical di Rodgers & Hammerstein. Ambientato nella Salisburgo del 1938, narra la storia della famiglia von Trapp e della loro fuga dall\'Austria nazista.',
  wikipedia: 'The_Sound_of_Music_(film)',
});
add({
  id: 'mus-kid-rock', title: 'Kid Rock — Country Rap e Rock Americano',
  year: 1998, lat: 42.5803, lng: -83.0302, categoria: 'musica', tipo: 'persona',
  description: 'Robert James Ritchie (Romeo, Michigan, 1971), in arte Kid Rock. Pioniere del rap-rock e country-rap, ha venduto oltre 35 milioni di dischi. Il suo stile ibrido riflette la cultura working-class del Michigan.',
  wikipedia: 'Kid_Rock',
});
add({
  id: 'mus-giorgia-cantante', title: 'Giorgia — La Voce del Soul Italiano',
  year: 1992, lat: 41.9028, lng: 12.4964, categoria: 'musica', tipo: 'persona',
  description: 'Giorgia Todrani (Roma, 1971) è tra le cantanti italiane con le maggiori doti vocali. Il suo stile spazia dal pop al soul e R&B. "Di sole e d\'azzurro" (1995) è uno dei maggiori successi del pop italiano anni \'90.',
  wikipedia: 'Giorgia_(cantante_1971)',
});
add({
  id: 'mus-elodie-cantante', title: 'Elodie — L\'Anima del Pop Italiano',
  year: 2016, lat: 41.9028, lng: 12.4964, categoria: 'musica', tipo: 'persona',
  description: 'Elodie Di Patrizi (Roma, 1990), cantante italiana tra le più ascoltate degli anni 2020. Formatasi ad Amici di Maria De Filippi, ha costruito un\'immagine che unisce pop, R&B e urban con forte personalità visiva.',
  wikipedia: 'Elodie_(cantante)',
});
add({
  id: 'mus-mango-cantante', title: 'Mango — Il Cantautore di Lagonegro',
  year: 1979, lat: 40.1267, lng: 15.7636, categoria: 'musica', tipo: 'persona',
  description: 'Giuseppe Mango (Lagonegro, 1954 – 2014), cantautore italiano. Noto per le sonorità esotiche e le melodie innovative, tra i suoi successi "Oro" e "La rondine". Figura di riferimento del pop d\'autore italiano.',
  wikipedia: 'Mango_(cantante)',
});
add({
  id: 'mus-madame-cantante', title: 'Madame — La Rapper della Generazione Z',
  year: 2020, lat: 45.55, lng: 11.55, categoria: 'musica', tipo: 'persona',
  description: 'Francesca Calearo, in arte Madame (Vicenza, 2002). Esordisce giovanissima con brani rap e trap, imponendosi come una delle voci più originali della musica italiana degli anni 2020.',
  wikipedia: 'Madame_(cantante)',
});

// ── SPORT ───────────────────────────────────────────────────────────────────
add({
  id: 'sport-campionato-mondiale-calcio', title: 'Coppa del Mondo FIFA — Il Torneo più Seguito al Mondo',
  year: 1930, lat: -34.9011, lng: -56.1645, categoria: 'sport', tipo: 'evento',
  description: 'Il Campionato Mondiale di Calcio FIFA, fondato nel 1930 in Uruguay, è il torneo sportivo più seguito al mondo con oltre 3 miliardi di spettatori. L\'Uruguay vinse la prima edizione.',
  wikipedia: 'Campionato_mondiale_di_calcio',
});
add({
  id: 'sport-nazionale-calcio-italia', title: 'Nazionale di Calcio dell\'Italia — Gli Azzurri',
  year: 1910, lat: 41.9028, lng: 12.4964, categoria: 'sport', tipo: 'organizzazione',
  description: 'La Nazionale italiana di calcio, fondata nel 1910, ha vinto quattro Campionati Mondiali (1934, 1938, 1982, 2006) e un Campionato Europeo (2021). È tra le nazionali più titolate della storia.',
  wikipedia: 'Nazionale_di_calcio_dell\'Italia',
});
add({
  id: 'sport-nazionale-argentina-calcio', title: 'Argentina — La Nazionale di Maradona e Messi',
  year: 1901, lat: -34.6083, lng: -58.3712, categoria: 'sport', tipo: 'organizzazione',
  description: 'La Nazionale argentina di calcio ha vinto tre Mondiali (1978, 1986, 2022) e quindici Coppe America. Ha espresso campioni leggendari come Diego Armando Maradona e Lionel Messi.',
  wikipedia: 'Argentina_national_football_team',
});
add({
  id: 'sport-manchester-city-fc', title: 'Manchester City FC — Il Dominio del Calcio Inglese',
  year: 1880, lat: 53.4831, lng: -2.2004, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Manchester City Football Club, fondato nel 1880, è diventato sotto la guida di Pep Guardiola una delle squadre più titolate del calcio europeo, vincendo il Treble nella stagione 2022-23.',
  wikipedia: 'Manchester_City_Football_Club',
});
add({
  id: 'sport-psg-fc', title: 'Paris Saint-Germain FC — La Potenza Finanziaria nel Calcio',
  year: 1970, lat: 48.8414, lng: 2.2530, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Paris Saint-Germain, fondato nel 1970 e acquisito dal Qatar Sports Investments nel 2011, è diventato un simbolo del calcio finanziario moderno, attirando stelle come Neymar e Messi.',
  wikipedia: 'Paris_Saint-Germain_Football_Club',
});
add({
  id: 'sport-man-united-fc', title: 'Manchester United FC — Il Teatro dei Sogni',
  year: 1878, lat: 53.4631, lng: -2.2913, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Manchester United, fondato nel 1878, è uno dei club calcistici più famosi al mondo. Con Sir Alex Ferguson ha dominato il calcio inglese, vincendo 20 campionati e 3 Champions League.',
  wikipedia: 'Manchester_United_Football_Club',
});
add({
  id: 'sport-chelsea-fc', title: 'Chelsea FC — Dal Miliardario russo ai Campioni d\'Europa',
  year: 1905, lat: 51.4816, lng: -0.1910, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Chelsea Football Club, fondato nel 1905, trasformato da Roman Abramovich dal 2003 in una potenza europea. Due Champions League (2012, 2021) e numerosi trofei inglesi.',
  wikipedia: 'Chelsea_Football_Club',
});
add({
  id: 'sport-genoa-cfc', title: 'Genoa CFC — Il Club più Antico d\'Italia',
  year: 1893, lat: 44.4156, lng: 8.9462, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Genoa Cricket and Football Club, fondato nel 1893, è il club calcistico più antico d\'Italia. Ha vinto 9 campionati italiani tra il 1898 e il 1924.',
  wikipedia: 'Genoa_Cricket_and_Football_Club',
});
add({
  id: 'sport-campionato-mondiale-calcio-2022', title: 'Coppa del Mondo 2022 — Il Mondiale in Qatar',
  year: 2022, lat: 25.286, lng: 51.533, categoria: 'sport', tipo: 'evento',
  description: 'Il Mondiale 2022 disputato in Qatar è stato il primo organizzato in Medio Oriente e il primo in novembre-dicembre. L\'Argentina di Messi ha battuto la Francia in finale ai rigori dopo un 3-3 storico.',
  wikipedia: 'Campionato_mondiale_di_calcio_2022',
});
add({
  id: 'sport-campionato-mondiale-rugby-2023', title: 'Coppa del Mondo di Rugby 2023',
  year: 2023, lat: 48.8566, lng: 2.3522, categoria: 'sport', tipo: 'evento',
  description: 'La Coppa del Mondo di Rugby 2023, disputata in Francia, ha visto il Sudafrica conquistare il suo quarto titolo mondiale battendo la Nuova Zelanda in finale, a Parigi.',
  wikipedia: 'Coppa_del_Mondo_di_rugby_2023',
});
add({
  id: 'sport-campionato-mondiale-calcio-femminile-2023', title: 'Mondiale Femminile 2023 — La Spagna e le Matildas',
  year: 2023, lat: -33.8688, lng: 151.2093, categoria: 'sport', tipo: 'evento',
  description: 'Il Campionato Mondiale Femminile 2023 in Australia e Nuova Zelanda ha visto la Spagna trionfare per la prima volta. La nazionale australiana (Matildas) ha entusiasmato il proprio pubblico arrivando in semifinale.',
  wikipedia: 'Campionato_mondiale_di_calcio_femminile_2023',
});
add({
  id: 'sport-atalanta-bc', title: 'Atalanta BC — La Dea di Bergamo nel Calcio d\'Europa',
  year: 1907, lat: 45.6949, lng: 9.6773, categoria: 'sport', tipo: 'organizzazione',
  description: 'L\'Atalanta Bergamasca Calcio, fondata nel 1907, è diventata una delle squadre rivelazione del calcio europeo degli anni 2010-2020, raggiungendo i quarti di Champions League nel 2020 e vincendo l\'Europa League 2024.',
  wikipedia: 'Atalanta_Bergamasca_Calcio',
});
add({
  id: 'sport-campionato-scacchi-mondiale', title: 'Campionato del Mondo di Scacchi',
  year: 1886, lat: 40.7128, lng: -74.006, categoria: 'sport', tipo: 'evento',
  description: 'Il Campionato del Mondo di Scacchi, fondato nel 1886, è la massima competizione scacchistica mondiale. Campioni leggendari come Capablanca, Fischer, Kasparov e Carlsen ne hanno segnato la storia.',
  wikipedia: 'World_Chess_Championship',
});
add({
  id: 'sport-al-nassr-fc', title: 'Al-Nassr FC — Cristiano Ronaldo in Arabia Saudita',
  year: 1955, lat: 24.5547, lng: 46.7169, categoria: 'sport', tipo: 'organizzazione',
  description: 'L\'Al-Nassr Football Club, fondato nel 1955 a Riad, è diventato noto a livello mondiale con l\'arrivo di Cristiano Ronaldo nel gennaio 2023, simbolo della crescita calcistica della Saudi Pro League.',
  wikipedia: 'Al-Nassr_Football_Club',
});
add({
  id: 'sport-monza-ac', title: 'Associazione Calcio Monza — L\'Ascesa in Serie A',
  year: 1912, lat: 45.5845, lng: 9.2744, categoria: 'sport', tipo: 'organizzazione',
  description: 'Il Monza, fondato nel 1912, ha raggiunto per la prima volta nella storia la Serie A nel 2022 dopo l\'acquisizione da parte di Silvio Berlusconi e Adriano Galliani. Un club storico della Lombardia.',
  wikipedia: 'Associazione_Calcio_Monza',
});
add({
  id: 'sport-sampdoria-uc', title: 'Sampdoria — Lo Scudetto del 1991',
  year: 1946, lat: 44.4056, lng: 8.9463, categoria: 'sport', tipo: 'organizzazione',
  description: 'L\'Unione Calcio Sampdoria, fondata nel 1946 dalla fusione di Sampierdarenese e Andrea Doria, ha vinto lo scudetto nel 1991 con Mancini, Vialli e Lombardo guidati da Boskov. Una stagione leggendaria.',
  wikipedia: 'Unione_Calcio_Sampdoria',
});
add({
  id: 'sport-nazionale-brasile-calcio', title: 'Brasile — La Seleção dei Cinque Mondiali',
  year: 1914, lat: -15.7801, lng: -47.9292, categoria: 'sport', tipo: 'organizzazione',
  description: 'La Nazionale brasiliana di calcio è la più vittoriosa al mondo con 5 Campionati Mondiali (1958, 1962, 1970, 1994, 2002). Il Brasile è l\'unica squadra ad aver partecipato a tutti i 22 Mondiali disputati.',
  wikipedia: 'Brazil_national_football_team',
});
add({
  id: 'sport-nazionale-portogallo-calcio', title: 'Portogallo — Da Eusébio a Cristiano Ronaldo',
  year: 1921, lat: 38.7169, lng: -9.1399, categoria: 'sport', tipo: 'organizzazione',
  description: 'La Nazionale portoghese di calcio ha vissuto due ere d\'oro: gli anni \'60 con Eusébio (terzo posto al Mondiale 1966) e gli anni 2010-2020 con Cristiano Ronaldo, vincendo Euro 2016 e Nations League 2019.',
  wikipedia: 'Portugal_national_football_team',
});

console.log('\nTotale finale:', events.length);
const added = events.length - 3150;
console.log('Nuovi eventi aggiunti:', added);

fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
console.log('events.json salvato.');
