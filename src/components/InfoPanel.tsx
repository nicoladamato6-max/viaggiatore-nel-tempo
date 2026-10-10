import { useState, useRef, useEffect } from 'react';
import { type HistoricalEvent, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const MIN_W     = 280;
const DEFAULT_W = 340;
const maxWidth  = () => window.innerWidth - 80;

// ── Fetch pagina Wikipedia completa via Action API (include TOC) ─────────────
// Le chiamate partono dal browser dell'utente (non da un proxy server):
// ogni utente usa il suo IP → limite 5 req/sec per utente (non condiviso).
// Un proxy server condividerebbe un solo IP per tutti gli utenti → rate limit
// immediato con traffico reale, più costi Wikimedia Enterprise (>$0).
// Mantenere browser-side è gratis e scalabile senza limiti di MAU.
async function fetchWikiPage(slug: string, lang: string) {
  const params = new URLSearchParams({
    action: 'parse', page: slug, prop: 'text',
    format: 'json', origin: '*', redirects: '1',
  });
  const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error || !data.parse?.text?.['*']) return null;
  return {
    html:  data.parse.text['*'] as string,
    title: data.parse.title    as string,
    url:   `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(data.parse.title as string)}`,
    base:  `https://${lang}.wikipedia.org`,
  };
}

function useWikiContent(slug: string | undefined) {
  const [body,    setBody]    = useState<string | null>(null);
  const [wikiUrl, setWikiUrl] = useState<string>('');
  const [wikiBase, setWikiBase] = useState<string>('https://it.wikipedia.org');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) { setBody(null); setWikiUrl(''); return; }
    let cancelled = false;
    setBody(null);
    setLoading(true);

    (async () => {
      for (const lang of ['it', 'en']) {
        const page = await fetchWikiPage(slug, lang);
        if (page && !cancelled) {
          setWikiUrl(page.url);
          setWikiBase(page.base);
          setBody(page.html);
          break;
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  return { body, wikiUrl, wikiBase, loading };
}

// Fix percorsi relativi di immagini e link dopo il render inline
function fixWikiPaths(root: HTMLElement, base: string) {
  root.querySelectorAll<HTMLImageElement>('img[src]').forEach(img => {
    const src = img.getAttribute('src') ?? '';
    if (src.startsWith('//'))  img.src = `https:${src}`;
    else if (src.startsWith('/')) img.src = `${base}${src}`;

    const ss = img.getAttribute('srcset') ?? '';
    if (ss) img.setAttribute('srcset', ss.replace(/\/\//g, 'https://'));
  });

  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a => {
    const href = a.getAttribute('href') ?? '';
    if (href.startsWith('//'))       a.href = `https:${href}`;
    else if (href.startsWith('/'))   a.href = `${base}${href}`;
    if (!href.startsWith('#')) {
      a.target = '_blank';
      a.rel    = 'noopener noreferrer';
    }
  });
}

function formatYear(year: number): string {
  if (year < -1_000_000_000) return `${(Math.abs(year) / 1_000_000_000).toFixed(1)} miliardi di anni fa`;
  if (year < -1_000_000)     return `${(Math.abs(year) / 1_000_000).toFixed(0)} milioni di anni fa`;
  if (year < 0)              return `${Math.abs(year)} a.C.`;
  return `${year} d.C.`;
}

// ── Componente ────────────────────────────────────────────────────────────
interface Props {
  event:   HistoricalEvent | null;
  onClose: () => void;
}

export function InfoPanel({ event, onClose }: Props) {
  const [width, setWidth] = useState(DEFAULT_W);
  const panelRef   = useRef<HTMLDivElement>(null);
  const wikiBodyRef = useRef<HTMLDivElement>(null);
  const dragging   = useRef(false);
  const startX     = useRef(0);
  const startW     = useRef(0);

  const { body, wikiUrl, wikiBase, loading } = useWikiContent(event?.wikipediaSlug);

  // Fix percorsi Wikipedia dopo ogni render del corpo
  useEffect(() => {
    if (body && wikiBodyRef.current) {
      fixWikiPaths(wikiBodyRef.current, wikiBase);
    }
  }, [body, wikiBase]);

  // ── resize handle (desktop) ──────────────────────────────────────────────
  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = panelRef.current?.offsetWidth ?? width;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      const delta = startX.current - ev.clientX;
      setWidth(Math.min(maxWidth(), Math.max(MIN_W, startW.current + delta)));
    }
    function onUp() {
      dragging.current = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  function onHandleDblClick() { setWidth(DEFAULT_W); }

  // ── placeholder quando nessun evento ────────────────────────────────────
  if (!event) {
    return (
      <div ref={panelRef} className="info-panel info-panel--empty" style={{ width }}>
        <div className="info-panel__resize-handle"
          onMouseDown={onHandleMouseDown}
          onDoubleClick={onHandleDblClick}
        />
        <div className="info-panel__placeholder">
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌍</div>
          <p>Tocca un evento sul globo per esplorarlo</p>
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS[event.category];

  return (
    <div ref={panelRef} className="info-panel" style={{ width }}>

      {/* resize handle (desktop) */}
      <div
        className="info-panel__resize-handle"
        onMouseDown={onHandleMouseDown}
        onDoubleClick={onHandleDblClick}
        title="Trascina per ridimensionare"
      />

      {/* intestazione */}
      <div className="info-panel__header">
        <span
          className="category-badge"
          style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
        >
          {CATEGORY_LABELS[event.category]}
        </span>
        <button className="info-panel__icon-btn" onClick={onClose} aria-label="Chiudi">×</button>
      </div>

      {/* dati evento + Wikipedia — tutto in un unico contenitore scrollabile */}
      <div className="info-panel__scroll">

        {/* meta */}
        <div className="info-panel__meta">
          <h2 className="info-panel__title">{event.title}</h2>
          <div className="info-panel__year">{formatYear(event.year)}</div>
          <p className="info-panel__desc">{event.description}</p>
        </div>

        {/* separatore */}
        <div className="info-panel__divider"><span>Wikipedia</span></div>

        {/* corpo Wikipedia inline (no iframe) */}
        <div className="info-panel__wiki-wrap">
          {loading && (
            <div className="info-panel__loading">
              <span className="info-panel__spinner" /> Caricamento Wikipedia…
            </div>
          )}
          {!loading && body && (
            <div
              ref={wikiBodyRef}
              className="wiki-body"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          )}
          {!loading && !body && (
            <p style={{ fontSize: '0.72rem', color: '#888', padding: '12px 14px' }}>
              Articolo Wikipedia non disponibile.
            </p>
          )}
        </div>

        {/* footer */}
        <div className="info-panel__footer">
          <a
            href={wikiUrl || `https://it.wikipedia.org/wiki/${event.wikipediaSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="info-panel__wiki-btn"
          >
            Apri Wikipedia in una nuova scheda
          </a>
          <span className="info-panel__license">
            Testo da{' '}
            <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>
            {', '}licenza{' '}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>
          </span>
        </div>

      </div>{/* fine info-panel__scroll */}
    </div>
  );
}
