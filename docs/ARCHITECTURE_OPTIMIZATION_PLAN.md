# Piano di ottimizzazione architetturale — Viaggiatore nel Tempo

> **Origine:** Analisi architetturale condotta in sessione Novembre 2026
> **Finding totali:** 24 (7 critici, 9 alti, 8 medi)
> **Prerequisito:** Completare tutti i critici PRIMA di accettare pagamenti da utenti

Ogni item di questo piano produce due deliverable:
1. Modifica al codice/configurazione (feature branch → staging → produzione)
2. Aggiornamento della sezione corrispondente in `docs/ADMIN_GUIDE.md`

---

## Sprint 1 — Critici (blockers al lancio commerciale)

Stima: 2–3 settimane di sviluppo.
Tutti e 7 devono essere in produzione prima di aprire iscrizioni a pagamento.

---

### C1 — Rate limiting sugli endpoint pubblici

**Rischio senza fix:** Un attaccante o un bot esaurisce le quote YouTube (100 req/giorno) e Groq (30 RPM) in pochi minuti, rendendo il servizio inutilizzabile per tutti gli utenti reali.

**Soluzione:** Sliding window counter in CF KV per IP address.
Ogni CF Function legge un contatore per `{IP}:{endpoint}:{ora}` da KV prima di rispondere.
Se il contatore supera la soglia, risponde 429 con `Retry-After`.

**Soglie da implementare:**
| Endpoint | Limite | Finestra |
|----------|--------|---------|
| `/api/entity-chat` | 20 req | 10 minuti per IP |
| `/api/entity-media` | 30 req | 10 minuti per IP |
| `/api/summarize` | 10 req | 10 minuti per IP |
| `/api/events` | 60 req | 1 minuto per IP |
| `/api/refresh` | 5 req | 1 ora per IP (admin only) |

**File da modificare:**
- `functions/api/_shared.ts` — aggiungere `checkRateLimit(ip, endpoint, env)`
- Tutti i CF Functions — chiamare `checkRateLimit` come primo step
- `docs/ADMIN_GUIDE.md` — §2.3 Endpoint (aggiungere colonna "Rate limit")

**Admin Guide update:** Aggiungere §2.4 "Rate limiting" con soglie e comportamento a limite superato.

---

### C2 — JWT unificato: usare Supabase JWT nelle CF Functions

**Rischio senza fix:** Sistema di autenticazione duale. Il JWT custom (scadenza 30gg, `JWT_SECRET`) non è revocabile: un token admin compromesso resta valido 30 giorni anche dopo il cambio password.

**Soluzione:** Eliminare `JWT_SECRET` e il sistema JWT custom. Le CF Functions verificano il JWT emesso da Supabase Auth usando la `SUPABASE_JWT_SECRET` (disponibile in Supabase Settings → API → JWT Secret).

**Implementazione:**
```typescript
// _shared.ts — sostituire hashPassword/JWT custom con:
async function getAuthUser(request: Request, env: { SUPABASE_JWT_SECRET: string }) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  // Verifica JWT Supabase con SUPABASE_JWT_SECRET
  // Il payload contiene user.id e user.role (dal profiles tramite custom claims)
}
```

**Prerequisito:** Configurare custom JWT claims in Supabase per includere il `role` dell'utente nel payload JWT (via Supabase Database Hooks o `auth.users` metadata).

**File da modificare:**
- `functions/api/_shared.ts` — riscrivere `getAuthUser`
- `functions/api/refresh.ts` — aggiornare la chiamata a `getAuthUser`
- CF Pages Dashboard — aggiungere `SUPABASE_JWT_SECRET`, rimuovere `JWT_SECRET`
- GitHub Secrets — aggiungere `SUPABASE_JWT_SECRET`
- `docs/ADMIN_GUIDE.md` — §2.2 (rimuovere JWT_SECRET, aggiungere SUPABASE_JWT_SECRET), §3.3 Auth

---

### C3 — Supabase Pro + migrazione region EU

**Rischio senza fix:**
1. Free tier si mette in pausa dopo 7gg di inattività — auth rotto al primo login
2. Dati personali EU (email, search_logs) fisicamente su AWS us-east-1 — rischio GDPR art. 44

**Soluzione:**
1. Upgrade progetto produzione a Supabase Pro ($25/mese)
2. Creare nuovo progetto in region `eu-central-1` (Frankfurt) — Supabase non permette migrazione di region, serve un nuovo progetto con migration script
3. Migrare schema e dati (non necessario se in early stage con pochi utenti)

