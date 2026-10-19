// Converts epoch-briefings.json from {top5: string[]} to {items: [{text, cat}][]}
// Existing top5 items get cat: 'storia'. Run once.
import { readFileSync, writeFileSync } from 'fs';

const path = new URL('../src/data/epoch-briefings.json', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const data = JSON.parse(readFileSync(path, 'utf8'));

let converted = 0;
for (const key of Object.keys(data)) {
  const epoch = data[key];
  for (const lang of ['it', 'en']) {
    const b = epoch[lang];
    if (!b) continue;
    if (b.top5 && !b.items) {
      b.items = b.top5.map(text => ({ text, cat: 'storia' }));
      delete b.top5;
      converted++;
    }
  }
}

writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log(`Done. Converted ${converted} briefing language blocks.`);
