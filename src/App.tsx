import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import './App.css';
import { GlobeView } from './components/GlobeView';
import { InfoPanel } from './components/InfoPanel';
import { TimeControls } from './components/TimeControls';
import { SearchBar } from './components/SearchBar';
import eventsData from './data/events.json';
import { type HistoricalEvent, type EventCategory, type FlyTarget } from './types';
import { PLANETS, toPlanetSearchItem } from './utils/celestialMechanics';

const ALL_EVENTS = eventsData as HistoricalEvent[];

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

// ID dei corpi celesti (matchano gli ID entità CesiumJS)
const BODY_IDS = new Set(['luna', 'sole', ...PLANETS.map(p => `planet-${p.id}`)]);

// Tutto ciò che è cercabile nella SearchBar
const ALL_SEARCHABLE = [...ALL_EVENTS, MOON_SEARCH, SUN_SEARCH, ...PLANET_SEARCH_ITEMS];

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
  if (year < -300_000)       return { from: year - 1_500_000,   to: year + 1_500_000   };
  if (year < -10_000)        return { from: year - 10_000,      to: year + 10_000      };
  return { from: year - 100, to: year + 100 };
}

export function formatYear(year: number): string {
  if (year <= -13_700_000_000) return 'Big Bang — 13,8 mld a.C.';
  if (Math.abs(year) >= 1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} mld a.C.`;
  if (Math.abs(year) >= 1_000_000)     return `${(Math.abs(year) / 1_000_000).toFixed(0)} mln a.C.`;
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

export function getEra(year: number): { label: string; color: string } {
  if (year < -4_600_000_000) return { label: '🌌 Universo primordiale', color: '#1abc9c' };
  if (year < -541_000_000)   return { label: '🌍 Terra primordiale',    color: '#27ae60' };
  if (year < -252_000_000)   return { label: '🐟 Era Paleozoica',       color: '#2ecc71' };
  if (year < -66_000_000)    return { label: '🦕 Era Mesozoica',        color: '#f39c12' };
  if (year < -2_500_000)     return { label: '🦎 Era Cenozoica',        color: '#e67e22' };
  if (year < -3_500)         return { label: '🦴 Preistoria',           color: '#e74c3c' };
  if (year < 476)            return { label: '📜 Età Antica',           color: '#9b59b6' };
  if (year < 1492)           return { label: '🏰 Medioevo',             color: '#2980b9' };
  if (year < 1789)           return { label: '🎨 Età Moderna',          color: '#8e44ad' };
  return                            { label: '⚙️ Età Contemporanea',    color: '#a8c8ff' };
}

export default function App() {
  const [sliderValue, setSliderValue]     = useState(yearToSlider(-753));
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [mobileGlobeH, setMobileGlobeH] = useState(40); // vh
  const splitDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const [flyTo, setFlyTo]                 = useState<FlyTarget | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(['storia', 'arte', 'musica', 'scienza', 'geologia', 'cosmo'])
  );

  const currentYear  = sliderToYear(sliderValue);
  const isCosmicView = currentYear < -4_500_000_000;
  const timeWindow   = useMemo(() => getTimeWindow(currentYear), [currentYear]);

  const visibleEvents = useMemo(() =>
    ALL_EVENTS.filter(e =>
      activeCategories.has(e.category) &&
      e.year >= timeWindow.from &&
      e.year <= timeWindow.to &&
      e.isCosmic === isCosmicView
    ),
    [timeWindow, activeCategories, isCosmicView]
  );

  const toggleCategory = useCallback((cat: EventCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  }, []);

  // Ricerca: corpi celesti → flyTo 'body'; eventi storici → flyTo 'geo' + sposta slider
  const handleSearchSelect = useCallback((event: HistoricalEvent) => {
    setSelectedEvent(event);

    if (BODY_IDS.has(event.id)) {
      setFlyTo({ kind: 'body', entityId: event.id, ts: Date.now() });
      return;
    }

    setSliderValue(yearToSlider(event.year));
    if (!event.isCosmic && event.lat != null && event.lng != null) {
      setFlyTo({ kind: 'geo', lat: event.lat, lng: event.lng, ts: Date.now() });
    }
  }, []);

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

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 <span>Viaggiatore</span> nel Tempo</h1>
        <SearchBar events={ALL_SEARCHABLE} onSelect={handleSearchSelect} />
      </header>

      <div className={`globe-container${selectedEvent ? ' has-panel' : ''}`}>
        <div
          className="globe-wrapper"
          style={selectedEvent ? { '--mobile-globe-h': `${mobileGlobeH}vh` } as React.CSSProperties : undefined}
        >
          <GlobeView
            events={visibleEvents}
            isCosmicView={isCosmicView}
            flyTo={flyTo}
            onEventClick={handleEventClick}
          />
        </div>
        {selectedEvent && (
          <div
            className="mobile-split-handle"
            onTouchStart={onSplitDown}
            onMouseDown={onSplitDown}
          />
        )}
        <InfoPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>

      <div className="controls">
        <TimeControls
          sliderValue={sliderValue}
          currentYear={currentYear}
          formatYear={formatYear}
          getEra={getEra}
          onSliderChange={setSliderValue}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
        />
      </div>
    </div>
  );
}