**Procedura migrazione:**
```bash
# Export schema dal progetto corrente
supabase db dump --db-url {PROD_DB_URL} > schema.sql

# Creare nuovo progetto su Supabase dashboard (region: eu-central-1)
# Applicare schema al nuovo progetto
psql {NEW_DB_URL} < schema.sql

# Aggiornare GitHub Secrets con nuovi URL/keys del progetto EU
# Rebuild e deploy
```

**File da modificare:**
- GitHub Secrets — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY_STAGING`
- `docs/ADMIN_GUIDE.md` — §3.1 Progetti Supabase (aggiornare Project ID, URL, region)

---

### C4 — Account deletion (GDPR art. 17)

**Rischio senza fix:** Violazione GDPR art. 17 (diritto all'oblio). Obbligo legale nell'UE, non negoziabile per qualsiasi prodotto commercializzato verso utenti europei.

**Soluzione:** Nuovo endpoint `DELETE /api/user` + UI nel profilo utente.

**Implementazione:**
```typescript
// functions/api/user.ts (nuovo file)
// DELETE /api/user — autenticato con Supabase JWT
export async function onRequestDelete({ request, env }) {
  const user = await getAuthUser(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });

  // 1. Cancella search_logs
  await supabase.from('search_logs').delete().eq('user_id', user.id);
  // 2. Cancella profilo
  await supabase.from('profiles').delete().eq('id', user.id);
  // 3. Cancella utente Supabase Auth (service role)
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  return new Response(JSON.stringify({ deleted: true }), { status: 200 });
}
```

**UI:** Aggiungere sezione "Account" nell'app con:
- Pulsante "Elimina account" con conferma a due step ("Scrivi DELETE per confermare")
- Messaggio di conferma post-cancellazione con redirect alla home

**File da modificare:**
- `functions/api/user.ts` — nuovo file
- `src/components/` — nuova sezione impostazioni account
- `docs/ADMIN_GUIDE.md` — §2.3 Endpoint (aggiungere DELETE /api/user), §3 Supabase (aggiornare RLS)

---

### C5 — search_logs: opt-in esplicito + retention 90 giorni

**Rischio senza fix:** Raccolta dati comportamentali senza consenso — violazione GDPR art. 5 (finalità esplicita, minimizzazione, limitazione conservazione).

**Implementazione in tre parti:**

**Parte A — Opt-in nella registrazione:**
Aggiungere checkbox nella schermata di signup:
```
[ ] Accetto la raccolta delle mie ricerche per migliorare il servizio (opzionale)
```
Salvare la preferenza in `profiles.analytics_consent boolean DEFAULT false`.
La CF Function `/api/entity-media` e la SearchBar scrivono in `search_logs` SOLO se `analytics_consent = true`.

**Parte B — Retention automatica (cron Supabase):**
```sql
-- Supabase Dashboard → Database → Extensions → pg_cron
SELECT cron.schedule(
  'delete-old-search-logs',
  '0 3 * * 0',  -- ogni domenica alle 3:00
  $$DELETE FROM search_logs WHERE created_at < now() - interval '90 days'$$
);
```

**Parte C — Visibilità per l'utente:**
RLS policy aggiuntiva: `SELECT WHERE auth.uid() = user_id` — l'utente può leggere e cancellare i propri log da una UI "Le mie ricerche" nelle impostazioni account.

**File da modificare:**
- Supabase migrations — `ALTER TABLE profiles ADD COLUMN analytics_consent boolean DEFAULT false`
- `src/components/` — checkbox signup + sezione "Le mie ricerche"
- `src/lib/supabase.ts` — funzione `logSearch` condizionale
- `docs/ADMIN_GUIDE.md` — §3.2 Schema (aggiungere colonna), §3.3 Auth

---

### C6 — Metering consumo AI per utente

**Rischio senza fix:** Impossibile implementare il modello freemium senza sapere quante chat ha fatto ogni utente nel mese corrente.

**Schema da aggiungere in Supabase:**
```sql
CREATE TABLE ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month text NOT NULL,         -- formato 'YYYY-MM'
  chat_count integer DEFAULT 0,
  summarize_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year_month)
);

-- RLS: utente legge solo il proprio contatore
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);
```

**Integrazione in CF Functions:**
```typescript
// In entity-chat.ts, prima di chiamare Groq:
const yearMonth = new Date().toISOString().slice(0, 7);
const { data: usage } = await supabase
  .from('ai_usage')
  .upsert({ user_id: userId, year_month: yearMonth })
  .select('chat_count').single();

