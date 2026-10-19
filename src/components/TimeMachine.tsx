import { useState, useRef, useEffect } from 'react';
import { type FlyTarget, type Locale, type HistoricalEvent } from '../types';
import { MACRO_ERAS, SUBCATEGORIES, getCurrentMacroEra } from '../data/historicalPeriods';
import epochBriefingsData from '../data/epoch-briefings.json';

interface AiBriefing {
  dove: string;
  top5: string[];
  connessioni: string;
}

type EpochBriefings = Record<string, { it: AiBriefing; en: AiBriefing }>;

function getStaticBriefing(year: number, locale: Locale): AiBriefing | null {
  const briefings = epochBriefingsData as EpochBriefings;
  // Preferisci la sotto-epoca più specifica (span più corto) che copre l'anno
  const activeSubs = SUBCATEGORIES.filter(p => year >= p.start && year <= p.end && !!p.wikipediaSlug);
  if (activeSubs.length > 0) {
    const best = activeSubs.reduce((a, b) => (b.end - b.start) < (a.end - a.start) ? b : a);
    const entry = briefings[best.wikipediaSlug!];
    if (entry) return entry[locale] ?? entry['it'] ?? null;
  }
  // Fallback alla macro-era
  const era = getCurrentMacroEra(year);
  if (!era.wikipediaSlug) return null;
  const entry = briefings[era.wikipediaSlug];
  if (!entry) return null;
  return entry[locale] ?? entry['it'] ?? null;
}

// ── Parser date potenziato ────────────────────────────────────────────────────
const IT_MONTHS: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  gen: 1, feb: 2, mar: 3, apr: 4, mag: 5, giu: 6,
  lug: 7, ago: 8, set: 9, ott: 10, nov: 11, dic: 12,
};
const EN_MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};
const ALL_MONTHS = { ...IT_MONTHS, ...EN_MONTHS };

