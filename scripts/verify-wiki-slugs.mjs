/**
 * scripts/verify-wiki-slugs.mjs
 *
 * Verifica tutti i wikipediaSlug del dataset contro Wikipedia API (IT + EN).
 * Per gli slug non trovati, prova opensearch sul titolo dell'entità.
 * Aggiorna i file sorgente con i slug corretti.
 *
 * Usage:
 *   node scripts/verify-wiki-slugs.mjs            # live mode
 *   node scripts/verify-wiki-slugs.mjs --dry-run  # solo report, nessuna scrittura
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const CHUNKS    = path.join(ROOT, 'src/data/chunks');
const EVENTS    = path.join(ROOT, 'src/data/events.json');
const DRY_RUN   = process.argv.includes('--dry-run');
const BATCH_SZ  = 50;
const DELAY_MS  = 350;

// ── Helpers ────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function apiFetch(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ViaggiatoreNelTempo-SlugChecker/1.0 (monthly maintenance)' },
      });
      if (res.status === 429) { await sleep(10_000); continue; }
      if (!res.ok) return null;
      return res.json();
    } catch { await sleep(2000 * (i + 1)); }
  }
  return null;
}

/** Batch query: returns Map<slug → { found, canonTitle }> */
async function checkBatch(slugs, lang) {
  const data = await apiFetch(
    `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'query', titles: slugs.join('|'),
      format: 'json', origin: '*', redirects: '1',
    })
  );
  const result = new Map(slugs.map(s => [s, { found: false, canonTitle: null }]));
  if (!data) return result;

  const normMap = new Map();
  for (const n of data.query?.normalized ?? []) normMap.set(n.from, n.to);
  for (const r of data.query?.redirects  ?? []) normMap.set(r.from, r.to);

  for (const page of Object.values(data.query?.pages ?? {})) {
    // Find which input slug maps to this page
    for (const slug of slugs) {
      const resolved = normMap.get(slug) ?? slug;
      if (resolved.toLowerCase() === page.title?.toLowerCase()) {
        result.set(slug, {
          found:      page.pageid > 0,
          canonTitle: page.pageid > 0 ? page.title : null,
        });
      }
    }
  }
  return result;
}

/** opensearch fallback: returns best-matching Wikipedia URL or null */
async function searchFallback(title, lang) {
  const base = title.split(/\s*[—–]\s*/)[0].trim();
  const data = await apiFetch(
    `https://${lang}.wikipedia.org/w/api.php?` + new URLSearchParams({
      action: 'opensearch', search: base, limit: '5', format: 'json', origin: '*',
    })
  );
  if (!data) return null;
  const [, titles,, urls] = data;
  if (!titles?.length) return null;
  const words = base.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
  const idx = titles.findIndex(t => words.some(w => t.toLowerCase().includes(w)));
  const url = urls[idx !== -1 ? idx : 0];
  if (!url) return null;
  return decodeURIComponent(url.split('/wiki/')[1] ?? '').replace(/ /g, '_') || null;
}

// ── Load dataset ───────────────────────────────────────────────────────────

