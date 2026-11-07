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
import { type Period, MACRO_ERAS, SUBCATEGORIES, assignLanes, getActivePeriods } from '../data/historicalPeriods';
import { SearchBar } from './SearchBar';
import './BridgeConsole.css';

// Estratto fuori dal componente per stabilità del tipo React (evita unmount/remount ad ogni render)
function CosmicBtn({ code, label, title: t, onDown, onUp }: {
  code: string; label: string; title?: string;
  onDown?: () => void; onUp?: () => void;
}) {
  const kdown = (c: string) => window.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true }));
  const kup   = (c: string) => window.dispatchEvent(new KeyboardEvent('keyup',   { code: c, bubbles: true }));
  return (
    <button
      className="bc__dpad-btn"
      title={t}
      onPointerDown={e => { e.preventDefault(); kdown(code); onDown?.(); }}
      onPointerUp={() => { kup(code); onUp?.(); }}
      onPointerLeave={() => { kup(code); onUp?.(); }}
    >
      {label}
    </button>
  );
}

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
  onDpad?: (dir: 'n' | 's' | 'e' | 'w' | 'in' | 'out') => void;
  yearToSlider: (year: number) => number;
  onThrustStart?: () => void;
  onThrustEnd?: () => void;
  showHoloOverlays?: boolean;
  onToggleHoloOverlays?: () => void;
  onHyperDpad?: (dir: 'in' | 'out') => void;
  timeMachineOpen?: boolean;
  onToggleTimeMachine?: () => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];
const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS) as EntityType[];

// Era overlay computed from MACRO_ERAS + SUBCATEGORIES via yearToSlider (passed as prop)

