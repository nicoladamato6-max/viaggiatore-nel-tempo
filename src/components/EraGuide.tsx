import { useMemo, useState, useRef, useEffect } from 'react';
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

// ── Text-to-Speech (same logic as InfoPanel) ─────────────────────────────
function splitChunks(text: string, max = 180): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > max && cur) { chunks.push(cur.trim()); cur = s; }
    else cur += (cur ? ' ' : '') + s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(c => c.length > 0);
}

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const cancelledRef = useRef(false);

  function speak(text: string, lang: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    cancelledRef.current = false;
    const chunks = splitChunks(text);
    let idx = 0;
    function speakNext() {
      if (cancelledRef.current || idx >= chunks.length) { setSpeaking(false); return; }
      const utt = new SpeechSynthesisUtterance(chunks[idx++]);
      utt.lang = lang === 'it' ? 'it-IT' : 'en-US';
      utt.rate = 0.95;
      utt.onend = speakNext;
      utt.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
    speakNext();
    setSpeaking(true);
  }

  function stop() {
    cancelledRef.current = true;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  useEffect(() => () => { stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { speaking, speak, stop };
}

type ResizeDir = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';

export function EraGuide({ data, events, onClose, onNavigate, onSelectEvent }: Props) {
  const [sheetExpanded, setSheetExpanded] = useState(false); // mobile bottom sheet
  const [isFloat,       setIsFloat]       = useState(false);
  const [floatPos,      setFloatPos]      = useState({ x: 60, y: 60 });
  const [floatSize,     setFloatSize]     = useState({ w: 360, h: 620 });
  const dragStartRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const { speaking, speak, stop } = useTTS();

  function onDragMouseDown(e: React.MouseEvent) {
    if (!isFloat) return;
    e.preventDefault();
    dragStartRef.current = { mx: e.clientX, my: e.clientY, px: floatPos.x, py: floatPos.y };
    const onMove = (me: MouseEvent) => {
      if (!dragStartRef.current) return;
      setFloatPos({
        x: dragStartRef.current.px + me.clientX - dragStartRef.current.mx,
        y: dragStartRef.current.py + me.clientY - dragStartRef.current.my,
      });
    };
    const onUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function onResizeMouseDown(e: React.MouseEvent, dir: ResizeDir) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const sp = { ...floatPos }, ss = { ...floatSize };
    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX, dy = me.clientY - startY;
      let { x, y } = sp, { w, h } = ss;
      if (dir.includes('e')) w = Math.max(280, ss.w + dx);
      if (dir.includes('s')) h = Math.max(300, ss.h + dy);
      if (dir.includes('w')) { w = Math.max(280, ss.w - dx); x = sp.x + ss.w - w; }
      if (dir.includes('n')) { h = Math.max(300, ss.h - dy); y = sp.y + ss.h - h; }
      setFloatSize({ w, h });
      setFloatPos({ x, y });
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Pre-compute entity links for all items — must be before early return (hooks)
  const itemLinks = useMemo(() => {
    if (!data) return [];
    return data.briefing.items.map(item => findEntityLinks(item.text, events));
  }, [data, events]);

  if (!data) return null;

  const it = data.locale === 'it';
  const { briefing, eraName, eraYear, originLat, originLng } = data;

  function handleItemClick(item: typeof briefing.items[0], itemIndex: number) {
    const links = itemLinks[itemIndex] ?? [];

    // 1. Priorità: primaryEntity esplicita nel dato (titolo esatto dell'esperienza come concetto)
    let primaryEv: HistoricalEvent | null = null;
    if (item.primaryEntity) {
      const needle = item.primaryEntity.toLowerCase();
      primaryEv = events.find(e => e.title.toLowerCase() === needle) ?? null;
    }

    // 2. Fallback: entità con il match più LUNGO nel testo
    //    (match lungo = entità più specifica = più probabile soggetto dell'esperienza)
    if (!primaryEv && links.length > 0) {
      primaryEv = links.reduce<typeof links[0] | null>(
        (best, cur) => (!best || cur.phrase.length > best.phrase.length ? cur : best),
        null,
      )?.event ?? null;
    }

    const parsedYear = primaryEv?.year ?? parseYear(item.text) ?? eraYear;
    const flyTo: FlyTarget | undefined =
      primaryEv && primaryEv.lat != null && primaryEv.lng != null
        ? { kind: 'geo', lat: primaryEv.lat, lng: primaryEv.lng, ts: Date.now(), range: 1_800_000 }
        : originLat != null && originLng != null
          ? { kind: 'geo', lat: originLat, lng: originLng, ts: Date.now(), range: 1_800_000 }
          : undefined;
    onNavigate({ year: parsedYear, flyTo });
    if (primaryEv) onSelectEvent?.(primaryEv);
  }

  function handleEntityClick(ev: HistoricalEvent, e: React.MouseEvent) {
    e.stopPropagation();
    onNavigate({ year: ev.year });
    onSelectEvent?.(ev);
  }

  const closeLabel = it ? 'Chiudi guida era' : 'Close era guide';

  const classes = [
    'era-guide',
    isFloat       ? 'era-guide--float'       : '',
    sheetExpanded ? 'era-guide--sheet-open'  : 'era-guide--sheet-closed',
  ].filter(Boolean).join(' ');

  const floatStyle: React.CSSProperties = isFloat
    ? { top: floatPos.y, left: floatPos.x, width: floatSize.w, height: floatSize.h, right: 'unset', bottom: 'unset' }
    : {};

  return (
    <div className={classes} style={floatStyle}>

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

      {/* 8 resize handles — solo in modalità float */}
      {isFloat && (
        <>
          <div className="eg__resize eg__resize--n"  onMouseDown={e => onResizeMouseDown(e,'n')} />
          <div className="eg__resize eg__resize--s"  onMouseDown={e => onResizeMouseDown(e,'s')} />
          <div className="eg__resize eg__resize--e"  onMouseDown={e => onResizeMouseDown(e,'e')} />
          <div className="eg__resize eg__resize--w"  onMouseDown={e => onResizeMouseDown(e,'w')} />
          <div className="eg__resize eg__resize--nw" onMouseDown={e => onResizeMouseDown(e,'nw')} />
          <div className="eg__resize eg__resize--ne" onMouseDown={e => onResizeMouseDown(e,'ne')} />
          <div className="eg__resize eg__resize--sw" onMouseDown={e => onResizeMouseDown(e,'sw')} />
          <div className="eg__resize eg__resize--se" onMouseDown={e => onResizeMouseDown(e,'se')} />
        </>
      )}

      {/* ── Desktop header (always visible on desktop) ── */}
      <div
        className="era-guide__header"
        onMouseDown={isFloat ? onDragMouseDown : undefined}
        style={isFloat ? { cursor: 'move' } : undefined}
      >
        <div className="era-guide__title-row">
          <span className="era-guide__label">ERA GUIDE</span>
          <span className="era-guide__era-name">{eraName}</span>
        </div>
        <div className="era-guide__header-btns">
          {/* Undock / Re-dock */}
          {isFloat ? (
            <button
              className="era-guide__icon-btn"
              onClick={() => { setIsFloat(false); stop(); }}
              title={it ? 'Aggancia a sinistra' : 'Dock to left'}
            >
              ⊣
            </button>
          ) : (
            <button
              className="era-guide__icon-btn"
              onClick={() => setIsFloat(true)}
              title={it ? 'Sgancia pannello' : 'Undock panel'}
            >
              ⊞
            </button>
          )}
          {/* TTS */}
          {window.speechSynthesis && (
            <button
              className="era-guide__icon-btn"
              onClick={() => {
                const text = [briefing.dove, ...briefing.items.map(i => i.text)].join('. ');
                speak(text, data.locale);
              }}
              title={speaking ? (it ? 'Ferma lettura' : 'Stop reading') : (it ? 'Leggi ad alta voce' : 'Read aloud')}
              aria-label="Text-to-speech"
            >
              {speaking ? '⏹' : '🔊'}
            </button>
          )}
          {/* Chiudi */}
          <button
            className="era-guide__icon-btn"
            onClick={() => { stop(); onClose(); }}
            title={closeLabel}
          >
            ✕
          </button>
        </div>
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
                  onClick={() => handleItemClick(item, i)}
                  title={it ? 'Naviga a questo momento' : 'Navigate to this moment'}
                >
                  <span className="era-guide__item-cat" title={item.cat}>
                    {CAT_ICON[item.cat] ?? '📌'}
                  </span>
                  <span className="era-guide__top5-arrow">→</span>
                  <span className="era-guide__top5-text">
                    {renderAnnotatedText(item.text, itemLinks[i] ?? [], handleEntityClick)}
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