function loadDataset() {
  const records = []; // { entity, filePath, arrIndex }

  const evArr = JSON.parse(fs.readFileSync(EVENTS, 'utf8'));
  evArr.forEach((e, i) => records.push({ entity: e, filePath: EVENTS, arrIndex: i }));

  for (const f of fs.readdirSync(CHUNKS).filter(f => f.endsWith('.json') && f !== 'events-index.json')) {
    const fpath = path.join(CHUNKS, f);
    JSON.parse(fs.readFileSync(fpath, 'utf8')).forEach((e, i) =>
      records.push({ entity: e, filePath: fpath, arrIndex: i })
    );
  }
  return records;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('[DRY RUN — no files will be modified]\n');

  const all    = loadDataset();
  const verify = all.filter(r => !r.entity.isCosmic && r.entity.wikipediaSlug);
  const slugs  = verify.map(r => r.entity.wikipediaSlug);

  console.log(`Dataset: ${all.length} entities | To verify: ${verify.length} (non-cosmic with slug)\n`);

  const fixes   = new Map(); // slug → newSlug
  const notFound = [];

  // ── Phase 1: IT Wikipedia ──
  console.log('Phase 1 — IT Wikipedia (batch)');
  const failIT = [];
  for (let i = 0; i < slugs.length; i += BATCH_SZ) {
    const batch = slugs.slice(i, i + BATCH_SZ);
    const pct   = Math.round((i / slugs.length) * 100);
    process.stdout.write(`\r  ${pct}% (${i}/${slugs.length})`);
    const res = await checkBatch(batch, 'it');
    for (const [slug, { found, canonTitle }] of res) {
      if (!found) { failIT.push(slug); continue; }
      const canon = canonTitle?.replace(/ /g, '_');
      if (canon && canon !== slug) fixes.set(slug, canon);
    }
    await sleep(DELAY_MS);
  }
  console.log(`\n  IT not found: ${failIT.length}`);

  // ── Phase 2: EN Wikipedia for IT failures ──
  console.log('\nPhase 2 — EN Wikipedia for IT failures');
  const failEN = [];
  for (let i = 0; i < failIT.length; i += BATCH_SZ) {
    const batch = failIT.slice(i, i + BATCH_SZ);
    process.stdout.write(`\r  ${i}/${failIT.length}`);
    const res = await checkBatch(batch, 'en');
    for (const [slug, { found, canonTitle }] of res) {
      if (!found) { failEN.push(slug); continue; }
      const canon = canonTitle?.replace(/ /g, '_');
      if (canon && canon !== slug) fixes.set(slug, canon);
    }
    await sleep(DELAY_MS);
  }
  console.log(`\n  EN not found: ${failEN.length}`);

  // ── Phase 3: opensearch for still-missing ──
  console.log('\nPhase 3 — opensearch fallback');
  for (const slug of failEN) {
    const record = verify.find(r => r.entity.wikipediaSlug === slug);
    if (!record) continue;
    const title = record.entity.title;
    let found = await searchFallback(title, 'it') ?? await searchFallback(title, 'en');
    if (found && found !== slug) {
      fixes.set(slug, found);
      console.log(`  FIXED "${title}": ${slug} → ${found}`);
    } else if (!found) {
      notFound.push({ title, slug });
    }
    await sleep(DELAY_MS);
  }

  // ── Apply fixes ──
  if (!DRY_RUN && fixes.size > 0) {
    console.log('\nApplying fixes...');
    // Group by file
    const byFile = new Map();
    for (const rec of verify) {
      const newSlug = fixes.get(rec.entity.wikipediaSlug);
      if (!newSlug) continue;
      if (!byFile.has(rec.filePath)) byFile.set(rec.filePath, []);
      byFile.get(rec.filePath).push({ ...rec, newSlug });
    }
    for (const [fpath, recs] of byFile) {
      const arr = JSON.parse(fs.readFileSync(fpath, 'utf8'));
      let changed = false;
      for (const { arrIndex, entity, newSlug } of recs) {
        if (arr[arrIndex]?.id === entity.id) {
          arr[arrIndex].wikipediaSlug = newSlug;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fpath, JSON.stringify(arr, null, 2), 'utf8');
        console.log(`  Wrote ${path.basename(fpath)}`);
      }
    }
  }

  // ── Report ──
  console.log('\n════════════ REPORT ════════════');
  console.log(`Verified:        ${verify.length}`);
  console.log(`Fixed (redirect/search): ${fixes.size}`);
  if (fixes.size) {
    for (const [old, neo] of fixes) console.log(`  ${old} → ${neo}`);
  }
  console.log(`No article found: ${notFound.length}`);
  if (notFound.length) {
    console.log('  (entities with no Wikipedia article — slug left as-is):');
    notFound.forEach(({ title, slug }) => console.log(`  - "${title}" [${slug}]`));
  }
  if (DRY_RUN) console.log('\n[DRY RUN — no files modified]');
}

main().catch(err => { console.error(err); process.exit(1); });
