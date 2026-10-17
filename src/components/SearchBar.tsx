import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { type HistoricalEvent, type WikiSearchResult } from '../types';
import { type Period } from '../data/historicalPeriods';
import { supabase } from '../lib/supabase';

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
  onWikiSelect: (result: WikiSearchResult) => void;
  onEpochSelect?: (period: Period) => void;
  epochs?: Period[];
  locale?: string;
}

function formatPeriodYear(year: number): string {
  if (Math.abs(year) >= 1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} mld ${year < 0 ? 'a.C.' : 'd.C.'}`;
  if (Math.abs(year) >= 1_000_000)     return `${(Math.abs(year) / 1_000_000).toFixed(0)} mln ${year < 0 ? 'a.C.' : 'd.C.'}`;
  if (year < 0) return `${Math.abs(year).toLocaleString()} a.C.`;
  return `${year} d.C.`;
}

async function searchWikipedia(q: string, lang: string): Promise<WikiSearchResult[]> {
  const params = new URLSearchParams({
    action: 'query', list: 'search', srsearch: q,
    format: 'json', origin: '*', srlimit: '6', srprop: 'snippet',
  });
  const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) return [];
  const data = await res.json() as {
    query?: { search?: Array<{ pageid: number; title: string; snippet: string }> };
  };
  return (data.query?.search ?? []).map(r => ({
    pageid: r.pageid,
    title: r.title,
    slug: r.title.replace(/\s+/g, '_'),
    snippet: r.snippet.replace(/<[^>]+>/g, '').slice(0, 90),
  }));
}

// Rimuove punteggiatura terminale inserita dall'STT ("Dante Alighieri." → "Dante Alighieri")
function normalizeQuery(raw: string): string {
  return raw.trim().replace(/[.,;:!?。，]+$/, '').trim();
}

function queryWords(q: string): string[] {
  return q.split(/\s+/).filter(w => w.length >= 2);
}

function allWordsIn(words: string[], text: string): boolean {
  return words.every(w => text.includes(w));
}

export function SearchBar({ events, onSelect, onWikiSelect, onEpochSelect, epochs = [], locale = 'it' }: Props) {
  const [query,       setQuery]       = useState('');
  const [open,        setOpen]        = useState(false);
  const [listening,   setListening]   = useState(false);
  const [wikiResults, setWikiResults] = useState<WikiSearchResult[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);
  const containerRef  = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wikiTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wikiAbortRef  = useRef<AbortController | null>(null);

  const lang = locale === 'it' ? 'it' : 'en';

  // Local results — instant, min 2 chars
  // Priorità: frase esatta > inizia con frase > contiene frase > tutte le parole nel titolo > parole nella descrizione
  const localResults = useMemo(() => {
    const norm = normalizeQuery(query);
    if (norm.length < 2) return [];
    const q = norm.toLowerCase();
    const words = queryWords(q);

    const rank = (title: string, desc: string): number => {
      if (title === q) return 0;
      if (title.startsWith(q)) return 1;
      if (title.includes(q)) return 2;
      if (allWordsIn(words, title)) return 3;
      if (desc && (desc.includes(q) || allWordsIn(words, desc))) return 4;
      return 5;
    };

    return events
      .filter(e => {
        const t = e.title.toLowerCase();
        const d = e.description?.toLowerCase() ?? '';
        return t.includes(q) || d.includes(q) || allWordsIn(words, t) || allWordsIn(words, d);
      })
      .sort((a, b) =>
        rank(a.title.toLowerCase(), a.description?.toLowerCase() ?? '') -
        rank(b.title.toLowerCase(), b.description?.toLowerCase() ?? '')
      )
      .slice(0, 7);
  }, [events, query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Epoch results — match on name, min 2 chars
  const epochResults = query.length >= 2
    ? epochs.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  // Wikipedia search — debounced 400ms, min 3 chars
  useEffect(() => {
    if (query.length < 3) {
      setWikiResults([]);
      setWikiLoading(false);
      return;
    }

    setWikiLoading(true);
    if (wikiTimerRef.current) clearTimeout(wikiTimerRef.current);
    wikiAbortRef.current?.abort();

    wikiTimerRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      wikiAbortRef.current = ctrl;
      try {
        const results = await searchWikipedia(query, lang);
        if (!ctrl.signal.aborted) {
          // Exclude items already in local results to avoid duplicates
          const localIds = new Set(localResults.map(e => e.title.toLowerCase()));
          setWikiResults(results.filter(r => !localIds.has(r.title.toLowerCase())));
        }
      } catch {
        if (!ctrl.signal.aborted) setWikiResults([]);
      } finally {
        if (!ctrl.signal.aborted) setWikiLoading(false);
      }
    }, 400);

    return () => {
      if (wikiTimerRef.current) clearTimeout(wikiTimerRef.current);
    };
  }, [query, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function logSearch(q: string, resultId: string | null, resultType: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    supabase.from('search_logs').insert({
      user_id: user.id, query: q, result_id: resultId, result_type: resultType,
    }).then(() => {});
  }

  function handleSelectLocal(event: HistoricalEvent) {
    logSearch(query || event.title, event.id, 'static');
    onSelect(event);
    setQuery('');
    setOpen(false);
    setWikiResults([]);
  }

  function handleSelectWiki(result: WikiSearchResult) {
    logSearch(query || result.title, String(result.pageid), 'wiki');
    onWikiSelect(result);
    setQuery('');
    setOpen(false);
    setWikiResults([]);
  }

  function handleSelectEpoch(period: Period) {
    onEpochSelect?.(period);
    setQuery('');
    setOpen(false);
    setWikiResults([]);
  }

  const startVoice = useCallback(() => {
    if (!SpeechRecognitionClass) return;
    if (listening) { recognitionRef.current?.stop(); return; }
    const rec = new SpeechRecognitionClass();
    rec.lang = locale === 'it' ? 'it-IT' : 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      setQuery(normalizeQuery(e.results[0][0].transcript));
      setOpen(true);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, locale]);

  const hasResults = localResults.length > 0 || epochResults.length > 0 || wikiResults.length > 0 || wikiLoading;

  return (
    <div ref={containerRef} className="search-bar" style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder={locale === 'it' ? 'Cerca eventi, personaggi, luoghi…' : 'Search events, people, places…'}
        value={query}
        onChange={e => {
          const normalized = normalizeQuery(e.target.value);
          e.target.value = normalized; // reset DOM diretto: evita che React salti il re-render
          setQuery(normalized);
          setOpen(true);
        }}
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

      {open && hasResults && (
        <div className="search-results">

          {/* ── Risultati locali ── */}
          {localResults.length > 0 && (
            <>
              <div className="search-results__section-header">
                📅 {locale === 'it' ? 'Nel dataset' : 'In dataset'}
              </div>
              {localResults.map(event => (
                <div
                  key={event.id}
                  className="search-result-item"
                  onClick={() => handleSelectLocal(event)}
                >
                  <span className="item-title">{event.title}</span>
                  <span className="item-year">
                    {event.year < 0
                      ? `${Math.abs(event.year).toLocaleString()} a.C.`
                      : `${event.year} d.C.`}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* ── Epoche storiche ── */}
          {epochResults.length > 0 && (
            <>
              <div className="search-results__section-header search-results__section-header--epoch">
                📅 {locale === 'it' ? 'Epoche storiche' : 'Historical epochs'}
              </div>
              {epochResults.map(period => (
                <div
                  key={period.name}
                  className="search-result-item search-result-item--epoch"
                  onClick={() => handleSelectEpoch(period)}
                >
                  <span className="item-title">{period.name}</span>
                  <span className="item-year" style={{ color: period.color }}>
                    {formatPeriodYear(period.start)} — {formatPeriodYear(period.end)}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* ── Risultati Wikipedia ── */}
          {(wikiResults.length > 0 || wikiLoading) && (
            <>
              <div className="search-results__section-header search-results__section-header--wiki">
                🌐 Wikipedia
                {wikiLoading && <span className="search-wiki-spinner" />}
              </div>
              {wikiResults.map(result => (
                <div
                  key={result.pageid}
                  className="search-result-item search-result-item--wiki"
                  onClick={() => handleSelectWiki(result)}
                >
                  <span className="item-title">{result.title}</span>
                  <span className="item-snippet">{result.snippet}</span>
                </div>
              ))}
            </>
          )}

        </div>
      )}
    </div>
  );
}
