import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  type HistoricalEvent,
  type EventCategory,
  type EntityType,
  type WikiSearchResult,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  ENTITY_TYPE_LABELS,
  ENTITY_TYPE_COLORS,
} from '../types';
import { type Period } from '../data/historicalPeriods';
import './BridgeConsole.css';

interface Props {
  sliderValue: number;
  onSliderChange: (v: number) => void;
  currentYear: number;
  formatYear: (y: number) => string;
  getEra: (y: number) => { label: string; color: string };
  activeCategories: Set<EventCategory>;
  onToggleCategory: (c: EventCategory) => void;
  activeTipi: Set<EntityType>;
  onToggleTipo: (t: EntityType) => void;
  cesiumAltKm: number;
  events: HistoricalEvent[];
  onSearch: (ev: HistoricalEvent) => void;
  onWikiSelect?: (r: WikiSearchResult) => void;
  onEpochSelect?: (p: Period) => void;
  locale: 'it' | 'en';
  isCosmicView: boolean;
  aiPanelOpen: boolean;
  onToggleAIPanel: () => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];
const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS) as EntityType[];

export function BridgeConsole({
  sliderValue, onSliderChange,
  currentYear, formatYear, getEra,
  activeCategories, onToggleCategory,
  activeTipi, onToggleTipo,
  cesiumAltKm, events,
  onSearch, locale,
  aiPanelOpen, onToggleAIPanel,
}: Props) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [dropResults, setDropResults] = useState<HistoricalEvent[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [audOn, setAudOn] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const catRef   = useRef<HTMLDivElement>(null);
  const typeRef  = useRef<HTMLDivElement>(null);

  const era = getEra(currentYear);

  // Filter events for inline search
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return events.filter(e => e.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query, events]);

  useEffect(() => { setDropResults(filtered); }, [filtered]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setQuery('');
        setDropResults([]);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const handleDpad = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    const step = dir === 'up' || dir === 'down' ? 100 : 25;
    const delta = dir === 'left' || dir === 'down' ? -step : step;
    onSliderChange(Math.max(0, Math.min(1000, sliderValue + delta)));
  }, [sliderValue, onSliderChange]);

  const altDisplay = cesiumAltKm > 0
    ? `${Math.round(cesiumAltKm).toLocaleString('it')} km`
    : '—';

  return (
    <div className={`bc${open ? '' : ' bc--closed'}`}>

      {/* ── Status bar ── */}
      <div className="bc__sbar">
        <span className="bc__led bc__led--ok" />
        <span className="bc__sbar-txt">SISTEMI NOMINALI</span>
        <span className="bc__sep">|</span>
        <span className="bc__sbar-lbl">ALT</span>
        <span className="bc__sbar-val">{altDisplay}</span>
        <span className="bc__sep">|</span>
        <span className="bc__sbar-lbl">ERA</span>
        <span className="bc__sbar-val" style={{ color: era.color }}>{era.label}</span>
      </div>

      {/* ── Toggle ── */}
      <button className="bc__toggle" onClick={() => setOpen(v => !v)}>
        BRIDGE CONSOLE {open ? '▼' : '▲'}
      </button>

      {/* ── Body ── */}
      <div className="bc__body">

        {/* Row 1 */}
        <div className="bc__row">

          {/* Era label */}
          <span className="bc__era-lbl" style={{ color: era.color }}>
            {formatYear(currentYear)}
          </span>

          {/* Search */}
          <div className="bc__si-wrap" ref={searchRef}>
            <input
              className="bc__si"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={locale === 'it' ? 'Cerca entità…' : 'Search entity…'}
              autoComplete="off"
              spellCheck={false}
            />
            {dropResults.length > 0 && (
              <div className="bc__si-drop">
                {dropResults.map(ev => (
                  <button
                    key={ev.id}
                    className="bc__si-item"
                    onClick={() => { onSearch(ev); setQuery(''); setDropResults([]); }}
                  >
                    <span
                      className="bc__si-dot"
                      style={{ background: CATEGORY_COLORS[ev.category] }}
                    />
                    <span className="bc__si-title">{ev.title}</span>
                    <span className="bc__si-year">{formatYear(ev.year)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* D-pad */}
          <div className="bc__dpad">
            <div className="bc__dpad-row bc__dpad-row--top">
              <button className="bc__dpad-btn" onClick={() => handleDpad('up')} title="Avanza">△</button>
            </div>
            <div className="bc__dpad-row bc__dpad-row--mid">
              <button className="bc__dpad-btn" onClick={() => handleDpad('left')} title="Indietro">◁</button>
              <div className="bc__dpad-center" />
              <button className="bc__dpad-btn" onClick={() => handleDpad('right')} title="Avanti">▷</button>
            </div>
            <div className="bc__dpad-row bc__dpad-row--bot">
              <button className="bc__dpad-btn" onClick={() => handleDpad('down')} title="Torna indietro">▽</button>
            </div>
          </div>

          {/* AUD */}
          <button
            className={`bc__fn-btn${audOn ? ' bc__fn-btn--on' : ''}`}
            onClick={() => setAudOn(v => !v)}
            title={locale === 'it' ? 'Audio' : 'Audio'}
          >
            <span className="bc__fn-ico">◉</span>
            <span className="bc__fn-lbl">AUD</span>
          </button>

          {/* AI */}
          <button
            className={`bc__fn-btn${aiPanelOpen ? ' bc__fn-btn--on' : ''}`}
            onClick={onToggleAIPanel}
            title="AI Assistant"
          >
            <span className="bc__fn-ico">⬡</span>
            <span className="bc__fn-lbl">AI</span>
          </button>

        </div>{/* /Row 1 */}

        {/* Row 2 */}
        <div className="bc__row bc__row--slider">

          {/* Slider */}
          <div className="bc__slider-wrap">
            <input
              className="bc__slider"
              type="range"
              min={0}
              max={1000}
              value={sliderValue}
              onChange={e => onSliderChange(Number(e.target.value))}
            />
            <div className="bc__slider-labels">
              <span>13.8 Mld a.C.</span>
              <span>OGGI</span>
            </div>
          </div>

          {/* Category filter */}
          <div className="bc__filter" ref={catRef}>
            <button
              className={`bc__filter-btn${catOpen ? ' bc__filter-btn--open' : ''}`}
              onClick={() => { setCatOpen(v => !v); setTypeOpen(false); }}
            >
              CAT {activeCategories.size < CATEGORIES.length ? `(${activeCategories.size})` : ''}▾
            </button>
            {catOpen && (
              <div className="bc__filter-drop">
                <div className="bc__filter-drop-label">DISCIPLINA</div>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`bc__filter-item${activeCategories.has(cat) ? ' bc__filter-item--on' : ''}`}
                    onClick={() => onToggleCategory(cat)}
                    style={{ '--item-color': CATEGORY_COLORS[cat] } as React.CSSProperties}
                  >
                    <span
                      className="bc__filter-dot"
                      style={{ background: CATEGORY_COLORS[cat] }}
                    />
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Entity type filter */}
          <div className="bc__filter" ref={typeRef}>
            <button
              className={`bc__filter-btn${typeOpen ? ' bc__filter-btn--open' : ''}`}
              onClick={() => { setTypeOpen(v => !v); setCatOpen(false); }}
            >
              TIPO {activeTipi.size < ENTITY_TYPES.length ? `(${activeTipi.size})` : ''}▾
            </button>
            {typeOpen && (
              <div className="bc__filter-drop">
                <div className="bc__filter-drop-label">ENTITÀ</div>
                {ENTITY_TYPES.map(tipo => (
                  <button
                    key={tipo}
                    className={`bc__filter-item${activeTipi.has(tipo) ? ' bc__filter-item--on' : ''}`}
                    onClick={() => onToggleTipo(tipo)}
                    style={{ '--item-color': ENTITY_TYPE_COLORS[tipo] } as React.CSSProperties}
                  >
                    <span
                      className="bc__filter-dot"
                      style={{ background: ENTITY_TYPE_COLORS[tipo] }}
                    />
                    {ENTITY_TYPE_LABELS[tipo].replace(/^[^\s]+\s/, '')}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>{/* /Row 2 */}

      </div>{/* /bc__body */}
    </div>
  );
}
