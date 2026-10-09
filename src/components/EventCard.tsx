import { type HistoricalEvent, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

interface Props {
  event: HistoricalEvent;
  onClose: () => void;
}

function formatYear(year: number): string {
  if (year < -1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} miliardi di anni fa`;
  if (year < -1_000_000) return `${(Math.abs(year) / 1_000_000).toFixed(0)} milioni di anni fa`;
  if (year < 0) return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

export function EventCard({ event, onClose }: Props) {
  const color = CATEGORY_COLORS[event.category];
  const wikiUrl = `https://it.wikipedia.org/wiki/${event.wikipediaSlug}`;

  return (
    <div className="event-card">
      <button className="close-btn" onClick={onClose} aria-label="Chiudi">×</button>

      <span
        className="category-badge"
        style={{ background: `${color}25`, color, borderColor: `${color}60`, border: '1px solid' }}
      >
        {CATEGORY_LABELS[event.category]}
      </span>

      <h2>{event.title}</h2>
      <div className="year-tag">{formatYear(event.year)}</div>

      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} loading="lazy" />
      )}

      <p>{event.description}</p>

      <a
        className="wiki-link"
        href={wikiUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        📖 Approfondisci su Wikipedia
      </a>
    </div>
  );
}
