import { useState, useRef, useEffect } from 'react';
import { type HistoricalEvent, type Locale, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

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

/** Cerca il miglior articolo Wikipedia per un titolo libero. Usato come fallback
 *  quando lo slug nel dataset non trova corrispondenza. */
async function searchWikiFallback(title: string, lang: string): Promise<string | null> {
  const baseTitle = title.split(/\s*[—–]\s*/)[0].trim();
  const params = new URLSearchParams({
    action: 'opensearch', search: baseTitle, limit: '5', format: 'json', origin: '*',
  });
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return null;
    const data = await res.json() as [string, string[], string[], string[]];
    const titles = data[1] ?? [];
    const urls   = data[3] ?? [];
    if (!titles.length) return null;
    // Preferisci il risultato che condivide almeno una parola significativa con il titolo
    const words = baseTitle.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
    const idx = titles.findIndex(t => words.some(w => t.toLowerCase().includes(w)));
    return urls[idx !== -1 ? idx : 0] ?? null;
  } catch {
    return null;
  }
}

function useWikiContent(slug: string | undefined, locale: Locale, entityTitle?: string) {
  const [body,    setBody]    = useState<string | null>(null);
  const [wikiUrl, setWikiUrl] = useState<string>('');
  const [wikiBase, setWikiBase] = useState<string>(`https://${locale}.wikipedia.org`);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) { setBody(null); setWikiUrl(''); return; }
    let cancelled = false;
    setBody(null);
    setLoading(true);

    // Lingua del sito prima, poi fallback inglese
    const langs = locale === 'en' ? ['en'] : [locale, 'en'];

    (async () => {
      // Fase 1: prova slug diretto su IT poi EN
      for (const lang of langs) {
        const page = await fetchWikiPage(slug, lang);
        if (page && !cancelled) {
          setWikiUrl(page.url);
          setWikiBase(page.base);
          setBody(page.html);
          setLoading(false);
          return;
        }
      }

      // Fase 2: slug non trovato → opensearch con il titolo dell'entità
      if (!cancelled && entityTitle) {
        const searchLangs = locale === 'en' ? ['en'] : [locale, 'en'];
        for (const lang of searchLangs) {
          const foundUrl = await searchWikiFallback(entityTitle, lang);
          if (foundUrl && !cancelled) {
            // Carica la pagina trovata via search tramite URL diretto
            const slugFromUrl = decodeURIComponent(foundUrl.split('/wiki/')[1] ?? '');
            if (slugFromUrl) {
              const page = await fetchWikiPage(slugFromUrl, lang);
              if (page && !cancelled) {
                setWikiUrl(page.url);
                setWikiBase(page.base);
                setBody(page.html);
                setLoading(false);
                return;
              }
            }
            // Se la pagina non si carica via parse, usa comunque l'URL per il link
            if (!cancelled) setWikiUrl(foundUrl);
            break;
          }
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug, locale, entityTitle]);

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

// Estrae testo leggibile dall'HTML Wikipedia: rimuove infobox, tabelle, note, nav
function extractWikiText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll(
    '.infobox, .reference, .reflist, .toc, .navbox, .mw-editsection, ' +
    'table, script, style, sup, .thumb, .sidebar, .hatnote, [role="note"]'
  ).forEach(el => el.remove());
  return (div.textContent ?? '')
    .replace(/\[\d+\]/g, '')  // rimuovi marker footnote [1][2]
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 15000);
}

// Divide il testo in chunk ~250 char su confini di frase per evitare
// il bug Chrome che tronca gli utterance dopo ~15 secondi
function splitChunks(text: string, maxLen = 250): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const chunks: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > maxLen && cur) { chunks.push(cur.trim()); cur = s; }
    else cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(c => c.length > 0);
}

// ── Text-to-Speech ────────────────────────────────────────────────────────
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
      const utt  = new SpeechSynthesisUtterance(chunks[idx++]);
      utt.lang   = lang === 'it' ? 'it-IT' : 'en-US';
      utt.rate   = 0.95;
      utt.onend  = speakNext;
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

const DEFAULT_H = 480;

