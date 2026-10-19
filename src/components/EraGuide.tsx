import { useState } from 'react';
import { type FlyTarget, type EraLaunchData } from '../types';
import { parseYear } from './TimeMachine';
import './EraGuide.css';

interface Props {
  data: EraLaunchData | null;
  onClose: () => void;
  onNavigate: (params: { year?: number; flyTo?: FlyTarget }) => void;
}

export function EraGuide({ data, onClose, onNavigate }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (!data) return null;

  const it = data.locale === 'it';
  const { briefing, eraName, eraYear, originLat, originLng } = data;

  function handleTop5Click(itemText: string) {
    const parsedYear = parseYear(itemText) ?? eraYear;
    const flyTo: FlyTarget | undefined =
      originLat != null && originLng != null
        ? { kind: 'geo', lat: originLat, lng: originLng, ts: Date.now(), range: 1_800_000 }
        : undefined;
    onNavigate({ year: parsedYear, flyTo });
  }

  const collapseLabel = it ? 'Comprimi' : 'Collapse';
  const closeLabel    = it ? 'Chiudi guida era' : 'Close era guide';

  return (
    <div className={`era-guide${collapsed ? ' era-guide--collapsed' : ''}`}>

      {/* Header sempre visibile */}
      <div className="era-guide__header">
        {collapsed ? (
          <>
            <button
              className="era-guide__expand-btn"
              onClick={() => setCollapsed(false)}
              title={it ? 'Espandi guida' : 'Expand guide'}
            >
              ›
            </button>
            <span className="era-guide__name-rotated">{eraName}</span>
          </>
        ) : (
          <>
            <div className="era-guide__title-row">
              <span className="era-guide__label">ERA GUIDE</span>
              <span className="era-guide__era-name">{eraName}</span>
            </div>
            <div className="era-guide__header-btns">
              <button
                className="era-guide__icon-btn"
                onClick={() => setCollapsed(true)}
                title={collapseLabel}
              >
                ‹
              </button>
              <button
                className="era-guide__icon-btn"
                onClick={onClose}
                title={closeLabel}
              >
                ✕
              </button>
            </div>
          </>
        )}
      </div>

      {/* Body scrollabile */}
      <div className="era-guide__body">

        {/* Dove sei */}
        <div className="era-guide__section">
          <div className="era-guide__section-label">
            {it ? "L'epoca in cui sei" : 'The era you\'re in'}
          </div>
          <p className="era-guide__dove">{briefing.dove}</p>
        </div>

        <div className="era-guide__divider" />

        {/* Top5 */}
        <div className="era-guide__section">
          <div className="era-guide__section-label">
            {it ? '5 cose da non perdere' : '5 things to experience'}
          </div>
          <ol className="era-guide__top5">
            {briefing.top5.map((item, i) => (
              <li key={i}>
                <button
                  className="era-guide__top5-btn"
                  onClick={() => handleTop5Click(item)}
                  title={it ? 'Naviga a questo momento' : 'Navigate to this moment'}
                >
                  <span className="era-guide__top5-arrow">→</span>
                  <span>{item}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="era-guide__divider" />

        {/* Connessioni */}
        <div className="era-guide__section">
          <div className="era-guide__section-label">
            {it ? 'Connessioni sorprendenti' : 'Surprising connections'}
          </div>
          <p className="era-guide__connessioni">{briefing.connessioni}</p>
        </div>

      </div>

      <div className="era-guide__footer">
        {it ? 'ERA GUIDE — VIAGGIATORE NEL TEMPO' : 'ERA GUIDE — TIME TRAVELER'}
      </div>
    </div>
  );
}
