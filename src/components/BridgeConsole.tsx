import { useState, useRef, useEffect, useMemo } from 'react';
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
  onLocaleToggle: () => void;
  user: { email: string; role: string } | null;
  onAuthClick: () => void;
  showTerritories: boolean;
  onToggleTerritories: () => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];
const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS) as EntityType[];

// Era segments for the slider overlay — derived from BP breakpoints + getEra colors
const ERA_SEGMENTS = [
  { from: 0,   to: 100, label: '🌌 Universo',   color: '#1abc9c' },
  { from: 100, to: 250, label: '🌍 Terra',       color: '#27ae60' },
  { from: 250, to: 290, label: '🐟 Paleozoico',  color: '#2ecc71' },
  { from: 290, to: 330, label: '🦕 Mesozoico',   color: '#f39c12' },
  { from: 330, to: 400, label: '🦎 Cenozoico',   color: '#e67e22' },
  { from: 400, to: 560, label: '🦴 Preistoria',  color: '#e74c3c' },
  { from: 560, to: 640, label: '📜 Antica',      color: '#9b59b6' },
  { from: 640, to: 720, label: '🏰 Medioevo',    color: '#2980b9' },
  { from: 720, to: 800, label: '🎨 Moderna',     color: '#8e44ad' },
  { from: 800, to: 1000, label: '⚙️ Contemp.',   color: '#a8c8ff' },
];

export function BridgeConsole({
  sliderValue, onSliderChange,
  currentYear, formatYear, getEra,
  activeCategories, onToggleCategory,
  activeTipi, onToggleTipo,
  cesiumAltKm, events,
  onSearch, locale,
  aiPanelOpen, onToggleAIPanel,
  onLocaleToggle, user, onAuthClick,
  showTerritories, onToggleTerritories,
}: Props) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [dropResults, setDropResults] = useState<HistoricalEvent[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [sliderDragging, setSliderDragging] = useState(false);
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

          {/* AI — Assistente di viaggio AI */}
          <button
            className={`bc__fn-btn bc__fn-btn--ai${aiPanelOpen ? ' bc__fn-btn--on' : ''}`}
            onClick={onToggleAIPanel}
            title="Assistente di viaggio AI"
          >
            <span className="bc__fn-ico">⬡</span>
            <span className="bc__fn-ai-label">ASSISTENTE<br/>DI VIAGGIO AI</span>
          </button>

          {/* MAP — toggle territories */}
          <button
            className={`bc__fn-btn${showTerritories ? ' bc__fn-btn--on' : ''}`}
            onClick={onToggleTerritories}
            title={locale === 'it' ? 'Territori storici' : 'Historical territories'}
          >
            <span className="bc__fn-ico">🌐</span>
            <span className="bc__fn-lbl">MAP</span>
          </button>

          {/* LANG — toggle locale */}
          <button
            className="bc__fn-btn"
            onClick={onLocaleToggle}
            title={locale === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
          >
            <span className="bc__fn-ico">{locale === 'it' ? 'IT' : 'EN'}</span>
            <span className="bc__fn-lbl">LANG</span>
          </button>

          {/* ACC/LOG — auth */}
          <button
            className="bc__fn-btn"
            onClick={onAuthClick}
            title={user ? user.email : (locale === 'it' ? 'Accedi' : 'Login')}
          >
            <span className="bc__fn-ico">{user ? '●' : '○'}</span>
            <span className="bc__fn-lbl">{user ? 'ACC' : 'LOG'}</span>
          </button>

        </div>{/* /Row 1 */}

        {/* Row 2 */}
        <div className="bc__row bc__row--slider">

          {/* Slider */}
          <div className="bc__slider-wrap">
            {/* Era overlay — visible while dragging */}
            {sliderDragging && (
              <div className="bc__era-overlay">
                {ERA_SEGMENTS.map(seg => (
                  <div
                    key={seg.from}
                    className={`bc__era-seg${sliderValue >= seg.from && sliderValue < seg.to ? ' bc__era-seg--active' : ''}`}
                    style={{
                      left: `${seg.from / 10}%`,
                      width: `${(seg.to - seg.from) / 10}%`,
                      '--seg-color': seg.color,
                    } as React.CSSProperties}
                  >
                    <span className="bc__era-seg-lbl">{seg.label}</span>
                  </div>
                ))}
              </div>
            )}
            <input
              className="bc__slider"
              type="range"
              min={0}
              max={1000}
              value={sliderValue}
              style={{ '--val': sliderValue } as React.CSSProperties}
              onChange={e => onSliderChange(Number(e.target.value))}
              onMouseDown={() => setSliderDragging(true)}
              onMouseUp={() => setSliderDragging(false)}
              onTouchStart={() => setSliderDragging(true)}
              onTouchEnd={() => setSliderDragging(false)}
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
