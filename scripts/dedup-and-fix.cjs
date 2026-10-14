/**
 * Pulizia conservativa di events.json:
 * 1. Rimuove duplicati VERI: stesso slug + (titolo quasi identico O anno identico)
 * 2. Riclassifica eventi con category errata (sport→storia, filosofia con keyword militari→storia)
 *
 * NON rimuove eventi distinti che condividono lo stesso slug Wikipedia
 * (es. 3 eventi diversi su Galileo - nascita/telescopio/satelliti - restano tutti).
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// ── Utility ────────────────────────────────────────────────────────────────────
function normalizeTitle(t) {
  return t.toLowerCase()
    .replace(/[àáâ]/g, 'a').replace(/[èéê]/g, 'e')
    .replace(/[ìíî]/g, 'i').replace(/[òóô]/g, 'o')
    .replace(/[ùúû]/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a, b) {
  var na = normalizeTitle(a);
  var nb = normalizeTitle(b);
  if (na === nb) return 1.0;
  // Controlla se uno è sottostringa dell'altro (>80% del più corto)
  var shorter = na.length < nb.length ? na : nb;
  var longer  = na.length < nb.length ? nb : na;
  if (longer.indexOf(shorter) !== -1 && shorter.length > 10) return 0.9;
  return 0;
}

// ── Step 1: Identificazione duplicati VERI ────────────────────────────────────
// Duplicato = stesso slug + (titolo quasi identico O stesso anno esatto)
var slugGroups = {};
events.forEach(function(ev) {
  var slug = (ev.wikipediaSlug || '').toLowerCase().replace(/\s/g, '_');
  if (!slug || slug === '') return;
  if (!slugGroups[slug]) slugGroups[slug] = [];
  slugGroups[slug].push(ev);
});

var toRemoveIds = new Set();
var dedupLog    = [];

Object.keys(slugGroups).forEach(function(slug) {
  var group = slugGroups[slug];
  if (group.length < 2) return;

  // Confronta ogni coppia nel gruppo
  for (var i = 0; i < group.length; i++) {
    if (toRemoveIds.has(group[i].id)) continue;
    for (var j = i + 1; j < group.length; j++) {
      if (toRemoveIds.has(group[j].id)) continue;

      var sameYear  = group[i].year === group[j].year;
      var simTitle  = titleSimilarity(group[i].title, group[j].title);
      var isDuplicate = simTitle >= 0.9 || sameYear;

      if (isDuplicate) {
        // Tieni quello con la descrizione più lunga (più ricco di informazioni)
        var keepIdx   = (group[i].description || '').length >= (group[j].description || '').length ? i : j;
        var removeIdx = keepIdx === i ? j : i;
        toRemoveIds.add(group[removeIdx].id);
        dedupLog.push({
          removed: group[removeIdx].id,
          removedTitle: group[removeIdx].title,
          kept: group[keepIdx].id,
          keptTitle: group[keepIdx].title,
          reason: sameYear && simTitle < 0.9 ? 'stesso anno + slug' : 'titolo quasi identico'
        });
      }
    }
  }
});

// ── Step 2: Reclassificazioni errori di categoria ─────────────────────────────
var SPORT_KEYWORDS = /olimpiad|giochi olimpici|olimpiche|coppa del mondo|campionato mondiale|maratona|jesse owens|muhammad ali|pelé|pele|cassius clay|usain bolt|roger (bannister|federer)|formula 1|tour de france|wimbledon|nba\b|fifa\b|rugby|calcio (moderno|mondiale)|football (association|club)|coubertin|atleta|atletica|ciclismo|nuoto|ginnastic|pallacanestro|boxe|pugilato|lottatore|pugile|circo massimo|giochi (pitici|istmici|panellenici|nemei)|milone|leonida (di rodi|di)|teagene|diagora|abebe|bikila|maradona|senna\b|federer|serena (williams)?|michael jordan|comaneci|pelé|messi\b|bolt\b|phelps|biles|fabrizio|carl lewis|spitz|zatopek|owens/i;

var reclassLog = [];

var cleaned = events
  .filter(function(ev) { return !toRemoveIds.has(ev.id); })
  .map(function(ev) {
    // sport → storia se il titolo non contiene keyword sportive
    if (ev.category === 'sport' && !SPORT_KEYWORDS.test(ev.title)) {
      reclassLog.push({ id: ev.id, title: ev.title, from: 'sport', to: 'storia' });
      return Object.assign({}, ev, { category: 'storia' });
    }
    // filosofia → storia se il titolo contiene keyword chiaramente militari
    var MILITARY_RE = /\bbattaglia (di|del|della)\b|\bguerra (di|del|civile|mondiale|punica|persiana)\b|\binvasione di\b|\bassedio di\b|\bsacco di\b/i;
    if (ev.category === 'filosofia' && MILITARY_RE.test(ev.title)) {
      reclassLog.push({ id: ev.id, title: ev.title, from: 'filosofia', to: 'storia' });
      return Object.assign({}, ev, { category: 'storia' });
    }
    return ev;
  });

// ── Output ─────────────────────────────────────────────────────────────────────
fs.writeFileSync(eventsPath, JSON.stringify(cleaned, null, 2), 'utf8');

console.log('\n=== RIEPILOGO DEDUP CONSERVATIVO ===');
console.log('  Prima:         ' + events.length + ' eventi');
console.log('  Rimossi:       ' + toRemoveIds.size + ' duplicati veri');
console.log('  Reclassificati:' + reclassLog.length + ' eventi categoria errata');
console.log('  Dopo:          ' + cleaned.length + ' eventi');

if (dedupLog.length > 0) {
  console.log('\nDuplicati rimossi:');
  dedupLog.forEach(function(d) {
    console.log('  [' + d.removed + '] "' + d.removedTitle.substring(0, 55) + '" (' + d.reason + ')');
    console.log('    → tenuto: [' + d.kept + '] "' + d.keptTitle.substring(0, 55) + '"');
  });
}

if (reclassLog.length > 0) {
  console.log('\nReclassificazioni:');
  reclassLog.forEach(function(r) {
    console.log('  [' + r.id + '] ' + r.from + ' → ' + r.to + ': "' + r.title.substring(0, 60) + '"');
  });
}