// ── Componente ────────────────────────────────────────────────────────────
interface Props {
  event:            HistoricalEvent | null;
  locale:           Locale;
  onClose:          () => void;
  onRecall?:        (ev: HistoricalEvent) => void;
  onShowEraGuide?:  () => void;
  eraGuideName?:    string;
  events?:          HistoricalEvent[];
  onSelectEvent?:   (ev: HistoricalEvent) => void;
}

async function fetchWikiImages(slug: string, lang: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query', titles: slug, prop: 'pageimages|images',
      format: 'json', origin: '*', piprop: 'thumbnail', pithumbsize: '300', imlimit: '12',
    });
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0] as {
      thumbnail?: { source: string };
      images?: { title: string }[];
    };
    const result: string[] = [];
    if (page?.thumbnail?.source) result.push(page.thumbnail.source);
    const imageFiles = (page?.images ?? [])
      .map((img: { title: string }) => img.title)
      .filter((t: string) => /\.(jpg|jpeg|png)$/i.test(t))
      .slice(0, 8);
    if (imageFiles.length > 0) {
      const infoParams = new URLSearchParams({
        action: 'query', prop: 'imageinfo', iiprop: 'url',
        format: 'json', origin: '*', iiurlwidth: '300',
        titles: imageFiles.join('|'),
      });
      const infoRes = await fetch(`https://${lang}.wikipedia.org/w/api.php?${infoParams}`);
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        const infoPages = infoData.query?.pages ?? {};
        Object.values(infoPages).forEach((p: unknown) => {
          const pg = p as { imageinfo?: { thumburl?: string }[] };
          const url = pg.imageinfo?.[0]?.thumburl;
          if (url && !result.includes(url)) result.push(url);
        });
      }
    }
    return result.slice(0, 9);
  } catch { return []; }
}

