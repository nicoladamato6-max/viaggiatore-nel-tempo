import { useMemo, useState } from 'react';
import { type FlyTarget, type EraLaunchData, type HistoricalEvent } from '../types';
import { parseYear } from './TimeMachine';
import './EraGuide.css';

const CAT_ICON: Record<string, string> = {
  storia:    '📜',
  arte:      '🎨',
  musica:    '🎵',
  scienza:   '🔭',
  filosofia: '🧠',
  geologia:  '⛰️',
  cosmo:     '🌌',
  sport:     '🏆',
};

interface Props {
  data: EraLaunchData | null;
  events: HistoricalEvent[];
  onClose: () => void;
  onNavigate: (params: { year?: number; flyTo?: FlyTarget }) => void;
  onSelectEvent?: (event: HistoricalEvent) => void;
}

/** Returns entity matches found in the text, sorted by position, deduplicated. */
function findEntityLinks(
  itemText: string,
  allEvents: HistoricalEvent[],
): Array<{ phrase: string; event: HistoricalEvent; pos: number }> {
  const textLower = itemText.toLowerCase();
  const found: Array<{ phrase: string; event: HistoricalEvent; pos: number }> = [];

  for (const ev of allEvents) {
    if (ev.isCosmic) continue;
    // Use base title only (strip em-dash suffix like "— Conquista dell'Asia")
    const baseTitle = ev.title.split(/\s*[—–]\s*/)[0].trim();
    if (baseTitle.length < 4) continue;

    const baseLower = baseTitle.toLowerCase();
    const idx = textLower.indexOf(baseLower);
    if (idx === -1) continue;

    // Word-boundary check: ensure match is not inside a longer word
    const charBefore = idx > 0 ? itemText[idx - 1] : null;
    const charAfter = idx + baseTitle.length < itemText.length
      ? itemText[idx + baseTitle.length]
      : null;
    if (charBefore && /[\wÀ-öø-ÿ]/.test(charBefore)) continue;
    if (charAfter  && /[\wÀ-öø-ÿ]/.test(charAfter))  continue;

    found.push({ phrase: itemText.slice(idx, idx + baseTitle.length), event: ev, pos: idx });
  }

  // Sort by position; longest match wins when two overlap at same offset
  found.sort((a, b) => a.pos - b.pos || b.phrase.length - a.phrase.length);

  // Deduplicate overlapping matches
  const deduped: typeof found = [];
  let lastEnd = -1;
  for (const f of found) {
    if (f.pos >= lastEnd) {
      deduped.push(f);
      lastEnd = f.pos + f.phrase.length;
    }
  }
  return deduped;
}

/** Splits a top5 sentence into plain-text and entity-link segments. */
function renderAnnotatedText(
  text: string,
  links: Array<{ phrase: string; event: HistoricalEvent; pos: number }>,
  onLinkClick: (event: HistoricalEvent, e: React.MouseEvent) => void,
): React.ReactNode {
  if (links.length === 0) return text;

  const result: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const { phrase, event } of links) {
    const idx = remaining.indexOf(phrase);
    if (idx === -1) continue;
    if (idx > 0) result.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    const yearLabel = event.year > 0 ? `${event.year} d.C.` : `${Math.abs(event.year)} a.C.`;
    result.push(
      <button
        key={key++}
        className="era-guide__entity-link"
        onClick={(e) => onLinkClick(event, e)}
        title={`${event.title} — ${yearLabel}`}
      >
        {phrase}
      </button>
    );
    remaining = remaining.slice(idx + phrase.length);
  }
  if (remaining) result.push(<span key={key++}>{remaining}</span>);
  return <>{result}</>;
}

export function EraGuide({ data, events, onClose, onNavigate, onSelectEvent }: Props) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false); // mobile bottom sheet

  // Pre-compute entity links for all items — must be before early return (hooks)
  const top5Links = useMemo(() => {
    if (!data) return [];
    return data.briefing.items.map(item => findEntityLinks(item.text, events));
  }, [data, events]);

  if (!data) return null;

  const it = data.locale === 'it';
  const { briefing, eraName, eraYear, originLat, originLng } = data;

  function handleItemClick(itemText: string) {
    const parsedYear = parseYear(itemText) ?? eraYear;
    const flyTo: FlyTarget | undefined =
      originLat != null && originLng != null
        ? { kind: 'geo', lat: originLat, lng: originLng, ts: Date.now(), range: 1_800_000 }
        : undefined;
    onNavigate({ year: parsedYear, flyTo });
  }

  function handleEntityClick(ev: HistoricalEvent, e: React.MouseEvent) {
    e.stopPropagation();
    onNavigate({ year: ev.year });
    onSelectEvent?.(ev);
  }

  const collapseLabel = it ? 'Comprimi' : 'Collapse';
  const closeLabel    = it ? 'Chiudi guida era' : 'Close era guide';

  const classes = [
    'era-guide',
    collapsed      ? 'era-guide--collapsed'    : '',
    sheetExpanded  ? 'era-guide--sheet-open'   : 'era-guide--sheet-closed',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>

      {/* ── Mobile bottom sheet handle ── */}
      <div
        className="era-guide__sheet-handle"
        onClick={() => setSheetExpanded(v => !v)}
        title={sheetExpanded
          ? (it ? 'Riduci' : 'Collapse')
          : (it ? 'Espandi guida era' : 'Expand era guide')}
      >
        <span className="era-guide__sheet-pip" />
        <span className="era-guide__sheet-title">{eraName}</span>
        <span className="era-guide__sheet-chevron">
          {sheetExpanded ? '▾' : '▴'}
        </span>
        <button
          className="era-guide__sheet-close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          title={closeLabel}
        >✕</button>
      </div>

      {/* ── Desktop header (always visible on desktop) ── */}
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
            {it ? "L'epoca in cui sei" : "The era you're in"}
          </div>
          <p className="era-guide__dove">{briefing.dove}</p>
        </div>

        <div className="era-guide__divider" />

        {/* 10 esperienze con categoria e entity hyperlinks */}
        <div className="era-guide__section">
          <div className="era-guide__section-label">
            {it ? '10 esperienze imperdibili' : '10 must-see experiences'}
          </div>
          <ol className="era-guide__top5">
            {briefing.items.map((item, i) => (
              <li key={i}>
                <div
                  className="era-guide__top5-item"
                  onClick={() => handleItemClick(item.text)}
                  title={it ? 'Naviga a questo momento' : 'Navigate to this moment'}
                >
                  <span className="era-guide__item-cat" title={item.cat}>
                    {CAT_ICON[item.cat] ?? '📌'}
                  </span>
                  <span className="era-guide__top5-arrow">→</span>
                  <span className="era-guide__top5-text">
                    {renderAnnotatedText(item.text, top5Links[i] ?? [], handleEntityClick)}
                  </span>
                </div>
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
