/**
 * Classifica automaticamente il campo `tipo` per tutti gli eventi di events.json.
 * Regole basate su categoria, pattern nel titolo e keyword nella descrizione.
 * Valori: persona | evento | conflitto | opera | luogo | scoperta
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// Keyword universali per CONFLITTO (si applicano a tutte le categorie)
var CONFLITTO_RE = /battaglia (di|del|della|delle|d'|alle )|guerra (di|del|della|civile|punica|persiana|mondiale|dei|delle|fredda)|invasione (di|del|della|delle)|assedio (di|del|della|delle)|conquista (di|del|della|delle)|caduta (di|del|della|delle|dell')|sacco di |crociate?\b|crociata\b|liberazione (di|del|della)|presa di |attentato (di|a |del)|attacco (a |di |del)|bombardamento (di|a )|d-day\b|sbarco in normandia|sterminio|genocidio\b|olocausto\b|shoah\b|resistenza italiana|rivolta (di|del|della)|ribellione (di|del|della)|insurrezione\b|assalto\b|offensiva\b|distruzione di |maso* distruzione/i;

function classify(ev) {
  var t   = ev.title.toLowerCase();
  var d   = ev.description.toLowerCase();
  var cat = ev.category;

  // ── CONFLITTO universale (priorità su tutto) ──────────────────────────────
  if (CONFLITTO_RE.test(ev.title)) return 'conflitto';

  // ── COSMO ─────────────────────────────────────────────────────────────────
  if (cat === 'cosmo') {
    if (/apollo|voyager|sputnik|gagarin|missione|lancio|telescopio|hubble|stazione spaziale/.test(t)) return 'scoperta';
    return 'evento';
  }

  // ── GEOLOGIA ──────────────────────────────────────────────────────────────
  if (cat === 'geologia') return 'evento';

  // ── SCIENZA ───────────────────────────────────────────────────────────────
  if (cat === 'scienza') {
    if (!/ — | - /.test(t) && /nato|nacque|fisico|matematico|chimico|biologo|astronomo|medico|ingegnere/.test(d)) return 'persona';
    return 'scoperta';
  }

  // ── ARTE ──────────────────────────────────────────────────────────────────
  if (cat === 'arte') {
    if (/ — | - /.test(t)) return 'opera';
    if (/scuola|movimento|corrente|stile|periodo|impressionismo|surrealismo|dadaismo|barocco|rinascimento|gotico|romanticismo|futurismo|cubismo/.test(t)) return 'evento';
    if (/teatro|museo|galleria|biblioteca|palazzo|edificio|cattedrale|duomo|basilica|abbazia|anfiteatro/.test(t)) return 'luogo';
    return 'persona';
  }

  // ── MUSICA ────────────────────────────────────────────────────────────────
  if (cat === 'musica') {
    if (/ — | - /.test(t)) return 'opera';
    if (/festival|teatro|sala|conservatorio|opera house/.test(t)) return 'luogo';
    if (/movimento|stile|jazz|blues|rock|pop|barocco|classicismo|romanticismo|canto|genere/.test(t) && !/nato|nacque/.test(d)) return 'evento';
    return 'persona';
  }

  // ── FILOSOFIA / RELIGIONE ─────────────────────────────────────────────────
  if (cat === 'filosofia') {
    // Testi e opere filosofiche/religiose con " — "
    if (/ — /.test(t)) {
      var afterF = t.split(' — ')[1] || '';
      if (/summa|critica|etica|metafisica|dialogo|trattato|commedia|libro|codice|bibbia|corano|vangelo|talmud|corpus|confessioni|città di dio|arte della guerra|principe|leviatano|capitale|manifesto|così parlò|essere e nulla/.test(afterF)) return 'opera';
      if (/concilio|sinodo|scisma|riforma|chiesa|papato|nascita|fondazione|illuminazione|egira|creazione/.test(afterF)) return 'evento';
      return 'persona'; // filosofi con opera
    }
    // Concili, scismi, riforme religiose, movimenti
    if (/concilio|scisma|riforma protestante|controriforma|inquisizione|sinodo|grande scisma|egira|fondazione dell'islam|nascita del buddhismo|illuminazione del buddha/.test(t)) return 'evento';
    // Papato come istituzione
    if (/papato|santa sede|pontificato/.test(t) && !/papa [a-z]+\b/.test(t)) return 'evento';
    // Singoli papi, filosofi, profeti → persona
    return 'persona';
  }

  // ── SPORT ─────────────────────────────────────────────────────────────────
  if (cat === 'sport') {
    // Singoli atleti → persona
    if (/jesse owens|muhammad ali|pelé|pele\b|usain bolt|roger bannister|ayrton senna|eddy merckx|michael jordan|serena williams/.test(t)) return 'persona';
    // Tutto il resto (olimpiadi, campionati) → evento
    return 'evento';
  }

  // ── STORIA ────────────────────────────────────────────────────────────────
  if (cat === 'storia') {

    // LUOGO: fondazione, costruzione, edifici, città
    if (/fondazione di|costruzione (di|del|della|delle)|eruzione di|edificazione|le piramidi|il colosseo|il partenone|pantheon|anfiteatro|mura di|muraglia|torre (di|eiffel)|castello di|palazzo di|cattedrale|duomo di|basilica|acropoli|agorà|foro romano|acquedotto|via appia|stonehenge|machu picchu|angkor|petra |colosseo|alhambra/.test(t)) return 'luogo';
    if (/^fondazione|^costruzione|^nascita di (roma|atene|cartagine|babilonia|gerico|costantinopoli|venezia)/.test(t)) return 'luogo';

    // EVENTO: rivoluzioni, epidemie, trattati, proclamazioni (non conflitti — già catturati sopra)
    if (/rivoluzione (francese|americana|industriale|russa|scientifica|gloriosa)/.test(t)) return 'evento';
    if (/trattato (di|del|della)|dichiarazione (di|d'|del)|costituzione\b|elezione\b|proclamazione (dell'|del|di)|indipendenza\b|unificazione\b|abolizione (di|della|dell'|dello)|accordo (di)|patto (di)|armistizio\b|capitolazione\b/.test(t)) return 'evento';
    if (/olimpiad|campionato|coppa del mondo|marathon|giochi (olimpici|panellenici)|stadio/.test(t)) return 'evento';
    if (/epidemia|pandemia|peste|colera|vaiolo|influenza spagnola|morte nera/.test(t)) return 'evento';
    if (/risorgimento|resistenza|occupazione|deportazione/.test(t)) return 'evento';
    if (/primo volo|luna|allunaggio|fusione nucleare/.test(t)) return 'evento';

    // SCOPERTA in storia
    if (/scoperta dell'america|scoperta del nuovo mondo|rotta (delle spezie|per l'india)|circumnavigazione/.test(t)) return 'scoperta';

    // OPERA: documenti, leggi, manoscritti
    if (/magna carta|codice di hammurabi|corpus juris|habeas corpus|editto di|bolla d'oro|bill of rights|declaration of independence|dichiarazione di indipendenza/.test(t)) return 'opera';
    if (/ — (il |la |le |i |gli |un |una )?(libro|codice|manoscritto|bibbia|corano|vangelo|commedia|iliade|odissea|eneide|divina commedia|trattato di|legge delle)/.test(t)) return 'opera';

    // LUOGO: "Persona — Fondazione/Costruzione di Luogo"
    if (/ — (fondazione|costruzione|edificazione|inaugurazione|consacrazione) (di |del |della |delle |dei |degli )/.test(t)) return 'luogo';
    if (/ziggurat|mastaba|obelisco|faro di|biblioteca di|mausoleo di|arco di|piazza di|porto di/.test(t)) return 'luogo';

    // PERSONA: leader, regnanti, esploratori
    if (/ — /.test(t)) {
      var after = t.split(' — ')[1] || '';
      if (/primo ministro|presidente|imperatore|faraone|sultano|califfo|papa|doge|re |regina |khan|imperatrice|dittatore|segretario generale/.test(after)) return 'persona';
      return 'persona';
    }

    if (/homo sapiens|homo erectus|homo habilis|homo heidelbergensis|neandertal|homo floresiensis/.test(t)) return 'persona';
    if (/primo ministro|presidente della|imperatore|faraone|sultano|califfo|re (di|d')|regina|doge|papa |cardinale|vescovo|dittatore/.test(t)) return 'persona';
    if (/\bnato\b|nascita di |nato a /.test(t) && !/stato nascente|istituto|partito|movimento/.test(t)) return 'persona';

    var words = t.trim().split(/\s+/);
    if (words.length <= 3 && /^[A-ZÀ-Ö]/.test(ev.title) && !/il |la |le |i |gli |un |una /.test(t.slice(0, 15))) {
      if (/nato|nacque|regnò|governò|fondò|filosofo|poeta|scrittore|politico|generale|condottiero|conquistatore|esploratore|scienziato|matematico|astronomo/.test(d)) return 'persona';
    }

    return 'evento';
  }

  return 'evento';
}

var after  = {};
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