const FREE_LIMIT = 5; // configurabile
if (user.plan === 'free' && usage.chat_count >= FREE_LIMIT) {
  return new Response(JSON.stringify({
    error: 'quota_exceeded',
    message: 'Hai raggiunto il limite di 5 chat gratuite questo mese',
    upgrade_url: '/upgrade'
  }), { status: 429 });
}

// Incrementa contatore
await supabase.from('ai_usage')
  .upsert({ user_id: userId, year_month: yearMonth, chat_count: (usage.chat_count + 1) });
```

**UI:** Badge "X/5 chat usate questo mese" nel pannello chat per utenti free.

**File da modificare:**
- Supabase migrations — nuova tabella `ai_usage`
- `functions/api/entity-chat.ts` — metering + quota check
- `functions/api/summarize.ts` — metering summarize_count
- `src/components/` — badge uso + prompt upgrade
- `docs/ADMIN_GUIDE.md` — §3.2 Schema (aggiungere tabella ai_usage)

---

### C7 — Groq: passaggio a piano paid prima del lancio

**Rischio senza fix:** Groq free tier vieta l'uso commerciale nei ToS. Sospensione dell'account senza preavviso = chat AI completamente non funzionale per tutti gli utenti.

**Azione:** Nessun codice da modificare — solo configurazione account.

1. Vai su console.groq.com → Billing → Upgrade to paid
2. Aggiungere metodo di pagamento + impostare budget alert a $20/mese
3. Verificare che la stessa `GROQ_API_KEY` funzioni su piano paid (di solito sì, ma verificare)
4. Monitorare Usage → impostare alert a 80% del budget

**Stima costo:** con 100 utenti premium, 10 chat/mese ciascuno, 2000 token/chat = ~2M token/mese = **~$1.18/mese** (molto gestibile).

**Admin Guide update:** §5.4 — aggiornare da "free tier" a "paid" con nuovo limite e stima costo.

---

## Sprint 2 — Alti (entro 1 mese dalla commercializzazione)

---

### A1 — CF KV cache per entity-media

**Problema:** 8 chiamate parallele per ogni apertura InfoPanel, senza cache. YouTube esaurisce in ore.

**Implementazione:**
```typescript
// In entity-media.ts, prima delle fetch parallele:
const cacheKey = `media:${title}:${locale}`;
const cached = await env.VIAGGIATORE_KV.get(cacheKey, { type: 'json' });
if (cached) return new Response(JSON.stringify(cached), {
  headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
});

// ... fetch parallele alle 8 sorgenti ...

// Dopo aver costruito il risultato:
await env.VIAGGIATORE_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 86400 }); // 24h
```

**Stima impatto:** 90% di riduzione delle call YouTube con le 50 entità più cercate (Colosseo, Da Vinci, Napoleone...). La quota YouTube torna utilizzabile anche con migliaia di utenti.

**Admin Guide update:** §4.1 YouTube (aggiornare comportamento quota), §2.2 (aggiornare descrizione VIAGGIATORE_KV).

---

### A2 — Uptime monitoring automatico

**Problema:** Incidenti scoperti solo quando qualcuno segnala. Con utenti paganti, ogni minuto di downtime non rilevato è un problema.

**Setup (senza codice):**
1. **UptimeRobot** (free, 50 monitor, 5 min interval):
   - Monitor 1: `https://viaggiatore-nel-tempo.pages.dev` → HTTP 200
   - Monitor 2: `https://viaggiatore-nel-tempo.pages.dev/api/events` → HTTP 200
   - Alert: email + Slack webhook

2. **Better Stack** (free tier, 3 monitor, 3 min interval):
   - Monitor su `/api/entity-chat` con POST body e verifica risposta
   - Alert: SMS + email

**Admin Guide update:** §7.5 Monitoraggio — aggiungere URL dashboard UptimeRobot e Better Stack, aggiornare frequenza e canali di alert.

---

### A3 — Restrizione YouTube API key e proxy MapTiler

**Problema A:** YouTube API key non ristretta → può essere usata da chiunque.
**Problema B:** `VITE_MAPTILER_KEY` hardcodata nel bundle JS → visibile a chiunque.

**Fix YouTube:** Google Cloud Console → Credentials → Edit key → Application restrictions:
- HTTP referrers → `viaggiatore-nel-tempo.pages.dev/*` e `test-viaggiatore-nel-tempo.pages.dev/*`

