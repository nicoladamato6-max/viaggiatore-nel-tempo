import { useState, useRef, useEffect, useCallback } from 'react';
import { type HistoricalEvent } from '../types';

// Dichiarazione minima per SpeechRecognition (non ancora nei tipi standard TS)
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

const SpeechRecognitionClass =
  typeof window !== 'undefined'
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
    : undefined;

interface Props {
  events: HistoricalEvent[];
  onSelect: (event: HistoricalEvent) => void;
  locale?: string;
}

export function SearchBar({ events, onSelect, locale = 'it' }: Props) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [listening, setListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const results = query.length >= 2
    ? events.filter(e =>
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
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

  const startVoice = useCallback(() => {
    if (!SpeechRecognitionClass) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognitionClass();
    rec.lang = locale === 'it' ? 'it-IT' : 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setOpen(true);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, locale]);

  return (
    <div ref={containerRef} className="search-bar" style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={locale === 'it' ? 'Cerca eventi, personaggi, luoghi…' : 'Search events, people, places…'}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />

      {SpeechRecognitionClass && (
        <button
          className={`voice-btn${listening ? ' voice-btn--active' : ''}`}
          onClick={startVoice}
          title={listening
            ? (locale === 'it' ? 'Ferma ascolto' : 'Stop listening')
            : (locale === 'it' ? 'Cerca con la voce' : 'Voice search')}
          aria-label="Voice search"
        >
          {listening ? '⏹' : '🎤'}
        </button>
      )}

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
                {event.year < 0 ? `${Math.abs(event.year).toLocaleString()} a.C.` : `${event.year} d.C.`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
