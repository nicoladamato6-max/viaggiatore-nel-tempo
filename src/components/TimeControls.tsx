import { useState, useRef, useCallback, useMemo } from 'react';
import { type EventCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { getActivePeriods, getCurrentMacroEra, assignLanes, SUBCATEGORIES } from '../data/historicalPeriods';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

// Soglia storica: solo dopo -2.5M anni si mostrano sottocategorie
const HISTORICAL_THRESHOLD = -2_500_000;
// Gantt visibile solo per ere con span < 10.000 anni (Età Antica, Medioevo, Moderna, Contemporanea)
const GANTT_MAX_SPAN = 10_000;

interface Props {
  sliderValue: number;
  currentYear: number;
  formatYear: (year: number) => string;
  getEra: (year: number) => { label: string; color: string };
  onSliderChange: (value: number) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (cat: EventCategory) => void;
}

function formatYearShort(year: number): string {
  if (Math.abs(year) >= 1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} mld`;
  if (Math.abs(year) >= 1_000_000)     return `${(Math.abs(year) / 1_000_000).toFixed(0)} mln`;
  if (Math.abs(year) >= 1_000)         return `${(Math.abs(year) / 1_000).toFixed(0)}k`;
  if (year < 0)  return `${Math.abs(year)} a.C.`;
  if (year === 0) return 'anno 0';
  return `${year} d.C.`;
}

export function TimeControls({
  sliderValue, currentYear, formatYear, getEra,
  onSliderChange, activeCategories, onToggleCategory,
}: Props) {
  const era = getEra(currentYear);
  const [isDragging, setIsDragging] = useState(false);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHistorical = currentYear >= HISTORICAL_THRESHOLD;
  const activeSubs   = useMemo(() => getActivePeriods(currentYear), [currentYear]);
  const macroEra     = useMemo(() => isHistorical ? getCurrentMacroEra(currentYear) : null, [currentYear, isHistorical]);

  // Sottocategorie per il Gantt: overlap con l'era macro corrente
  const ganttPeriods = useMemo(() => {
    if (!macroEra) return [];
    return SUBCATEGORIES.filter(p => p.end > macroEra.start && p.start < macroEra.end);
  }, [macroEra]);

  const laneAssignment = useMemo(() => assignLanes(ganttPeriods), [ganttPeriods]);
  const numLanes = laneAssignment.length > 0 ? Math.max(...laneAssignment.map(x => x.lane + 1)) : 1;

  const showGantt =
    isDragging &&
    isHistorical &&
    macroEra !== null &&
    (macroEra.end - macroEra.start) < GANTT_MAX_SPAN &&
    laneAssignment.length > 0;

  const handleDragStart = useCallback(() => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    fadeTimerRef.current = setTimeout(() => setIsDragging(false), 1500);
  }, []);

  return (
    <div className="time-slider">

      {/* Gantt — fluttua sopra i controlli mentre si trascina il cursore */}
      {showGantt && macroEra && (
        <div className="epoch-gantt">
          <div className="epoch-gantt__header">
            <span className="epoch-gantt__era-label" style={{ color: macroEra.color }}>
              {macroEra.name}
            </span>
            <span className="epoch-gantt__axis-ends">
              <span>{formatYearShort(macroEra.start)}</span>
              <span>{formatYearShort(macroEra.end)}</span>
            </span>
          </div>

          <div className="epoch-gantt__bars" style={{ height: numLanes * 18 + 4 }}>
            {laneAssignment.map(({ period: p, lane }) => {
              const span  = macroEra.end - macroEra.start;
              const left  = Math.max(0, (p.start - macroEra.start) / span) * 100;
              const right = Math.min(100, ((p.end - macroEra.start) / span) * 100);
              const width = Math.max(0.5, right - left);
              const isActive = currentYear >= p.start && currentYear <= p.end;
              return (
                <div
                  key={p.name}
                  className={`epoch-gantt__bar${isActive ? ' epoch-gantt__bar--active' : ''}`}
                  style={{
                    left:    `${left}%`,
                    width:   `${width}%`,
                    top:     `${lane * 18}px`,
                    background: p.color,
                    opacity: isActive ? 1 : 0.45,
                  }}
                  title={p.name}
                >
                  {p.name}
                </div>
              );
            })}
            {/* Linea cursore anno corrente */}
            <div
              className="epoch-gantt__cursor"
              style={{
                left: `${Math.max(0, Math.min(100, ((currentYear - macroEra.start) / (macroEra.end - macroEra.start)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Anno + badge era + tag sottocategorie */}
      <div className="time-label">
        <span>Big Bang</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span className="current-year">{formatYear(currentYear)}</span>
          <span className="era-badge" style={{ color: era.color, borderColor: `${era.color}50` }}>
            {era.label}
          </span>
          {activeSubs.length > 0 && (
            <div className="subera-tags">
              {activeSubs.slice(0, 3).map(p => (
                <span
                  key={p.name}
                  className="subera-tag"
                  style={{ color: p.color, borderColor: `${p.color}55` }}
                >
                  {p.name}
                </span>
              ))}
              {activeSubs.length > 3 && (
                <span className="subera-tag subera-tag--more">+{activeSubs.length - 3}</span>
              )}
            </div>
          )}
        </div>
        <span>Oggi</span>
      </div>

      {/* Track colorato + slider */}
      <div className="slider-track-wrap">
        <div className="slider-track-bg" />
        <input
          className="slider-input"
          type="range"
          min={0}
          max={1000}
          value={sliderValue}
          onChange={e => onSliderChange(Number(e.target.value))}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
        />
      </div>

      <div className="filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategories.has(cat) ? 'active' : ''}`}
            style={activeCategories.has(cat) ? { color: CATEGORY_COLORS[cat] } : {}}
            onClick={() => onToggleCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
    </div>
  );
}