**Fix MapTiler — nuovo proxy CF Function:**
```typescript
// functions/maptiler/[[path]].ts (nuovo file)
export async function onRequest({ request, params, env }) {
  const path = params.path?.join('/') ?? '';
  const url = `https://api.maptiler.com/${path}?key=${env.MAPTILER_API_KEY}`;
  return fetch(url, { headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0' } });
}
```

Aggiornare CesiumJS config in `App.tsx` per usare `/maptiler/` invece dell'URL diretto con key.
Spostare `VITE_MAPTILER_KEY` → `MAPTILER_API_KEY` (variabile runtime CF Pages, non più build-time).

**Admin Guide update:** §2.2 (rimuovere VITE_MAPTILER_KEY build-time, aggiungere MAPTILER_API_KEY runtime), §2.3 (aggiungere GET /maptiler/[[path]]), §4.11 MapTiler.

---

### A4 — Rollback non-distruttivo con `git revert`

**Problema:** Il rollback attuale usa `git reset --hard` + force push, che riscrive la storia.

**Nuovo runbook rollback:**
```bash
# Identificare il commit da rollare (l'ultimo merge di staging su main)
git log --oneline main | head -5

# Revert non-distruttivo (crea un nuovo commit che annulla le modifiche)
git checkout main
git revert {commit-sha} --no-edit
git push origin main   # nessun force push necessario
# Il push triggera deploy.yml automaticamente
```

**Quando usare reset --hard (ancora valido):** solo se il rollback riguarda più commit e si vuole tornare a uno stato precedente ben definito tramite i tag backup. In questo caso si usa il tag esistente e si fa `git revert {tag}..HEAD` per revertire la sequenza.

**Admin Guide update:** §7.2 Rollback produzione — aggiornare con la nuova procedura.

---

### A5 — Social login: Google OAuth

**Problema:** Solo email/password → 70-85% degli utenti consumer preferisce social login.

**Implementazione:**
1. Google Cloud Console → Progetto → OAuth 2.0 → Create credentials → Web app
   - Authorized redirect: `https://{supabase-project}.supabase.co/auth/v1/callback`
2. Supabase Dashboard → Auth → Providers → Google → abilita con Client ID + Secret
3. `src/components/AuthModal.tsx` — aggiungere pulsante:
```tsx
<button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>
  Continua con Google
</button>
```

**Admin Guide update:** §3.3 Auth — aggiungere provider Google, aggiornare Redirect URLs.

---

### A6 — Custom domain

**Problema:** `viaggiatore-nel-tempo.pages.dev` non è professionale per un prodotto a pagamento.

**Azione:** Nessun codice — solo configurazione DNS.
1. Registrare dominio (es. `viaggiatoreneltempo.it` o `app.viaggiatoreneltempo.it`)
2. CF Pages → Progetto → Custom domains → Add domain
3. Seguire le istruzioni per la configurazione DNS (record CNAME)
4. CF gestisce SSL automaticamente (Let's Encrypt)
5. Aggiornare Supabase Redirect URLs con il nuovo dominio

**Admin Guide update:** §2.1 Progetti (aggiungere colonna "Dominio custom"), §3.3 Auth Redirect URLs.

---

### A7 — Attribution Europeana nei media card

**Problema:** Termini Europeana richiedono attribution istituzionale visibile (es. "Rijksmuseum via Europeana"), non solo il generico "Europeana".

**Implementazione:** Il campo `dataProvider` è già nella risposta Europeana API.
```typescript
// In entity-media.ts, fetch Europeana:
items: data.items.map(item => ({
  ...item,
  source: 'europeana',
  attribution: `${item.dataProvider?.[0] ?? 'Europeana'} via Europeana`
}))
```

```tsx
// In InfoPanel.tsx, media card:
{item.attribution && <span className="media-card__attribution">{item.attribution}</span>}
```

**Admin Guide update:** §4.2 Europeana — aggiungere nota "attribution implementata nel render".

---

### A8 — Filtro licenze Archive.org

**Problema:** Archive.org restituisce materiale con licenze eterogenee, alcune non adatte all'uso commerciale.

**Implementazione:**
```typescript
// In entity-media.ts, fetch Archive.org:
const url = `https://archive.org/advancedsearch.php?q=${q}` +
  `+AND+(licenseurl:*creativecommons* OR licenseurl:*public+domain*)` +
  `&fl=identifier,title,mediatype,description,licenseurl&output=json&rows=3`;
```

**Admin Guide update:** §4.7 Internet Archive — aggiungere filtro licenze al dettaglio.

---

### A9 — Error tracking con Sentry (free tier)

**Problema:** Errori JS in produzione non vengono catturati centralmente. Per un prodotto commerciale, sapere quando e dove si rompe qualcosa è fondamentale.

**Implementazione:**
1. Creare progetto su sentry.io (free tier: 5000 errori/mese)
2. `npm install @sentry/react @sentry/vite-plugin`
3. Inizializzare in `src/main.tsx`:
```typescript
import * as Sentry from '@sentry/react';
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: 'production' });
```
4. Aggiungere `VITE_SENTRY_DSN` ai GitHub Secrets + build

**Admin Guide update:** §2.4 Build configuration (aggiungere VITE_SENTRY_DSN), §7.5 Monitoraggio (aggiungere Sentry dashboard).

---

## Sprint 3 — Medi (roadmap 3–6 mesi)

---

### M1 — CSP (Content Security Policy)

**Implementazione:** Aggiungere file `public/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.groq.com https://*.wikipedia.org https://query.wikidata.org https://*.europeana.eu https://api.dp.la https://api.si.edu https://api.openverse.org https://collectionapi.metmuseum.org https://commons.wikimedia.org https://archive.org https://api.maptiler.com; frame-ancestors 'none'; form-action 'self';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

