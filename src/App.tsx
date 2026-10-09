import { useState, useCallback, useMemo } from 'react';
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

// ── Scala piecewise: 38% dello slider = 5000 anni di storia scritta ──────────
const BP = [
  { s: 0,    y: -13_800_000_000 },  // Big Bang
  { s: 150,  y: -4_600_000_000 },   // Formazione Sistema Solare
  { s: 350,  y: -541_000_000 },     // Esplosione Cambriana
  { s: 450,  y: -66_000_000 },      // Fine dei dinosauri
  { s: 500,  y: -300_000 },         // Homo Sapiens
  { s: 560,  y: -10_000 },          // Prime civiltà
  { s: 620,  y: -3_000 },           // Storia scritta
  { s: 1000, y: 2025 },             // Oggi
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
  if (year < -4_500_000_000) return { label: '🌌 Universo primordiale', color: '#1abc9c' };
  if (year < -500_000_000)   return { label: '🌍 Terra preistorica',    color: '#27ae60' };
  if (year < -66_000_000)    return { label: '🦕 Era dei dinosauri',    color: '#f39c12' };
  if (year < -300_000)       return { label: '🦎 Era dei mammiferi',    color: '#e67e22' };
  if (year < -10_000)        return { label: '🦴 Preistoria umana',     color: '#e74c3c' };
  if (year < 0)              return { label: '📜 Antichità',            color: '#9b59b6' };
  if (year < 500)            return { label: '⚔️ Alto Medioevo',        color: '#3498db' };
  if (year < 1500)           return { label: '🏰 Basso Medioevo',       color: '#2980b9' };
  if (year < 1800)           return { label: '🎨 Età Moderna',          color: '#8e44ad' };
  return                            { label: '⚙️ Età Contemporanea',    color: '#a8c8ff' };
}

export default function App() {
  const [sliderValue, setSliderValue]     = useState(yearToSlider(1500));
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
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
        <div className="globe-wrapper">
          <GlobeView
            events={visibleEvents}
            isCosmicView={isCosmicView}
            flyTo={flyTo}
            onEventClick={handleEventClick}
          />
        </div>
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
