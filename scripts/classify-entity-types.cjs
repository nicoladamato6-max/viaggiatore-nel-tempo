/**
 * Classifica automaticamente il campo `tipo` per tutti gli eventi di events.json.
 * Valori: persona | evento | movimento | organizzazione | opera | luogo | scoperta
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// ── MOVIMENTO: movimenti artistici, culturali, filosofici, politici ────────────
// Entità che spannano un periodo, non un singolo momento
var MOVIMENTO_RE = /impressionismo|surrealismo|dadaismo|futurismo|cubismo|espressionismo|simbolismo|romanticismo|neoclassicismo|realismo\b|art nouveau|art dec[oò]|pop art|astrattismo|pointillismo|fauvismo|costruttivismo|minimalismo|postmodernismo|modernismo|manierismo|gotico\b|rinascimento.*stile|stile.*rinascimento|barocco.*movimento|movimento.*barocco|illuminismo\b|umanesimo\b|stoicismo\b|epicureismo\b|neoplatonismo\b|esistenzialismo\b|positivismo\b|marxismo\b|socialismo\b|comunismo\b|fascismo\b|nazismo\b|liberalismo\b|femminismo\b|nazionalismo\b|anarchismo\b|romanticismo.*letterario|naturalismo\b|verismo\b|decadentismo\b|ermetismo\b|simbolismo\b|scolastica\b|sofisti\b|cinismo\b|pirronismo\b|taoismo\b|confucianesimo\b|buddhi[sm]mo\b|islamismo\b|protestantesimo\b|calvinismo\b|anglicanesimo\b|rinascita culturale|risorgimento culturale|movimento (artistico|culturale|filosofico|politico|letterario|romantico|illuminista)/i;

// ── ORGANIZZAZIONE: stati fondati, istituzioni, ordini, partiti, università ────
var ORGANIZZAZIONE_RE = /fondazione (dell'|del |dei |della |delle |di )(onu\b|nato\b|ue\b|unione europea|nazioni unite|società delle nazioni|croce rossa|fmi\b|banca mondiale|unesco|otan|cee\b|fondo monetario|senato romano|parlamento|accademia di platone|liceo di aristotele|università|accademia|scuola di|biblioteca di alessandria|partito (comunista|fascista|nazista|socialista|liberale|democratico|laburista)|ordine (dei|dei gesuiti|dei domenicani|francescano|benedettino|templare|ospitaliero)|compagnia di gesù|santa inquisizione|lega (anseatica|lombarda)|santa alleanza|internazionale (comunista|socialista)|komintern|comintern|loggia massonica|accademia dei lincei|royal society|accademia di scienze|accademia française|societa'? geografica|croce rossa)|nascita (dell'|dello |della |dei )(stato|impero|regno|repubblica|confederazione|unione|commonwealth)|primo (stato|parlamento|senato|governo|congresso)\b|repubblica romana\b|impero romano\b|sacro romano impero|confederazione elvetica|prima internazionale|seconda internazionale/i;

function classify(ev) {
  var t   = ev.title;
  var tl  = t.toLowerCase();
  var d   = ev.description.toLowerCase();
  var cat = ev.category;

  // ── MOVIMENTO (priorità alta — si applica a tutte le categorie) ─────────────
  if (MOVIMENTO_RE.test(tl)) return 'movimento';

  // ── ORGANIZZAZIONE (priorità alta) ─────────────────────────────────────────
  if (ORGANIZZAZIONE_RE.test(tl)) return 'organizzazione';

  // ── COSMO ──────────────────────────────────────────────────────────────────
  if (cat === 'cosmo') {
    if (/apollo|voyager|sputnik|gagarin|missione|lancio|telescopio|hubble|stazione spaziale/.test(tl)) return 'scoperta';
    return 'evento';
  }

  // ── GEOLOGIA ───────────────────────────────────────────────────────────────
  if (cat === 'geologia') return 'evento';

  // ── SCIENZA ────────────────────────────────────────────────────────────────
  if (cat === 'scienza') {
    if (!/ — | - /.test(tl) && /nato|nacque|fisico|matematico|chimico|biologo|astronomo|medico|ingegnere/.test(d)) return 'persona';
    return 'scoperta';
  }

  // ── ARTE ───────────────────────────────────────────────────────────────────
  if (cat === 'arte') {
    if (/ — | - /.test(tl)) return 'opera';
    if (/scuola|periodo|stile|corrente/.test(tl)) return 'movimento';
    if (/teatro|museo|galleria|biblioteca|palazzo|edificio|cattedrale|duomo|basilica|abbazia|anfiteatro/.test(tl)) return 'luogo';
    return 'persona';
  }

  // ── MUSICA ─────────────────────────────────────────────────────────────────
  if (cat === 'musica') {
    if (/ — | - /.test(tl)) return 'opera';
    if (/festival|teatro|sala|conservatorio|opera house/.test(tl)) return 'luogo';
    if (/stile|genere|jazz|blues|rock|pop|barocco|classicismo|canto/.test(tl) && !/nato|nacque/.test(d)) return 'movimento';
    return 'persona';
  }

  // ── FILOSOFIA / RELIGIONE ──────────────────────────────────────────────────
  if (cat === 'filosofia') {
    if (/ — /.test(tl)) {
      var afterF = tl.split(' — ')[1] || '';
      if (/summa|critica|etica|metafisica|dialogo|trattato|commedia|libro|codice|bibbia|corano|vangelo|talmud|corpus|confessioni|città di dio|arte della guerra|principe|leviatano|capitale|manifesto|così parlò|essere e nulla/.test(afterF)) return 'opera';
      if (/concilio|sinodo|scisma|riforma|chiesa|papato|nascita|fondazione|illuminazione|egira|creazione/.test(afterF)) return 'evento';
      return 'persona';
    }
    if (/concilio|sinodo|scisma|riforma protestante|controriforma|inquisizione|grande scisma|egira|nascita del buddhismo|illuminazione del buddha/.test(tl)) return 'evento';
    if (/papato|santa sede|pontificato/.test(tl) && !/papa [a-z]+\b/.test(tl)) return 'organizzazione';
    return 'persona';
  }

  // ── SPORT ──────────────────────────────────────────────────────────────────
  if (cat === 'sport') {
    if (/jesse owens|muhammad ali|pelé|pele\b|usain bolt|roger bannister|ayrton senna|eddy merckx|michael jordan|serena williams/.test(tl)) return 'persona';
    return 'evento';
  }

  // ── STORIA ─────────────────────────────────────────────────────────────────
  if (cat === 'storia') {

    // LUOGO: fondazione fisica di città, monumenti
    if (/fondazione di|costruzione (di|del|della|delle)|le piramidi|il colosseo|il partenone|pantheon|anfiteatro|mura di|muraglia|torre (di|eiffel)|castello di|palazzo di|cattedrale|duomo di|basil|acropoli|agorà|foro romano|acquedotto|via appia|stonehenge|machu picchu|angkor|petra |colosseo|alhambra/.test(tl)) return 'luogo';
    if (/^fondazione|^costruzione|^nascita di (roma|atene|cartagine|babilonia|gerico|costantinopoli|venezia)/.test(tl)) return 'luogo';

    // EVENTO: guerre, battaglie, rivoluzioni, trattati
    if (/battaglia (di|del|della|delle|d')|guerra (di|del|della|civile|punica|persiana|mondiale|dei|fredda)|invasione (di|del|della)|assedio (di|del|della)|conquista (di|del|della)|caduta (di|del|della|dell')|sacco di |crociata|crociate|liberazione (di|del|della)|presa di |attentato|bombardamento|d-day|sbarco in normandia|genocidio|olocausto|shoah/.test(tl)) return 'evento';
    if (/rivoluzione (francese|americana|industriale|russa|scientifica|gloriosa)/.test(tl)) return 'evento';
    if (/trattato (di|del|della)|dichiarazione (di|d'|del)|costituzione\b|elezione\b|proclamazione (dell'|del|di)|indipendenza\b|unificazione\b|abolizione (di|della|dell'|dello)|armistizio\b|capitolazione\b/.test(tl)) return 'evento';
    if (/epidemia|pandemia|peste|colera|vaiolo|influenza spagnola|morte nera/.test(tl)) return 'evento';
    if (/risorgimento|resistenza italiana|deportazione/.test(tl)) return 'evento';
    if (/primo volo|allunaggio|fusione nucleare/.test(tl)) return 'evento';

    // SCOPERTA in storia
    if (/scoperta dell'america|scoperta del nuovo mondo|rotta (delle spezie|per l'india)|circumnavigazione/.test(tl)) return 'scoperta';

    // OPERA: documenti, leggi, manoscritti
    if (/magna carta|codice di hammurabi|corpus juris|habeas corpus|editto di|bolla d'oro|bill of rights|declaration of independence|dichiarazione di indipendenza/.test(tl)) return 'opera';
    if (/ — (il |la |le |i |gli |un |una )?(libro|codice|manoscritto|bibbia|corano|vangelo|commedia|iliade|odissea|eneide|divina commedia|trattato di|legge delle)/.test(tl)) return 'opera';

    // LUOGO: "Persona — Fondazione di Luogo"
    if (/ — (fondazione|costruzione|edificazione|inaugurazione|consacrazione) (di |del |della |delle |dei |degli )/.test(tl)) return 'luogo';
    if (/ziggurat|mastaba|obelisco|faro di|biblioteca di|mausoleo di|arco di|porto di/.test(tl)) return 'luogo';

    // PERSONA: titoli "Nome — Ruolo"
    if (/ — /.test(tl)) {
      var after = tl.split(' — ')[1] || '';
      if (/primo ministro|presidente|imperatore|faraone|sultano|califfo|papa|doge|re |regina |khan|imperatrice|dittatore|segretario generale/.test(after)) return 'persona';
      return 'persona';
    }

    if (/homo sapiens|homo erectus|homo habilis|homo heidelbergensis|neandertal|homo floresiensis/.test(tl)) return 'persona';
    if (/primo ministro|presidente della|imperatore|faraone|sultano|califfo|re (di|d')|regina|doge|papa |cardinale|vescovo|dittatore/.test(tl)) return 'persona';
    if (/\bnato\b|nascita di |nato a /.test(tl) && !/stato nascente|istituto|partito|movimento/.test(tl)) return 'persona';

    var words = tl.trim().split(/\s+/);
    if (words.length <= 3 && /^[A-ZÀ-Ö]/.test(t) && !/il |la |le |i |gli |un |una /.test(tl.slice(0, 15))) {
      if (/nato|nacque|regnò|governò|fondò|filosofo|poeta|scrittore|politico|generale|condottiero|conquistatore|esploratore|scienziato|matematico|astronomo/.test(d)) return 'persona';
    }

    return 'evento';
  }

  return 'evento';
}

var after   = {};
var changed = 0;

var classified = events.map(function(ev) {
  var tipo = classify(ev);
  if (ev.tipo !== tipo) changed++;
  after[tipo] = (after[tipo] || 0) + 1;
  return Object.assign({}, ev, { tipo: tipo });
});

fs.writeFileSync(eventsPath, JSON.stringify(classified, null, 2), 'utf8');

console.log('Classificazione completata. Modificati: ' + changed + '/' + events.length);
console.log('Distribuzione tipo:');
Object.keys(after).sort().forEach(function(k) { console.log('  ' + k + ': ' + after[k]); });
