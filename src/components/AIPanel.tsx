import { useState, useRef, useEffect, useMemo } from 'react';
import { type HistoricalEvent, type Locale, CATEGORY_COLORS } from '../types';
import './AIPanel.css';

interface Props {
  event:          HistoricalEvent | null;
  locale:         Locale;
  onClose:        () => void;
  events?:        HistoricalEvent[];
  onSelectEvent?: (ev: HistoricalEvent) => void;
}

function findCorrelations(ev: HistoricalEvent, all: HistoricalEvent[]): HistoricalEvent[] {
  return all
    .filter(e => e.id !== ev.id && !e.isCosmic)
    .map(e => {
      const yearDiff = Math.abs(e.year - ev.year);
      let score = 1 / (1 + yearDiff / 500);
      if (ev.lat != null && ev.lng != null && e.lat != null && e.lng != null) {
        const d = Math.hypot(e.lat - ev.lat, e.lng - ev.lng);
        score += 0.5 / (1 + d / 20);
      }
      // Bonus per categoria diversa (relazioni interdisciplinari)
      if (e.category !== ev.category) score += 0.3;
      return { e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.e);
}

interface Msg { role: 'user' | 'ai'; text: string }

async function askEntity(
  event: HistoricalEvent,
  question: string,
  history: Msg[],
  locale: Locale,
): Promise<string> {
  const res = await fetch('/api/entity-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity: { title: event.title, description: event.description, year: event.year, category: event.category },
      question,
      history: history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
      locale,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { ok: boolean; data: { answer: string } };
  return json.data.answer;
}

function formatYear(year: number, locale: Locale): string {
  if (year > 0) return locale === 'it' ? `${year} d.C.` : `${year} AD`;
  return locale === 'it' ? `${Math.abs(year)} a.C.` : `${Math.abs(year)} BC`;
}

type ResizeDir = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';

const DEFAULT_W = 340;
const DEFAULT_H = 480;
const MIN_W = 260;
const MIN_H = 300;

export function AIPanel({ event, locale, onClose, events = [], onSelectEvent }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });

  const dragging = useRef(false);
  const resizing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: DEFAULT_W, h: DEFAULT_H });

  const correlations = useMemo(
    () => (event && events.length > 0 ? findCorrelations(event, events) : []),
    [event?.id, events], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  // Auto-analysis when entity changes
  useEffect(() => {
    if (!event) { setMessages([]); setBusy(false); return; }

    const correlated = events.length > 0 ? findCorrelations(event, events) : [];
    const yr = formatYear(event.year, locale);

    const prompt = locale === 'it'
      ? `Sei una guida esperta di storia universale. L'utente ha selezionato: "${event.title}" (${yr}).

Descrizione disponibile: ${event.description}

Il tuo compito:
1. Presenta brevemente l'entità con tono coinvolgente.
2. Identifica almeno 5 entità storiche correlate — sceglile tra epoche e discipline diverse (es. arte, scienza, politica, filosofia, geologia). Puoi ispirarrti a queste già trovate nella mappa: ${correlated.map(e => `"${e.title}" (${formatYear(e.year, 'it')})`).join(', ')}, ma puoi aggiungerne altre.
3. Per ciascuna entità correlata: spiega in modo esteso e narrativo il legame con "${event.title}", e invita l'utente a esplorarla sulla mappa con una frase suggestiva.

Usa un tono da narratore storico appassionato, coinvolgente e curioso.`
      : `You are an expert guide in world history. The user selected: "${event.title}" (${yr}).

Available description: ${event.description}

Your task:
1. Briefly introduce the entity with an engaging tone.
2. Identify at least 5 related historical entities — choose from different eras and disciplines (art, science, politics, philosophy, geology). You can draw inspiration from these already found on the map: ${correlated.map(e => `"${e.title}" (${formatYear(e.year, 'en')})`).join(', ')}, but feel free to add others.
3. For each related entity: explain in detail and narratively the connection with "${event.title}", and invite the user to explore it on the map with a suggestive phrase.

Use the tone of a passionate, engaging, and curious historical narrator.`;

    setMessages([{ role: 'ai', text: locale === 'it' ? '⬡ Analisi in corso…' : '⬡ Analyzing…' }]);
    setBusy(true);

    askEntity(event, prompt, [], locale)
      .then(reply => setMessages([{ role: 'ai', text: reply }]))
      .catch(() => {
        const intro = locale === 'it'
          ? `${event.title} (${yr}) — ${event.description}\n\nEntità correlate che potresti esplorare:`
          : `${event.title} (${yr}) — ${event.description}\n\nRelated entities you might explore:`;
        const list = correlated.map(e =>
          locale === 'it'
            ? `• ${e.title} (${formatYear(e.year, 'it')}) — correlata per prossimità storica e geografica.`
            : `• ${e.title} (${formatYear(e.year, 'en')}) — related by historical and geographical proximity.`
        ).join('\n');
        setMessages([{ role: 'ai', text: `${intro}\n${list}` }]);
      })
      .finally(() => setBusy(false));

  }, [event?.id, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  function defaultPos() {
    const consoleH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--console-h')) || 0;
    return {
      x: Math.max(0, window.innerWidth - size.w - 14),
      y: Math.max(0, window.innerHeight - consoleH - size.h - 8),
    };
  }

  function onHeaderMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const current = pos ?? defaultPos();
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startPos.current = current;
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 80, startPos.current.x + ev.clientX - startX.current)),
        y: Math.max(0, Math.min(window.innerHeight - 40, startPos.current.y + ev.clientY - startY.current)),
      });
    }
    function onUp() {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function onResizeMouseDown(e: React.MouseEvent, dir: ResizeDir) {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    startSize.current = { w: size.w, h: size.h };
    const current = pos ?? defaultPos();
    startPos.current = current;
    const cursors: Record<ResizeDir, string> = {
      se: 'se-resize', sw: 'sw-resize', ne: 'ne-resize', nw: 'nw-resize',
      n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
    };
    document.body.style.cursor = cursors[dir];
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;
      let { x, y } = startPos.current;
      let { w, h } = startSize.current;
      if (dir.includes('e')) w = Math.max(MIN_W, w + dx);
      if (dir.includes('s')) h = Math.max(MIN_H, h + dy);
      if (dir.includes('w')) { const nw = Math.max(MIN_W, w - dx); x = startPos.current.x + (w - nw); w = nw; }
      if (dir.includes('n')) { const nh = Math.max(MIN_H, h - dy); y = startPos.current.y + (h - nh); h = nh; }
      setSize({ w, h });
      if (dir !== 'e' && dir !== 's' && dir !== 'se') setPos({ x, y });
    }
    function onUp() {
      resizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  async function send() {
    if (!input.trim() || busy) return;
    const question = input.trim();
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setBusy(true);
    try {
      const reply = event
        ? await askEntity(event, question, next, locale)
        : (locale === 'it' ? 'Seleziona prima un\'entità sulla mappa.' : 'Please select an entity on the map first.');
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: locale === 'it'
          ? 'Servizio AI momentaneamente non disponibile.'
          : 'AI service temporarily unavailable.',
      }]);
    } finally {
      setBusy(false);
    }
  }

  const resolvedPos = pos ?? defaultPos();

  return (
    <div
      ref={panelRef}
      className="aip"
      style={{ left: resolvedPos.x, top: resolvedPos.y, width: size.w, height: size.h }}
    >
      {/* Resize handles */}
      <div className="aip__resize aip__resize--n"  onMouseDown={e => onResizeMouseDown(e, 'n')} />
      <div className="aip__resize aip__resize--s"  onMouseDown={e => onResizeMouseDown(e, 's')} />
      <div className="aip__resize aip__resize--e"  onMouseDown={e => onResizeMouseDown(e, 'e')} />
      <div className="aip__resize aip__resize--w"  onMouseDown={e => onResizeMouseDown(e, 'w')} />
      <div className="aip__resize aip__resize--nw" onMouseDown={e => onResizeMouseDown(e, 'nw')} />
      <div className="aip__resize aip__resize--ne" onMouseDown={e => onResizeMouseDown(e, 'ne')} />
      <div className="aip__resize aip__resize--sw" onMouseDown={e => onResizeMouseDown(e, 'sw')} />
      <div className="aip__resize aip__resize--se" onMouseDown={e => onResizeMouseDown(e, 'se')} />

      <div className="aip__hd" onMouseDown={onHeaderMouseDown} style={{ cursor: 'move' }}>
        <span className="aip__hd-ic">⬡</span>
        <span className="aip__hd-title">ASSISTENTE VIAGGIO AI</span>
        <button className="aip__close" onClick={onClose} aria-label="Chiudi">✕</button>
      </div>

      <div className="aip__body" ref={bodyRef}>
        {!event && messages.length === 0 && (
          <p className="aip__hint">
            {locale === 'it'
              ? 'Seleziona un\'entità sulla mappa per analisi e correlazioni automatiche.'
              : 'Select an entity on the map for automatic analysis and correlations.'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`aip__msg aip__msg--${m.role}`}>
            {m.role === 'ai' && <span className="aip__msg-ic">⬡</span>}
            <span className="aip__msg-txt" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</span>
          </div>
        ))}
        {busy && (
          <div className="aip__msg aip__msg--ai">
            <span className="aip__msg-ic">⬡</span>
            <span className="aip__msg-txt aip__msg--thinking">◈ ◈ ◈</span>
          </div>
        )}
      </div>

      {correlations.length > 0 && (
        <div className="aip__tags">
          <span className="aip__tags-lbl">
            {locale === 'it' ? 'Esplora:' : 'Explore:'}
          </span>
          {correlations.map(e => (
            <button
              key={e.id}
              className="aip__tag"
              style={{ '--tag-clr': CATEGORY_COLORS[e.category] } as React.CSSProperties}
              onClick={() => onSelectEvent?.(e)}
              title={e.description}
            >
              {e.title}
            </button>
          ))}
        </div>
      )}

      <div className="aip__inp-row">
        <div className="aip__inp-wrap">
          <input
            className="aip__inp"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={locale === 'it' ? 'Chiedimi qualcosa…' : 'Ask me something…'}
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
          />
        </div>
        <button
          className="aip__send"
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Invia"
        >▷</button>
      </div>
    </div>
  );
}
