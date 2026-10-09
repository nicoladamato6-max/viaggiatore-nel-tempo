import { type EventCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

interface Props {
  sliderValue: number;
  currentYear: number;
  formatYear: (year: number) => string;
  getEra: (year: number) => { label: string; color: string };
  onSliderChange: (value: number) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (cat: EventCategory) => void;
}

export function TimeControls({
  sliderValue,
  currentYear,
  formatYear,
  getEra,
  onSliderChange,
  activeCategories,
  onToggleCategory,
}: Props) {
  const era = getEra(currentYear);

  return (
    <div className="time-slider">
      <div className="time-label">
        <span>Big Bang</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span className="current-year">{formatYear(currentYear)}</span>
          <span className="era-badge" style={{ color: era.color, borderColor: `${era.color}50` }}>
            {era.label}
          </span>
        </div>
        <span>Oggi</span>
      </div>

      <input
        className="slider-input"
        type="range"
        min={0}
        max={1000}
        value={sliderValue}
        onChange={e => onSliderChange(Number(e.target.value))}
      />

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
