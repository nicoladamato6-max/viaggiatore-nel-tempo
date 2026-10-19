import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './App.css';
import { GlobeView } from './components/GlobeView';
import { InfoPanel } from './components/InfoPanel';
import { TimeControls } from './components/TimeControls';
import { SearchBar } from './components/SearchBar';
import { TimeMachine } from './components/TimeMachine';
import { EraGuide } from './components/EraGuide';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { ProfileModal } from './components/ProfileModal';
import { MobileNav } from './components/MobileNav';
import { useAuth } from './hooks/useAuth';
import { useMobile } from './hooks/useMobile';
import { type HistoricalEvent, type EventCategory, type EntityType, type FlyTarget, type Locale, type WikiSearchResult, type WikiMarker, type MobileTab, type EraLaunchData } from './types';
import { PLANETS, MOONS, toPlanetSearchItem, toMoonSearchItem } from './utils/celestialMechanics';
import { MACRO_ERAS, SUBCATEGORIES, type Period } from './data/historicalPeriods';

// ── Opzione C: chunk per era, import dinamici ─────────────────────────────────
const ERA_KEYS = ['cosmo', 'preistoria', 'antica', 'medioevo', 'moderna', 'ottocento', 'novecento', 'contemporanea', 'senza_anno'] as const;
type EraKey = typeof ERA_KEYS[number];

function getEraKey(year: number | null, isCosmic: boolean): EraKey {
  if (isCosmic) return 'cosmo';
  if (year == null) return 'senza_anno';
  if (year < -3_500)  return 'preistoria';
  if (year < 476)     return 'antica';
  if (year < 1492)    return 'medioevo';
  if (year < 1789)    return 'moderna';
  if (year < 1914)    return 'ottocento';
  if (year < 1945)    return 'novecento';
  return 'contemporanea';
}

const ERA_IMPORTS: Record<EraKey, () => Promise<{ default: unknown[] }>> = {
  cosmo:         () => import('./data/chunks/era-cosmo.json'),
  preistoria:    () => import('./data/chunks/era-preistoria.json'),
  antica:        () => import('./data/chunks/era-antica.json'),
  medioevo:      () => import('./data/chunks/era-medioevo.json'),
  moderna:       () => import('./data/chunks/era-moderna.json'),
  ottocento:     () => import('./data/chunks/era-ottocento.json'),
  novecento:     () => import('./data/chunks/era-novecento.json'),
  contemporanea: () => import('./data/chunks/era-contemporanea.json'),
  senza_anno:    () => import('./data/chunks/era-senza_anno.json'),
};

// Voci cercabili per Luna, Sole e tutti i pianeti
const MOON_SEARCH: HistoricalEvent = {
  id: 'luna', title: 'Luna', year: -4_500_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'Il satellite naturale della Terra a ~384.400 km. Si è formata ~4,5 miliardi di anni fa dall\'impatto di Theia. L\'Apollo 11 vi allunò il 20 luglio 1969.',
  wikipediaSlug: 'Moon',
};
const SUN_SEARCH: HistoricalEvent = {
  id: 'sole', title: 'Sole', year: -4_600_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'La stella al centro del Sistema Solare, a 149,6 milioni di km dalla Terra. La luce impiega 8 minuti a raggiungerci. Contiene il 99,8% della massa del Sistema Solare.',
  wikipediaSlug: 'Sun',
};
const PLANET_SEARCH_ITEMS = PLANETS.map(toPlanetSearchItem);
const MOON_SEARCH_ITEMS   = MOONS.map(toMoonSearchItem);

// ID dei corpi celesti (matchano gli ID entità CesiumJS o lune che volano verso il genitore)
const BODY_IDS = new Set([
  'luna', 'sole',
  ...PLANETS.map(p => `planet-${p.id}`),
  ...MOONS.map(m => `moon-${m.id}`),
]);

// ── Scala piecewise ridistribuita per densità informativa ────────────────────
// Ogni macro-era storica ottiene spazio proporzionale ai suoi eventi, non alla durata.
// Età Moderna (297 anni) = 8%, Età Contemporanea (236 anni) = 20% (era prima 2.2%/1.8%).
// I breakpoint coincidono con i confini delle macro-ere per allineare track CSS e Gantt.
const BP = [
  { s: 0,    y: -13_800_000_000 },  // Big Bang
  { s: 100,  y:  -4_600_000_000 },  // Formazione Sistema Solare
  { s: 250,  y:    -541_000_000 },  // Esplosione Cambriana
  { s: 330,  y:     -66_000_000 },  // Fine dei dinosauri
  { s: 400,  y:      -2_500_000 },  // Preistoria (Homo)
  { s: 480,  y:        -300_000 },  // Homo Sapiens
  { s: 520,  y:         -10_000 },  // Prime civiltà
  { s: 560,  y:          -3_500 },  // Età Antica
  { s: 640,  y:             476 },  // Medioevo
  { s: 720,  y:            1492 },  // Età Moderna
  { s: 800,  y:            1789 },  // Età Contemporanea
  { s: 1000, y:            2025 },  // Oggi
] as const;