Testare con report-only mode prima di applicare definitivamente.

**Admin Guide update:** §2.4 Build configuration (documentare file _headers).

---

### M2 — MFA per admin + audit trail

**Implementazione in due parti:**

**Parte A — MFA TOTP:**
Supabase supporta MFA nativamente. Aggiungere un hook auth che richiede MFA per gli utenti con `role = 'admin'`.

**Parte B — Audit trail:**
```sql
CREATE TABLE admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,            -- 'promote_user', 'refresh_wikidata', 'delete_user'
  target_user_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

Ogni CF Function admin logga in `admin_audit` prima di eseguire l'azione.

**Admin Guide update:** §3.2 Schema (aggiungere tabella admin_audit), §8.4 Come aggiungere un admin (aggiungere nota audit).

---

### M3 — Ruoli granulari per modello freemium

**Implementazione:**
```sql
-- Separare ruolo da piano
ALTER TABLE profiles ADD COLUMN plan text DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'edu'));
-- role rimane 'user' | 'admin'
```

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_end timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
```

**Admin Guide update:** §3.2 Schema (aggiungere plan in profiles, aggiungere tabella subscriptions).

---

### M4 — Wikidata refresh: stato persistito in KV

**Problema:** Dopo `POST /api/refresh`, non si sa se ha avuto successo.

**Implementazione:**
```typescript
// In _wikidata.ts, alla fine di fetchWikidataEvents():
await env.VIAGGIATORE_KV.put('refresh_status', JSON.stringify({
  success: true,
  timestamp: new Date().toISOString(),
  eventCount: events.length
}));

// In caso di errore:
await env.VIAGGIATORE_KV.put('refresh_status', JSON.stringify({
  success: false,
  timestamp: new Date().toISOString(),
  error: err.message
}));
```

L'Admin panel mostra questo stato nel blocco "Architettura → Wikidata".

**Admin Guide update:** §7.4 Wikidata refresh (documentare come leggere lo stato).

---

### M5 — SEO: landing page statica indicizzabile

**Problema:** React SPA pura = HTML vuoto per i crawler = zero traffico organico.

**Soluzione minima (senza SSR):**
Creare `public/index-seo.html` con contenuto statico per la landing page, servita separatamente da `/app` (la SPA). CF Pages serve i file statici direttamente.

**Soluzione completa:** Vite SSR con rendering lato server per le pagine degli eventi più importanti. Richiede refactoring significativo — valutare solo se il traffico organico diventa un canale rilevante.

**Admin Guide update:** §1.3 Flusso dati (aggiungere percorso SEO landing).

---

### M6 — Wikipedia: proxy CF Function con cache KV

**Problema:** Chiamate Wikipedia browser-side senza UA identificativo, senza cache, potenzialmente bloccabili da Wikipedia per alto traffico.

