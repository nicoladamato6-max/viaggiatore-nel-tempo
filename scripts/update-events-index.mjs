// Rigenera events-index.json da tutti i chunk (solo campi leggeri, senza description).
// Eseguire dopo aver aggiunto nuovi eventi a qualsiasi chunk.
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');
const chunksDir = join(root, 'src/data/chunks');

const ERA_CHUNKS = [
  'era-cosmo', 'era-preistoria', 'era-antica', 'era-medioevo',
  'era-moderna', 'era-ottocento', 'era-novecento', 'era-contemporanea', 'era-senza_anno',
];

const index = [];
const seenIds = new Set();

for (const chunk of ERA_CHUNKS) {
  const raw  = readFileSync(join(chunksDir, `${chunk}.json`), 'utf8').replace(/^﻿/, '');
  const data = JSON.parse(raw);
  for (const ev of data) {
    if (seenIds.has(ev.id)) continue;
    seenIds.add(ev.id);
    index.push({
      id:           ev.id,
      year:         ev.year,
      title:        ev.title,
      category:     ev.category,
      tipo:         ev.tipo ?? null,
      lat:          ev.lat ?? null,
      lng:          ev.lng ?? null,
      isCosmic:     ev.isCosmic ?? false,
      wikipediaSlug: ev.wikipediaSlug,
    });
  }
}

// Ordina per anno
index.sort((a, b) => a.year - b.year);

writeFileSync(join(chunksDir, 'events-index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log(`events-index.json aggiornato: ${index.length} eventi totali`);
