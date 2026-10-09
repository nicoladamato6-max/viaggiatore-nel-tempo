import { useState, useRef, useEffect } from 'react';
import { type HistoricalEvent } from '../types';

interface Props {
  events: HistoricalEvent[];
  onSelect: (event: HistoricalEvent) => void;
}

export function SearchBar({ events, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? events.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(event: HistoricalEvent) {
    onSelect(event);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="search-bar" style={{ position: 'relative' }}>
      <input
        type="search"
        placeholder="Cerca eventi, persone…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />

      {open && results.length > 0 && (
        <div className="search-results">
          {results.map(event => (
            <div
              key={event.id}
              className="search-result-item"
              onClick={() => handleSelect(event)}
            >
              <span className="item-title">{event.title}</span>
              <span className="item-year">
                {event.year < 0 ? `${Math.abs(event.year)} a.C.` : `${event.year} d.C.`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
