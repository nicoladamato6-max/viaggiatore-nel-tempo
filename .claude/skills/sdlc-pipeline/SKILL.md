---
name: sdlc-pipeline
description: >
  Pipeline SDLC obbligatoria per il progetto Viaggiatore nel Tempo.
  INVOKE THIS SKILL at the very start of every development session, before writing any code or running any git command.
  Also invoke whenever you are about to: commit code, push to any branch, deploy anything, or start implementing a feature.
  This skill is non-negotiable: environment misalignment between staging and production is a CRITICAL incident.
  Trigger phrases include: "implementa", "aggiungi", "fix", "feature", "push", "deploy", "rilascia", "commit", "merge", "sviluppa", "nuova sessione", "continuiamo".
---

# Pipeline SDLC — Viaggiatore nel Tempo

## Regola fondamentale — nessun bypass

**Ogni feature, fix o modifica segue esattamente questa pipeline.** Nessuna eccezione, nemmeno per "piccole modifiche" o "fix urgenti". Il disallineamento degli ambienti è un incidente critico: nella sessione del 10/11/2026, 7 commit sono finiti direttamente in produzione saltando staging, rendendo l'ambiente di test inutilizzabile.

---

## Passo 0 — Verifica allineamento (PRIMO PASSO DI OGNI SESSIONE)

```bash
cd C:\Users\nicola.damato\Documents\viaggiatore-nel-tempo
git fetch origin
git log --oneline staging..main
git log --oneline main..staging
```

| Risultato | Azione |
|-----------|--------|
| Entrambi vuoti | ✅ Allineati — procedi |
| `staging..main` non vuoto | 🚨 Main è avanti — allinea staging a main SUBITO |
| `main..staging` non vuoto | ℹ️ Staging ha feature in attesa — informa l'utente |

**Allineamento (caso 🚨):**
```bash
git checkout staging && git merge main --ff-only && git push origin staging && git checkout main
```

---

## Architettura ambienti

| Ambiente | Branch | CF Pages project | URL |
|----------|--------|------------------|-----|
| dev | locale | — | http://localhost:5173 |
| staging | `staging` | `test-viaggiatore-nel-tempo` | https://test-viaggiatore-nel-tempo.pages.dev/app |
| produzione | `main` | `viaggiatore-nel-tempo` | https://viaggiatore-nel-tempo.pages.dev |

Le credenziali Basic Auth per staging sono in `memory/project_sdlc.md`.

---

## Passo 1 — Sviluppo su feature branch

```bash
git checkout staging
git pull origin staging
git checkout -b feature/nome-descrittivo
```

I CF Functions (`functions/api/`) non girano in locale — testabili solo su staging/produzione.

---

## Passo 2 — Build locale preventiva

```bash
npm run build
```

Se fallisce, correggi prima di pushare.

---

## Passo 3 — Deploy su staging

```bash
git checkout staging
git merge feature/nome-descrittivo --ff-only
git push origin staging
```

Il push triggera `staging-deploy.yml` (GitHub Actions): TypeScript check → build → deploy CF Pages → smoke test. Attendi badge verde prima di procedere.

---

## Passo 4 — Test su staging + notifica utente

Dopo il deploy verde:
1. Testa la feature su `https://test-viaggiatore-nel-tempo.pages.dev/app`
2. Per CF Functions: `curl` con Basic Auth sull'endpoint staging
3. **Notifica l'utente** con: URL, feature da testare, edge case

**Non procedere senza conferma esplicita dell'utente.**

---

## Passo 5 — Gate di approvazione utente (OBBLIGATORIO)

Frasi che costituiscono approvazione: "ok, rilascia in prod", "pusha in produzione", "pushalo tu", "approvo", "vai avanti", "deploy in prod".

Silenzio, screenshot, o domande su staging **non** sono approvazione.

---

## Passo 6 — Promozione staging → produzione

**Usa il workflow GitHub Actions, non git diretto:**

```bash
gh workflow run promote-to-prod.yml --ref staging --field confirm=yes
```

Il workflow: crea tag backup → merge staging→main → build → deploy → smoke test produzione.

**Non usare mai `git push origin main` per feature.** Percorso obbligatorio: `feature/* → staging → main (via workflow)`.

---

## Rollback produzione

```bash
git tag -l "prod-backup-*" | sort -r | head -5
git reset --hard prod-backup-YYYYMMDD-HHmmss
git push --force origin main   # solo con conferma esplicita dell'utente
```

---

## Passo 2b — Aggiornamento documento architetturale (OBBLIGATORIO SE APPLICABILE)

**Il documento `docs/ADMIN_GUIDE.md` deve sempre descrivere lo stato in produzione.**
Aggiornarlo sul feature branch prima del merge su staging: diventa definitivo con la promozione in produzione.

### Quando aggiornare (checklist rapida)

| La modifica tocca... | Sezione da aggiornare |
|----------------------|-----------------------|
| Nuova API esterna aggiunta o rimossa | §4 API esterne |
| Nuova variabile d'ambiente CF Pages o GitHub Secret | §2.2 Variabili runtime / §6.2 GitHub Secrets |
| Nuovo o rimosso endpoint CF Function | §2.3 Pages Functions — Endpoint |
| Modifica schema Supabase (tabelle, colonne, RLS) | §3.2 Schema database |
| Modifica routing o modelli AI | §5.1 / §5.2 AI backend |
| Modifica workflow CI/CD | §6.3 Workflow CI/CD |
| Nuova procedura operativa o runbook | §7 Runbook operativo |
| Nuovo elemento in checklist pre-commercializzazione | §9 Checklist |

### Quando NON serve aggiornamento

- Fix di bug che non cambiano interfacce o configurazioni esterne
- Aggiornamenti del dataset storico (file JSON in `src/data/chunks/`)
- Modifiche CSS, animazioni, layout UI senza impatto sull'architettura
- Refactoring interno senza cambi di contratto API

### Procedura

1. Prima di fare il commit sul feature branch, aprire `docs/ADMIN_GUIDE.md`
2. Aggiornare le sezioni pertinenti con le informazioni corrette
3. Aggiornare il campo `Ultima modifica` in fondo al documento
4. Includere il file nel commit della feature (stesso commit, stessa PR)

**Il documento architetturale fa parte del deliverable, non è documentazione opzionale.**
Un feature branch che aggiunge un endpoint o una variabile d'ambiente senza aggiornare l'Admin Guide è incompleto.

---

## Variabili d'ambiente (solo su CF Pages dashboard, mai nel codice)

| Variabile | Stato |
|-----------|-------|
| `YOUTUBE_API_KEY` | Configurato su staging + prod |
| `EUROPEANA_API_KEY` | Configurato su staging + prod |
| `DPLA_API_KEY` | Configurato su staging + prod |
| `SMITHSONIAN_API_KEY` | Configurato su staging + prod |
| `OPENVERSE_API_KEY` | Opzionale |
| `GROQ_API_KEY` | Configurato su staging + prod |
| `JWT_SECRET` | Configurato su staging + prod |
| `VIAGGIATORE_KV` | Binding KV — configurare se non presente |

Vedi `memory/project_api_commercialization.md` per quote e piano upgrade.
Vedi `docs/ADMIN_GUIDE.md` per la documentazione completa di ogni variabile.