**Implementazione:**
```typescript
// functions/api/wikipedia.ts (nuovo file)
// GET /api/wikipedia?title=...&lang=...&action=...
export async function onRequestGet({ request, env }) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? '';
  const lang = searchParams.get('lang') ?? 'it';
  const action = searchParams.get('action') ?? 'query';

  const cacheKey = `wiki:${lang}:${title}`;
  const cached = await env.VIAGGIATORE_KV.get(cacheKey, { type: 'json' });
  if (cached) return new Response(JSON.stringify(cached));

  const wikiUrl = `https://${lang}.wikipedia.org/w/api.php?...`;
  const response = await fetch(wikiUrl, {
    headers: { 'User-Agent': 'ViaggiatoreNelTempo/1.0 (https://viaggiatore-nel-tempo.pages.dev)' }
  });
  const data = await response.json();

  await env.VIAGGIATORE_KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 3600 }); // 1h
  return new Response(JSON.stringify(data));
}
```

**Admin Guide update:** §2.3 Endpoint (aggiungere GET /api/wikipedia), §4.9 Wikipedia (aggiornare da browser-side a proxied).

---

### M7 — Bundle ottimizzazione: dataset su CF R2

**Problema:** Bundle da 2.1 MB con dataset storico incluso. Ogni aggiornamento contenuti = rebuild.

**Soluzione architetturale:** Spostare i chunk era-* su Cloudflare R2 (object storage, compatibile S3, $0.015/GB/mese). Il bundle carica solo l'indice al boot, lazy-fetcha i chunk al click per era.

**Impatto:** Riduzione bundle stimata 70% (da ~2.1 MB a ~600 KB). Aggiornamento contenuti possibile senza rebuild (upload diretto su R2).

**Admin Guide update:** §1.1 Stack (aggiungere CF R2), §1.3 Flusso dati (aggiornare caricamento dataset).

---

### M8 — Analytics privacy-friendly

**Problema:** Nessun dato sull'engagement degli utenti. Come si misura se il prodotto funziona?

**Soluzione:** Cloudflare Web Analytics (già incluso in CF Pages, zero config, privacy-compliant, nessun cookie).

**Setup:** CF Pages Dashboard → Analytics → Enable Web Analytics → copia snippet in `index.html`.

Alternativa più ricca: Plausible Analytics ($9/mese, GDPR-compliant by design, nessun cookie, dati in EU).

**Admin Guide update:** §7.5 Monitoraggio (aggiungere dashboard analytics, metriche chiave da monitorare).

---

## Riepilogo e dipendenze

```
Sprint 1 — Critici (blockers al lancio)
  C1 Rate limiting ─────────────────── nessuna dipendenza
  C2 JWT unificato ─────────────────── dipende da C3 (nuovo progetto Supabase)
  C3 Supabase Pro + EU ─────────────── nessuna dipendenza
  C4 Account deletion ──────────────── dipende da C2
  C5 search_logs opt-in + retention ── dipende da C3 (schema migration)
  C6 Metering AI ───────────────────── dipende da C3 (schema migration)
  C7 Groq paid ─────────────────────── nessuna dipendenza (solo config)

Sprint 2 — Alti (entro 1 mese dal lancio)
  A1 Cache entity-media ────────────── nessuna dipendenza
  A2 Uptime monitoring ─────────────── nessuna dipendenza (config esterna)
  A3 API key restriction + MapTiler ── nessuna dipendenza
  A4 Rollback git revert ───────────── nessuna dipendenza (aggiornamento runbook)
  A5 Social login Google ───────────── dipende da C3 (nuovo progetto Supabase)
  A6 Custom domain ─────────────────── nessuna dipendenza
  A7 Europeana attribution ─────────── nessuna dipendenza
  A8 Archive.org filtro licenze ────── nessuna dipendenza
  A9 Sentry error tracking ─────────── nessuna dipendenza

Sprint 3 — Medi (roadmap 3–6 mesi)
  M1 CSP headers ───────────────────── dipende da A3 (MapTiler proxy)
  M2 MFA + audit trail ─────────────── dipende da C2, C3
  M3 Ruoli granulari ───────────────── dipende da C6 (metering)
  M4 Wikidata stato refresh ────────── nessuna dipendenza
  M5 SEO landing page ──────────────── dipende da A6 (custom domain)
  M6 Wikipedia proxy ───────────────── nessuna dipendenza
  M7 Bundle → CF R2 ────────────────── nessuna dipendenza immediata
  M8 Analytics ─────────────────────── dipende da A6 (custom domain)
```

**Ordine consigliato per Sprint 1:** C3 → C7 → C2 → C1 → C4 → C5 → C6
(Migrare prima Supabase, poi aggiornare JWT, poi aggiungere le feature che dipendono dal nuovo schema)

---

_Documento creato: Novembre 2026 — Nicola D'Amato con Claude Sonnet 4.6_
_Aggiornare questo documento al completamento di ogni item._