function sliderToYear(v: number): number {
  for (let i = 0; i < BP.length - 1; i++) {
    const a = BP[i], b = BP[i + 1];
    if (v >= a.s && v <= b.s) {
      const t = (v - a.s) / (b.s - a.s);
      return Math.round(a.y + (b.y - a.y) * t);
    }
  }
  return 2025;
}

function yearToSlider(year: number): number {
  for (let i = 0; i < BP.length - 1; i++) {
    const a = BP[i], b = BP[i + 1];
    if (year >= a.y && year <= b.y) {
      const t = (year - a.y) / (b.y - a.y);
      return Math.round(a.s + (b.s - a.s) * t);
    }
  }
  return year < BP[0].y ? 0 : 1000;
}

function getTimeWindow(year: number): { from: number; to: number } {
  if (year < -4_500_000_000) return { from: year - 700_000_000, to: year + 700_000_000 };
  if (year < -500_000_000)   return { from: year - 80_000_000,  to: year + 80_000_000  };
  if (year < -66_000_000)    return { from: year - 10_000_000,  to: year + 10_000_000  };
  // Cap superiore per epoche preistoriche: finestra simmetrica ma non oltre la soglia dell'era successiva
  if (year < -300_000)       return { from: year - 1_500_000,   to: Math.min(year + 1_500_000, -10_001) };
  if (year < -10_000)        return { from: year - 10_000,      to: Math.min(year + 10_000,    -3_501)  };
  if (year <= -3_001)        return { from: year - 3_500,       to: Math.min(year + 3_500,      475)    }; // Preistoria: 100ev/7000y
  if (year <= -501)          return { from: year - 1_250,       to: Math.min(year + 1_250,      475)    }; // Antico Oriente: 200ev/2499y
  if (year <= 476)           return { from: year - 300,         to: year + 300                          }; // Classico/Antico: ~500ev totali
  if (year <= 1_000)         return { from: year - 260,         to: year + 260                          }; // Alto Medioevo: 200ev/523y
  if (year <= 1_350)         return { from: year - 140,         to: year + 140                          }; // Basso Medioevo: 250ev/349y
  if (year <= 1_599)         return { from: year - 83,          to: year + 83                           }; // Rinascimento: 300ev/248y
  if (year <= 1_799)         return { from: year - 50,          to: year + 50                           }; // Eta Moderna: 400ev/199y
  if (year <= 1_913)         return { from: year - 23,          to: year + 23                           }; // Ottocento: 500ev/113y
  if (year <= 1_945)         return { from: year - 5,           to: year + 5                            }; // Novecento: 600ev/31y
  return                            { from: year - 10,          to: year + 10                           }; // Contemporaneo: 800ev/78y
}

