/**
 * Sposta eventi da 'storia' alle nuove discipline:
 *   filosofia  — Religione & Filosofia
 *   sport      — Sport
 * Agisce solo sugli eventi con category === 'storia'.
 */
var fs   = require('fs');
var path = require('path');

var eventsPath = path.join(__dirname, '../src/data/events.json');
var events     = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

// ── SPORT keywords ─────────────────────────────────────────────────────────────
var SPORT_RE = /olimpiad|giochi olimpici|olimpiche|coppa del mondo|campionato mondiale|maratona di atene|jesse owens|muhammad ali|pelé|pele\b|roger bannister|usain bolt|formula 1|tour de france|wimbledon|nba \b|fifa \b|superbowl|rugby world|atletica leggera|ciclismo|nuoto|giochi panellenici|sport aristocratico|coubertin|cio \b|ioc \b/i;

// ── FILOSOFIA / RELIGIONE keywords ────────────────────────────────────────────
var FILOSOFIA_RE = /\bsocrate\b|platone\b|aristotele\b|pitagora\b|talete\b|anassimandro|eraclito|democrito|epicuro\b|zenone\b|plotino\b|agostino\b|tommaso d'aquino|cartesio\b|locke\b|leibniz\b|hume\b|kant\b|hegel\b|schopenhauer|kierkegaard|nietzsche\b|marx\b|engels\b|wittgenstein|sartre\b|camus\b|confucio\b|laozi\b|lao.tzu|mencius\b|zhuangzi|avicenna\b|averroè\b|al.ghazali|al.kindi|maimonide|erasmo da rotterdam|blaise pascal|thomas hobbes|john locke|jean-jacques rousseau|voltaire\b|diderot\b|montesquieu\b/i;

var RELIGIONE_RE = /\bbuddha\b|siddhartha gautama|gesù\b|gesu\b|nascita di gesù|betlemme|crocifissione|egira\b|maometto\b|muhammad\b|nascita dell'islam|islamismo\b|riforma protestante|martin lutero|calvino\b|zwingli\b|ignazio di loyola|concilio di nicea|concilio di trento|scisma\b|grande scisma|scisma d'oriente|inquisizione spagnola|inquisizione medievale|controriforma\b|papato medievale|secondo concilio|concilio vaticano|sant'agostino|san benedetto|san francesco d'assisi|sacro romano impero.*chiesa|chiesa.*sacro romano|sinodo\b|enciclica\b|protestantesimo\b|anglicanesimo\b|calvinismo\b|buddhismo\b|induismo\b|sikhismo\b|zoroastrismo\b|manicheismo\b|babilonese.*religione|religione.*babilonese|talmud\b|sinagoga\b|giudaismo\b|ebraismo\b|torah\b|corano\b|vangelo.*scritto|primo concilio|papa \b|papato\b/i;

function reclassify(ev) {
  if (ev.category !== 'storia') return ev.category;
  var t = ev.title;
  if (SPORT_RE.test(t))      return 'sport';
  if (FILOSOFIA_RE.test(t))  return 'filosofia';
  if (RELIGIONE_RE.test(t))  return 'filosofia';
  return 'storia';
}

var counts = { sport: 0, filosofia: 0, unchanged: 0 };
var reclassified = events.map(function(ev) {
  var newCat = reclassify(ev);
  if (newCat !== ev.category) {
    counts[newCat] = (counts[newCat] || 0) + 1;
    return Object.assign({}, ev, { category: newCat });
  }
  counts.unchanged++;
  return ev;
});

fs.writeFileSync(eventsPath, JSON.stringify(reclassified, null, 2), 'utf8');

console.log('Discipline reclassificate:');
console.log('  -> filosofia: ' + counts.filosofia);
console.log('  -> sport:     ' + counts.sport);
console.log('  invariati:    ' + counts.unchanged);
console.log('Totale eventi:  ' + events.length);
