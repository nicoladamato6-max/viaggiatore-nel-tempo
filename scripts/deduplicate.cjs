'use strict';
const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../src/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

console.log('Totale prima:', events.length);

// ID da rimuovere — duplicati identificati manualmente dall'analisi
const toRemove = new Set([
  // Karl Marx: "Karl Marx" generico duplicato di "Karl Marx — Il Padre del Comunismo"
  'fil-marx-1818',

  // Prima fotografia buco nero (×3 → ×1)
  'cont-astronomy-black-hole-image-2019',
  'cosmo-foto-buco-nero-eht',

  // Fondazione di Israele (×3 → ×1)
  'con-israel-fondazione-1948',
  'nov-middle-east-creation-israel-1948',

  // Ittiti (×5 → ×2: tieni ittiti-hattusa e ao-hittite-empire-iron-age per diversi periodi)
  'anatolie-ittiti',
  'ao-hittiti-ferro-anatolia',
  'ao-ittiti-hattusha',

  // Conferenza di Berlino (×4 → ×2)
  'ott-imperialism-berlin-congo',       // stesso titolo di ott-africa-conferenza-berlino
  'ott-imperialism-scramble-africa-berlin', // stesso titolo di ott-africa-conferenza-berlino

  // Socrate processo/morte (×2 → ×1, tieni socrate-atene)
  'ao-socrate-filosofia-morte',

  // Pitagora sfericità Terra (×2 → ×1)
  'cosmo-pitagora-sfericita',

  // Prima Crociata presa di Gerusalemme 1099 (×2 → ×1)
  'bmed-crociate-gerusalemme-1099',

  // Galileo telescopio/lune di Giove (riduzione da 12 a 8)
  'cosmo-galileo-telescopio-1609',      // dup di galileo-telescopio
  'mod-galileo-telescopio-1610',        // dup di mod-galileo-telescopio-giove
  'cosmo-galileo-telescopio',           // dup generico
  'cosmo-galileo-persona-1600',         // generico, dup di cosmo-sidereus-nuncius-1610

  // Tommaso d'Aquino Summa (×3 → ×1)
  'bm-aquinas-summa-theologica',
  'bm-thomas-aquinas-summa-theology',

  // Newton (riduzione da 14 a 8)
  'mod-newton-principia-gravity',       // dup di mod-newton-principia-1687
  'cosmo-newton-gravitazione-1687',     // dup di mod-newton-principia-1687
  'cosmo-newton-gravitazione',          // dup di mod-newton-principia-1687
  'mod-newton-calcolo-leibniz-disputa', // dup di mod-newton-leibniz-calcolo
  'mod-newton-calculus-leibniz',        // dup di mod-newton-leibniz-calcolo
  'mod-newton-optics-light',            // dup di mod-newton-ottica-colori

  // Caravaggio chiaroscuro (dup di realismo)
  'mod-art-baroque-caravaggio-light',

  // Frida Kahlo generica (dup di nov-frida-kahlo-pittura-dolore)
  'ma-frida-kahlo',

  // Chopin (dup notturni/romanticismo)
  'ott-romanticism-music-chopin-piano',

  // Ciro il Grande Cilindro (×2 → ×1)
  'persia-ciro-decreto',

  // Aristotele al Liceo (dup di aristotele-liceo)
  'ao-aristotele-staggirita-scienza',

  // Confucio generico (dup di ao-confucio-cina-filosofia)
  'filo-fill-011',
]);

// Rimuovi anche duplicati esatti per titolo normalizzato (case-insensitive)
// — mantieni il primo trovato, rimuovi i successivi
const titleSeen = new Map();
const titleDups = new Set();
events.forEach(e => {
  const key = e.title.toLowerCase().replace(/\s+/g, ' ').trim();
  if (titleSeen.has(key)) {
    titleDups.add(e.id);
    console.log(`  Dup titolo esatto: "${e.title}" (id=${e.id}) dup di "${titleSeen.get(key).title}" (id=${titleSeen.get(key).id})`);
  } else {
    titleSeen.set(key, e);
  }
});

const allRemove = new Set([...toRemove, ...titleDups]);
console.log('\nID da rimuovere:', allRemove.size);

// Verifica che tutti gli ID esistano
allRemove.forEach(id => {
  if (!events.find(e => e.id === id)) {
    console.warn('  WARN: ID non trovato nel dataset:', id);
  }
});

const cleaned = events.filter(e => !allRemove.has(e.id));
console.log('Totale dopo pulizia:', cleaned.length);
console.log('Rimossi:', events.length - cleaned.length);

fs.writeFileSync(eventsPath, JSON.stringify(cleaned, null, 2), 'utf8');
console.log('\nevents.json aggiornato.');
