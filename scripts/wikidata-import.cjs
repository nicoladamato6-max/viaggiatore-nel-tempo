'use strict';
const fs   = require('fs');
const path = require('path');

const EVENTS_PATH     = path.join(__dirname, '../src/data/events.json');
const CANDIDATES_PATH = path.join(__dirname, '../src/data/wikidata-candidates.json');

if (!fs.existsSync(CANDIDATES_PATH)) {
  console.error('File candidati non trovato. Esegui prima: node scripts/wikidata-expand.cjs');
  process.exit(1);
}

const events     = JSON.parse(fs.readFileSync(EVENTS_PATH, 'utf8'));
const candidates = JSON.parse(fs.readFileSync(CANDIDATES_PATH, 'utf8'));

console.log(`Dataset esistente: ${events.length}`);
console.log(`Candidati da importare: ${candidates.length}`);

// Deduplicazione finale (per sicurezza)
const existingIds     = new Set(events.map(e => e.id));
const existingWpSlugs = new Set(events.map(e => e.wikipediaSlug).filter(Boolean));
const existingTitles  = new Set(events.map(e => e.title.toLowerCase().replace(/\s+/g, ' ').trim()));

const toAdd = [];
for (const c of candidates) {
  if (existingIds.has(c.id)) continue;
  if (c.wikipediaSlug && existingWpSlugs.has(c.wikipediaSlug)) continue;
  const tk = c.title.toLowerCase().replace(/\s+/g, ' ').trim();
  if (existingTitles.has(tk)) continue;
  toAdd.push(c);
  existingIds.add(c.id);
  if (c.wikipediaSlug) existingWpSlugs.add(c.wikipediaSlug);
  existingTitles.add(tk);
}

const merged = [...events, ...toAdd];
fs.writeFileSync(EVENTS_PATH, JSON.stringify(merged, null, 2), 'utf8');

console.log(`\nAggiunti: ${toAdd.length}`);
console.log(`Dataset finale: ${merged.length} entità`);
console.log('\nProssimo step: node scripts/split-chunks.cjs  (rigenera i chunk per era)');
