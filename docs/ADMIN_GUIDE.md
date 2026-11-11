# Viaggiatore nel Tempo — Admin & Maintenance Guide

> **Versione:** 1.0 — Novembre 2026
> **Audience:** Owner (Nicola D'Amato), team esterno, agente AI per AMS automatizzata
> **AI-ready:** Questo documento e' progettato come knowledge base per sessioni Claude Code.
> Carica questo file come contesto all'inizio di ogni sessione AMS.

---

## Indice

1. [Panoramica architettura](#1-panoramica-architettura)
2. [Infrastruttura Cloudflare Pages](#2-infrastruttura-cloudflare-pages)
3. [Supabase - Auth e Database](#3-supabase--auth-e-database)
4. [API esterne - Sorgenti media e dati](#4-api-esterne)
5. [AI - Backend LLM](#5-ai--backend-llm)
6. [GitHub - Repository e CI/CD](#6-github--repository-e-cicd)
7. [Runbook operativo](#7-runbook-operativo)
8. [Troubleshooting](#8-troubleshooting)
9. [Checklist pre-commercializzazione](#9-checklist-pre-commercializzazione)

---

## 1. Panoramica architettura

### 1.1 Stack tecnologico

| Layer | Tecnologia | Versione | Ruolo |
|-------|-----------|---------|-------|
| Frontend | React | 19 | SPA, componenti UI |
| Build | Vite | 6+ | Bundler, dev server |
| Linguaggio | TypeScript | 5 strict | Tutto il codice |
| Globo 3D | CesiumJS | latest | Rendering globo interattivo |
| Animazioni | Framer Motion | latest | Transizioni UI |
| Hosting | Cloudflare Pages | - | CDN + SSR-like Functions |
| Backend | CF Pages Functions | - | API serverless (TypeScript) |
| Auth + DB | Supabase | - | Auth, Postgres, RLS |
| KV Cache | Cloudflare KV | - | Cache eventi Wikidata |
| AI primario | Groq | - | Chat LLM (entity-chat) |
| AI fallback | Cloudflare Workers AI | - | Summarize + fallback chat |
| Terrain tiles | MapTiler | - | Tile server 3D terrain |
| Mappe storiche | GPlates Web Service | - | Paleografia / AWMC |

### 1.2 Diagramma a blocchi

```
+-------------------------------------------------------------+
|                        BROWSER                              |
|  React SPA + CesiumJS + Framer Motion + tsParticles         |
|  +------------+ +----------+ +----------+ +-------------+   |
|  | App.tsx    | |InfoPanel | | EraGuide | |TimeMachine  |   |
|  | (globo)    | |(wiki+AI) | |(AI guide)| |(AI briefing)|   |
|  +------------+ +----------+ +----------+ +-------------+   |
|  +-----------------------------------------------------+    |
|  | BridgeConsole (timeline + search + controlli)       |    |
|  +-----------------------------------------------------+    |
+---------------------------+---------------------------------+
                            | HTTPS
+---------------------------v---------------------------------+
|                 CLOUDFLARE PAGES CDN                        |
|  viaggiatore-nel-tempo.pages.dev  (branch: main)            |
|  test-viaggiatore-nel-tempo.pages.dev (branch: staging)     |
|                                                             |
|  +------------------ Pages Functions ------------------+   |
|  | POST /api/entity-chat   -> Groq LLM -> CF AI fallback|   |
|  | POST /api/summarize     -> CF AI -> Claude -> GPT    |   |
|  | GET  /api/entity-media  -> 8 sorgenti media parallele|   |
|  | GET  /api/events        -> KV cache (Wikidata)       |   |
|  | POST /api/refresh       -> Wikidata SPARQL -> KV     |   |
|  | GET  /tiles/[[path]]    -> proxy DARE tiles          |   |
|  | GET  /awmc/[[path]]     -> proxy AWMC tiles          |   |
|  +------------------------------------------------------+   |
+---------------------------+---------------------------------+
                            |
        +-------------------+-------------------+
        |                   |                   |
+-------v------+  +---------v-------+  +--------v--------+
|   SUPABASE   |  |  GROQ API       |  |  EXTERNAL APIs  |
|  Auth+DB     |  |  LLM Chat       |  |  YouTube        |
|  Postgres    |  |                 |  |  Europeana      |
|  RLS         |  |  CF Workers AI  |  |  Smithsonian    |
|  profiles    |  |  (fallback)     |  |  DPLA           |
|  search_logs |  |                 |  |  Wikimedia      |
+--------------+  +-----------------+  |  Archive.org    |
                                       |  Met Museum     |
                                       |  OpenVerse      |
                                       |  Wikipedia API  |
                                       |  Wikidata SPARQL|
                                       |  MapTiler       |
                                       |  GPlates        |
                                       +-----------------+
```

### 1.3 Flusso dati end-to-end

**Click su evento storico:**
1. Utente clicca un punto sul globo -> `App.tsx` rileva l'evento
2. `InfoPanel` apre con dati statici dal dataset locale (`src/data/chunks/`)
3. Contestualmente: `GET /api/entity-media?title=...` -> 8 sorgenti media in parallelo
4. Tab "Chiedi" -> `POST /api/entity-chat` -> Groq LLM -> risposta narrativa
5. Wikipedia: chiamata browser-side diretta a `{lang}.wikipedia.org/w/api.php`

**Macchina del Tempo:**
1. Utente seleziona un'epoca -> `TimeMachine` cerca il briefing in `epoch-briefings.json`
2. Se non trovato: `POST /api/summarize` -> CF AI -> briefing JSON

**Ricerca:**
1. Utente digita nella `SearchBar` -> risultati locali istantanei
2. Dopo 400ms debounce -> Wikipedia API (browser-side)
3. Click su risultato -> log in `search_logs` Supabase (se autenticato)

---

## 2. Infrastruttura Cloudflare Pages

### 2.1 Progetti

| Ambiente | CF Project Name | Branch Git | URL |
|----------|----------------|-----------|-----|
| Produzione | `viaggiatore-nel-tempo` | `main` | https://viaggiatore-nel-tempo.pages.dev |
| Staging | `test-viaggiatore-nel-tempo` | `staging` | https://test-viaggiatore-nel-tempo.pages.dev/app |

**Dashboard:** https://dash.cloudflare.com -> Workers & Pages -> rispettivo progetto

### 2.2 Variabili d'ambiente (CF Pages Dashboard)

Le variabili si impostano in: Dashboard -> Progetto -> Settings -> Environment variables
Configurare separatamente per **Production** e **Preview**.

> Le variabili `VITE_*` sono iniettate al momento del **build** (GitHub Actions),
> non in runtime. Non servono nel CF Pages dashboard - vanno nei GitHub Secrets.

#### Variabili runtime (Pages Functions - server-side)

| Variabile | Tipo | Descrizione | Come ottenere/rinnovare |
|-----------|------|-------------|------------------------|
| `GROQ_API_KEY` | Secret | API key per Groq LLM | console.groq.com -> API Keys -> Create |
| `ANTHROPIC_API_KEY` | Secret | Claude Haiku (opzionale, fallback) | console.anthropic.com -> API Keys |
| `OPENAI_API_KEY` | Secret | GPT-4o-mini per summarize (opzionale) | platform.openai.com -> API keys |
| `YOUTUBE_API_KEY` | Secret | YouTube Data API v3 | console.cloud.google.com -> Progetto `handy-amp-171511` -> Credentials |
| `EUROPEANA_API_KEY` | Secret | Europeana media | pro.europeana.eu/page/get-api (personal key) |
| `DPLA_API_KEY` | Secret | DPLA media | Registrato a nicola.damato6@gmail.com - recupera dalla email di conferma DPLA o ri-registra: `curl -X POST https://api.dp.la/v2/api_key/{email}` |
| `SMITHSONIAN_API_KEY` | Secret | Smithsonian Open Access | edan.si.edu/openaccess/devs/ -> "Get API Key" - recupera dal CF Pages dashboard attuale |
| `OPENVERSE_API_KEY` | Secret | OpenVerse CC (opzionale) | api.openverse.org -> registrazione opzionale |
| `JWT_SECRET` | Secret | Firma JWT per autenticazione admin API | Genera con: `openssl rand -base64 32` |
| `AI_MODEL` | Variabile | Seleziona backend AI | Vedi sezione 5.3 - lascia vuoto per default |

#### Binding KV (non e' una variabile stringa)

| Binding | Descrizione | Configurazione |
|---------|-------------|---------------|
| `VIAGGIATORE_KV` | Cache eventi Wikidata | Dashboard -> Progetto -> Settings -> Functions -> KV namespace bindings. Variable name: `VIAGGIATORE_KV` |

**Creazione namespace KV:**
1. Dashboard -> Workers & Pages -> KV -> Create namespace: `viaggiatore-nel-tempo-kv`
2. Dashboard -> Progetto -> Settings -> Functions -> KV namespace bindings
3. Variable name: `VIAGGIATORE_KV` -> KV namespace: selezionare il namespace creato
4. Ripetere per staging con un namespace separato

### 2.3 Pages Functions - Endpoint completi

| Metodo | Path | Auth | Descrizione | Env vars usate |
|--------|------|------|-------------|---------------|
| `POST` | `/api/entity-chat` | No | Chat AI su entita' storica | `GROQ_API_KEY`, `AI_MODEL`, `AI` (binding) |
| `POST` | `/api/summarize` | No | Briefing AI per Macchina del Tempo | `AI` (binding), `ANTHROPIC_API_KEY`, `AI_MODEL` |
| `GET` | `/api/entity-media` | No | Media aggregati da 8 sorgenti | `YOUTUBE_API_KEY`, `EUROPEANA_API_KEY`, `DPLA_API_KEY`, `SMITHSONIAN_API_KEY`, `OPENVERSE_API_KEY` |
| `GET` | `/api/events` | No | Eventi da KV cache | `VIAGGIATORE_KV` (binding) |
| `POST` | `/api/refresh` | JWT admin | Aggiorna eventi da Wikidata in KV | `VIAGGIATORE_KV` (binding), `JWT_SECRET` |
| `GET` | `/tiles/[[path]]` | No | Proxy tile DARE (mappe storiche medievali) | - |
| `GET` | `/awmc/[[path]]` | No | Proxy tile AWMC (antichita') | - |

### 2.4 Build configuration

```
Build command:  npm run build
Output dir:     dist
Root dir:       /
Node version:   20
```

**Variabili Vite iniettate dal build (GitHub Actions):**

| Variabile | Secret GitHub | Descrizione |
|-----------|--------------|-------------|
| `VITE_SUPABASE_URL` | `VITE_SUPABASE_URL` (prod) | URL progetto Supabase produzione |
| `VITE_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` (prod) | Anon key Supabase produzione |
| `VITE_MAPTILER_KEY` | `VITE_MAPTILER_KEY` | MapTiler API key |

> Le variabili `VITE_*` vengono hardcodate nel bundle JS al momento del build.
> Per cambiarle e' necessario triggerare un nuovo build (push o `gh workflow run deploy.yml --ref main`).

---

## 3. Supabase - Auth e Database

### 3.1 Progetti Supabase

| Ambiente | Project ID | URL | Note |
|----------|-----------|-----|------|
| Produzione | Leggi da GitHub Secret `VITE_SUPABASE_URL` | https://{id}.supabase.co | URL estratto dal secret |
| Staging | `jicmmisiptgyumuvzhjn` | https://jicmmisiptgyumuvzhjn.supabase.co | Hardcoded nel workflow |

**Dashboard:** https://supabase.com/dashboard

### 3.2 Schema database

#### Tabella `profiles`

| Colonna | Tipo | Vincoli | Descrizione |
|---------|------|---------|-------------|
| `id` | uuid | PK, FK -> `auth.users.id` | UUID utente Supabase |
| `email` | text | NOT NULL | Email dell'utente |
| `role` | text | DEFAULT 'user' | 'user' o 'admin' |

**RLS policies:**
- SELECT: utente vede solo il proprio profilo (`auth.uid() = id`)
- INSERT/UPDATE: solo service role (via workflow GitHub Actions)

#### Tabella `search_logs`

| Colonna | Tipo | Vincoli | Descrizione |
|---------|------|---------|-------------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | ID log |
| `user_id` | uuid | FK -> `auth.users.id` | Utente che ha cercato |
| `query` | text | NOT NULL | Testo della ricerca |
| `result_id` | text | NULLABLE | ID del risultato cliccato |
| `result_type` | text | NOT NULL | 'static', 'wiki', 'epoch' |
| `created_at` | timestamptz | DEFAULT now() | Timestamp |

**RLS policies:**
- INSERT: `auth.uid() = user_id` (utenti autenticati loggano solo le proprie ricerche)
- SELECT: solo admin (`profiles.role = 'admin'` via join)

### 3.3 Auth

**Provider abilitati:** Email/password (con conferma email)

**Redirect URLs configurate** (Supabase Dashboard -> Auth -> URL Configuration):
```
https://viaggiatore-nel-tempo.pages.dev/**
https://test-viaggiatore-nel-tempo.pages.dev/**
http://localhost:5173/**
```

**JWT Expiry:** 3600 secondi (1 ora) - session refresh automatico via Supabase client

### 3.4 Chiavi Supabase - Come recuperarle

**Anon key (pubblica, sicura nel bundle):**
1. Dashboard -> Progetto -> Settings -> API
2. Sezione "Project API keys" -> `anon public`

**Service role key (segreta, solo GitHub Actions):**
1. Dashboard -> Progetto -> Settings -> API
2. Sezione "Project API keys" -> `service_role` (click su "Reveal")
3. Usare la chiave JWT legacy (`eyJhbGci...`), non la `sb_secret_...`

**Come aggiornare le chiavi in GitHub Secrets:**
1. github.com -> Repository -> Settings -> Secrets and variables -> Actions
2. Click sul secret -> Update

---

## 4. API esterne

### 4.1 YouTube Data API v3

| Campo | Valore |
|-------|--------|
| Endpoint | `https://www.googleapis.com/youtube/v3/search` |
| Autenticazione | Query parameter `key={YOUTUBE_API_KEY}` |
| Variabile env | `YOUTUBE_API_KEY` (CF Pages, server-side) |
| Quota gratuita | 10.000 unita'/giorno (1 search = 100 unita' -> ~100 search/giorno) |
| Comportamento a quota esaurita | HTTP 403 `quotaExceeded` -> `fetchYouTube` ritorna `[]` -> graceful degradation |
| Dashboard quota | console.cloud.google.com -> Progetto `handy-amp-171511` -> YouTube Data API v3 -> Quotas |
| Come rinnovare la chiave | console.cloud.google.com -> Credentials -> API key -> Regenerate |
| Attenzione | La chiave attuale non e' ristretta - prima della commercializzazione limitarla a HTTP referrer `viaggiatore-nel-tempo.pages.dev/*` |

**Parametri usati nella chiamata:**
```
q = {title}
part = snippet
type = video
maxResults = 3
relevanceLanguage = {locale}
```

### 4.2 Europeana API

| Campo | Valore |
|-------|--------|
| Endpoint | `https://api.europeana.eu/record/v2/search.json` |
| Autenticazione | Query parameter `wskey={EUROPEANA_API_KEY}` |
| Variabile env | `EUROPEANA_API_KEY` (CF Pages) |
| Quota | Nessun limite rigido - fair use policy per progetti culturali |
| Costo | Gratuito |
| Registrazione | pro.europeana.eu/page/get-api (Personal key, approvazione automatica) |
| Account | Registrato a nicola.damato6@gmail.com |
| Nota | Europeana aggrega da istituzioni terze - alcune thumbnail possono non caricare se l'istituzione fornitrice e' down. Non e' un bug dell'app. |

### 4.3 DPLA - Digital Public Library of America

| Campo | Valore |
|-------|--------|
| Endpoint | `https://api.dp.la/v2/items` |
| Autenticazione | Query parameter `api_key={DPLA_API_KEY}` |
| Variabile env | `DPLA_API_KEY` (CF Pages) |
| Quota | Non documentata rigidamente - fair use |
| Costo | Gratuito |
| Registrazione | `curl -X POST https://api.dp.la/v2/api_key/{email}` -> chiave inviata via email |
| Account | Registrato a nicola.damato6@gmail.com - controlla la mail per la chiave o ri-registra |

### 4.4 Smithsonian Open Access

| Campo | Valore |
|-------|--------|
| Endpoint | `https://api.si.edu/openaccess/api/v1.0/search` |
| Autenticazione | Query parameter `api_key={SMITHSONIAN_API_KEY}` |
| Variabile env | `SMITHSONIAN_API_KEY` (CF Pages) |
| Chiave attuale | Configurata in CF Pages dashboard - recupera da li' |
| Quota | 1.000 req/ora, 10.000 req/giorno (free) |
| Costo | Gratuito |
| Registrazione | edan.si.edu/openaccess/devs/ -> "Get API Key" |

### 4.5 OpenVerse (Creative Commons)

| Campo | Valore |
|-------|--------|
| Endpoint | `https://api.openverse.org/v1/images/` |
| Autenticazione | Anonimo (rate-limited) o `Authorization: Bearer {OPENVERSE_API_KEY}` |
| Variabile env | `OPENVERSE_API_KEY` (CF Pages, opzionale) |
| Quota anonima | ~5.000 req/giorno |
| User-Agent inviato | `ViaggiatoreNelTempo/1.0` |
| Filtro licenze | `commercial,modification` (solo immagini con licenza commerciale) |

### 4.6 Wikimedia Commons

| Campo | Valore |
|-------|--------|
| Endpoint | `https://commons.wikimedia.org/w/api.php` |
| Autenticazione | Nessuna chiave richiesta |
| Quota | Nessun limite ufficiale - user-agent corretto richiesto |
| Costo | Gratuito |

### 4.7 Internet Archive

| Campo | Valore |
|-------|--------|
| Endpoint ricerca | `https://archive.org/advancedsearch.php` |
| Endpoint metadati | `https://archive.org/metadata/{id}` |
| Autenticazione | Nessuna chiave richiesta |
| Quota | Nessun limite ufficiale |
| Costo | Gratuito |

### 4.8 Met Museum Collection API

| Campo | Valore |
|-------|--------|
| Endpoint | `https://collectionapi.metmuseum.org/public/collection/v1/search` |
| Autenticazione | Nessuna chiave richiesta |
| Quota | Nessun limite ufficiale |
| Costo | Gratuito |
| Nota | Solo opere in pubblico dominio - sicuro per uso commerciale |

### 4.9 Wikipedia API (browser-side)

| Campo | Valore |
|-------|--------|
| Endpoint IT | `https://it.wikipedia.org/w/api.php` |
| Endpoint EN | `https://en.wikipedia.org/w/api.php` |
| Autenticazione | Nessuna |
| Chiamata da | Browser direttamente (non CF Functions) |
| Uso | Search: `action=query&list=search` - Article: `action=query&prop=extracts|pageimages` |

### 4.10 Wikidata SPARQL

| Campo | Valore |
|-------|--------|
| Endpoint | `https://query.wikidata.org/sparql` |
| Autenticazione | Nessuna |
| User-Agent inviato | `ViaggiatoreNelTempo/1.0 (https://viaggiatore-nel-tempo.pages.dev)` |
| Timeout | 28 secondi |
| Chiamata da | CF Pages Function `/api/refresh` (admin only) |
| Categorie | storia (battaglie Q178561, guerre Q198), geologia (terremoti Q7944, eruzioni Q7581056), scienza (scoperte Q757539, epidemie Q11190) |
| Cache | KV namespace `VIAGGIATORE_KV` -> chiave `events` |

### 4.11 MapTiler (terrain tiles)

| Campo | Valore |
|-------|--------|
| Uso | Tile server per terrain 3D in CesiumJS |
| Variabile env | `VITE_MAPTILER_KEY` (iniettata nel build) |
| GitHub Secret | `VITE_MAPTILER_KEY` |
| Dashboard | cloud.maptiler.com |
| Come rinnovare | cloud.maptiler.com -> Account -> Keys -> Create new key |

### 4.12 GPlates Web Service (mappe paleografiche)

| Campo | Valore |
|-------|--------|
| Uso | Deriva dei continenti per ere geologiche (L1 mappa paleografica) |
| Autenticazione | Nessuna |
| Chiamata da | Browser direttamente |
| Costo | Gratuito (servizio accademico) |

### 4.13 DARE / AWMC (mappe storiche antichita')

| Campo | Valore |
|-------|--------|
| DARE | Digital Atlas of the Roman Empire - dh.gu.se |
| AWMC | Ancient World Mapping Center - cawm.lib.uiowa.edu |
| Autenticazione | Nessuna |
| Proxy | CF Pages Functions `/tiles/[[path]]` e `/awmc/[[path]]` (restituiscono 204 se il tile non esiste) |

---

## 5. AI - Backend LLM

### 5.1 entity-chat (`POST /api/entity-chat`)

**Routing logica:**

```
AI_MODEL env var:
  "groq"           -> Groq (primary) -> CF AI Workers AI (fallback se AI binding presente)
  "claude-haiku"   -> Anthropic Claude Haiku 5.5
  "cloudflare-ai"  -> CF Workers AI DeepSeek direttamente
  (non impostato)  -> "groq" (default)
```

| Backend | Modello | Max tokens | Endpoint |
|---------|---------|-----------|---------|
| Groq (primary) | `openai/gpt-oss-120b` | 2000 | `https://api.groq.com/openai/v1/chat/completions` |
| Cloudflare Workers AI (fallback) | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | 800 | CF AI binding (interno) |
| Claude Haiku (opzionale) | `claude-haiku-5-5` | 600 | `https://api.anthropic.com/v1/messages` |

**History:** ultimi 6 messaggi (3 turni) per staying nel context limit
**Formato risposta:** JSON `{"answer":"...","suggestions":["Nome1","Nome2"]}`
**Analisi iniziale:** testo libero (prompt con prefisso `ANALISI`)

### 5.2 summarize (`POST /api/summarize`)

**Routing logica:**

```
AI_MODEL env var:
  "cloudflare-ai"  -> CF Workers AI DeepSeek (default se non impostato)
  "claude-haiku"   -> Anthropic Claude Haiku 5.5
  "gpt-4o-mini"   -> OpenAI GPT-4o-mini
```

| Backend | Modello | Max tokens |
|---------|---------|-----------|
| CF Workers AI (default) | `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | 1400 |
| Claude Haiku | `claude-haiku-5-5` | 700 |
| GPT-4o-mini | `gpt-4o-mini` | 700 |

**Formato risposta:** JSON `{"dove":"...","top5":["..."],"connessioni":"..."}`

### 5.3 Come cambiare il modello AI

1. CF Pages Dashboard -> Progetto -> Settings -> Environment variables
2. Aggiungere/modificare `AI_MODEL` con il valore desiderato
3. Il cambio e' immediato - non richiede rebuild

**Raccomandazioni:**
- Per costi zero: lascia vuoto (usa CF Workers AI + Groq free tier)
- Per qualita' massima: `claude-haiku` (richiede `ANTHROPIC_API_KEY`, ~$0.001/req)
- Per testing: `cloudflare-ai` (sempre gratis, qualita' inferiore)

### 5.4 Groq - Limiti free tier

| Metrica | Limite |
|---------|--------|
| Requests/minuto | 30 RPM |
| Tokens/minuto | 6.000 TPM |
| Tokens/giorno | 500.000 TPD |

**Dashboard quota:** console.groq.com -> Usage
**Comportamento a quota esaurita:** Groq risponde 429 -> CF AI fallback automatico (se binding configurato) -> altrimenti `502 AI call failed`

---

## 6. GitHub - Repository e CI/CD

### 6.1 Repository

| Campo | Valore |
|-------|--------|
| Branch produzione | `main` |
| Branch staging | `staging` |
| Strategia | `feature/* -> staging -> main` (via workflow promote) |

### 6.2 GitHub Secrets richiesti

Configurabili in: Repository -> Settings -> Secrets and variables -> Actions

| Secret | Usato da | Descrizione | Come ottenere |
|--------|----------|-------------|--------------|
| `CLOUDFLARE_API_TOKEN` | Tutti i workflow | Token API Cloudflare per deploy | dash.cloudflare.com -> My Profile -> API Tokens -> Create Token (template: Edit Cloudflare Pages) |
| `CLOUDFLARE_ACCOUNT_ID` | Tutti i workflow | ID account Cloudflare | dash.cloudflare.com -> Home -> Account ID (a destra) |
| `VITE_MAPTILER_KEY` | deploy.yml, staging-deploy.yml | MapTiler API key | cloud.maptiler.com -> Account -> Keys |
| `VITE_SUPABASE_URL` | deploy.yml (produzione) | URL Supabase produzione | Supabase Dashboard -> Settings -> API -> Project URL |
| `VITE_SUPABASE_ANON_KEY` | deploy.yml (produzione) | Anon key Supabase produzione | Supabase Dashboard -> Settings -> API -> anon public |
| `VITE_SUPABASE_URL_STAGING` | staging-deploy.yml | URL Supabase staging | Supabase Dashboard -> Progetto staging -> Settings -> API |
| `VITE_SUPABASE_ANON_KEY_STAGING` | staging-deploy.yml | Anon key Supabase staging | Supabase Dashboard -> Progetto staging -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY_STAGING` | staging-deploy.yml | Service role key staging | Supabase staging -> Settings -> API -> service_role (JWT `eyJhbGci...`) |
| `STAGING_TEST_EMAIL` | staging-deploy.yml | Email utente admin di test | Definita dall'owner - usata per creare utente admin in staging |
| `STAGING_TEST_PASS` | staging-deploy.yml | Password utente admin di test | Definita dall'owner |
| `STAGING_BASIC_AUTH_USER` | staging-deploy.yml | Username Basic Auth staging | Definita dall'owner |
| `STAGING_BASIC_AUTH_PASS` | staging-deploy.yml | Password Basic Auth staging | Definita dall'owner |

### 6.3 Workflow CI/CD

#### `staging-deploy.yml` - Deploy staging

**Trigger:** push su branch `staging` o `workflow_dispatch`

**Step:**
1. Checkout -> Node 20 -> `npm ci`
2. TypeScript check (`tsc --noEmit`)
3. Validazione secret Supabase staging
4. `npm run build` (con variabili VITE staging)
5. Copia Cesium static assets in `dist/cesium/`
6. Verifica bundle contiene URL Supabase staging corretto
7. Setup utente admin di test in Supabase staging (via Service Role API)
8. Deploy su CF Pages `test-viaggiatore-nel-tempo` (branch `staging`)
9. Smoke test: HTTP check su `test-viaggiatore-nel-tempo.pages.dev/app`
10. Smoke test AI: `POST /api/entity-chat` su staging (verifica risposta > 100 chars)

#### `promote-to-prod.yml` - Promozione in produzione

**Trigger:** `workflow_dispatch` manuale con `confirm=yes`

**Step:**
1. Valida conferma (`confirm == "yes"`)
2. Checkout `main`
3. Crea tag backup: `prod-backup-YYYYMMDD-HHmmss`
4. Merge `staging` -> `main` (no-ff)
5. Push `main`
6. Dispatch `deploy.yml` su `main`

**Come eseguire:**

```bash
gh workflow run promote-to-prod.yml --ref staging --field confirm=yes
```

#### `deploy.yml` - Deploy produzione

**Trigger:** push su `main` o `workflow_dispatch`

**Step:**
1. Checkout -> Node 20 -> `npm ci`
2. `npm run build` (con variabili VITE produzione)
3. Copia Cesium static assets
4. Deploy su CF Pages `viaggiatore-nel-tempo`
5. Smoke test AI: `POST /api/entity-chat` su produzione

---

## 7. Runbook operativo

### 7.1 Deploy normale (feature -> staging -> produzione)

```bash
# 1. Passo 0 - verifica allineamento ambienti
git fetch origin
git log --oneline staging..main    # deve essere vuoto
git log --oneline main..staging    # commit in attesa di promozione

# 2. Crea feature branch
git checkout staging
git pull origin staging
git checkout -b feature/nome-descrittivo

# 3. Sviluppa e fai build locale
npm run build  # verifica che TypeScript compili

# 4. Merge e push su staging
git checkout staging
git merge feature/nome-descrittivo --ff-only
git push origin staging
# GitHub Actions staging-deploy.yml si avvia automaticamente

# 5. Verifica su staging: test-viaggiatore-nel-tempo.pages.dev/app

# 6. Promuovi in produzione (solo con approvazione esplicita)
gh workflow run promote-to-prod.yml --ref staging --field confirm=yes
```

### 7.2 Rollback produzione

```bash
# Elenca i backup disponibili
git tag -l "prod-backup-*" | sort -r

# Esegui rollback al tag desiderato
git checkout main
git reset --hard prod-backup-YYYYMMDD-HHmmss
git push --force origin main    # richiede conferma esplicita
```

> Il push force su main e' distruttivo. Usare solo con conferma esplicita dell'utente.

### 7.3 Rotazione chiavi API

**Procedura generale:**
1. Genera la nuova chiave nel dashboard del provider
2. Aggiorna la variabile in CF Pages Dashboard (Prod + Staging)
3. Il cambio e' immediato - nessun rebuild necessario
4. Revoca la vecchia chiave nel dashboard del provider
5. Verifica con smoke test:

```bash
curl -X POST https://viaggiatore-nel-tempo.pages.dev/api/entity-chat \
  -H "Content-Type: application/json" \
  -d '{"entity":{"title":"Test","description":"","year":0,"category":"storia"},"question":"ANALISI","history":[],"locale":"it"}'
```

**Per variabili VITE (Supabase, MapTiler):**
1. Aggiorna il GitHub Secret corrispondente
2. Triggerai un rebuild:

```bash
gh workflow run deploy.yml --ref main
```

### 7.4 Aggiornamento dataset eventi (Wikidata refresh)

Il dataset statico (`src/data/chunks/*.json`) e' separato dal dataset Wikidata in KV.

**Wikidata refresh (admin API):**
```bash
# Richiede JWT admin - ottienilo dalla sessione di login admin nell'app
curl -X POST https://viaggiatore-nel-tempo.pages.dev/api/refresh \
  -H "Authorization: Bearer {JWT_ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
# Risposta attesa: {"message":"Refresh avviato - i nuovi eventi appariranno entro 30 secondi"}
```

**Aggiornamento dataset statico** (eventi in `src/data/chunks/`):
1. Modifica i file JSON in `src/data/chunks/era-*.json`
2. Push su feature branch -> staging -> produzione via procedura normale

### 7.5 Monitoraggio

**Cosa monitorare regolarmente:**

| Cosa | Dove | Frequenza | Alert |
|------|------|-----------|-------|
| Quota YouTube | console.cloud.google.com -> YouTube API -> Quotas | Settimanale | >80% = rischio 403 |
| Quota Groq | console.groq.com -> Usage | Settimanale | >400k tokens/giorno |
| Errori CF Pages | dash.cloudflare.com -> Workers & Pages -> Functions | Dopo ogni deploy | Error rate >1% |
| Build GitHub Actions | github.com -> Repository -> Actions | Dopo ogni push | Build fallito |
| Uptime Supabase | status.supabase.com | Passivo | Incidents |

**Smoke test manuale produzione:**

```bash
# Verifica API chat
curl -s -X POST https://viaggiatore-nel-tempo.pages.dev/api/entity-chat \
  -H "Content-Type: application/json" \
  -d '{"entity":{"title":"Leonardo da Vinci","description":"Artista","year":1452,"category":"arte"},"question":"ANALISI","history":[],"locale":"it"}'

# Verifica media
curl -s "https://viaggiatore-nel-tempo.pages.dev/api/entity-media?title=Colosseo&locale=it"
```

---

## 8. Troubleshooting

### 8.1 Sintomi comuni -> causa -> soluzione

| Sintomo | Causa probabile | Soluzione |
|---------|----------------|-----------|
| Chat AI risponde "AI call failed" | `GROQ_API_KEY` mancante o quota esaurita | Verifica chiave in CF Pages -> vedi sezione 5.4 |
| Chat AI usa CF AI invece di Groq | `GROQ_API_KEY` non impostata, CF AI binding attivo | Imposta `GROQ_API_KEY` in CF Pages dashboard |
| Nessun media in InfoPanel | Tutte le API falliscono o `YOUTUBE_API_KEY` mancante | Controlla CF Functions logs in Cloudflare dashboard |
| Errore 503 su /api/events | KV binding `VIAGGIATORE_KV` non configurato | Aggiungi binding KV in CF Pages -> Functions settings |
| Login non funziona | URL Supabase o Anon key errate nel bundle | Rebuild con secrets corretti: `gh workflow run deploy.yml --ref main` |
| Build GitHub fallisce con "VITE_SUPABASE_URL_STAGING non configurato" | Secret mancante | Aggiungilo in Repository -> Settings -> Secrets |
| Staging non si aggiorna | Branch `staging` non allineato o wrangler non ha permessi | Verifica `CLOUDFLARE_API_TOKEN` scope -> deve includere Pages:Edit |
| `git merge --ff-only` fallisce | staging e' dietro main | `git checkout staging && git merge main --ff-only && git push origin staging` |

### 8.2 Come diagnosticare un'API esterna down

```bash
# YouTube (sostituisci {KEY} con il valore dalla CF Pages dashboard)
curl -s "https://www.googleapis.com/youtube/v3/search?q=test&part=snippet&type=video&maxResults=1&key={KEY}"

# Europeana
curl -s "https://api.europeana.eu/record/v2/search.json?query=rome&wskey={KEY}&rows=1"

# DPLA
curl -s "https://api.dp.la/v2/items?q=rome&api_key={KEY}&page_size=1"

# Smithsonian
curl -s "https://api.si.edu/openaccess/api/v1.0/search?q=rome&api_key={KEY}&rows=1"

# Groq
curl -s -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer {KEY}" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"Hi"}],"max_tokens":10}'
```

### 8.3 Supabase - Query di diagnostica

Eseguire da Supabase Dashboard -> Table Editor o SQL Editor:

```sql
-- Ultimi 20 accessi
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 20;

-- Utenti admin
SELECT p.email, p.role FROM profiles p WHERE p.role = 'admin';

-- Ricerche piu' frequenti (ultimi 30 giorni)
SELECT query, COUNT(*) as n, result_type
FROM search_logs
WHERE created_at > now() - interval '30 days'
GROUP BY query, result_type
ORDER BY n DESC
LIMIT 20;

-- Verifica RLS attiva
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';
```

### 8.4 Come aggiungere un utente admin

```sql
-- Via Supabase Dashboard -> SQL Editor
UPDATE profiles SET role = 'admin' WHERE email = 'email@esempio.com';

-- Verifica
SELECT email, role FROM profiles WHERE email = 'email@esempio.com';
```

---

## 9. Checklist pre-commercializzazione

Eseguire questa checklist prima del lancio pubblico a pagamento:

### Sicurezza
- [ ] Restringere YouTube API key a HTTP referrer `viaggiatore-nel-tempo.pages.dev/*` (attualmente non ristretta)
- [ ] Verificare che `JWT_SECRET` sia almeno 32 bytes random (`openssl rand -base64 32`)
- [ ] Verificare RLS attiva su tutte le tabelle Supabase (sezione 8.3 query diagnostica)
- [ ] Assicurarsi che nessuna chiave API sia hardcodata nel codice
- [ ] Ruotare `GROQ_API_KEY` se condivisa durante sviluppo

### Performance
- [ ] Implementare caching CF KV per YouTube (chiave `yt:{title}:{locale}`, TTL 24h) - riduce quota
- [ ] Verificare che `epoch-briefings.json` sia aggiornato per tutte le 52 epoche
- [ ] Testare tempi di risposta `/api/entity-chat` < 5s, `/api/entity-media` < 8s

### Quota e scaling
- [ ] Richiedere quota aggiuntiva YouTube se traffico > 3.000 visite/giorno
- [ ] Impostare alert su quota YouTube a 80%
- [ ] Valutare upgrade Groq se traffic > 100 richieste/giorno di chat AI

### Legale
- [ ] Privacy Policy aggiornata con elenco API esterne e dati raccolti (`search_logs`)
- [ ] Cookie banner (se tracciamento aggiunto)
- [ ] Termini di servizio con diritto di recesso 14 giorni (obbligo UE)
- [ ] Verifica licenze immagini: Met (pubblico dominio), Archive (mixed), OpenVerse (CC commercial)

### Monitoring
- [ ] Configurare alert CF Pages su error rate > 1%
- [ ] Monitorare Groq Usage settimanalmente
- [ ] Verificare uptime Supabase su status.supabase.com

---

_Ultima modifica: Novembre 2026 - Nicola D'Amato con Claude Sonnet 4.6_
