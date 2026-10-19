const fs = require('fs');
const path = require('path');
const eventsPath = path.join(__dirname, '../src/data/events.json');
const existing = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const newEvents = [
  {"id":"ao-king-david-jerusalem","title":"Davide re di Israele e Gerusalemme","year":-1000,"lat":31.78,"lng":35.23,"category":"storia","description":"Il re Davide unifica le tribù israelite e stabilisce Gerusalemme come capitale del suo regno. La tradizione gli attribuisce la composizione dei Salmi e la costruzione di una nazione che influenzerà le tre grandi religioni monoteiste. Suo figlio Salomone costruirà il primo Tempio di Gerusalemme.","wikipediaSlug":"David","isCosmic":false},
  {"id":"ao-assyrian-conquest-israel","title":"L'Assiria conquista il Regno di Israele","year":-722,"lat":36.36,"lng":43.16,"category":"storia","description":"Sargon II di Assiria conquista Samaria e deporta le dieci tribù di Israele, che scompaiono dalla storia come le Dieci Tribù Perdute. La diaspora forzata è uno degli eventi fondativi del popolo ebraico e della tradizione profetica biblica. Il potere militare assiro, basato su carri da guerra e assedi, domina il Vicino Oriente per due secoli.","wikipediaSlug":"Assyrian_captivity","isCosmic":false}
];

const existingIds = new Set(existing.map(function(e) { return e.id; }));
const toAdd = newEvents.filter(function(e) {
  if (existingIds.has(e.id)) { console.log('Skip: ' + e.id); return false; }
  return true;
});
const merged = existing.concat(toAdd);
fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2), 'utf8');
console.log('Added ' + toAdd.length + ' events. Total: ' + merged.length);
