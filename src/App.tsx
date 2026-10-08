import { useState, useCallback, useMemo } from 'react';
import './App.css';
import { GlobeView } from './components/GlobeView';
import { EventCard } from './components/EventCard';
import { TimeControls } from './components/TimeControls';
import { SearchBar } from './components/SearchBar';
import eventsData from './data/events.json';
import { HistoricalEvent, EventCategory } from './types';

const ALL_EVENTS = eventsData as HistoricalEvent[];

// Anno corrente in formato "display" (gestisce a.C.)
function formatYear(year: number): string {
  if (year < -13_000_000_000) return 'Inizio dell\'Universo';
  if (Math.abs(year) >= 1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} mld a.C.`;
  if (Math.abs(year) >= 1_000_000) return `${(Math.abs(year) / 1_000_000).toFixed(0)} mln a.C.`;
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

// Range slider: mappa posizione 0-1000 → anno reale (scala logaritmica inversa)
const MIN_YEAR = -13_800_000_000;
const MAX_YEAR = 2025;

function sliderToYear(value: number): number {
  const t = value / 1000;
  return Math.round(MIN_YEAR + (MAX_YEAR - MIN_YEAR) * Math.pow(t, 3));
}

function yearToSlider(year: number): number {
  const t = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
  return Math.round(Math.pow(t, 1 / 3) * 1000);
}

export default function App() {
  const [sliderValue, setSliderValue] = useState(() => yearToSlider(1500));
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<EventCategory>>(
    new Set(['storia', 'arte', 'musica', 'scienza', 'geologia', 'cosmo'])
  );

  const currentYear = sliderToYear(sliderValue);

  // Finestra temporale visibile: ±5% del range per gli anni recenti, proporzionale per quelli antichi
  const timeWindow = useMemo(() => {
    const span = Math.max(50, Math.abs(currentYear) * 0.05);
    return { from: currentYear - span, to: currentYear + span };
  }, [currentYear]);

  const visibleEvents = useMemo(() =>
    ALL_EVENTS.filter(e =>
      e.year >= timeWindow.from &&
      e.year <= timeWindow.to &&
      activeCategories.has(e.category)
    ),
    [timeWindow, activeCategories]
  );

  const toggleCategory = useCallback((cat: EventCategory) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
      return next;
    });
  }, []);

  const handleSearchSelect = useCallback((event: HistoricalEvent) => {
    setSliderValue(yearToSlider(event.year));
    setSelectedEvent(event);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 <span>Viaggiatore</span> nel Tempo</h1>
        <SearchBar events={ALL_EVENTS} onSelect={handleSearchSelect} />
      </header>

      <div className="globe-container">
        <GlobeView
          events={visibleEvents}
          currentYear={currentYear}
          onEventClick={setSelectedEvent}
        />

        {selectedEvent && (
          <EventCard
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>

      <div className="controls">
        <TimeControls
          sliderValue={sliderValue}
          currentYear={currentYear}
          formatYear={formatYear}
          onSliderChange={setSliderValue}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
        />
      </div>
    </div>
  );
}