export function parseYear(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const lower = s.toLowerCase();

  // "anno X ..." → togli prefisso e riprova ricorsivamente
  const annoMatch = lower.match(/^(?:anno|year|l'anno|nell'anno)\s+(.+)/i);
  if (annoMatch) return parseYear(annoMatch[1]);

  // Grandi scale temporali: "65 milioni di anni fa", "3.8 miliardi"
  const mldMatch = lower.match(/(\d[\d.,]*)\s*miliard[io]/);
  if (mldMatch) return -Math.round(parseFloat(mldMatch[1].replace(',', '.')) * 1e9);

  const mlnMatch = lower.match(/(\d[\d.,]*)\s*milion[ei]/);
  if (mlnMatch) return -Math.round(parseFloat(mlnMatch[1].replace(',', '.')) * 1e6);

  const migMatch = lower.match(/(\d[\d.,]*)\s*mila?\s*anni\s*fa/);
  if (migMatch) return -Math.round(parseFloat(migMatch[1].replace(',', '.')) * 1e3);

  // Rilevamento a.C./d.C. (applica a tutti i casi seguenti)
  const isBC = /\b(a\.?\s*c\.?|ac\b|bc\b|a\.?\s*chr|avant|avanti\s*cristo)\b/i.test(lower);
  const isAD = /\b(d\.?\s*c\.?|dc\b|ad\b|d\.?\s*chr|dopo\s*cristo)\b/i.test(lower);

  // Data con mese testuale: "15 marzo 44 a.C.", "March 15 1776", "4 July 1776"
  for (const [monthName] of Object.entries(ALL_MONTHS)) {
    if (new RegExp(`\\b${monthName}\\b`, 'i').test(lower)) {
      // Estrai tutti i numeri e prendi quello più grande come anno
      const nums = (lower.match(/\d+/g) ?? []).map(Number).filter(n => n > 0);
      if (nums.length > 0) {
        const yearNum = Math.max(...nums);
        return isBC || (!isAD && yearNum <= 476 && nums.length === 1) ? -yearNum : yearNum;
      }
    }
  }

  // Formato DD/MM/YYYY o DD-MM-YYYY o DD.MM.YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](-?\d{1,9})\s*(a\.?c\.?|bc)?/i);
  if (dmyMatch) {
    const y = parseInt(dmyMatch[3]);
    const bc = isBC || !!dmyMatch[4];
    return bc ? -Math.abs(y) : y;
  }

  // Numero puro con era: "44 a.C.", "300 BC", "1492 d.C.", "44 a. C."
  const bcNum = s.match(/^(\d+)\s*(a\.?\s*c\.?|ac\b|bc\b)/i);
  if (bcNum) return -parseInt(bcNum[1]);

  const adNum = s.match(/^(\d+)\s*(d\.?\s*c\.?|dc\b|ad\b)/i);
  if (adNum) return parseInt(adNum[1]);

  // "circa 44 a.C.", "around 1776"
  const circaBc = s.match(/(?:circa|around|approx\.?|~)\s*(\d+)\s*(a\.?c\.?|bc)/i);
  if (circaBc) return -parseInt(circaBc[1]);

  const circaNum = s.match(/(?:circa|around|approx\.?|~)\s*(-?\d+)/i);
  if (circaNum) return parseInt(circaNum[1]);

  // Numero negativo puro: "-44"
  if (/^-\d+$/.test(s.trim())) return parseInt(s.trim());

  // Anno da 4 cifre: "1492"
  const fourDigit = s.match(/\b(\d{4})\b/);
  if (fourDigit) return parseInt(fourDigit[1]);

  // Numero puro qualunque: "44"
  if (/^\d+$/.test(s.trim())) return parseInt(s.trim());

  // Nomi di epoche e sottoepoche — es. "Rinascimento", "Guerra Fredda", "Grecia Classica"
  const stripEmoji = (t: string) => t.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
  const allPeriods = [...MACRO_ERAS, ...SUBCATEGORIES];
  for (const period of allPeriods) {
    const pName = stripEmoji(period.name).toLowerCase().replace(/\s+/g, ' ');
    if (lower === pName || lower.includes(pName) || pName.includes(lower)) {
      // Punto mediano dell'epoca; per ere cosmologiche usa l'inizio (più significativo)
      return Math.abs(period.start) >= 1_000_000
        ? period.start
        : Math.round((period.start + period.end) / 2);
    }
  }

  return null;
}

