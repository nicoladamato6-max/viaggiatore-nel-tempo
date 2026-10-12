import { useState, useRef } from 'react';
import { type FlyTarget, type Locale } from '../types';

interface Props {
  locale: Locale;
  onNavigate: (params: { year?: number; flyTo?: FlyTarget }) => void;
}

/** Converte testo libero in anno numerico.
 *  Accetta: "1492", "44 a.C.", "44 aC", "-44", "1492 d.C.", "300 BC", "300 AD"
 */
function parseYear(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // Formato numerico puro (positivo o negativo)
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);

  // Abbrev. italiane/inglesi
  const bcMatch = s.match(/^(\d[\d.,]*)[\s_-]*(a\.?c\.?|ac|bc|a\.?chr)/i);
  if (bcMatch) return -Math.abs(parseFloat(bcMatch[1].replace(',', '.')));

  const adMatch = s.match(/^(\d[\d.,]*)[\s_-]*(d\.?c\.?|dc|ad|d\.?chr)/i);
  if (adMatch) return Math.abs(parseFloat(adMatch[1].replace(',', '.')));

  // Anno puro senza suffisso
  const numMatch = s.match(/^(\d{1,4})$/);
  if (numMatch) return parseInt(numMatch[1], 10);

  return null;
}

/** Geocodifica un luogo tramite Nominatim (OSM) — gratuito, senza API key */
async function geocode(place: string, signal: AbortSignal): Promise<{ lat: number; lng: number; name: string } | null> {
  const params = new URLSearchParams({ q: place, format: 'json', limit: '1' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    signal,
    headers: { 'Accept-Language': 'it,en', 'User-Agent': 'ViaggiatoreNelTempo/1.0' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
}

export function TimeMachine({ locale, onNavigate }: Props) {
  const [open,     setOpen]     = useState(false);
  const [yearText, setYearText] = useState('');
  const [place,    setPlace]    = useState('');
  const [status,   setStatus]   = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const it = locale === 'it';

  async function handleGo() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const year   = parseYear(yearText);
    const hasPlace = place.trim().length > 0;

    if (!year && !hasPlace) {
      setStatus(it ? 'Inserisci un anno o un luogo.' : 'Enter a year or place.');
      return;
    }

    setLoading(true);
    setStatus(null);

    let flyTo: FlyTarget | undefined;

    if (hasPlace) {
      try {
        const geo = await geocode(place.trim(), ctrl.signal);
        if (geo) {
          flyTo = { kind: 'geo', lat: geo.lat, lng: geo.lng, ts: Date.now() };
          setStatus(it ? `📍 ${geo.name.split(',')[0]}` : `📍 ${geo.name.split(',')[0]}`);
        } else {
          setStatus(it ? 'Luogo non trovato.' : 'Place not found.');
        }
      } catch {
        if (!ctrl.signal.aborted)
          setStatus(it ? 'Errore di geocodifica.' : 'Geocoding error.');
      }
    }

    if (year !== null) {
      const label = year < 0
        ? `${Math.abs(year).toLocaleString()} ${it ? 'a.C.' : 'BC'}`
        : `${year} ${it ? 'd.C.' : 'AD'}`;
      setStatus(prev => (prev ? `${prev} — ` : '') + `📅 ${label}`);
    }

    setLoading(false);
    onNavigate({ year: year ?? undefined, flyTo });
  }

  return (
    <div className={`time-machine${open ? ' time-machine--open' : ''}`}>
      <button
        className="time-machine__toggle"
        onClick={() => setOpen(v => !v)}
        title={it ? 'Macchina del Tempo' : 'Time Machine'}
      >
        ⏳
      </button>

      {open && (
        <div className="time-machine__panel">
          <div className="time-machine__title">
            {it ? '⏳ Macchina del Tempo' : '⏳ Time Machine'}
          </div>

          <label className="time-machine__label">
            {it ? 'Anno o Era' : 'Year or Era'}
          </label>
          <input
            className="time-machine__input"
            type="text"
            placeholder={it ? 'es. 44 a.C. oppure 1492' : 'e.g. 44 BC or 1492'}
            value={yearText}
            onChange={e => setYearText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
          />

          <label className="time-machine__label">
            {it ? 'Luogo' : 'Place'}
          </label>
          <input
            className="time-machine__input"
            type="text"
            placeholder={it ? 'es. Roma, Atene, Cairo…' : 'e.g. Rome, Athens, Cairo…'}
            value={place}
            onChange={e => setPlace(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
          />

          <button
            className="time-machine__go"
            onClick={handleGo}
            disabled={loading}
          >
            {loading
              ? (it ? 'Navigazione…' : 'Navigating…')
              : (it ? 'Viaggia ⏩' : 'Go ⏩')}
          </button>

          {status && <div className="time-machine__status">{status}</div>}
        </div>
      )}
    </div>
  );
}
