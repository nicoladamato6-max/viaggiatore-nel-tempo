const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../src/data/events.json');
const existing = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const newEvents = [

  // ─── FILOSOFI COME PERSONA ────────────────────────────────────────────────

  {
    "id": "fil-kant-1724",
    "title": "Immanuel Kant",
    "year": 1724,
    "lat": 54.7104,
    "lng": 20.5104,
    "category": "filosofia",
    "description": "Immanuel Kant nacque a Königsberg, in Prussia Orientale, nel 1724 e vi trascorse l'intera vita senza mai allontanarsi dalla città natale. È considerato il massimo filosofo dell'Illuminismo tedesco e uno dei pensatori più influenti di tutta la storia della filosofia occidentale. Con la sua «filosofia critica» cercò di conciliare il razionalismo continentale e l'empirismo britannico, dimostrando che la conoscenza umana è il risultato dell'interazione tra le categorie a priori dell'intelletto e i dati dell'esperienza sensibile. Le sue tre Critiche — della ragion pura, della ragion pratica e del giudizio — ridefinirono i fondamenti dell'epistemologia, dell'etica e dell'estetica per i secoli a venire. Il suo imperativo categorico — «Agisci solo secondo quella massima che puoi volere diventi una legge universale» — resta uno dei principi etici più citati della modernità. Morì nel 1804, lasciando un'eredità che avrebbe plasmato l'idealismo tedesco di Fichte, Schelling e Hegel.",
    "wikipediaSlug": "Immanuel_Kant",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-hegel-1770",
    "title": "Georg Wilhelm Friedrich Hegel",
    "year": 1770,
    "lat": 48.7758,
    "lng": 9.1829,
    "category": "filosofia",
    "description": "Georg Wilhelm Friedrich Hegel nacque a Stoccarda nel 1770 e divenne il principale esponente dell'idealismo tedesco, il movimento che domina la filosofia europea nella prima metà dell'Ottocento. Il suo sistema filosofico ruota attorno al concetto di dialettica: la realtà si sviluppa attraverso un processo di tesi, antitesi e sintesi, che Hegel chiamò «movimento del concetto». Con la Fenomenologia dello Spirito (1807) e la Scienza della Logica (1812-1816) costruì una filosofia che abbraccia l'intera realtà naturale, storica e spirituale come manifestazioni progressive dello Spirito Assoluto. La sua filosofia della storia, secondo cui «tutto ciò che è reale è razionale e tutto ciò che è razionale è reale», esercitò un'influenza enorme su Marx, Kierkegaard e tutta la filosofia successiva. Hegel insegnò a Berlino, dove morì nel 1831 probabilmente di colera, lasciando scuole di pensiero profondamente divise tra «destra» e «sinistra» hegeliana.",
    "wikipediaSlug": "Georg_Wilhelm_Friedrich_Hegel",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-schopenhauer-1788",
    "title": "Arthur Schopenhauer",
    "year": 1788,
    "lat": 54.3520,
    "lng": 18.6466,
    "category": "filosofia",
    "description": "Arthur Schopenhauer nacque a Danzica nel 1788 e sviluppò una filosofia radicalmente pessimista che fece del dolore e della volontà i cardini dell'esistenza umana. Nella sua opera principale, Il mondo come volontà e rappresentazione (1818), sostenne che la realtà profonda di ogni cosa è una forza cieca e irrazionale — la Volontà — che spinge gli esseri verso desideri mai pienamente soddisfatti, generando così sofferenza. Fortemente influenzato dalla filosofia indiana, in particolare dall'induismo e dal buddhismo, Schopenhauer indicò nell'ascesi, nella compassione e nella contemplazione estetica le vie per temporaneamente liberarsi dalla tirannia della Volontà. La sua opera rimase ignorata per decenni, ma a partire dalla metà dell'Ottocento esercitò un influsso decisivo su Nietzsche, Wagner, Freud e Wittgenstein. Morì a Francoforte sul Meno nel 1860, finalmente riconosciuto come uno dei grandi pensatori europei.",
    "wikipediaSlug": "Arthur_Schopenhauer",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-comte-1798",
    "title": "Auguste Comte",
    "year": 1798,
    "lat": 43.6119,
    "lng": 3.8772,
    "category": "filosofia",
    "description": "Auguste Comte nacque a Montpellier nel 1798 ed è considerato il fondatore del positivismo e della sociologia come disciplina scientifica autonoma. Elaborò la «legge dei tre stadi», secondo la quale ogni scienza e ogni civiltà passano progressivamente dallo stadio teologico, a quello metafisico, fino a quello positivo — basato sull'osservazione empirica e sulla scienza. Nel suo monumentale Corso di filosofia positiva (1830-1842) sistematizzò tutte le scienze in una gerarchia che culminava nella sociologia, la scienza più complessa e più recente. Comte credeva che la scienza potesse diventare il fondamento di una nuova religione laica dell'umanità, capace di sostituire il Cristianesimo come collante morale della società. La sua visione influenzò profondamente il pensiero scientifico e sociologico europeo e latinoamericano, tanto che il motto «Ordine e Progresso» è ancora oggi inciso sulla bandiera del Brasile.",
    "wikipediaSlug": "Auguste_Comte",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-kierkegaard-1813",
    "title": "Søren Kierkegaard",
    "year": 1813,
    "lat": 55.6761,
    "lng": 12.5683,
    "category": "filosofia",
    "description": "Søren Kierkegaard nacque a Copenaghen nel 1813 e fu il primo grande pensatore dell'esistenzialismo, sebbene non usasse mai questo termine per definire la propria filosofia. Contro l'idealismo hegeliano che dissolveva l'individuo nel sistema universale, Kierkegaard sostenne che l'esistenza autentica è irriducibilmente personale: ogni essere umano deve affrontare scelte decisive che non possono essere risolte dalla logica. Identificò tre stadi dell'esistenza — estetico, etico e religioso — e descrisse il «salto della fede» come il passaggio decisivo verso una relazione personale con Dio, irrazionale e paradossale per definizione. Scrisse spesso sotto pseudonimi per invitare il lettore a confrontarsi direttamente con il testo senza l'autorità dell'autore. La sua opera, rivalutata solo nel Novecento, influenzò profondamente Heidegger, Sartre, Camus e tutta la tradizione esistenzialista europea.",
    "wikipediaSlug": "Søren_Kierkegaard",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-mill-1806",
    "title": "John Stuart Mill",
    "year": 1806,
    "lat": 51.5074,
    "lng": -0.1278,
    "category": "filosofia",
    "description": "John Stuart Mill nacque a Londra nel 1806 e divenne il principale filosofo del liberalismo e dell'utilitarismo nell'Ottocento anglosassone. Formatosi con un'educazione intensiva imposta dal padre James Mill, fu un prodigioso pensatore che scrisse su economia, logica, politica e morale. Nella sua opera Utilitarismo (1863) sviluppò e raffinò la teoria di Jeremy Bentham, distinguendo tra piaceri qualitativamente superiori e inferiori: «meglio essere Socrate insoddisfatto che uno stupido soddisfatto». Il suo saggio Sulla libertà (1859) è una delle difese più eloquenti della libertà individuale contro la tirannia della maggioranza e rimane un testo fondamentale del pensiero liberal-democratico. Mill fu anche un pioniere dei diritti delle donne, sostenendo nel suo La soggezione delle donne (1869) la piena parità politica e sociale tra i sessi.",
    "wikipediaSlug": "John_Stuart_Mill",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-marx-1818",
    "title": "Karl Marx",
    "year": 1818,
    "lat": 49.7492,
    "lng": 6.6381,
    "category": "filosofia",
    "description": "Karl Marx nacque a Treviri nel 1818 e fu filosofo, economista e teorico politico, autore di una delle analisi più influenti e controverse del capitalismo moderno. Partendo dall'idealismo hegeliano, sviluppò il materialismo storico e dialettico: le strutture economiche — i «rapporti di produzione» — determinano le forme culturali, politiche e ideologiche di ogni società. Con Friedrich Engels scrisse il Manifesto del Partito Comunista (1848), che aprì con le parole «Uno spettro si aggira per l'Europa», diventando uno dei testi politici più letti della storia. Nel suo capolavoro Il Capitale (1867) condusse un'analisi sistematica dell'economia capitalistica, introducendo concetti come il plusvalore, l'alienazione del lavoro e l'accumulazione primitiva. Morì a Londra nel 1883, ma le sue idee ispirarono rivoluzioni e movimenti sociali in tutto il mondo nel Novecento.",
    "wikipediaSlug": "Karl_Marx",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-nietzsche-1844",
    "title": "Friedrich Nietzsche",
    "year": 1844,
    "lat": 51.2562,
    "lng": 12.2267,
    "category": "filosofia",
    "description": "Friedrich Nietzsche nacque a Röcken, in Sassonia, nel 1844 e divenne uno dei filosofi più provocatori e influenti della modernità, le cui idee continuano a dividere e affascinare. Critico spietato della morale cristiana, della metafisica tradizionale e del nazionalismo tedesco, proclamò la «morte di Dio» come il fatto culturale determinante della modernità, aprendo la strada al nichilismo e alla necessità di creare nuovi valori. Con il concetto di Übermensch (Oltreuomo) indicò un ideale di essere umano capace di affermare la vita nella sua totalità, superando le morali del risentimento e della rinuncia. La sua scrittura aforistica e poetica — da La nascita della tragedia (1872) ad Al di là del bene e del male (1886) — influenzò profondamente l'esistenzialismo, il postmodernismo, la psicanalisi e le arti del Novecento. Colpito da una crisi mentale nel 1889, trascorse gli ultimi undici anni di vita in uno stato di incapacità mentale, morendo a Weimar nel 1900.",
    "wikipediaSlug": "Friedrich_Nietzsche",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-james-1842",
    "title": "William James",
    "year": 1842,
    "lat": 40.7128,
    "lng": -74.0060,
    "category": "filosofia",
    "description": "William James nacque a New York nel 1842 ed è considerato il padre del pragmatismo americano e uno dei fondatori della psicologia scientifica moderna. Fratello dello scrittore Henry James, fu un pensatore eclettico che unì filosofia, psicologia e riflessione religiosa in un sistema coerente e profondamente originale. Nel suo Principi di psicologia (1890) introdusse il concetto di «flusso di coscienza», rivoluzionando sia la psicologia che la letteratura. Con i suoi saggi pragmatisti — raccolti in Il pragmatismo (1907) — sostenne che la verità di un'idea si misura dalle sue conseguenze pratiche nella vita: «le idee vere sono quelle che possiamo assimilare, convalidare, corroborare e verificare». Le sue Conferenze sulla pluralità del mondo (1909) offrono una visione empirista radicale e pluralistica della realtà che anticipa molti temi della filosofia analitica contemporanea.",
    "wikipediaSlug": "William_James",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-dewey-1859",
    "title": "John Dewey",
    "year": 1859,
    "lat": 44.4759,
    "lng": -73.2121,
    "category": "filosofia",
    "description": "John Dewey nacque a Burlington, Vermont, nel 1859 e fu il più importante filosofo americano del Novecento, figura centrale del pragmatismo e riformatore radicale dell'educazione pubblica. Convinto che filosofia e vita pratica debbano essere inseparabili, elaborò una pedagogia basata sull'esperienza attiva: l'apprendimento avviene meglio facendo, sperimentando e risolvendo problemi reali («learning by doing»). La sua critica alla filosofia accademica tradizionale — esplicitata in opere come Democrazia e educazione (1916) e Esperienza e natura (1925) — aprì la strada a una visione della conoscenza come strumento di trasformazione sociale. Come intellettuale pubblico, Dewey si batté per i diritti civili, contro il dogmatismo religioso e per una democrazia radicale fondata sulla partecipazione attiva dei cittadini. La sua influenza sulle scienze dell'educazione, sulla filosofia politica e sulla psicologia è tuttora profonda e globale.",
    "wikipediaSlug": "John_Dewey",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-frege-1848",
    "title": "Gottlob Frege",
    "year": 1848,
    "lat": 50.9272,
    "lng": 11.5861,
    "category": "filosofia",
    "description": "Gottlob Frege nacque a Wismar nel 1848 e fu il logico e matematico che gettò le fondamenta della filosofia analitica moderna e della logica formale contemporanea. Con la sua Begriffsschrift (Notazione concettuale, 1879) inventò un linguaggio simbolico per l'analisi logica del ragionamento, anticipando di decenni la logica matematica di Russell e Whitehead. Nelle Fondamenta dell'aritmetica (1884) sostenne che i numeri sono oggetti logici e non costruzioni mentali, aprendo il dibattito che diventerà centrale nella filosofia della matematica. La sua distinzione tra «senso» (Sinn) e «riferimento» (Bedeutung) — illustrata nell'esempio della stella del mattino e della stella della sera — è rimasta un caposaldo della filosofia del linguaggio. Benché ignorato per lungo tempo, Frege fu rivalutato da Russell, Wittgenstein e Husserl, che ne riconobbero il ruolo fondativo per la filosofia del Novecento.",
    "wikipediaSlug": "Gottlob_Frege",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-moore-1873",
    "title": "G.E. Moore",
    "year": 1873,
    "lat": 52.2053,
    "lng": 0.1218,
    "category": "filosofia",
    "description": "George Edward Moore nacque a Londra nel 1873 e fu, assieme a Bertrand Russell, il fondatore della filosofia analitica britannica e uno dei critici più efficaci dell'idealismo di Bradley e Bosanquet. Il suo saggio Confutazione dell'idealismo (1903) affermò il «senso comune» come punto di partenza imprescindibile della riflessione filosofica, aprendo la strada al realismo analitico. I Principia Ethica (1903) introdussero la cosiddetta «fallacia naturalistica», sostenendo che il bene non può essere definito in termini naturali o empirici, influenzando profondamente l'etica analitica del Novecento. Moore insegnò a Cambridge per decenni, formando generazioni di filosofi e diventando un punto di riferimento del Circolo di Bloomsbury, frequentato da Virginia Woolf, John Maynard Keynes e Lytton Strachey. La sua attenzione meticolosa al linguaggio e alla chiarezza concettuale rimane un modello metodologico per la filosofia analitica contemporanea.",
    "wikipediaSlug": "G._E._Moore",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-lacan-1901",
    "title": "Jacques Lacan",
    "year": 1901,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Jacques Lacan nacque a Parigi nel 1901 ed è il più influente — e controverso — interprete di Freud del Novecento, la cui opera ha profondamente segnato la psicanalisi, la filosofia continentale e la teoria critica. Il suo «ritorno a Freud» attraverso la linguistica strutturale di Saussure produsse il celebre assioma: «l'inconscio è strutturato come un linguaggio». Con i concetti del Reale, dell'Immaginario e del Simbolico — la cosiddetta «triade RSI» — Lacan elaborò una topologia psichica originale che permise di reinterpretare i fondamenti della soggettività e del desiderio. I suoi Écrits (1966) e i Seminari, tenuti all'École Normale Supérieure, erano eventi culturali frequentati da intellettuali di tutta Europa, da Derrida a Foucault. Benché la sua scrittura sia notoriamente oscura e provocatoria, l'influenza di Lacan si estende dalla filosofia alla teoria letteraria, al cinema e agli studi di genere.",
    "wikipediaSlug": "Jacques_Lacan",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-levi-strauss-1908",
    "title": "Claude Lévi-Strauss",
    "year": 1908,
    "lat": 50.8503,
    "lng": 4.3517,
    "category": "filosofia",
    "description": "Claude Lévi-Strauss nacque a Bruxelles nel 1908 e fu l'antropologo e filosofo che portò lo strutturalismo al centro del dibattito culturale europeo degli anni Sessanta. Ispirandosi alla linguistica strutturale di Ferdinand de Saussure e Roman Jakobson, applicò la nozione di struttura profonda all'analisi dei miti, dei sistemi di parentela e dei riti delle società «primitive», mostrando che anche le culture non occidentali possiedono una logica raffinata e universalmente umana. Le Strutture elementari della parentela (1949) e la tetralogia delle Mythologiques (1964-1971) sono le sue opere più ambiziose, costruite come sinfonie tematiche che esplorano le strutture del pensiero mitico. Il suo pensiero aprì la strada allo strutturalismo letterario, alla semiotica e al postmodernismo, influenzando Barthes, Foucault, Derrida e tutta la teoria critica. Morì nel 2009 a 100 anni, pochi giorni prima del suo centesimo compleanno.",
    "wikipediaSlug": "Claude_Lévi-Strauss",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-austin-1911",
    "title": "J.L. Austin",
    "year": 1911,
    "lat": 51.7520,
    "lng": -1.2577,
    "category": "filosofia",
    "description": "John Langshaw Austin nacque a Lancaster nel 1911 e fu il fondatore della filosofia del «linguaggio ordinario», corrente che dominò la filosofia analitica britannica negli anni Cinquanta e Sessanta. Insegnando a Oxford, Austin sviluppò una metodologia filosofica basata sull'analisi minuziosa del linguaggio quotidiano, convinto che molti problemi filosofici fossero il risultato di usi impropri o confusi del linguaggio. La sua teoria degli «atti linguistici» — presentata nelle Lectures How to Do Things with Words (1962, postumo) — distinse tra enunciati «constativi» e «performativi», mostrando che il linguaggio non descrive soltanto la realtà ma la modifica: dire «prometto» equivale a fare una promessa. Questa distinzione rivoluzionò la linguistica pragmatica, la filosofia del diritto e la teoria della comunicazione. Austin morì prematuramente a 48 anni nel 1960, ma la sua influenza attraverso Searle, Grice e altri è tuttora vivissima.",
    "wikipediaSlug": "J._L._Austin",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-baudrillard-1929",
    "title": "Jean Baudrillard",
    "year": 1929,
    "lat": 49.2577,
    "lng": 4.0319,
    "category": "filosofia",
    "description": "Jean Baudrillard nacque a Reims nel 1929 ed è il teorico della «simulazione» e dell'«iperrealtà», uno dei filosofi più originali e provocatori del postmodernismo francese. Formatosi nel marxismo e poi nella sociologia di Roland Barthes, sviluppò una critica radicale della società dei consumi e dei media, sostenendo che nel mondo contemporaneo i segni hanno perso il riferimento alla realtà e si autoreferenziano in simulacri senza originale. Con Simulacra e Simulazione (1981) elaborò il concetto di «iperreale»: una realtà costruita dai media e dal consumismo che è «più reale del reale» e che cancella la distinzione tra rappresentazione e realtà. Queste idee influenzarono la cultura popolare — il film Matrix cita esplicitamente il suo libro — e la teoria critica dei media digitali. Baudrillard morì a Parigi nel 2007, lasciando un'opera che anticipa molte questioni centrali dell'era digitale.",
    "wikipediaSlug": "Jean_Baudrillard",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-chomsky-1928",
    "title": "Noam Chomsky",
    "year": 1928,
    "lat": 39.9526,
    "lng": -75.1652,
    "category": "filosofia",
    "description": "Noam Chomsky nacque a Filadelfia nel 1928 ed è uno dei pensatori più influenti del Novecento, noto sia come linguista rivoluzionario sia come intellettuale critico dell'imperialismo americano. In linguistica, la sua teoria della «grammatica generativa» (1957) sostenne l'esistenza di strutture grammaticali universali, innate nella mente umana, aprendo un dibattito fondamentale sulla natura del linguaggio e della cognizione. Come filosofo politico, Chomsky ha condotto per decenni una critica sistematica della politica estera americana, dei media mainstream e delle strutture del potere capitalistico, diventando il principale intellettuale della sinistra libertaria anglosassone. Opere come La produzione del consenso (1988, con Edward Herman) hanno fornito strumenti analitici per smontare la propaganda dei media di massa. Chomsky, ancora attivo dopo i novant'anni al MIT, incarna la figura del filologo-filosofo-militante.",
    "wikipediaSlug": "Noam_Chomsky",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-rorty-1931",
    "title": "Richard Rorty",
    "year": 1931,
    "lat": 40.7128,
    "lng": -74.0060,
    "category": "filosofia",
    "description": "Richard Rorty nacque a New York nel 1931 e fu il filosofo che cercò di tenere assieme il pragmatismo americano e la filosofia continentale europea in una sintesi postmoderna e antifondazionalista. Formatosi nella tradizione analitica, si allontanò progressivamente dalle sue pretese scientifiche con il suo capolavoro Philosophy and the Mirror of Nature (1979), dove sostenne che la conoscenza non «rispecchia» la realtà ma è un insieme di pratiche linguistiche e sociali utili a determinati scopi. Il suo pragmatismo neopragmatista valorizza la solidarietà, la tolleranza e la democrazia liberale non come valori fondati su basi metafisiche assolute, ma come tradizioni culturali da difendere e ampliare. Rorty recuperò il grande filone di William James e John Dewey aggiornandolo con Wittgenstein, Heidegger e Derrida. Morì nel 2007 a Stanford, dove era professore emerito.",
    "wikipediaSlug": "Richard_Rorty",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-searle-1932",
    "title": "John Searle",
    "year": 1932,
    "lat": 37.8716,
    "lng": -122.2727,
    "category": "filosofia",
    "description": "John Searle nacque a Denver nel 1932 ed è il filosofo che, con il suo celebre esperimento mentale della «Stanza cinese» (1980), aprì uno dei dibattiti più vivaci della filosofia della mente contemporanea sull'intelligenza artificiale. Allievo di J.L. Austin a Oxford, sviluppò la teoria degli atti linguistici in modo sistematico, distinguendo tra atti illocutori, locutori e perlocutori nell'opera Speech Acts (1969). Con La mente, il cervello e i programmi (1980) sostenne che un computer che elabora simboli secondo regole sintattiche non capisce davvero il significato: la sintassi non è sufficiente per la semantica. La sua difesa del «realismo esterno» e della «consapevolezza» come proprietà biologica del cervello lo ha posto in aperto conflitto con le teorie computazionali della mente di Dennett e Chalmers. Ha insegnato per decenni a Berkeley, dove è ancora professore emerito.",
    "wikipediaSlug": "John_Searle",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-dennett-1942",
    "title": "Daniel Dennett",
    "year": 1942,
    "lat": 42.3736,
    "lng": -71.1097,
    "category": "filosofia",
    "description": "Daniel Dennett nacque a Boston nel 1942 e fu uno dei filosofi più brillanti e polemici della mente e della scienza cognitiva del tardo Novecento. Nel suo capolavoro La coscienza spiegata (1991) sostenne una visione materialista e computazionale della coscienza umana, respingendo l'idea che esista un «teatro cartesiano» interiore dove l'esperienza soggettiva si manifesta. Con il concetto di «eterofenomenologia» propose un metodo scientifico per studiare i fenomeni mentali senza ricorrere a entità metafisiche. Uno dei «Quattro cavalieri» del Nuovo Ateismo assieme a Richard Dawkins, Sam Harris e Christopher Hitchens, Dennett ha esteso la sua critica alla religione intesa come fenomeno evolutivo in opere come Rompere l'incantesimo (2006). È stato professore e co-direttore del Centro per gli Studi Cognitivi alla Tufts University fino alla morte, avvenuta nel 2024.",
    "wikipediaSlug": "Daniel_Dennett",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-chalmers-1966",
    "title": "David Chalmers",
    "year": 1966,
    "lat": -27.4698,
    "lng": 153.0251,
    "category": "filosofia",
    "description": "David Chalmers nacque a Brisbane, Australia, nel 1966 ed è il filosofo che ha imposto la nozione di «problema difficile della coscienza» al centro del dibattito contemporaneo sulla mente. Con il suo libro La mente cosciente (1996) sostenne che spiegare i processi cerebrali che causano comportamenti e funzioni cognitive — il «problema facile» — non spiega automaticamente perché esistano esperienze soggettive, qualia, sensazioni qualitative: il rosso che vedo è davvero «come qualcosa». Questa distinzione ha rilanciato posizioni neo-dualiste e panpsichiste nell'ambito della filosofia analitica contemporanea, mettendo in discussione il riduzionismo materialista. Chalmers ha insegnato all'Università Nazionale Australiana, poi al City University di New York e alla NYU, diventando uno dei filosofi più citati al mondo. Il suo recente Reality+: Virtual Worlds and the Philosophy of Mind (2022) applica queste idee ai mondi virtuali e all'intelligenza artificiale.",
    "wikipediaSlug": "David_Chalmers",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-butler-1956",
    "title": "Judith Butler",
    "year": 1956,
    "lat": 41.4993,
    "lng": -81.6944,
    "category": "filosofia",
    "description": "Judith Butler nacque a Cleveland, Ohio, nel 1956 ed è la filosofa che ha rivoluzionato la teoria del genere e il femminismo con la sua opera Problemi di genere (1990). Attingendo a Foucault, Derrida e la psicoanalisi lacaniana, Butler sostiene che il genere non è una proprietà naturale e fissa degli individui ma una «performance» — una ripetizione di atti codificati culturalmente che produce l'illusione di un'identità di genere stabile e preesistente. Questa visione performativa del genere ha costituito il fondamento teorico della queer theory e ha influenzato profondamente il femminismo, gli studi LGBTQ+ e la filosofia politica. Con Vite precarie (2004) e La forza della non violenza (2020) Butler ha esteso la sua riflessione alle questioni di vulnerabilità, lutto e politica della resistenza. Insegna all'Università della California a Berkeley ed è tra i filosofi viventi più tradotti e citati al mondo.",
    "wikipediaSlug": "Judith_Butler",
    "isCosmic": false,
    "tipo": "persona"
  },
  {
    "id": "fil-zizek-1949",
    "title": "Slavoj Žižek",
    "year": 1949,
    "lat": 46.0569,
    "lng": 14.5058,
    "category": "filosofia",
    "description": "Slavoj Žižek nacque a Lubiana, Slovenia, nel 1949 e si è affermato come il più noto — e divisivo — filosofo marxista del XXI secolo, noto per il suo stile irriverente che mescola Hegel, Lacan, Marx e la cultura popolare. Cresciuto nella Jugoslavia di Tito, Žižek ha sviluppato una critica originale dell'ideologia liberale e capitalista, sostenendo che la tolleranza multiculturale del tardo capitalismo è essa stessa una forma di controllo ideologico che neutralizza il conflitto politico reale. Con L'oggetto sublime dell'ideologia (1989) impose la lettura lacaniana di Marx nell'agenda della teoria critica internazionale, mentre Vivere alla fine dei tempi (2010) offre una lettura apocalittica del capitalismo contemporaneo. Prolifico saggista e conferenziere, Žižek è capace di analizzare film, barzellette e catastrofi politiche con la stessa acuità teorica. Insegna alla European Graduate School e al Birkbeck College di Londra.",
    "wikipediaSlug": "Slavoj_Žižek",
    "isCosmic": false,
    "tipo": "persona"
  },

  // ─── OPERE FILOSOFICHE ────────────────────────────────────────────────────

  {
    "id": "fil-critica-ragion-pura-1781",
    "title": "Critica della ragion pura — Kant",
    "year": 1781,
    "lat": 54.7104,
    "lng": 20.5104,
    "category": "filosofia",
    "description": "La Critica della ragion pura di Immanuel Kant, pubblicata a Königsberg nel 1781, è una delle opere più importanti dell'intera storia della filosofia occidentale, spesso descritta come la «rivoluzione copernicana» della filosofia moderna. Kant si chiede come sia possibile la conoscenza scientifica a priori — certa e universale — e risponde che non è la mente a conformarsi alla realtà, ma la realtà (così come la conosciamo) a conformarsi alle strutture della mente. Introduce le categorie pure dell'intelletto — sostanza, causalità, realtà — come condizioni trascendentali di ogni esperienza possibile, e delimita rigorosamente il campo di ciò che la ragione può legittimamente conoscere. La distinzione fondamentale tra «fenomeno» (ciò che appare) e «noumeno» (la cosa in sé, inconoscibile) chiude definitivamente la metafisica dogmatica e apre la via alla filosofia critica. L'opera, inizialmente ignorata, divenne il punto di partenza obbligato per tutto il pensiero filosofico dell'Ottocento e del Novecento.",
    "wikipediaSlug": "Critique_of_Pure_Reason",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-fenomenologia-spirito-1807",
    "title": "Fenomenologia dello Spirito — Hegel",
    "year": 1807,
    "lat": 50.9272,
    "lng": 11.5861,
    "category": "filosofia",
    "description": "La Fenomenologia dello Spirito di Georg Hegel, pubblicata a Jena nel 1807, è uno dei libri più difficili e più affascinanti della storia della filosofia, spesso definita «l'Odissea dello Spirito». L'opera descrive il percorso della coscienza umana attraverso successive figure — certezza sensibile, percezione, intelletto, autocoscienza, ragione, spirito, religione, sapere assoluto — in un movimento dialettico che è contemporaneamente storia individuale e storia universale. La celebre sezione sulla «dialettica signore-servo» (Herrschaft und Knechtschaft) ha influenzato profondamente Marx, il pensiero del riconoscimento (Anerkennung) di Kojève e Honneth, la psicanalisi e la teoria postcoloniale. Hegel scrisse l'opera di getto, consegnando le ultime pagine all'editore mentre Napoleone entrava a Jena con il suo esercito — «l'Anima del Mondo a cavallo», come egli scrisse in una lettera. Ancora oggi è considerata una delle opere filosofiche più ambiziose e influenti mai scritte.",
    "wikipediaSlug": "Phenomenology_of_Spirit",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-mondo-volonta-1818",
    "title": "Il mondo come volontà e rappresentazione — Schopenhauer",
    "year": 1818,
    "lat": 51.0504,
    "lng": 13.7373,
    "category": "filosofia",
    "description": "Il mondo come volontà e rappresentazione, pubblicato da Arthur Schopenhauer a Lipsia nel 1818, è la sua opera principale e uno dei capolavori della filosofia ottocentesca. Partendo dalla distinzione kantiana tra fenomeno e cosa in sé, Schopenhauer identifica la cosa in sé con la Volontà — una forza cieca, irrazionale e insaziabile che si manifesta nell'intera natura, dal più semplice impulso fisico al desiderio umano. Il libro è strutturato in quattro libri: epistemologia, ontologia, estetica ed etica, formando un sistema coerente dove la sofferenza è la condizione normale dell'esistenza consapevole. Schopenhauer indica nell'arte — in particolare nella musica, che descrive come la «copia diretta» della Volontà — e nell'ascesi buddhista le uniche vie di temporanea liberazione. Nonostante l'iniziale insuccesso commerciale, l'opera conobbe una straordinaria rivalutazione dopo il 1850 e influenzò profondamente Nietzsche, Wagner, Tolstoj, Proust e Freud.",
    "wikipediaSlug": "The_World_as_Will_and_Representation",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-utilitarismo-1863",
    "title": "Utilitarismo — John Stuart Mill",
    "year": 1863,
    "lat": 51.5074,
    "lng": -0.1278,
    "category": "filosofia",
    "description": "L'Utilitarismo di John Stuart Mill, pubblicato a Londra nel 1863 in forma di saggio, è la difesa più elegante e sofisticata mai scritta del principio di utilità come fondamento dell'etica. Mill ereditò la teoria di Jeremy Bentham — secondo cui la giustizia consiste nel massimizzare la felicità del maggior numero — ma la raffina distinguendo tra piaceri qualitativamente superiori e inferiori: non tutte le soddisfazioni hanno lo stesso valore morale. La celebre affermazione «meglio essere Socrate insoddisfatto che uno stupido soddisfatto» esprime questa gerarchizzazione qualitativa dei piaceri e risponde alle critiche che accusavano l'utilitarismo di essere una «filosofia da porci». Mill introduce anche una sofisticata giustificazione epistemologica del principio di utilità attraverso l'osservazione della condotta umana universale. L'opera è ancora oggi il testo di riferimento nell'etica normativa e nei dibattiti di filosofia morale e politica.",
    "wikipediaSlug": "Utilitarianism_(book)",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-capitale-1867",
    "title": "Il Capitale — Karl Marx",
    "year": 1867,
    "lat": 51.5074,
    "lng": -0.1278,
    "category": "filosofia",
    "description": "Il Capitale (Das Kapital), pubblicato a Amburgo nel 1867, è l'opera principale di Karl Marx e la critica più sistematica mai elaborata dell'economia politica capitalistica. Marx analizza il modo di produzione capitalista a partire dalla merce — forma elementare della ricchezza borghese — svelando come il valore di scambio nasconda i rapporti sociali di sfruttamento: il lavoro operaio produce più valore di quello che riceve come salario, e questa differenza — il «plusvalore» — è appropriata dal capitale. La sezione sulla «giornata lavorativa» e quella sul «feticismo della merce» sono tra le pagine filosoficamente più dense e letterariamente più potenti dell'intera opera. Marx scrisse a Londra, in esilio, tra la miseria e le frequentazioni della British Library, aiutato materialmente ed intellettualmente da Friedrich Engels. Solo il primo volume fu pubblicato in vita; Engels curò i restanti due volumi postumi tra il 1885 e il 1894.",
    "wikipediaSlug": "Das_Kapital",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-zarathustra-1883",
    "title": "Così parlò Zarathustra — Nietzsche",
    "year": 1883,
    "lat": 46.4928,
    "lng": 9.8235,
    "category": "filosofia",
    "description": "Così parlò Zarathustra, pubblicato da Friedrich Nietzsche in quattro parti tra il 1883 e il 1885, è l'opera filosofica più ambiziosa e poetica del filosofo tedesco, scritta in uno stile profetico che richiama la Bibbia e Goethe. Il protagonista Zarathustra — ispirato al fondatore dello zoroastrismo — scende dalla montagna per annunciare agli uomini la morte di Dio, l'avvento dell'Oltreuomo (Übermensch) e la dottrina dell'eterno ritorno: ogni momento della vita si ripete infinite volte, e accettare questa ripetizione è la massima affermazione della vita. L'Übermensch non è un superuomo razziale — come distorceranno i nazisti — ma l'ideale di un essere umano capace di creare i propri valori senza appoggiarsi a morali trascendenti o consolatorie. L'opera influenzò profondamente la letteratura europea (Thomas Mann, Hermann Hesse, André Gide), la musica (Richard Strauss) e la filosofia del Novecento. Rimane uno dei libri filosofici più letti al mondo.",
    "wikipediaSlug": "Thus_Spoke_Zarathustra",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-positivismo-1830",
    "title": "Corso di filosofia positiva — Comte",
    "year": 1830,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Il Corso di filosofia positiva di Auguste Comte, pubblicato a Parigi in sei volumi tra il 1830 e il 1842, è l'opera fondatrice del positivismo e dell'approccio scientifico alle scienze sociali. Comte sostiene che tutta la conoscenza umana evolve attraverso tre stadi: quello teologico, dove i fenomeni sono spiegati con entità soprannaturali; quello metafisico, dove sono spiegati con principi astratti; e quello positivo, dove sono spiegati solo attraverso l'osservazione dei fatti e la scoperta di leggi naturali. In quest'opera sistematizza tutte le scienze in una gerarchia — matematica, astronomia, fisica, chimica, biologia e sociologia — dove ogni scienza più complessa si fonda sulle precedenti. La sociologia, scienza nuova che Comte battezza con questo nome, è al vertice della gerarchia e deve guidare la riorganizzazione razionale della società. L'opera esercitò un'influenza enorme sulla cultura scientifica del secondo Ottocento in Europa e America.",
    "wikipediaSlug": "The_Course_in_Positive_Philosophy",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-aura-opera-1935",
    "title": "L'opera d'arte nell'epoca della sua riproducibilità tecnica — Benjamin",
    "year": 1935,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "L'opera d'arte nell'epoca della sua riproducibilità tecnica è il saggio più celebre di Walter Benjamin, scritto a Parigi nel 1935-1936 e pubblicato postumo. Benjamin sostiene che la riproduzione meccanica — fotografia, cinema — distrugge l'«aura» dell'opera d'arte: quell'irripetibile presenza hic et nunc, quel senso del qui-e-ora dell'originale che conferisce all'arte un'autorità quasi rituale. La perdita dell'aura ha conseguenze politiche ambigue: da un lato democratizza l'accesso all'arte; dall'altro la rende strumento di propaganda politica — come dimostra il cinema nazista — o di alienazione di massa. Il saggio anticipa le teorie dei media di McLuhan, la sociologia dell'immagine di Bourdieu e le riflessioni postmoderne sulla simulazione di Baudrillard. È uno dei testi filosofici più citati nel campo dell'estetica, degli studi culturali e della teoria dei media contemporanei.",
    "wikipediaSlug": "The_Work_of_Art_in_the_Age_of_Mechanical_Reproduction",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-dialettica-illuminismo-1947",
    "title": "Dialettica dell'Illuminismo — Adorno e Horkheimer",
    "year": 1947,
    "lat": 34.0522,
    "lng": -118.2437,
    "category": "filosofia",
    "description": "La Dialettica dell'Illuminismo, scritta da Max Horkheimer e Theodor W. Adorno durante il loro esilio americano e pubblicata ad Amsterdam nel 1947, è uno dei manifesti della Scuola di Francoforte e una delle critiche più penetranti della modernità razionalista. Gli autori sostengono che la ragione illuminista, nel suo sforzo di dominare la natura attraverso la scienza e la tecnica, si è trasformata in uno strumento di dominio sugli esseri umani stessi: il progresso finisce per produrre barbarie, come dimostra emblematicamente Auschwitz. Il celebre capitolo sull'«industria culturale» analizza come il capitalismo avanzato neutralizzi il potenziale critico dell'arte trasformandola in merce standardizzata che pacifica le masse invece di svegliarle. Il saggio su Odisseo come prototipo del soggetto borghese razionale apre prospettive di straordinaria ricchezza interpretativa. L'opera è un punto di riferimento obbligato per la teoria critica, i cultural studies e la filosofia politica contemporanea.",
    "wikipediaSlug": "Dialectic_of_Enlightenment",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-banalita-male-1963",
    "title": "La banalità del male — Hannah Arendt",
    "year": 1963,
    "lat": 31.7683,
    "lng": 35.2137,
    "category": "filosofia",
    "description": "La banalità del male — Eichmann a Gerusalemme è il resoconto filosofico di Hannah Arendt del processo al criminale nazista Adolf Eichmann, svoltosi a Gerusalemme nel 1961, pubblicato nel 1963. Arendt, che seguì il processo per il «New Yorker», propose la tesi provocatoria e controversa che Eichmann non fosse un mostro sadico ma un burocrate ordinario incapace di pensiero morale autonomo: la sua colpa non era il fanatismo ideologico ma l'«assenza di pensiero», l'incapacità di mettersi nei panni delle vittime. Il concetto di «banalità del male» afferma che il male estremo non richiede motivazioni demoniache ma solo l'obbedienza cieca alle procedure e alla «normalità» del sistema. La tesi suscitò un'accesa polemica nella comunità ebraica e nel mondo intellettuale, ma è diventata uno dei contributi filosofici più influenti del Novecento al dibattito sull'etica, la responsabilità individuale e il totalitarismo.",
    "wikipediaSlug": "Eichmann_in_Jerusalem",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-grammatologia-1967",
    "title": "Della grammatologia — Derrida",
    "year": 1967,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Della grammatologia (De la grammatologie) di Jacques Derrida, pubblicato a Parigi nel 1967, è l'opera fondatrice della decostruzione, uno dei metodi di lettura e di analisi critica più influenti della seconda metà del Novecento. Derrida analizza la storia della filosofia occidentale come pervasa da un «logocentrismo» — la preferenza per la parola parlata rispetto alla scrittura — che riflette una metafisica della presenza: la voce sembra più autentica e immediata della scrittura, che è considerata secondaria e derivata. Rovesciando questa gerarchia, Derrida mostra che la scrittura (in senso ampio: la différance, la traccia) è in realtà la condizione di possibilità di qualsiasi segno, anche parlato. La decostruzione, come metodo, non nega il significato ma mette in luce le tensioni interne e le gerarchie implicite nei testi filosofici e letterari. L'influenza di Derrida si estende dalla filosofia alla critica letteraria, agli studi legali, all'architettura e alla teoria culturale.",
    "wikipediaSlug": "Of_Grammatology",
    "isCosmic": false,
    "tipo": "opera"
  },
  {
    "id": "fil-simulacri-1981",
    "title": "Simulacra e Simulazione — Baudrillard",
    "year": 1981,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Simulacra e Simulazione di Jean Baudrillard, pubblicato a Parigi nel 1981, è il testo in cui il filosofo francese sviluppa la sua teoria dell'iperrealtà e della simulazione, diventando uno dei manifesti del postmodernismo critico. Baudrillard sostiene che nell'era contemporanea dei media, della pubblicità e della società dello spettacolo, i segni non rimandano più a una realtà esterna ma si autoreferenziano in un sistema di simulacri: copie senza originale che finiscono per sembrare «più reali del reale». Il percorso che conduce dal simbolismo all'iperrealtà passa attraverso quattro fasi: il segno riflette la realtà, poi la maschera, poi ne nasconde l'assenza, infine non ha alcun rapporto con la realtà. La Disneyland descritta nel libro è il simulacro perfetto: esiste per convincerci che il resto dell'America sia «reale». Il film Matrix (1999) cita esplicitamente il libro, portando queste idee all'attenzione di milioni di spettatori.",
    "wikipediaSlug": "Simulacra_and_Simulation",
    "isCosmic": false,
    "tipo": "opera"
  },

  // ─── MOVIMENTI FILOSOFICI ─────────────────────────────────────────────────

  {
    "id": "fil-pragmatismo-1870",
    "title": "Pragmatismo americano",
    "year": 1870,
    "lat": 42.3601,
    "lng": -71.0589,
    "category": "filosofia",
    "description": "Il pragmatismo americano nacque nel Metaphysical Club di Cambridge, Massachusetts, negli anni 1870, grazie all'iniziativa di Charles Sanders Peirce, William James e Oliver Wendell Holmes Jr. È la prima grande corrente filosofica originale americana: rifiuta la metafisica astratta e sostiene che il significato di un concetto va misurato dalle sue conseguenze pratiche e verificabili nell'esperienza. Peirce elaborò il «principio pragmatico» come metodo per chiarire i concetti; William James lo trasformò in una teoria della verità — vera è l'idea che «funziona» nella nostra esperienza — e John Dewey lo estese alla pedagogia, alla democrazia e alla scienza sociale. Il pragmatismo influenzò profondamente la psicologia funzionalista, il diritto americano (attraverso Holmes e il realismo giuridico), l'educazione e la sociologia. Nel tardo Novecento, Richard Rorty ne ha proposto una versione postmoderna che ha rinvigorito il dibattito filosofico internazionale.",
    "wikipediaSlug": "Pragmatism",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-analitica-mov-1900",
    "title": "Filosofia analitica",
    "year": 1900,
    "lat": 52.2053,
    "lng": 0.1218,
    "category": "filosofia",
    "description": "La filosofia analitica si sviluppò a Cambridge nei primissimi anni del Novecento grazie a Gottlob Frege, Bertrand Russell e G.E. Moore, in reazione all'idealismo hegeliano britannico di Francis Herbert Bradley. Il tratto distintivo è il metodo: l'analisi logica del linguaggio come strumento privilegiato per dissolvere i problemi filosofici tradizionali, spesso causati dall'imprecisione concettuale o da errori linguistici. Ludwig Wittgenstein portò questo programma alle sue estreme conseguenze nel Tractatus (1921) e poi lo problematizzò radicalmente nelle Ricerche filosofiche (1953). Il Circolo di Vienna radicalizzò l'approccio nella direzione del positivismo logico, sostenendo che solo le proposizioni verificabili empiricamente o logicamente vere hanno significato. Oggi la filosofia analitica è la corrente dominante nelle università anglosassoni, australiane e sempre più europee, e abbraccia settori come filosofia della mente, etica, filosofia del linguaggio e metafisica.",
    "wikipediaSlug": "Analytic_philosophy",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-esistenzialismo-mov-1945",
    "title": "Esistenzialismo",
    "year": 1945,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "L'esistenzialismo è il movimento filosofico che domina la cultura europea del dopoguerra, sviluppatosi soprattutto nella Parigi liberata del 1944-1950 attorno alle figure di Jean-Paul Sartre, Simone de Beauvoir e Albert Camus. La sua tesi centrale — elaborata da Sartre nella conferenza L'esistenzialismo è un umanismo (1945) — è che «l'esistenza precede l'essenza»: non esiste una natura umana predefinita, e ogni individuo è integralmente responsabile di ciò che diventa attraverso le proprie scelte. Le radici filosofiche risalgono a Kierkegaard, Nietzsche, Husserl e Heidegger, anche se quest'ultimo rifiutò l'etichetta esistenzialista. L'esistenzialismo si nutrì dell'esperienza della Resistenza, della Shoah e della bomba atomica come esperienze limite che richiamavano l'umanità alla responsabilità assoluta. Ebbe uno straordinario impatto culturale attraverso il teatro (Sartre, Beckett), il romanzo (Camus, de Beauvoir) e la moda intellettuale dei caffè di Saint-Germain-des-Prés.",
    "wikipediaSlug": "Existentialism",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-ling-ordinario-1950",
    "title": "Filosofia del linguaggio ordinario",
    "year": 1950,
    "lat": 51.7520,
    "lng": -1.2577,
    "category": "filosofia",
    "description": "La filosofia del linguaggio ordinario è una corrente della filosofia analitica sviluppatasi principalmente a Oxford negli anni Cinquanta, attorno alle figure di Gilbert Ryle, J.L. Austin, P.F. Strawson e del tardo Wittgenstein a Cambridge. Diversamente dal positivismo logico, che cercava un linguaggio ideale formalmente preciso, questa corrente sostiene che il linguaggio naturale quotidiano non è impreciso o difettoso ma possiede una propria logica e ricchezza che i filosofi devono analizzare con attenzione. Austin sviluppò la teoria degli atti linguistici, distinguendo tra ciò che diciamo (atto locutorio), ciò che facciamo con le parole (atto illocutorio) e l'effetto che produciamo (atto perlocutorio). Ryle criticò il «mito della ghost in the machine» di Cartesio, mostrando che i problemi mente-corpo sono spesso errori categoriali. Questa tradizione ha influenzato profondamente la linguistica pragmatica, la filosofia del diritto e le scienze cognitive.",
    "wikipediaSlug": "Ordinary_language_philosophy",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-filosofia-mente-1970",
    "title": "Filosofia della mente",
    "year": 1970,
    "lat": 42.3601,
    "lng": -71.0589,
    "category": "filosofia",
    "description": "La filosofia della mente si è imposta come uno dei campi più fertili e vivaci della filosofia contemporanea a partire dagli anni Settanta, alimentata dallo sviluppo parallelo delle scienze cognitive, della neurobiologia e dell'intelligenza artificiale. Le questioni centrali — cos'è la coscienza? come si relaziona il mentale al fisico? è possibile costruire macchine che pensano davvero? — attraggono filosofi, psicologi, neurobiologi e informatici. Il dibattito tra dualismo, materialismo eliminativo, funzionalismo e panpsichismo ha prodotto alcune delle controversie intellettuali più vivaci del tardo Novecento, con protagonisti come Daniel Dennett, John Searle, David Chalmers, Patricia Churchland e Thomas Nagel. L'articolo di Nagel «What Is It Like to Be a Bat?» (1974) e il «problema difficile della coscienza» di Chalmers (1995) sono diventati punti di riferimento classici. La disciplina è in costante dialogo con le neuroscienze e con le domande etiche poste dall'intelligenza artificiale.",
    "wikipediaSlug": "Philosophy_of_mind",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-postmodernismo-mov-1979",
    "title": "Postmodernismo filosofico",
    "year": 1979,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Il postmodernismo filosofico emerge come corrente riconoscibile con la pubblicazione de La condizione postmoderna di Jean-François Lyotard nel 1979, testo che diagnostica la fine delle «grandi narrazioni» — le ideologie totalizzanti come il marxismo, il liberalismo e il positivismo — che avevano strutturato il pensiero moderno. Il postmodernismo non è una scuola unitaria ma un insieme di posizioni critiche che accomunano pensatori come Derrida, Foucault, Baudrillard, Rorty e Lyotard nel rifiuto delle certezze fondazionali della modernità: verità assoluta, soggetto unificato, progresso lineare, ragione universale. In questo orizzonte di «incredulità verso le metanarrazioni», la conoscenza è sempre situata, parziale e implicata in rapporti di potere. Il postmodernismo ha avuto un impatto enorme sugli studi culturali, letterari, architettonici e sulle scienze sociali, pur essendo stato oggetto di forti critiche da parte di filosofi analitici, marxisti e realisti.",
    "wikipediaSlug": "Postmodern_philosophy",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-femminismo-fil-1960",
    "title": "Femminismo filosofico",
    "year": 1960,
    "lat": 48.8566,
    "lng": 2.3522,
    "category": "filosofia",
    "description": "Il femminismo filosofico si sviluppò come corrente teorica autonoma a partire dagli anni Sessanta, radicandosi nell'esperienza del movimento per i diritti delle donne e nella critica alle strutture di potere patriarcali che attraversano la filosofia, la politica e la cultura occidentale. Simone de Beauvoir aveva già aperto la strada con Il secondo sesso (1949), mostrando che «donna non si nasce, si diventa» — cioè che il genere è una costruzione sociale. Negli anni Settanta e Ottanta, il femminismo filosofico si diversificò in correnti: il femminismo liberale che richiede la parità nei diritti; il femminismo radicale che critica l'intera struttura patriarcale; il femminismo della differenza che rivaluta le caratteristiche femminili come cura e relazionalità. Con Judith Butler e la queer theory negli anni Novanta, il femminismo filosofico abbracciò una critica più radicale delle categorie stesse di «donna» e «genere» come costruzioni performative. È oggi una delle aree più dinamiche e internazionalmente attive della filosofia.",
    "wikipediaSlug": "Feminist_philosophy",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-bioetica-mov-1970",
    "title": "Bioetica",
    "year": 1970,
    "lat": 38.9072,
    "lng": -77.0369,
    "category": "filosofia",
    "description": "La bioetica emerge come disciplina autonoma nei primi anni Settanta, quando il biochimico Van Rensselaer Potter coniò il termine nel 1970 per indicare una nuova scienza che coniugasse la conoscenza biologica con i valori umani. Lo sviluppo impetuoso della medicina moderna — trapianti d'organo, rianimazione, ingegneria genetica, sperimentazione farmaceutica — pose domande etiche urgenti che la filosofia tradizionale non era attrezzata ad affrontare in modo pratico. Il Rapporto Belmont (1979), prodotto dalla Commissione Nazionale americana, stabilì i principi fondativi della bioetica medica: autonomia del paziente, beneficenza, non maleficenza e giustizia. Filosofi come Peter Singer, Tom Beauchamp, James Childress e Tristram Engelhardt hanno sviluppato frameworks etici per questioni come l'eutanasia, l'aborto, la genetica, i diritti degli animali e l'allocazione delle risorse sanitarie. La bioetica è oggi parte integrante della formazione medica e dei comitati etici ospedalieri in tutto il mondo.",
    "wikipediaSlug": "Bioethics",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-transuman-mov-2000",
    "title": "Transhumanesimo",
    "year": 2000,
    "lat": 51.7520,
    "lng": -1.2577,
    "category": "filosofia",
    "description": "Il transhumanesimo è il movimento filosofico e culturale che sostiene la possibilità e la desiderabilità di migliorare radicalmente la condizione umana attraverso la tecnologia, superando i limiti biologici della mortalità, della malattia e delle capacità cognitive. Le sue radici risalgono alle utopie tecnologiche del Novecento e all'opera di Julian Huxley, che coniò il termine nel 1957, ma la sua forma istituzionale attuale nasce nell'ambiente accademico californiano e britannico degli anni Novanta. Nick Bostrom fondò nel 2004 il Future of Humanity Institute a Oxford, mentre Ray Kurzweil sviluppò la visione della «Singolarità tecnologica» — il momento in cui l'intelligenza artificiale supererà quella umana — nel suo La singolarità è vicina (2005). I temi centrali sono il prolungamento radicale della vita (longevism), il potenziamento cognitivo, la crionica e il mind uploading. Il transhumanesimo è al centro di dibattiti etici intensi che coinvolgono filosofi, bioeticisti, teologi e scienziati.",
    "wikipediaSlug": "Transhumanism",
    "isCosmic": false,
    "tipo": "movimento"
  },
  {
    "id": "fil-etica-ia-2010",
    "title": "Etica dell'intelligenza artificiale",
    "year": 2010,
    "lat": 51.7520,
    "lng": -1.2577,
    "category": "filosofia",
    "description": "L'etica dell'intelligenza artificiale è emersa come campo filosofico e normativo urgente nel primo decennio del XXI secolo, man mano che i sistemi di IA hanno cominciato a prendere decisioni con conseguenze significative per la vita delle persone. Le questioni centrali riguardano la responsabilità algoritmica (chi risponde quando un sistema automatizzato sbaglia?), i bias dei dati di addestramento, la sorveglianza di massa, le armi autonome e le implicazioni a lungo termine di un'intelligenza artificiale generale. Il Future of Humanity Institute di Nick Bostrom a Oxford, il Machine Intelligence Research Institute e il Center for Human-Compatible AI di Stuart Russell a Berkeley hanno prodotto le riflessioni filosofiche più influenti. L'Unione Europea ha adottato nel 2024 l'AI Act, prima regolamentazione globale vincolante dell'IA basata su principi etici come trasparenza, proporzionalità e rispetto dei diritti fondamentali. L'etica dell'IA è oggi uno dei campi accademici a più rapida crescita, che unisce filosofi, giuristi, informatici e policy maker.",
    "wikipediaSlug": "Ethics_of_artificial_intelligence",
    "isCosmic": false,
    "tipo": "movimento"
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