// ── Geocodifica Nominatim ─────────────────────────────────────────────────────
async function geocode(
  place: string,
  signal: AbortSignal,
): Promise<{ lat: number; lng: number; name: string } | null> {
  const params = new URLSearchParams({ q: place, format: 'json', limit: '1' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    signal,
    headers: { 'Accept-Language': 'it,en', 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    name: data[0].display_name,
  };
}

// ── Formattazione anno per display nella console ──────────────────────────────
function displayYear(year: number, it: boolean): string {
  const abs = Math.abs(year);
  if (abs >= 1e9)  return `${(abs / 1e9).toFixed(1)} ${it ? 'miliardi di anni fa' : 'billion years ago'}`;
  if (abs >= 1e6)  return `${(abs / 1e6).toFixed(0)} ${it ? 'milioni di anni fa' : 'million years ago'}`;
  if (abs >= 1000) return `${abs.toLocaleString('it')} ${year < 0 ? (it ? 'a.C.' : 'BC') : (it ? 'd.C.' : 'AD')}`;
  return `${abs} ${year < 0 ? (it ? 'a.C.' : 'BC') : (it ? 'd.C.' : 'AD')}`;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  locale: Locale;
  events: HistoricalEvent[];
  currentYear: number;
  onNavigate: (params: { year?: number; flyTo?: FlyTarget }) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
export function TimeMachine({ locale, events: _events, currentYear: _currentYear, onNavigate }: Props) {
  const [open,           setOpen]           = useState(false);
  const [yearText,       setYearText]       = useState('');
  const [place,          setPlace]          = useState('');
  const [log,            setLog]            = useState<string[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [launched,       setLaunched]       = useState(false);
  const [briefing,       setBriefing]       = useState<AiBriefing | null>(null);
  const [briefingError,  setBriefingError]  = useState<string | null>(null);
  const launchedYearRef = useRef<number | null>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const yearRef   = useRef<HTMLInputElement>(null);
  const it = locale === 'it';

  // Reset completo alla riapertura della console
  useEffect(() => {
    if (open) {
      setLaunched(false);
      setLog([]);
      setYearText('');
      setPlace('');
      setBriefing(null);
      setBriefingError(null);
      setTimeout(() => yearRef.current?.focus(), 50);
    }
  }, [open]);

  // Chiudi con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function addLog(msg: string) {
    setLog(prev => [...prev.slice(-6), msg]);
  }

  function handleReset() {
    setLaunched(false);
    setLog([]);
    setBriefing(null);
    setBriefingError(null);
    launchedYearRef.current = null;
    setTimeout(() => yearRef.current?.focus(), 50);
  }

  async function handleLaunch() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const year     = parseYear(yearText);
    const hasPlace = place.trim().length > 0;

    if (!year && !hasPlace) {
      addLog(it ? '⚠ ERRORE: nessun parametro di navigazione.' : '⚠ ERROR: no navigation parameters.');
      return;
    }

    setLoading(true);
    setLaunched(false);
    addLog(it ? '▸ Inizializzazione sequenza di salto temporale…' : '▸ Initializing temporal jump sequence…');

    let flyTo: FlyTarget | undefined;

    if (year !== null) {
      addLog(`▸ ${it ? 'Coordinate temporali' : 'Temporal coordinates'}: ${displayYear(year, it)}`);
    }

    if (hasPlace) {
      addLog(it ? '▸ Triangolazione coordinate spaziali…' : '▸ Triangulating spatial coordinates…');
      try {
        const geo = await geocode(place.trim(), ctrl.signal);
        if (geo) {
          // 20 000m = zoom livello 12-13, affidabile ovunque su MapTiler satellite free tier
          flyTo = { kind: 'geo', lat: geo.lat, lng: geo.lng, ts: Date.now(), range: 20_000 };
          const shortName = geo.name.split(',')[0];
          addLog(`▸ ${it ? 'Destinazione confermata' : 'Destination confirmed'}: ${shortName}`);
        } else {
          addLog(it ? '✗ Destinazione non rilevata nel database spaziale.' : '✗ Destination not found in spatial database.');
        }
      } catch {
        if (!ctrl.signal.aborted)
          addLog(it ? '✗ Errore di triangolazione.' : '✗ Triangulation error.');
      }
    }

    setLoading(false);

    if (year !== null || flyTo) {
      addLog(it ? '⚡ PROPULSIONE ATTIVATA — buon viaggio.' : '⚡ PROPULSION ACTIVATED — safe travels.');
      launchedYearRef.current = year;
      setLaunched(true);
      onNavigate({ year: year ?? undefined, flyTo });
      // Mostra subito il briefing pre-generato per la macro-era
      if (year !== null) {
        const staticBriefing = getStaticBriefing(year, locale);
        if (staticBriefing) setBriefing(staticBriefing);
      }
    }
  }

  return (
    <>
      {/* Pulsante flottante */}
      <button
        className="tm-trigger"
        onClick={() => setOpen(v => !v)}
        title={it ? 'Macchina del Tempo' : 'Time Machine'}
        aria-label="Time Machine"
      >
        <span className="tm-trigger__icon">🛸</span>
        <span className="tm-trigger__text">{it ? 'Macchina del Tempo' : 'Time Machine'}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div className="tm-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className={`tm-console${launched ? ' tm-console--launched' : ''}`}>

            {/* Header */}
            <div className="tm-header">
              <div className="tm-header__title">
                {it ? 'CONSOLE DI NAVIGAZIONE TEMPORALE' : 'TEMPORAL NAVIGATION CONSOLE'}
              </div>
              <button className="tm-close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="tm-header__subtitle">
              {it ? '— VIAGGIATORE NEL TEMPO v1.0 —' : '— TIME TRAVELER v1.0 —'}
            </div>

            {/* Scanlines overlay */}
            <div className="tm-scanlines" aria-hidden="true" />

            <div className="tm-body">
              {/* Anno */}
              <div className="tm-field">
                <label className="tm-label">
                  <span className="tm-label__prefix">▸</span>
                  {it ? 'COORDINATE TEMPORALI' : 'TEMPORAL COORDINATES'}
                </label>
                <input
                  ref={yearRef}
                  className="tm-input"
                  type="text"
                  placeholder={it ? 'es. 1492  ·  44 a.C.  ·  Rinascimento  ·  Guerra Fredda' : 'e.g. 1492  ·  44 BC  ·  Renaissance  ·  Cold War'}
                  value={yearText}
                  onChange={e => setYearText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLaunch()}
                  autoComplete="off"
                  spellCheck={false}
                />
                {yearText && (
                  <div className="tm-preview">
                    {(() => {
                      const y = parseYear(yearText);
                      return y !== null
                        ? `→ ${displayYear(y, it)}`
                        : (it ? '? formato non riconosciuto' : '? unrecognized format');
                    })()}
                  </div>
                )}
              </div>

              {/* Luogo */}
              <div className="tm-field">
                <label className="tm-label">
                  <span className="tm-label__prefix">▸</span>
                  {it ? 'SETTORE DI ATTERRAGGIO' : 'LANDING SECTOR'}
                </label>
                <input
                  className="tm-input"
                  type="text"
                  placeholder={it ? 'es. Roma, Atene, Cairo, New York…' : 'e.g. Rome, Athens, Cairo, New York…'}
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLaunch()}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Log di sistema */}
              {log.length > 0 && (
                <div className="tm-log" aria-live="polite">
                  {log.map((line, i) => (
                    <div key={i} className="tm-log__line">{line}</div>
                  ))}
                </div>
              )}

              {/* Pulsante lancio + atterraggio */}
              <div className={launched ? 'tm-launch-row' : undefined}>
                <button
                  className={`tm-launch${loading ? ' tm-launch--loading' : ''}${launched ? ' tm-launch--done' : ''}`}
                  onClick={launched ? handleReset : handleLaunch}
                  disabled={loading}
                >
                  {launched
                    ? (it ? '🔄 NUOVO SALTO TEMPORALE' : '🔄 NEW TEMPORAL JUMP')
                    : loading
                      ? (it ? '◌ CALIBRAZIONE…' : '◌ CALIBRATING…')
                      : (it ? '⚡ ATTIVA PROPULSIONE' : '⚡ ACTIVATE PROPULSION')}
                </button>
                {launched && (
                  <button className="tm-land" onClick={() => setOpen(false)}>
                    {it ? '▼ ATTERRAGGIO' : '▼ LAND'}
                  </button>
                )}
              </div>

              {briefingError && (
                <div className="tm-briefing-error">⚠ {briefingError}</div>
              )}

              {/* Briefing dell'epoca */}
              {briefing && (
                <div className="tm-briefing">
                  <div className="tm-briefing__section">
                    <div className="tm-briefing__label">
                      {it ? '▸ L\'EPOCA IN CUI SEI' : '▸ THE ERA YOU\'RE IN'}
                    </div>
                    <p className="tm-briefing__text">{briefing.dove}</p>
                  </div>
                  <div className="tm-briefing__section">
                    <div className="tm-briefing__label">
                      {it ? '▸ 5 COSE DA NON PERDERE' : '▸ 5 THINGS TO EXPERIENCE'}
                    </div>
                    <ol className="tm-briefing__list">
                      {(briefing.top5 ?? []).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="tm-briefing__section">
                    <div className="tm-briefing__label">
                      {it ? '▸ CONNESSIONI SORPRENDENTI' : '▸ SURPRISING CONNECTIONS'}
                    </div>
                    <p className="tm-briefing__text">{briefing.connessioni}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="tm-footer">
              {it
                ? 'SISTEMA QUANTISTICO STABILE  ·  PARADOSSI: 0  ·  ENERGIA: 100%'
                : 'QUANTUM SYSTEM STABLE  ·  PARADOXES: 0  ·  ENERGY: 100%'}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
