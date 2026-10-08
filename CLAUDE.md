# Viaggiatore nel Tempo — Istruzioni di progetto

## Cos'è questa app

"Viaggiatore nel Tempo" è una webapp educativa interattiva che permette di navigare
nello spazio e nel tempo per scoprire la storia dell'umanità e dell'universo.

**Audience:** professori, studenti, appassionati di storia e cultura.
**Autore:** Nicola Damato (nicola.damato@accenture.com)
**Status:** in sviluppo attivo — MVP in costruzione

## Concept core

L'utente vede un globo 3D navigabile con uno slider del tempo.
Muovendosi nel tempo appaiono pin/marker sugli eventi storici di quel periodo.
Cliccando un marker si apre una card con immagine, descrizione breve e link Wikipedia.

Per eventi pre-terrestri (Big Bang, formazione del sistema solare) si passa a una
vista "universo" (cielo stellato con marker cosmici).

## Stack tecnologico

| Layer | Tecnologia | Note |
|-------|-----------|------|
| Frontend | React 18 + TypeScript | scaffolded con Vite |
| Globo 3D | react-globe.gl + three.js | gestisce sia Terra che spazio |
| Stile | CSS puro (no framework pesanti) | da aggiornare con Tailwind in fase 2 |
| Dati storici | Wikidata SPARQL API | gratuita, no autenticazione |
| Contenuti | Wikipedia REST API | gratuita, no autenticazione |
| Immagini | Wikimedia Commons API | gratuita, no autenticazione |
| Hosting | GitHub Pages (futuro) | deploy statico, zero costi |

## Struttura cartelle

```
src/
  components/     → componenti UI (Globe, TimeSlider, EventCard, SearchBar, FilterPanel)
  data/           → eventi storici hardcoded per l'MVP (events.json)
  api/            → client per Wikipedia e Wikidata
  types/          → definizioni TypeScript (HistoricalEvent, etc.)
  hooks/          → custom React hooks
docs/             → documentazione del progetto
```

## Tipi di dati principali

```typescript
// Evento storico — struttura centrale di tutta l'app
interface HistoricalEvent {
  id: string;
  title: string;           // nome evento/personaggio
  year: number;            // anno (negativo = a.C.)
  lat?: number;            // latitudine (null per eventi cosmici)
  lng?: number;            // longitudine (null per eventi cosmici)
  category: EventCategory; // arte | musica | storia | scienza | geologia | cosmo
  description: string;     // breve descrizione (max 300 caratteri)
  wikipediaSlug: string;   // slug pagina Wikipedia (es. "Christopher_Columbus")
  imageUrl?: string;       // URL immagine Wikimedia Commons
  isCosmic: boolean;       // true per eventi pre-terrestri (Big Bang, ecc.)
}

type EventCategory = 'storia' | 'arte' | 'musica' | 'scienza' | 'geologia' | 'cosmo';
```

## Fasi di sviluppo

### Fase 1 — MVP (in corso)
- [x] Scaffold progetto
- [ ] Globo 3D navigabile
- [ ] Slider del tempo (13.800.000.000 a.C. → oggi)
- [ ] Dataset hardcoded ~50 eventi chiave (events.json)
- [ ] Marker colorati per categoria sul globo
- [ ] Card evento con immagine + link Wikipedia
- [ ] Filtro per categoria
- [ ] Ricerca per nome evento/personaggio

### Fase 2 — Dati dinamici
- [ ] Integrazione Wikidata API (eventi in tempo reale)
- [ ] Mappe politiche storiche con confini che cambiano
- [ ] Vista universo per eventi cosmici

### Fase 3 — Esperienza avanzata
- [ ] Timeline verticale accanto alla mappa
- [ ] "Viaggi guidati" (playlist di eventi tematici)
- [ ] PWA per uso offline in classe
- [ ] Pubblicazione GitHub Pages

## Regole di sviluppo

1. **Mobile-first** — ogni componente deve funzionare su schermo 375px.
2. **Zero costi** — nessuna API a pagamento, nessun servizio con piano premium.
3. **Nessun backend** — app completamente statica, tutto gira nel browser.
4. **Wikipedia come fonte** — tutti i contenuti testuali puntano a Wikipedia (non generati).
5. **Accessibilità** — testi leggibili, contrasti adeguati, pensato per aule scolastiche.
6. **Dati storici accurati** — non inventare date o luoghi; usare fonti verificabili.

## Comandi utili

```bash
# Avvia server di sviluppo locale
npm run dev

# Build per produzione
npm run build

# Anteprima build di produzione
npm run preview

# Controllo tipi TypeScript
npx tsc --noEmit
```

## Contesto per sessioni future

Nicola Damato non è un programmatore — spiega le scelte tecniche in italiano,
in modo chiaro e contestualizzato. Prima di implementare funzionalità complesse,
descrivi l'approccio e chiedi conferma.
