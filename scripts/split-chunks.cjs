'use strict';
const fs   = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, '../src/data/events.json');
const DEST = path.join(__dirname, '../src/data/chunks');

const events = JSON.parse(fs.readFileSync(SRC, 'utf8'));

// Crea la directory chunks se non esiste
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const chunks = {
  cosmo:         e => e.isCosmic === true,
  preistoria:    e => !e.isCosmic && e.year != null && e.year < -3_500,
  antica:        e => !e.isCosmic && e.year != null && e.year >= -3_500 && e.year < 476,
  medioevo:      e => !e.isCosmic && e.year != null && e.year >= 476 && e.year < 1492,
  moderna:       e => !e.isCosmic && e.year != null && e.year >= 1492 && e.year < 1789,
  ottocento:     e => !e.isCosmic && e.year != null && e.year >= 1789 && e.year < 1914,
  novecento:     e => !e.isCosmic && e.year != null && e.year >= 1914 && e.year < 1945,
  contemporanea: e => !e.isCosmic && e.year != null && e.year >= 1945,
  // null year — bucket di fallback
  senza_anno:    e => !e.isCosmic && e.year == null,
};

let total = 0;
for (const [key, test] of Object.entries(chunks)) {
  const slice = events.filter(test);
  const file  = path.join(DEST, `era-${key}.json`);
  fs.writeFileSync(file, JSON.stringify(slice, null, 2), 'utf8');
  const kb = (JSON.stringify(slice).length / 1024).toFixed(1);
  console.log(`era-${key}.json: ${slice.length} eventi (${kb} KB)`);
  total += slice.length;
}
console.log('\nTotale nei chunk:', total, '/', events.length);

// Mini-indice per ricerca globale — campi minimi
const index = events.map(e => ({
  id:           e.id,
  year:         e.year,
  title:        e.title,
  category:     e.category,
  tipo:         e.tipo ?? null,
  lat:          e.lat ?? null,
  lng:          e.lng ?? null,
  isCosmic:     e.isCosmic ?? false,
  wikipediaSlug: e.wikipediaSlug ?? null,
}));
const idxFile = path.join(DEST, 'events-index.json');
fs.writeFileSync(idxFile, JSON.stringify(index, null, 2), 'utf8');
const idxKb = (JSON.stringify(index).length / 1024).toFixed(1);
console.log(`\nevents-index.json: ${index.length} voci (${idxKb} KB)`);