export function formatYear(year: number): string {
  if (year <= -13_700_000_000) return 'Big Bang — 13,8 mld a.C.';
  if (Math.abs(year) >= 1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} mld a.C.`;
  if (Math.abs(year) >= 1_000_000)     return `${(Math.abs(year) / 1_000_000).toFixed(0)} mln a.C.`;
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

export function getEra(year: number): { label: string; color: string; wikipediaSlug?: string } {
  if (year < -4_600_000_000) return { label: '🌌 Universo primordiale', color: '#1abc9c', wikipediaSlug: 'Observable_universe' };
  if (year < -541_000_000)   return { label: '🌍 Terra primordiale',    color: '#27ae60', wikipediaSlug: 'History_of_Earth' };
  if (year < -252_000_000)   return { label: '🐟 Era Paleozoica',       color: '#2ecc71', wikipediaSlug: 'Paleozoic' };
  if (year < -66_000_000)    return { label: '🦕 Era Mesozoica',        color: '#f39c12', wikipediaSlug: 'Mesozoic' };
  if (year < -2_500_000)     return { label: '🦎 Era Cenozoica',        color: '#e67e22', wikipediaSlug: 'Cenozoic' };
  if (year < -3_500)         return { label: '🦴 Preistoria',           color: '#e74c3c', wikipediaSlug: 'Prehistory' };
  if (year < 476)            return { label: '📜 Età Antica',           color: '#9b59b6', wikipediaSlug: 'Ancient_history' };
  if (year < 1492)           return { label: '🏰 Medioevo',             color: '#2980b9', wikipediaSlug: 'Middle_Ages' };
  if (year < 1789)           return { label: '🎨 Età Moderna',          color: '#8e44ad', wikipediaSlug: 'Early_modern_period' };
  return                            { label: '⚙️ Età Contemporanea',    color: '#a8c8ff', wikipediaSlug: 'Modern_history' };
}

// AuthProvider è ora in main.tsx (condiviso tra Landing e App)
export default function App() {
  return <AppInner />;
}

function AppInner() {
  const { user, logout } = useAuth();
  const isMobile = useMobile();
  const [authOpen,     setAuthOpen]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [adminOpen,    setAdminOpen]    = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);
  const [mobileTab,    setMobileTab]    = useState<MobileTab>('globe');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Rileva redirect post-conferma email (#type=signup o #type=recovery nel hash)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=signup')) {
      setToast('✓ Email confermata — benvenuto nel Viaggiatore nel Tempo!');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else if (hash.includes('type=recovery')) {
      setToast('✓ Puoi ora impostare la nuova password dal tuo profilo.');
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Slider e anno — dichiarati prima del chunk loading (currentEraKey li usa)
  const [sliderValue, setSliderValue] = useState(yearToSlider(-753));
  const [overrideYear, setOverrideYear] = useState<number | null>(null);

  // ── Chunk loading (Opzione C) ───────────────────────────────────────────────
  const chunkCacheRef = useRef<Map<EraKey, HistoricalEvent[]>>(new Map());
  const [loadedChunks, setLoadedChunks] = useState<Map<EraKey, HistoricalEvent[]>>(new Map());

  const currentEraKey = useMemo(() => {
    const yr = overrideYear !== null ? overrideYear : sliderToYear(sliderValue);
    return getEraKey(yr, yr < -4_500_000_000);
  }, [sliderValue, overrideYear]);

  useEffect(() => {
    if (chunkCacheRef.current.has(currentEraKey)) return;
    ERA_IMPORTS[currentEraKey]().then(mod => {
      const data = mod.default as HistoricalEvent[];
      chunkCacheRef.current.set(currentEraKey, data);
      setLoadedChunks(new Map(chunkCacheRef.current));
    });
  }, [currentEraKey]);

  // Pre-carica tutti gli altri chunk in background (priorità bassa)
  useEffect(() => {
    const remaining = ERA_KEYS.filter(k => !chunkCacheRef.current.has(k) && k !== currentEraKey);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    function loadNext() {
      if (i >= remaining.length) return;
      const key = remaining[i++];
      if (chunkCacheRef.current.has(key)) { loadNext(); return; }
      ERA_IMPORTS[key]().then(mod => {
        chunkCacheRef.current.set(key, mod.default as HistoricalEvent[]);
        setLoadedChunks(new Map(chunkCacheRef.current));
        timer = setTimeout(loadNext, 400);
      });
    }
    const start = setTimeout(loadNext, 3000);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Evento Wikidata (enrich API)
  const [wikidataEvents, setWikidataEvents] = useState<HistoricalEvent[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then((d: { events?: HistoricalEvent[] }) => {
        if (d.events && d.events.length > 0) {
          const allIds = new Set<string>();
          chunkCacheRef.current.forEach(chunk => chunk.forEach(e => allIds.add(e.id)));
          setWikidataEvents(d.events.filter(e => !allIds.has(e.id)));
        }
      })
      .catch(() => { /* API not available */ });
  }, []);

  // Tutti gli eventi statici = unione dei chunk caricati
  const staticEvents = useMemo(() => {
    const all: HistoricalEvent[] = [];
    loadedChunks.forEach(chunk => all.push(...chunk));
    return all;
  }, [loadedChunks]);

  const staticBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of staticEvents) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, [staticEvents]);

  const ALL_EVENTS = useMemo(() => [...staticEvents, ...wikidataEvents], [staticEvents, wikidataEvents]);

  // Index leggero (id, title, year, lat, lng…) per ricerca globale anche su era non caricate.
  // Caricato una sola volta all'avvio; chunk completi (con description) hanno precedenza.
  const [searchIndex, setSearchIndex] = useState<HistoricalEvent[]>([]);
  useEffect(() => {
    import('./data/chunks/events-index.json').then(mod => {
      const idx = (mod.default as Array<{
        id: string; title: string; year: number; category: EventCategory;
        tipo?: EntityType; lat?: number; lng?: number; isCosmic: boolean; wikipediaSlug: string;
      }>).map(e => ({ ...e, description: '' }));
      setSearchIndex(idx);
    }).catch(() => {});
  }, []);

  const ALL_SEARCHABLE = useMemo(() => {
    const loadedIds = new Set(ALL_EVENTS.map(e => e.id));
    const indexOnly = searchIndex.filter(e => !loadedIds.has(e.id));
    return [...ALL_EVENTS, ...indexOnly, MOON_SEARCH, SUN_SEARCH, ...PLANET_SEARCH_ITEMS, ...MOON_SEARCH_ITEMS];
  }, [ALL_EVENTS, searchIndex]);

  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [eraGuide,      setEraGuide]      = useState<EraLaunchData | null>(null);
  const [eraGuideOpen,  setEraGuideOpen]  = useState(false);
  const [mobileGlobeH, setMobileGlobeH] = useState(40); // vh
  const splitDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const [flyTo, setFlyTo]                 = useState<FlyTarget | null>(null);
  const [wikiMarker, setWikiMarker]       = useState<WikiMarker | null>(null);
  const [showTerritories, setShowTerritories] = useState(false);
  const [locale, setLocale]               = useState<Locale>('it');
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(['storia', 'arte', 'musica', 'scienza', 'geologia', 'cosmo', 'filosofia', 'sport'])
  );
  const [activeTipi, setActiveTipi] = useState<Set<EntityType>>(
    new Set(['persona', 'evento', 'movimento', 'organizzazione', 'opera', 'luogo', 'scoperta'] as EntityType[])
  );

  const currentYear  = overrideYear !== null ? overrideYear : sliderToYear(sliderValue);
  const isCosmicView = currentYear < -4_500_000_000;
  const timeWindow   = useMemo(() => getTimeWindow(currentYear), [currentYear]);

  const visibleEvents = useMemo(() =>
    ALL_EVENTS.filter(e =>
      activeCategories.has(e.category) &&
      e.year >= timeWindow.from &&
      e.year <= timeWindow.to &&
      e.isCosmic === isCosmicView &&
      (e.tipo == null || activeTipi.has(e.tipo))
    ),
    [ALL_EVENTS, timeWindow, activeCategories, activeTipi, isCosmicView]
  );

  const toggleCategory = useCallback((cat: EventCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  }, []);

  const toggleTipo = useCallback((tipo: EntityType) => {
    setActiveTipi(prev => {
      const next = new Set(prev);
      if (next.has(tipo)) { next.delete(tipo); } else { next.add(tipo); }
      return next;
    });
  }, []);

  // Ricerca: corpi celesti → flyTo 'body'; lune → flyTo verso il pianeta genitore; eventi storici → geo + slider
  const handleSearchSelect = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);

    if (event.id.startsWith('moon-')) {
      // Luna selezionata: vola verso il pianeta genitore
      const moonId = event.id.replace('moon-', '');
      const moon   = MOONS.find(m => m.id === moonId);
      if (moon) setFlyTo({ kind: 'body', entityId: `planet-${moon.parentPlanetId}`, ts: Date.now() });
      return;
    }

    if (BODY_IDS.has(event.id)) {
      setFlyTo({ kind: 'body', entityId: event.id, ts: Date.now() });
      return;
    }

    setWikiMarker(null);
    setOverrideYear(null); // resetta TimeMachine: currentEraKey deve seguire il nuovo slider
    setSliderValue(yearToSlider(event.year));

    // Force-load del chunk per l'era dell'evento: il pallino compare prima che arrivi la camera
    if (!event.isCosmic) {
      const eraKey = getEraKey(event.year, false);
      if (!chunkCacheRef.current.has(eraKey)) {
        ERA_IMPORTS[eraKey]().then(mod => {
          chunkCacheRef.current.set(eraKey, mod.default as HistoricalEvent[]);
          setLoadedChunks(new Map(chunkCacheRef.current));
        });
      }
    }

    if (!event.isCosmic && event.lat != null && event.lng != null) {
      setFlyTo({ kind: 'geo', lat: event.lat, lng: event.lng, ts: Date.now() });
    }
  }, []); // setter stabili, refs stabili, getEraKey e ERA_IMPORTS module-level

  // Transizione cosmo↔Terra gestita qui (non in GlobeView) per controllare
  // il primo mount e garantire che non parta alcuna animazione all'avvio
  const prevIsCosmicRef = useRef<boolean | null>(null);
  useEffect(() => {
    const prev = prevIsCosmicRef.current;
    prevIsCosmicRef.current = isCosmicView;
    if (prev === null || prev === isCosmicView) return; // mount iniziale o StrictMode
    setFlyTo({ kind: isCosmicView ? 'cosmic' : 'earth', ts: Date.now() });
  }, [isCosmicView]);

  const onSplitDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    splitDragRef.current = { startY, startH: mobileGlobeH };

    function move(ev: TouchEvent | MouseEvent) {
      if (!splitDragRef.current) return;
      const cy = 'touches' in ev ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      const deltaVh = ((cy - splitDragRef.current.startY) / window.innerHeight) * 100;
      setMobileGlobeH(Math.max(15, Math.min(70, splitDragRef.current.startH + deltaVh)));
    }
    function up() {
      splitDragRef.current = null;
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }
    document.addEventListener('touchmove', move, { passive: true });
    document.addEventListener('touchend', up);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }, [mobileGlobeH]);

  // Click diretto su un'entità nel globo (La telecamera si muove già dentro GlobeView)
  const handleEventClick = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);
    // I corpi celesti gestiscono il flyTo internamente in GlobeView — non innescare qui
    if (!event.isCosmic && event.lat != null && event.lng != null) {
      setFlyTo({ kind: 'geo', lat: event.lat, lng: event.lng, ts: Date.now() });
    }
  }, []);

  // Click su badge era/sottocategoria → apre Wikipedia dell'era nell'InfoPanel
  const handleEraClick = useCallback((slug: string, label: string) => {
    setSelectedEvent({
      id: `era-${slug}`,
      title: label,
      year: 0,
      category: 'storia',
      description: '',
      wikipediaSlug: slug,
      isCosmic: false,
    });
  }, []);

  // Selezione epoca/sottocategoria dalla SearchBar: salta slider all'inizio dell'epoca e vola al luogo d'origine
  const handleEpochSearchSelect = useCallback((period: Period) => {
    setSelectedEvent(null);
    setWikiMarker(null);
    setSliderValue(yearToSlider(period.start));
    setOverrideYear(null);
    if (period.originLat != null && period.originLng != null) {
      setFlyTo({ kind: 'geo', lat: period.originLat, lng: period.originLng, ts: Date.now(), range: 2_000_000 });
    }
  }, []);

  // Selezione risultato Wikipedia: apre InfoPanel subito, poi arricchisce con Wikidata async
  const handleWikiSelect = useCallback(async (result: WikiSearchResult) => {
    const lang = locale === 'it' ? 'it' : 'en';

    // Apri subito l'InfoPanel con i dati che abbiamo — Wikipedia inizia a caricare
    const placeholder: HistoricalEvent = {
      id: `wiki-${result.slug}`,
      title: result.title,
      year: currentYear,
      category: 'storia',
      description: result.snippet,
      wikipediaSlug: result.slug,
      isCosmic: false,
    };
    setSelectedEvent(placeholder);

    // Fetch Wikidata per data + coordinate + categoria
    try {
      const params = new URLSearchParams({
        action: 'wbgetentities', sites: `${lang}wiki`,
        titles: result.title, format: 'json',
        props: 'claims', origin: '*',
      });
      const res = await fetch(`https://www.wikidata.org/w/api.php?${params}`);
      if (!res.ok) return;
      const data = await res.json() as {
        entities?: Record<string, {
          missing?: string;
          claims?: Record<string, Array<{ mainsnak: { datavalue?: { value: unknown } } }>>;
        }>;
      };

      const entity = Object.values(data.entities ?? {})[0];
      if (!entity || 'missing' in entity || !entity.claims) return;
      const claims = entity.claims;

      const getQid = (prop: string): string => {
        const v = claims[prop]?.[0]?.mainsnak?.datavalue?.value;
        return v && typeof v === 'object' ? (v as { id?: string }).id ?? '' : '';
      };

      // Anno: prova P569 (nascita), P571 (fondazione), P580 (inizio), P585 (data), P570 (morte)
      let year: number | undefined;
      for (const prop of ['P569', 'P571', 'P580', 'P585', 'P570']) {
        const v = claims[prop]?.[0]?.mainsnak?.datavalue?.value;
        if (v && typeof v === 'object') {
          const tv = v as { time?: string };
          if (tv.time) {
            const isNeg  = tv.time.startsWith('-');
            const yStr   = tv.time.replace(/^[+-]/, '').split('-')[0];
            const y      = parseInt(yStr, 10);
            if (!isNaN(y)) { year = isNeg ? -y : y; break; }
          }
        }
      }

      // Coordinate: prima P625 diretto, poi risolvi luogo indiretto (P19/P20/P740/P159)
      let lat: number | undefined, lng: number | undefined;

      function extractCoords(value: unknown): { lat: number; lng: number } | null {
        if (!value || typeof value !== 'object') return null;
        const c = value as { latitude?: number; longitude?: number; globe?: string };
        if (c.globe === 'http://www.wikidata.org/entity/Q2' && typeof c.latitude === 'number')
          return { lat: c.latitude, lng: c.longitude as number };
        return null;
      }

      const directCoords = extractCoords(claims['P625']?.[0]?.mainsnak?.datavalue?.value);
      if (directCoords) {
        lat = directCoords.lat; lng = directCoords.lng;
      } else {
        // Persone: P19 = luogo di nascita. Luoghi/org: P740, P159. Fallback: P20 (morte)
        for (const prop of ['P19', 'P740', 'P159', 'P20']) {
          const placeQid = getQid(prop);
          if (!placeQid) continue;
          try {
            const placeParams = new URLSearchParams({
              action: 'wbgetentities', ids: placeQid,
              format: 'json', props: 'claims', origin: '*',
            });
            const placeRes = await fetch(`https://www.wikidata.org/w/api.php?${placeParams}`);
            if (!placeRes.ok) continue;
            const placeData = await placeRes.json() as {
              entities?: Record<string, { claims?: Record<string, Array<{ mainsnak: { datavalue?: { value: unknown } } }>> }>;
            };
            const pc = extractCoords(placeData.entities?.[placeQid]?.claims?.['P625']?.[0]?.mainsnak?.datavalue?.value);
            if (pc) { lat = pc.lat; lng = pc.lng; break; }
          } catch { continue; }
        }
      }

      // Categoria: instance-of (P31) e occupation (P106)
      const instanceOf = getQid('P31');
      const occ        = getQid('P106');
      let category: EventCategory = 'storia';
      if (['Q207628', 'Q105543609'].includes(instanceOf) || ['Q36834', 'Q486748'].includes(occ))
        category = 'musica';
      else if (['Q3305213', 'Q838948', 'Q179700'].includes(instanceOf) || ['Q483501', 'Q1028181'].includes(occ))
        category = 'arte';
      else if (['Q757539', 'Q11190'].includes(instanceOf) || ['Q901', 'Q593644'].includes(occ))
        category = 'scienza';
      else if (['Q7944', 'Q7581056', 'Q8068', 'Q83296'].includes(instanceOf))
        category = 'geologia';

      const enriched: HistoricalEvent = { ...placeholder, year: year ?? placeholder.year, lat, lng, category };
      setSelectedEvent(enriched);

      if (year !== undefined) setSliderValue(yearToSlider(year));
      if (lat !== undefined && lng !== undefined) {
        setFlyTo({ kind: 'geo', lat, lng, ts: Date.now() });
        setWikiMarker({ lat, lng, title: result.title });
      } else {
        setWikiMarker(null);
      }

    } catch { /* placeholder rimane aperto con Wikipedia */ }
  }, [currentYear, locale]);

  // Su mobile, il tab "search" apre il modal full-screen
  const handleMobileTabChange = useCallback((tab: MobileTab) => {
    if (tab === 'search') {
      setMobileSearchOpen(true);
      setMobileTab('globe'); // mantieni il globo come tab attivo di base
    } else if (tab === 'profile') {
      if (user) setProfileOpen(true);
      else setAuthOpen(true);
    } else {
      setMobileTab(tab);
    }
  }, [user]);

  const globeAndControls = (
    <>
      <div className={`globe-container${selectedEvent && !isMobile ? ' has-panel' : ''}`}>
        <div
          className="globe-wrapper"
          style={selectedEvent && !isMobile ? { '--mobile-globe-h': `${mobileGlobeH}vh` } as React.CSSProperties : undefined}
        >
          <GlobeView
            events={visibleEvents}
            selectedEventId={selectedEvent?.id ?? null}
            isCosmicView={isCosmicView}
            flyTo={flyTo}
            wikiMarker={wikiMarker}
            currentYear={currentYear}
            showTerritories={showTerritories}
            locale={locale}
            onEventClick={(ev) => { handleEventClick(ev); if (isMobile) setMobileTab('globe'); }}
          />
          <TimeMachine
            locale={locale}
            events={visibleEvents}
            currentYear={currentYear}
            onNavigate={({ year, flyTo: ft }) => {
              if (year !== undefined) {
                setSliderValue(yearToSlider(year));
                setOverrideYear(year);
              }
              if (ft) setFlyTo(ft);
            }}
            onEraLaunched={(data) => {
              setEraGuide(data);
              setEraGuideOpen(true);
            }}
          />
          {!isMobile && eraGuide && eraGuideOpen && (
            <EraGuide
              data={eraGuide}
              events={ALL_SEARCHABLE}
              onClose={() => { setEraGuide(null); setEraGuideOpen(false); }}
              onNavigate={({ year, flyTo: ft }) => {
                if (year !== undefined) {
                  setSliderValue(yearToSlider(year));
                  setOverrideYear(year);
                }
                if (ft) setFlyTo(ft);
              }}
              onSelectEvent={handleEventClick}
            />
          )}
          <button
            className={`territory-toggle-btn${showTerritories ? ' active' : ''}`}
            onClick={() => setShowTerritories(v => !v)}
            title={locale === 'it' ? (showTerritories ? 'Nascondi mappe storiche' : 'Mostra mappe storiche') : (showTerritories ? 'Hide historical maps' : 'Show historical maps')}
          >
            {showTerritories ? '🌐 ON' : '🌐'}
          </button>
          <button
            className={`cosmic-toggle-btn${isCosmicView ? ' active' : ''}`}
            onClick={() => {
              if (isCosmicView) {
                setOverrideYear(null);
                setSliderValue(yearToSlider(0));
              } else {
                const cosmicYear = -9_000_000_000;
                setOverrideYear(cosmicYear);
                setSliderValue(yearToSlider(cosmicYear));
              }
            }}
            title={locale === 'it'
              ? (isCosmicView ? 'Ritorna alla Terra' : 'Esplora il cosmo')
              : (isCosmicView ? 'Return to Earth' : 'Explore the cosmos')
            }
          >
            {isCosmicView ? '🌍' : '🚀'}
          </button>
          <AdminPanel
            locale={locale}
            open={adminOpen}
            setOpen={setAdminOpen}
            staticCount={staticEvents.length}
            staticBreakdown={staticBreakdown}
            wikidataCount={wikidataEvents.length}
            onEventsRefreshed={(evs) => {
              const staticIds = new Set(staticEvents.map(e => e.id));
              setWikidataEvents((evs as HistoricalEvent[]).filter(e => !staticIds.has(e.id)));
            }}
          />
        </div>
        {selectedEvent && !isMobile && (
          <div
            className="mobile-split-handle"
            onTouchStart={onSplitDown}
            onMouseDown={onSplitDown}
          />
        )}
        {!isMobile && (
          <InfoPanel
            event={selectedEvent}
            locale={locale}
            onClose={() => setSelectedEvent(null)}
            onShowEraGuide={eraGuide ? () => setEraGuideOpen(true) : undefined}
            eraGuideName={eraGuide?.eraName}
            events={ALL_SEARCHABLE}
            onSelectEvent={handleEventClick}
          />
        )}
      </div>

      {/* Desktop: controls in basso */}
      {!isMobile && (
        <div className="controls">
          <TimeControls
            sliderValue={sliderValue}
            currentYear={currentYear}
            formatYear={formatYear}
            getEra={getEra}
            onSliderChange={(v) => { setSliderValue(v); setOverrideYear(null); }}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
            activeTipi={activeTipi}
            onToggleTipo={toggleTipo}
            onEraClick={handleEraClick}
          />
        </div>
      )}
    </>
  );

  return (
    <div className={`app${isMobile ? ' app--mobile' : ''}`}>

      {/* ── Header (solo desktop) ── */}
      {!isMobile && (
        <header className="header">
          <h1>🌍 <span>Viaggiatore</span> nel Tempo</h1>
          <SearchBar
            events={ALL_SEARCHABLE}
            onSelect={handleSearchSelect}
            onWikiSelect={handleWikiSelect}
            onEpochSelect={handleEpochSearchSelect}
            epochs={[...MACRO_ERAS, ...SUBCATEGORIES]}
            locale={locale}
          />
          <button
            className="locale-toggle-btn"
            onClick={() => setLocale(l => l === 'it' ? 'en' : 'it')}
            title={locale === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
          >
            {locale === 'it' ? '🇮🇹 IT' : '🇬🇧 EN'} ⇄
          </button>
          <div className="header-auth-wrap">
            <button
              className="auth-header-btn"
              onClick={() => user ? setUserMenuOpen(v => !v) : setAuthOpen(true)}
              title={user ? user.email : (locale === 'it' ? 'Accedi' : 'Sign in')}
            >
              {user ? '👤' : '🔑'}
            </button>
            {userMenuOpen && user && (
              <>
                <div className="user-menu-backdrop" onClick={() => setUserMenuOpen(false)} />
                <div className="user-menu">
                  <div className="user-menu__email">{user.email}</div>
                  {user.role === 'admin' && <div className="user-menu__role">ADMIN</div>}
                  <button className="user-menu__item" onClick={() => { setProfileOpen(true); setUserMenuOpen(false); }}>
                    {locale === 'it' ? '👤 Il mio profilo' : '👤 My profile'}
                  </button>
                  <button className="user-menu__logout" onClick={() => { logout(); setUserMenuOpen(false); }}>
                    {locale === 'it' ? '⏏ Esci dall\'account' : '⏏ Sign out'}
                  </button>
                </div>
              </>
            )}
          </div>
          {user?.role === 'admin' && (
            <button
              className="admin-header-btn"
              onClick={() => setAdminOpen(true)}
              title={locale === 'it' ? 'Pannello Amministratore' : 'Admin Panel'}
            >
              ⚙️
            </button>
          )}
        </header>
      )}

      {/* ── Mobile: mini header con logo + lingua ── */}
      {isMobile && (
        <header className="header header--mobile">
          <h1>🌍 <span>Viaggiatore</span> nel Tempo</h1>
          <button
            className="locale-toggle-btn"
            onClick={() => setLocale(l => l === 'it' ? 'en' : 'it')}
          >
            {locale === 'it' ? '🇮🇹' : '🇬🇧'}
          </button>
          {user?.role === 'admin' && (
            <button className="admin-header-btn" onClick={() => setAdminOpen(true)}>⚙️</button>
          )}
        </header>
      )}

      {/* ── Contenuto principale ── */}
      {isMobile ? (
        <>
          {/* Globe tab: sempre montato, visibile quando activeTab = globe */}
          <div className={`mobile-screen${mobileTab === 'globe' ? ' mobile-screen--active' : ''}`}>
            {globeAndControls}
          </div>

          {/* Timeline tab: slider + filtri full-screen */}
          <div className={`mobile-screen mobile-timeline-screen${mobileTab === 'timeline' ? ' mobile-screen--active' : ''}`}>
            <div className="controls controls--fullscreen">
              <TimeControls
                sliderValue={sliderValue}
                currentYear={currentYear}
                formatYear={formatYear}
                getEra={getEra}
                onSliderChange={(v) => { setSliderValue(v); setOverrideYear(null); }}
                activeCategories={activeCategories}
                onToggleCategory={toggleCategory}
                activeTipi={activeTipi}
                onToggleTipo={toggleTipo}
                onEraClick={handleEraClick}
              />
            </div>
          </div>

          {/* Bottom sheet InfoPanel su mobile */}
          {selectedEvent && (
            <div className="mobile-bottom-sheet">
              <div className="mobile-bottom-sheet__grip" />
              <InfoPanel event={selectedEvent} locale={locale} onClose={() => setSelectedEvent(null)} />
            </div>
          )}

          {/* Search modal full-screen */}
          {mobileSearchOpen && (
            <div className="mobile-search-modal">
              <div className="mobile-search-modal__header">
                <button className="mobile-search-modal__close" onClick={() => setMobileSearchOpen(false)}>✕</button>
              </div>
              <div className="mobile-search-modal__body">
                <SearchBar
                  events={ALL_SEARCHABLE}
                  onSelect={(ev) => { handleSearchSelect(ev); setMobileSearchOpen(false); }}
                  onWikiSelect={(r) => { handleWikiSelect(r); setMobileSearchOpen(false); }}
                  onEpochSelect={(p) => { handleEpochSearchSelect(p); setMobileSearchOpen(false); }}
                  epochs={[...MACRO_ERAS, ...SUBCATEGORIES]}
                  locale={locale}
                />
              </div>
            </div>
          )}

          {/* Bottom nav */}
          <MobileNav
            activeTab={mobileTab}
            onTabChange={handleMobileTabChange}
            hasEvent={!!selectedEvent}
            isLoggedIn={!!user}
            locale={locale}
          />
        </>
      ) : (
        globeAndControls
      )}

      {authOpen    && <AuthModal    locale={locale} onClose={() => setAuthOpen(false)} />}
      {profileOpen && <ProfileModal locale={locale} onClose={() => setProfileOpen(false)} />}

      {toast && (
        <div className="app-toast" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}
    </div>
  );
}
