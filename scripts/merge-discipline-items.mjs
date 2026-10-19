// Merges a discipline-items patch file into epoch-briefings.json
// Usage: node scripts/merge-discipline-items.mjs <patch-file.json>
import { readFileSync, writeFileSync } from 'fs';

const patchPath = process.argv[2];
if (!patchPath) { console.error('Usage: node merge-discipline-items.mjs <patch.json>'); process.exit(1); }

const briefingsPath = new URL('../src/data/epoch-briefings.json', import.meta.url)
  .pathname.replace(/^\/([A-Z]:)/, '$1');

const briefings = JSON.parse(readFileSync(briefingsPath, 'utf8'));
const patch     = JSON.parse(readFileSync(patchPath, 'utf8'));

let merged = 0;
for (const [key, langs] of Object.entries(patch)) {
  if (!briefings[key]) { console.warn(`WARN: epoch key "${key}" not found, skipping`); continue; }
  for (const lang of ['it', 'en']) {
    if (!langs[lang]) continue;
    briefings[key][lang].items = [
      ...(briefings[key][lang].items ?? []),
      ...langs[lang],
    ];
    merged += langs[lang].length;
  }
}

writeFileSync(briefingsPath, JSON.stringify(briefings, null, 2), 'utf8');
console.log(`Merged ${merged} new items into epoch-briefings.json`);
