/**
 * Classifica automaticamente il campo `tipo` per tutti gli eventi di events.json.
 * Regole basate su categoria, pattern nel titolo e keyword nella descrizione.
 * I valori sono: persona | evento | opera | luogo | scoperta
 */
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../src/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

function classify(ev) {
  var t   = ev.title.toLowerCase();
  var d   = ev.description.toLowerCase();
  var cat = ev.category;

  // ── COSMO ──────────────────────────────────────────────────────────────────
  if (cat === 'cosmo') {
    if (/apollo|voyager|sputnik|gagarin|missione|lancio|telescopio|hubble|stazione spaziale/.test(t)) return 'scoperta';
    return 'evento';
  }

  // ── GEOLOGIA ───────────────────────────────────────────────────────────────
  if (cat === 'geologia') {
    if (/eruzione|vulcan|terremoto|tsunami|inondazione|alluvione/.test(t)) return 'evento';
    return 'evento';
  }

  // ── SCIENZA ────────────────────────────────────────────────────────────────
  if (cat === 'scienza') {
    // Solo il nome dello scienziato senza opera/scoperta indicata
    if (!/ — | - /.test(t) && /nato|nacque|fisico|matematico|chimico|biologo|astronomo|medico|ingegnere/.test(d)) return 'persona';
    return 'scoperta';
  }

  // ── ARTE ───────────────────────────────────────────────────────────────────
  if (cat === 'arte') {
    if (/ — | - /.test(t)) return 'opera';
    if (/scuola|movimento|corrente|stile|periodo|impressionismo|surrealismo|dadaismo|barocco|rinascimento|gotico|romanticismo|futurismo|cubismo/.test(t)) return 'evento';
    if (/teatro|museo|galleria|biblioteca|palazzo|edificio|cattedrale|duomo|basilica|abbazia|anfiteatro/.test(t)) return 'luogo';
    return 'persona';
  }

  // ── MUSICA ─────────────────────────────────────────────────────────────────
  if (cat === 'musica') {
    if (/ — | - /.test(t)) return 'opera';
    if (/festival|teatro|sala|conservatorio|opera house/.test(t)) return 'luogo';
    if (/movimento|stile|jazz|blues|rock|pop|barocco|classicismo|romanticismo|canto|genere/.test(t) && !/nato|nacque/.test(d)) return 'evento';
    return 'persona';
  }

  // ── STORIA ─────────────────────────────────────────────────────────────────
  if (cat === 'storia') {

    // LUOGO: fondazione, costruzione, edifici, città
    if (/fondazione di|costruzione (di|del|della|delle)|eruzione di|edificazione|le piramidi|il colosseo|il partenone|pantheon|anfiteatro|mura di|muraglia|torre (di|eiffel)|castello di|palazzo di|cattedrale|duomo di|basilica|acropoli|agorà|foro romano|acquedotto|via appia|stonehenge|machu picchu|angkor|petra |colosseo|alhambra/.test(t)) return 'luogo';
    if (/^fondazione|^costruzione|^nascita di (roma|atene|cartagine|babilonia|gerico|costantinopoli|venezia)/.test(t)) return 'luogo';

    // EVENTO: guerre, battaglie, rivoluzioni, disastri, trattati, eventi politici
    if (/battaglia (di|del|della|delle)|guerra (di|del|della|civile|punica|persiana|mondiale|dei|fredda)|rivoluzione (francese|americana|industriale|russa|scientifica|gloriosa)|invasione (di|del|della)|assedio (di|del|della)|conquista (di|del|della)|caduta (di|del|della|dell')|sacco di|liberazione (di|del|della)|presa di|crociata|crociate|conflitto|attentato|attacco|bombardamento/.test(t)) return 'evento';
    if (/trattato (di|del|della)|dichiarazione (di|d'|del)|costituzione|elezione|proclamazione (dell'|del|di)|indipendenza|unificazione|abolizione (di|della|dell'|dello)|firma (del|della|del)|accordo (di|di|di)|patto (di|di|di)|armistizio|capitolazione/.test(t)) return 'evento';
    if (/olimpiad|campionato|coppa del mondo|marathon|giochi (olimpici|panellenici)|stadio/.test(t)) return 'evento';
    if (/epidemia|pandemia|peste|colera|vaiolo|influenza spagnola|morte nera/.test(t)) return 'evento';
    if (/risorgimento|resistenza|occupazione|deportazione|olocausto|shoah|genocidio/.test(t)) return 'evento';
    if (/primo volo|luna|allunaggio|fusione nucleare/.test(t)) return 'evento';

    // SCOPERTA in storia
    if (/scoperta dell'america|scoperta del nuovo mondo|rotta (delle spezie|per l'india)|circumnavigazione/.test(t)) return 'scoperta';

    // OPERA in storia: documenti, leggi, manoscritti
    if (/magna carta|codice di hammurabi|corpus juris|habeas corpus|editto di|bolla d'oro|bill of rights|declaration of independence|dichiarazione di indipendenza/.test(t)) return 'opera';
    if (/ — (il |la |le |i |gli |un |una )?(libro|codice|manoscritto|bibbia|corano|vangelo|commedia|iliade|odissea|eneide|divina commedia|trattato di|legge delle)/.test(t)) return 'opera';

    // EVENTO: nascite di religioni, movimenti storici
    if (/\begira\b|nascita dell'islam|nascita del buddhismo|nascita del cristianesimo|scisma|iconoclasmo/.test(t)) return 'evento';

    // LUOGO: "Persona — Fondazione/Costruzione di Luogo" → il soggetto è il luogo
    if (/ — (fondazione|costruzione|edificazione|inaugurazione|consacrazione) (di |del |della |delle |dei |degli )/.test(t)) return 'luogo';
    if (/ziggurat|mastaba|obelisco|faro di|biblioteca di|mausoleo di|arco di|piazza di|porto di/.test(t)) return 'luogo';

    // PERSONA: leader, regnanti, papi, filosofi, esploratori
    // Pattern "Nome — Titolo/Azione": spesso è un personaggio
    if (/ — /.test(t)) {
      var after = t.split(' — ')[1] || '';
      // Azioni tipo "conquista", "battaglia" → evento
      if (/conquista|battaglia|invasione|guerra|assedio|rivoluzione/.test(after)) return 'evento';
      // Ruoli → persona
      if (/primo ministro|presidente|imperatore|faraone|sultano|califfo|papa|doge|re |regina |khan|imperatore|imperatrice|dittatore|segretario generale/.test(after)) return 'persona';
      // Azioni di un personaggio celebre → persona
      return 'persona';
    }

    // Titolo senza " — ": check keyword per persona
    if (/\bsocrate\b|platone|aristotele|pitagora|talete|epicuro|stoici|cartesio|kant\b|hegel|nietzsche|marx\b|engels|confucio|buddha\b|maometto|gesu\b|cristo\b|mosè/.test(t)) return 'persona';
    if (/homo sapiens|homo erectus|homo habilis|homo heidelbergensis|neandertal|homo floresiensis/.test(t)) return 'persona';
    if (/primo ministro|presidente della|imperatore|faraone|sultano|califfo|re (di|d')|regina|doge|papa |cardinale|vescovo|dittatore/.test(t)) return 'persona';
    if (/\bnato\b|nascita di |nato a /.test(t) && !/stato nascente|istituto|partito|movimento/.test(t)) return 'persona';

    // Titoli-persona senza disambiguatore (solo nome proprio, poche parole)
    var words = t.trim().split(/\s+/);
    if (words.length <= 3 && /^[A-ZÀ-Ö]/.test(ev.title) && !/il |la |le |i |gli |un |una /.test(t.slice(0, 15))) {
      if (/nato|nacque|regnò|governò|fondò|filosofo|poeta|scrittore|politico|generale|condottiero|conquistatore|esploratore|scienziato|matematico|astronomo/.test(d)) return 'persona';
    }

    return 'evento'; // fallback storia
  }

  return 'evento';
}

var before = {};
var after  = {};
var changed = 0;

var classified = events.map(function(ev) {
  var tipo = classify(ev);
  before[tipo] = (before[tipo] || 0) + 1;

  if (ev.tipo !== tipo) changed++;
  after[tipo] = (after[tipo] || 0) + 1;
  return Object.assign({}, ev, { tipo: tipo });
});

fs.writeFileSync(eventsPath, JSON.stringify(classified, null, 2), 'utf8');

console.log('Classificazione completata. Modificati: ' + changed + '/' + events.length);
console.log('Distribuzione tipo:');
Object.keys(after).sort().forEach(function(k) { console.log('  ' + k + ': ' + after[k]); });
