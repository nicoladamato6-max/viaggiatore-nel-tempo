import { EventCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

interface Props {
  sliderValue: number;
  currentYear: number;
  formatYear: (year: number) => string;
  onSliderChange: (value: number) => void;
  activeCategories: Set<EventCategory>;
  onToggleCategory: (cat: EventCategory) => void;
}

export function TimeControls({
  sliderValue,
  currentYear,
  formatYear,
  onSliderChange,
  activeCategories,
  onToggleCategory,
}: Props) {
  return (
    <div className="time-slider">
      <div className="time-label">
        <span>Big Bang</span>
        <span className="current-year">{formatYear(currentYear)}</span>
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