export function BridgeConsole({
  sliderValue, onSliderChange,
  currentYear, formatYear, getEra,
  activeCategories, onToggleCategory,
  activeTipi, onToggleTipo,
  cesiumAltKm, events,
  onSearch, onWikiSelect, onEpochSelect, locale,
  aiPanelOpen, onToggleAIPanel,
  onLocaleToggle, user, onAuthClick,
  showTerritories, onToggleTerritories,
  onDpad, yearToSlider,
  isCosmicView,
  onThrustStart, onThrustEnd,
  showHoloOverlays, onToggleHoloOverlays,
  onHyperDpad,
  timeMachineOpen, onToggleTimeMachine,
}: Props) {
  const [open, setOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [sliderDragging, setSliderDragging] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const bcRef = useRef<HTMLDivElement>(null);

  const era = getEra(currentYear);

  useEffect(() => {
    const el = bcRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--console-h', `${el.getBoundingClientRect().height}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const altDisplay = cesiumAltKm > 0
    ? `${Math.round(cesiumAltKm).toLocaleString('it')} km`
    : '—';

  const activePeriods = useMemo(() => getActivePeriods(currentYear), [currentYear]);

  return (
    <div ref={bcRef} className={`bc${open ? '' : ' bc--closed'}`}>

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
        {activePeriods.length > 0 && (
          <>
            <span className="bc__sep">|</span>
            {activePeriods.map((p, i) => (
              <span key={p.name} className="bc__sbar-subera">
                {i > 0 && <span className="bc__sep bc__sep--dot">·</span>}
                <span style={{ color: p.color }}>{p.name}</span>
              </span>
            ))}
          </>
        )}
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

          {/* Macchina del Tempo — pulsante console */}
          {onToggleTimeMachine && (
            <button
              className={`bc__fn-btn bc__fn-btn--tm${timeMachineOpen ? ' bc__fn-btn--on' : ''}`}
              onClick={onToggleTimeMachine}
              title={locale === 'it' ? 'Macchina del Tempo' : 'Time Machine'}
            >
              <span className="bc__fn-ico bc__fn-ico--tm">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* cerchio esterno — outline luminosa, nessun riempimento */}
                  <circle cx="10" cy="10" r="8.5" stroke="rgba(0,220,190,0.9)" strokeWidth="1.2"/>
                  {/* anello orbitale inclinato */}
                  <ellipse cx="10" cy="10" rx="8.5" ry="3" stroke="rgba(0,220,190,0.45)" strokeWidth="0.8" transform="rotate(-30 10 10)"/>
                  {/* lancetta ore */}
                  <line x1="10" y1="10" x2="10" y2="4.5" stroke="rgba(0,220,190,0.95)" strokeWidth="1.4" strokeLinecap="round"/>
                  {/* lancetta minuti */}
                  <line x1="10" y1="10" x2="13.8" y2="12.2" stroke="rgba(0,220,190,0.75)" strokeWidth="1" strokeLinecap="round"/>
                  {/* punto centrale */}
                  <circle cx="10" cy="10" r="1" fill="rgba(0,220,190,0.9)"/>
                </svg>
              </span>
              <span className="bc__fn-tm-label">MACCHINA<br/>DEL TEMPO</span>
            </button>
          )}

          {/* Search — full SearchBar con dataset + Wikipedia + epoche + voce */}
          <div className="bc__search-wrap">
            <SearchBar
              events={events}
              onSelect={onSearch}
              onWikiSelect={onWikiSelect ?? (() => {})}
              onEpochSelect={onEpochSelect}
              epochs={SUBCATEGORIES}
              locale={locale}
            />
          </div>

          {/* D-pad navigation — cosmic: keyboard events hold-to-press; earth: onDpad click */}
          {onDpad && (
            <div className="bc__dpad">
              {/* Direction grid (3×3) */}
              <div className="bc__dpad-dir">
                <div className="bc__dpad-row">
                  {isCosmicView
                    ? <CosmicBtn code="KeyQ" label="▲" title="Ruota su" />
                    : <button className="bc__dpad-btn" onClick={() => onDpad('n')} title="Nord">▲</button>}
                </div>
                <div className="bc__dpad-row bc__dpad-row--mid">
                  {isCosmicView
                    ? <CosmicBtn code="KeyA" label="◀" title="Ruota sinistra" />
                    : <button className="bc__dpad-btn" onClick={() => onDpad('w')} title="Ovest">◀</button>}
                  <div className="bc__dpad-center" />
                  {isCosmicView
                    ? <CosmicBtn code="KeyD" label="▶" title="Ruota destra" />
                    : <button className="bc__dpad-btn" onClick={() => onDpad('e')} title="Est">▶</button>}
                </div>
                <div className="bc__dpad-row">
                  {isCosmicView
                    ? <CosmicBtn code="KeyE" label="▼" title="Ruota giù" />
                    : <button className="bc__dpad-btn" onClick={() => onDpad('s')} title="Sud">▼</button>}
                </div>
              </div>
              {/* Thrust — due colonne affiancate: normale | iper */}
              <div className="bc__dpad-thrust">
                {/* colonna sinistra: normale */}
                <div className="bc__dpad-thrust-col">
                  {isCosmicView ? (
                    <>
                      <CosmicBtn code="KeyW" label="⬆" title="Accelera (W)"
                        onDown={onThrustStart} onUp={onThrustEnd} />
                      <CosmicBtn code="Space" label="⏹" title="Stop" />
                      <CosmicBtn code="KeyS" label="⬇" title="Decelera (S)" />
                    </>
                  ) : (
                    <>
                      <button className="bc__dpad-btn" title="Zoom in"
                        onClick={() => { onDpad?.('in'); onThrustStart?.(); setTimeout(() => onThrustEnd?.(), 400); }}>⬆</button>
                      <button className="bc__dpad-btn" title="Stop">⏹</button>
                      <button className="bc__dpad-btn" title="Zoom out"
                        onClick={() => onDpad?.('out')}>⬇</button>
                    </>
                  )}
                </div>
                {/* colonna destra: iper (allineata a ⬆ e ⬇, vuota al centro) */}
                <div className="bc__dpad-thrust-col">
                  {isCosmicView ? (
                    <>
                      <CosmicBtn code="HyperFwd"  label="⚡⬆" title="Iper-accelera 100× (Shift+W)"
                        onDown={onThrustStart} onUp={onThrustEnd} />
                      <div className="bc__dpad-thrust-empty" />
                      <CosmicBtn code="HyperBack" label="⚡⬇" title="Iper-decelera 100× (Shift+S)" />
                    </>
                  ) : (
                    <>
                      <button className="bc__dpad-btn bc__dpad-btn--wide" title="Iper-zoom in (4×)"
                        onClick={() => onHyperDpad?.('in')}>⚡⬆</button>
                      <div className="bc__dpad-thrust-empty" />
                      <button className="bc__dpad-btn bc__dpad-btn--wide" title="Iper-zoom out (4×)"
                        onClick={() => onHyperDpad?.('out')}>⚡⬇</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

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

          {/* HUD — toggle ologrammi */}
          {onToggleHoloOverlays && (
            <button
              className={`bc__fn-btn${showHoloOverlays ? ' bc__fn-btn--on' : ''}`}
              onClick={onToggleHoloOverlays}
              title={showHoloOverlays ? 'Nascondi ologrammi HUD' : 'Mostra ologrammi HUD'}
            >
              <span className="bc__fn-ico">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3.5"/>
                  <line x1="12" y1="2" x2="12" y2="7"/>
                  <line x1="12" y1="17" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="7" y2="12"/>
                  <line x1="17" y1="12" x2="22" y2="12"/>
                  <path d="M6 6 L4 4"/><path d="M18 6 L20 4"/>
                  <path d="M18 18 L20 20"/><path d="M6 18 L4 20"/>
                </svg>
              </span>
              <span className="bc__fn-lbl">HUD</span>
            </button>
          )}

        </div>{/* /Row 1 */}

        {/* Row 2 */}
        <div className="bc__row bc__row--slider">

          {/* Slider */}
          <div className="bc__slider-wrap">
            {/* Era overlay — visible while dragging */}
            {sliderDragging && (
              <div className="bc__era-overlay">
                {/* Row 1: Macro eras */}
                <div className="bc__era-macro-row">
                  {MACRO_ERAS.map(era => {
                    const fromS = Math.max(0, Math.min(1000, yearToSlider(era.start)));
                    const toS   = Math.max(0, Math.min(1000, yearToSlider(era.end)));
                    const active = sliderValue >= fromS && sliderValue < toS;
                    return (
                      <div
                        key={era.name}
                        className={`bc__era-seg${active ? ' bc__era-seg--active' : ''}`}
                        style={{ left: `${fromS / 10}%`, width: `${Math.max(0.5, (toS - fromS) / 10)}%`, '--seg-color': era.color } as React.CSSProperties}
                      >
                        <span className="bc__era-seg-lbl">{era.name}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Row 2: Sub-eras (swim lanes for overlaps) */}
                <div className="bc__era-sub-row">
                  {assignLanes(SUBCATEGORIES).map(({ period, lane }) => {
                    const fromS = Math.max(0, Math.min(1000, yearToSlider(period.start)));
                    const toS   = Math.max(0, Math.min(1000, yearToSlider(period.end)));
                    if (toS - fromS < 0.2) return null;
                    const active = sliderValue >= fromS && sliderValue < toS;
                    return (
                      <div
                        key={period.name}
                        className={`bc__sub-seg${active ? ' bc__sub-seg--active' : ''}`}
                        style={{ left: `${fromS / 10}%`, width: `${Math.max(0.5, (toS - fromS) / 10)}%`, top: `${lane * 13}px`, '--seg-color': period.color } as React.CSSProperties}
                      >
                        <span className="bc__sub-seg-lbl">{period.name}</span>
                      </div>
                    );
                  })}
                </div>
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