export function InfoPanel({ event, locale, onClose, onRecall, onShowEraGuide, eraGuideName }: Props) {
  const [activeTab,    setActiveTab]    = useState<'info' | 'media'>('info');
  const [minimized,    setMinimized]    = useState(false);
  const [mediaImages,  setMediaImages]  = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [recalled,     setRecalled]     = useState<HistoricalEvent | null>(null);
  // Docking state
  const [dockMode,     setDockMode]     = useState<'anchored' | 'float'>('anchored');
  const [anchorWidth,  setAnchorWidth]  = useState(380);
  const [visible,      setVisible]      = useState(false);
  // Float state
  const [pos,          setPos]          = useState<{x: number; y: number} | null>(null);
  const [size,         setSize]         = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const panelRef    = useRef<HTMLDivElement>(null);
  const wikiBodyRef = useRef<HTMLDivElement>(null);
  const dragging    = useRef(false);
  const resizing    = useRef(false);
  const startX      = useRef(0);
  const startY      = useRef(0);
  const startPos    = useRef({ x: 0, y: 0 });
  const startSize   = useRef({ w: DEFAULT_W, h: DEFAULT_H });

  const { body, wikiUrl, wikiBase, loading } = useWikiContent(event?.wikipediaSlug, locale, event?.title);
  const { speaking, speak, stop } = useTTS();

  // Fix percorsi Wikipedia dopo ogni render del corpo
  useEffect(() => {
    if (body && wikiBodyRef.current) {
      fixWikiPaths(wikiBodyRef.current, wikiBase);
    }
  }, [body, wikiBase]);

  // Nuova entità → slide-in dal bordo destro
  useEffect(() => {
    if (event) {
      setRecalled(null);
      setMinimized(false);
      setDockMode('anchored');
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }
  }, [event?.id]);

  // Reset media when event changes
  useEffect(() => {
    setActiveTab('info');
    setMediaImages([]);
  }, [event?.id]);

  // Load media images when media tab is active
  useEffect(() => {
    if (activeTab !== 'media' || !event?.wikipediaSlug) return;
    if (mediaImages.length > 0) return;
    setMediaLoading(true);
    const lang = locale === 'en' ? 'en' : 'it';
    fetchWikiImages(event.wikipediaSlug, lang)
      .then(imgs => setMediaImages(imgs))
      .finally(() => setMediaLoading(false));
  }, [activeTab, event?.wikipediaSlug, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ferma TTS quando cambia evento
  useEffect(() => { stop(); }, [event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chiudi con animazione di slide-out ────────────────────────────────────
  function closeWithAnim() {
    setVisible(false);
    setTimeout(() => { setRecalled(event); onClose(); }, 300);
  }

  // ── Undock: da ancorato a floating ────────────────────────────────────────
  function undock() {
    const w = Math.min(500, window.innerWidth - 80);
    const h = Math.round(window.innerHeight * 0.72);
    setPos({ x: Math.max(0, window.innerWidth - w - 24), y: 56 });
    setSize({ w, h });
    setDockMode('float');
  }

  // ── Drag header (solo float) ──────────────────────────────────────────────
  function onHeaderMouseDown(e: React.MouseEvent) {
    if (dockMode !== 'float') return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const current = pos ?? { x: Math.max(0, window.innerWidth - DEFAULT_W - 24), y: 64 };
    dragging.current = true;
    startX.current   = e.clientX;
    startY.current   = e.clientY;
    startPos.current = current;
    document.body.style.cursor     = 'move';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      const nx = Math.max(0, Math.min(window.innerWidth  - 80, startPos.current.x + ev.clientX - startX.current));
      const ny = Math.max(0, Math.min(window.innerHeight - 40, startPos.current.y + ev.clientY - startY.current));
      setPos({ x: nx, y: ny });
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

  // ── Resize da qualsiasi handle (8 direzioni, solo float) ────────────────
  type ResizeDir = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';
  function onResizeMouseDown(e: React.MouseEvent, dir: ResizeDir) {
    if (dockMode !== 'float') return;
    e.preventDefault();
    e.stopPropagation();
    resizing.current  = true;
    startX.current    = e.clientX;
    startY.current    = e.clientY;
    startSize.current = { w: size.w, h: size.h };
    const resolvedPos = pos ?? { x: Math.max(0, window.innerWidth - DEFAULT_W - 24), y: 64 };
    startPos.current  = resolvedPos;
    const cursors: Record<ResizeDir, string> = {
      se: 'se-resize', sw: 'sw-resize', ne: 'ne-resize', nw: 'nw-resize',
      n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
    };
    document.body.style.cursor     = cursors[dir];
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;
      let { x, y } = startPos.current;
      let { w, h } = startSize.current;

      if (dir === 'e' || dir === 'se' || dir === 'ne') w = Math.min(Math.max(MIN_W, w + dx), maxWidth());
      if (dir === 'w' || dir === 'sw' || dir === 'nw') {
        const nw = Math.max(MIN_W, w - dx);
        x = startPos.current.x + (w - nw);
        w = nw;
      }
      if (dir === 's' || dir === 'se' || dir === 'sw') h = Math.max(160, h + dy);
      if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        const nh = Math.max(160, h - dy);
        y = startPos.current.y + (h - nh);
        h = nh;
      }
      setSize({ w, h });
      if (dir !== 'e' && dir !== 's' && dir !== 'se') setPos({ x, y });
    }
    function onUp() {
      resizing.current = false;
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  // ── Left-edge resize (solo anchored) ──────────────────────────────────────
  function onLeftResizeDown(e: React.MouseEvent) {
    e.preventDefault();
    const sx = e.clientX;
    const sw = anchorWidth;
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
    function onMove(ev: MouseEvent) {
      const delta = sx - ev.clientX; // dragging left = wider
      setAnchorWidth(Math.max(280, Math.min(window.innerWidth * 0.8, sw + delta)));
    }
    function onUp() {
      document.body.style.cursor     = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  // Recall chip — visibile quando pannello chiuso
  if (!event) {
    if (!recalled) return null;
    return (
      <button
        className="recall-chip"
        style={{ right: 14 }}
        onClick={() => { onRecall?.(recalled); setRecalled(null); }}
        title={locale === 'it' ? 'Riapri il pannello' : 'Reopen panel'}
      >
        <span className="recall-chip__name">{recalled.title}</span>
        <span className="recall-chip__arrow">←</span>
      </button>
    );
  }

  const color = CATEGORY_COLORS[event.category];

  // ── Contenuto interno (comune a anchored e float) ─────────────────────────
  const panelContent = (
    <>
      {/* intestazione */}
      <div
        className="info-panel__header"
        onMouseDown={onHeaderMouseDown}
        style={{ cursor: dockMode === 'float' ? 'move' : 'default' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', flex: 1 }}>
          <span
            className="category-badge"
            style={{ background: `${color}22`, color, border: `1px solid ${color}55`, alignSelf: 'flex-start' }}
          >
            {CATEGORY_LABELS[event.category]}
          </span>
          {onShowEraGuide && eraGuideName && (
            <button
              className="info-panel__era-back-btn"
              onClick={onShowEraGuide}
              title={locale === 'it' ? `Torna alla guida: ${eraGuideName}` : `Back to era guide: ${eraGuideName}`}
            >
              ‹ {eraGuideName}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {/* Undock / Re-anchor */}
          {dockMode === 'anchored' ? (
            <button
              className="info-panel__icon-btn"
              onClick={undock}
              title={locale === 'it' ? 'Sblocca pannello' : 'Undock panel'}
            >⊡</button>
          ) : (
            <button
              className="info-panel__icon-btn"
              onClick={() => { setDockMode('anchored'); setPos(null); }}
              title={locale === 'it' ? 'Ancora a destra' : 'Dock to right'}
            >⊟</button>
          )}
          {/* TTS */}
          {window.speechSynthesis && !minimized && (
            <button
              className={`info-panel__icon-btn${speaking ? ' tts-active' : ''}`}
              onClick={() => {
                const wikiText = body ? extractWikiText(body) : '';
                speak(
                  wikiText ? `${event.title}. ${wikiText}` : `${event.title}. ${event.description}`,
                  locale,
                );
              }}
              title={speaking ? 'Ferma lettura' : 'Leggi ad alta voce'}
              aria-label="Text-to-speech"
            >
              {speaking ? '⏹' : '🔊'}
            </button>
          )}
          {/* Minimizza */}
          <button
            className="info-panel__icon-btn"
            onClick={() => setMinimized(v => !v)}
            aria-label={minimized ? 'Espandi' : 'Minimizza'}
            title={minimized ? (locale === 'it' ? 'Espandi' : 'Expand') : (locale === 'it' ? 'Minimizza' : 'Minimize')}
          >
            {minimized ? '▲' : '▬'}
          </button>
          {/* Espandi (solo float) */}
          {dockMode === 'float' && (
            <button
              className="info-panel__icon-btn"
              onClick={() => {
                const w = Math.min(700, window.innerWidth - 80);
                const h = Math.round(window.innerHeight * 0.72);
                setPos({ x: Math.round((window.innerWidth - w) / 2), y: 56 });
                setSize({ w, h });
              }}
              title={locale === 'it' ? 'Espandi' : 'Expand'}
            >⤢</button>
          )}
          {/* Chiudi */}
          <button
            className="info-panel__icon-btn"
            onClick={closeWithAnim}
            aria-label="Chiudi"
          >×</button>
        </div>
      </div>

      {/* meta + tabs */}
      {!minimized && <div className="info-panel__scroll">
        <div className="info-panel__meta">
          <h2 className="info-panel__title">{event.title}</h2>
          <div className="info-panel__year">{formatYear(event.year)}</div>
          <p className="info-panel__desc">{event.description}</p>
        </div>

        <div className="info-panel__tabs">
          <button
            className={`info-panel__tab${activeTab === 'info' ? ' info-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('info')}
          >📖 Wikipedia</button>
          <button
            className={`info-panel__tab${activeTab === 'media' ? ' info-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('media')}
          >🖼 Media</button>
        </div>

        {activeTab === 'info' && (
          <>
            <div className="info-panel__wiki-wrap">
              {loading && (
                <div className="info-panel__loading">
                  <span className="info-panel__spinner" /> Caricamento Wikipedia…
                </div>
              )}
              {!loading && body && (
                <div ref={wikiBodyRef} className="wiki-body" dangerouslySetInnerHTML={{ __html: body }} />
              )}
              {!loading && !body && (
                <p style={{ fontSize: '0.72rem', color: '#888', padding: '12px 14px' }}>
                  Articolo Wikipedia non disponibile.
                </p>
              )}
            </div>
            <div className="info-panel__footer">
              <a
                href={
                  wikiUrl ||
                  (event.wikipediaSlug
                    ? `https://it.wikipedia.org/wiki/${event.wikipediaSlug}`
                    : `https://it.wikipedia.org/w/index.php?search=${encodeURIComponent(event.title.split(/\s*[—–]\s*/)[0].trim())}`)
                }
                target="_blank" rel="noopener noreferrer" className="info-panel__wiki-btn"
              >
                {wikiUrl || event.wikipediaSlug ? 'Apri Wikipedia in una nuova scheda' : 'Cerca su Wikipedia'}
              </a>
              <span className="info-panel__license">
                Testo da <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>{', '}licenza{' '}
                <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>
              </span>
            </div>
          </>
        )}

        {activeTab === 'media' && (
          <div className="info-panel__media">
            {mediaLoading && (
              <div className="info-panel__loading">
                <span className="info-panel__spinner" /> {locale === 'it' ? 'Caricamento immagini…' : 'Loading images…'}
              </div>
            )}
            {!mediaLoading && mediaImages.length === 0 && (
              <p style={{ fontSize: '0.72rem', color: '#888', padding: '12px 14px' }}>
                {locale === 'it' ? 'Nessuna immagine disponibile.' : 'No images available.'}
              </p>
            )}
            {!mediaLoading && mediaImages.length > 0 && (
              <div className="info-panel__media-grid">
                {mediaImages.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="info-panel__media-item">
                    <img src={url} alt="" loading="lazy" />
                  </a>
                ))}
              </div>
            )}
            <p className="info-panel__license" style={{ padding: '8px 14px' }}>
              {locale === 'it' ? 'Immagini da Wikimedia Commons' : 'Images from Wikimedia Commons'}
            </p>
          </div>
        )}
      </div>}

      {/* Resize handles su tutti i bordi/angoli (solo float) */}
      {dockMode === 'float' && !minimized && (
        <>
          <div className="ip__resize ip__resize--n"  onMouseDown={e => onResizeMouseDown(e, 'n')} />
          <div className="ip__resize ip__resize--s"  onMouseDown={e => onResizeMouseDown(e, 's')} />
          <div className="ip__resize ip__resize--e"  onMouseDown={e => onResizeMouseDown(e, 'e')} />
          <div className="ip__resize ip__resize--w"  onMouseDown={e => onResizeMouseDown(e, 'w')} />
          <div className="ip__resize ip__resize--nw" onMouseDown={e => onResizeMouseDown(e, 'nw')} />
          <div className="ip__resize ip__resize--ne" onMouseDown={e => onResizeMouseDown(e, 'ne')} />
          <div className="ip__resize ip__resize--sw" onMouseDown={e => onResizeMouseDown(e, 'sw')} />
          <div className="ip__resize ip__resize--se" onMouseDown={e => onResizeMouseDown(e, 'se')} />
        </>
      )}
    </>
  );

  // ── Anchored mode ─────────────────────────────────────────────────────────
  if (dockMode === 'anchored') {
    return (
      <div
        ref={panelRef}
        className={`info-panel info-panel--anchored${visible ? ' info-panel--visible' : ''}${minimized ? ' info-panel--minimized' : ''}`}
        style={{ width: anchorWidth }}
      >
        <div className="info-panel__left-resize" onMouseDown={onLeftResizeDown} />
        {panelContent}
      </div>
    );
  }

  // ── Float mode ────────────────────────────────────────────────────────────
  const resolvedPos = pos ?? { x: Math.max(0, window.innerWidth - DEFAULT_W - 24), y: 64 };
  return (
    <div
      ref={panelRef}
      className={`info-panel info-panel--float${minimized ? ' info-panel--minimized' : ''}`}
      style={{
        left:   resolvedPos.x,
        top:    resolvedPos.y,
        width:  size.w,
        height: minimized ? 38 : size.h,
      }}
    >
      {panelContent}
    </div>
  );
}
