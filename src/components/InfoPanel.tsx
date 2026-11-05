import { useState, useRef, useEffect, useCallback } from 'react';
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

function useWikiContent(slug: string | undefined, locale: Locale) {
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
      for (const lang of langs) {
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
  }, [slug, locale]);

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

// ── Chat con LLM ─────────────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'assistant'; content: string; suggestions?: string[] }

// Restituisce sempre un evento: prima cerca nel DB, poi crea un evento sintetico
// che apre Wikipedia per quell'entità. Così tutti i chip sono cliccabili.
function useSuggestionMatcher(allEvents: HistoricalEvent[]) {
  return useCallback((name: string): HistoricalEvent => {
    const low = name.toLowerCase();
    const found = allEvents.find(ev =>
      ev.title.toLowerCase() === low ||
      ev.title.toLowerCase().includes(low) ||
      low.includes(ev.title.toLowerCase().slice(0, 8))
    );
    if (found) return found;
    return {
      id: `wiki-suggestion-${name.replace(/\s+/g, '-').toLowerCase()}`,
      title: name,
      year: 0,
      category: 'storia',
      description: '',
      wikipediaSlug: name.replace(/[\s']/g, '_'),
      isCosmic: false,
    };
  }, [allEvents]);
}

async function sendToEntityChat(
  entity: HistoricalEvent,
  question: string,
  history: ChatMsg[],
  locale: Locale,
): Promise<{ answer: string; suggestions: string[] }> {
  const res = await fetch('/api/entity-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity: { title: entity.title, description: entity.description, year: entity.year, category: entity.category },
      question,
      history: history.map(m => ({ role: m.role, content: m.content })),
      locale,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { ok: boolean; data: { answer: string; suggestions: string[] } };
  return json.data;
}

const DEFAULT_H = 480;
const LEFT_PANEL_W = 260;

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
  leftPanelOpen?:   boolean;
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

export function InfoPanel({ event, locale, onClose, onRecall, onShowEraGuide, eraGuideName, events = [], onSelectEvent, leftPanelOpen }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'media'>('info');
  const [chatMsgs, setChatMsgs]   = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy]   = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [recalled,  setRecalled]  = useState<HistoricalEvent | null>(null);
  const [pos,       setPos]       = useState<{x: number; y: number} | null>(null);
  const [size,      setSize]      = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const chatEndRef  = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const wikiBodyRef = useRef<HTMLDivElement>(null);
  const dragging    = useRef(false);
  const resizing    = useRef(false);
  const startX      = useRef(0);
  const startY      = useRef(0);
  const startPos    = useRef({ x: 0, y: 0 });
  const startSize   = useRef({ w: DEFAULT_W, h: DEFAULT_H });

  const { body, wikiUrl, wikiBase, loading } = useWikiContent(event?.wikipediaSlug, locale);
  const { speaking, speak, stop } = useTTS();
  const matchSuggestion = useSuggestionMatcher(events);

  // Fix percorsi Wikipedia dopo ogni render del corpo
  useEffect(() => {
    if (body && wikiBodyRef.current) {
      fixWikiPaths(wikiBodyRef.current, wikiBase);
    }
  }, [body, wikiBase]);

  // Nuova entità selezionata → apri pannello e pulisci recall
  useEffect(() => {
    if (event) {
      setRecalled(null);
      setMinimized(false);
    }
  }, [event?.id]);

  // Reset chat and media when event changes
  useEffect(() => {
    setChatMsgs([]);
    setChatInput('');
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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  async function handleChatSend() {
    if (!event || !chatInput.trim() || chatBusy) return;
    const question = chatInput.trim();
    setChatInput('');
    const newMsgs: ChatMsg[] = [...chatMsgs, { role: 'user', content: question }];
    setChatMsgs(newMsgs);
    setChatBusy(true);
    try {
      const { answer, suggestions } = await sendToEntityChat(event, question, chatMsgs, locale);
      setChatMsgs([...newMsgs, { role: 'assistant', content: answer, suggestions }]);
    } catch {
      setChatMsgs([...newMsgs, { role: 'assistant', content: locale === 'it' ? 'Errore di connessione. Riprova.' : 'Connection error. Please retry.', suggestions: [] }]);
    } finally {
      setChatBusy(false);
    }
  }

  async function handleAutoSuggest() {
    if (!event || chatBusy) return;
    const label    = locale === 'it' ? 'suggeriscimi relazioni' : 'suggest connections';
    const question = locale === 'it'
      ? 'Suggerisci 3-4 connessioni con altre entità storiche. Per ognuna spiega esplicitamente il nesso: perché è sorprendente, cosa illumina, quale filo rosso le unisce attraverso epoche o discipline diverse.'
      : 'Suggest 3-4 connections to other historical entities. For each one explicitly explain the link: why it is surprising, what it illuminates, what thread connects them across different eras or disciplines.';
    const newMsgs: ChatMsg[] = [...chatMsgs, { role: 'user', content: label }];
    setChatMsgs(newMsgs);
    setChatBusy(true);
    try {
      const { answer, suggestions } = await sendToEntityChat(event, question, chatMsgs, locale);
      setChatMsgs([...newMsgs, { role: 'assistant', content: answer, suggestions }]);
    } catch {
      setChatMsgs([...newMsgs, { role: 'assistant', content: locale === 'it' ? 'Errore di connessione. Riprova.' : 'Connection error. Please retry.', suggestions: [] }]);
    } finally {
      setChatBusy(false);
    }
  }

  // ── Drag header ──────────────────────────────────────────────────────────
  function getDefaultPos() {
    return {
      x: Math.max(0, window.innerWidth - DEFAULT_W - 24),
      y: 64,
    };
  }

  function toggleExpand() {
    if (expanded) {
      setExpanded(false);
      setPos(null);
      setSize({ w: DEFAULT_W, h: DEFAULT_H });
    } else {
      const w = Math.min(700, window.innerWidth - 80);
      const h = Math.round(window.innerHeight * 0.72);
      setPos({ x: Math.round((window.innerWidth - w) / 2), y: 56 });
      setSize({ w, h });
      setExpanded(true);
    }
  }

  function onHeaderMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const current = pos ?? getDefaultPos();
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

  // ── Corner resize ─────────────────────────────────────────────────────────
  function onCornerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizing.current  = true;
    startX.current    = e.clientX;
    startY.current    = e.clientY;
    startSize.current = { w: size.w, h: size.h };
    document.body.style.cursor     = 'se-resize';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!resizing.current) return;
      const nw = Math.max(MIN_W,  startSize.current.w + ev.clientX - startX.current);
      const nh = Math.max(160,    startSize.current.h + ev.clientY - startY.current);
      setSize({ w: Math.min(nw, maxWidth()), h: nh });
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

  // Ferma TTS quando cambia evento
  useEffect(() => { stop(); }, [event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recall chip: visibile quando il pannello è stato chiuso (event=null) e c'è un'entità salvata
  if (!event) {
    if (!recalled) return null;
    const recallLeft = leftPanelOpen ? LEFT_PANEL_W + 14 : 14;
    return (
      <button
        className="recall-chip"
        style={{ left: recallLeft }}
        onClick={() => { onRecall?.(recalled); setRecalled(null); }}
        title={locale === 'it' ? 'Riapri il pannello' : 'Reopen panel'}
      >
        <span className="recall-chip__arrow">→</span>
        <span className="recall-chip__name">{recalled.title}</span>
      </button>
    );
  }

  const color = CATEGORY_COLORS[event.category];
  const resolvedPos = pos ?? getDefaultPos();

  return (
    <>
      <div
        ref={panelRef}
        className={`info-panel${minimized ? ' info-panel--minimized' : ''}`}
        style={{
          position: 'fixed',
          left: resolvedPos.x,
          top:  resolvedPos.y,
          width: size.w,
          height: minimized ? 38 : size.h,
          zIndex: 25,
        }}
      >

      {/* intestazione — drag handle */}
      <div className="info-panel__header" onMouseDown={onHeaderMouseDown}>
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
          <button
            className="info-panel__icon-btn"
            onClick={() => setMinimized(v => !v)}
            aria-label={minimized ? 'Espandi' : 'Minimizza'}
            title={minimized ? (locale === 'it' ? 'Espandi' : 'Expand') : (locale === 'it' ? 'Minimizza' : 'Minimize')}
          >
            {minimized ? '▲' : '▬'}
          </button>
          <button
            className="info-panel__icon-btn"
            onClick={toggleExpand}
            aria-label={expanded ? 'Riduci' : 'Espandi pannello'}
            title={expanded ? (locale === 'it' ? 'Riduci' : 'Reduce') : (locale === 'it' ? 'Espandi' : 'Expand')}
          >
            {expanded ? '⤡' : '⤢'}
          </button>
          <button
            className="info-panel__icon-btn"
            onClick={() => { setRecalled(event); onClose(); }}
            aria-label="Chiudi"
          >×</button>
        </div>
      </div>

      {/* meta + tabs: nascoste quando minimizzato */}
      {!minimized && <div className={`info-panel__scroll${activeTab === 'chat' ? ' info-panel__scroll--chat' : ''}`}>

        {/* meta */}
        <div className="info-panel__meta">
          <h2 className="info-panel__title">{event.title}</h2>
          <div className="info-panel__year">{formatYear(event.year)}</div>
          <p className="info-panel__desc">{event.description}</p>
        </div>

        {/* tab bar */}
        <div className="info-panel__tabs">
          <button
            className={`info-panel__tab${activeTab === 'info' ? ' info-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('info')}
          >📖 {locale === 'it' ? 'Wikipedia' : 'Wikipedia'}</button>
          <button
            className={`info-panel__tab${activeTab === 'chat' ? ' info-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >💬 {locale === 'it' ? 'Chiedi' : 'Ask'}</button>
          <button
            className={`info-panel__tab${activeTab === 'media' ? ' info-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('media')}
          >🖼 Media</button>
        </div>

        {/* ── Wikipedia tab ── */}
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
              <a href={wikiUrl || `https://it.wikipedia.org/wiki/${event.wikipediaSlug}`} target="_blank" rel="noopener noreferrer" className="info-panel__wiki-btn">
                Apri Wikipedia in una nuova scheda
              </a>
              <span className="info-panel__license">
                Testo da <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia</a>{', '}licenza{' '}
                <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>
              </span>
            </div>
          </>
        )}

        {/* ── Media tab ── */}
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

      </div>}{/* fine info-panel__scroll */}

      {/* ── Chat tab — FUORI dallo scroll per mantenere input sempre visibile ── */}
      {!minimized && activeTab === 'chat' && (
        <div className="ip-chat">
          <div className="ip-chat__messages">
            {chatMsgs.length === 0 && (
              <div className="ip-chat__empty">
                <p className="ip-chat__hint">
                  {locale === 'it'
                    ? `Fai una domanda su "${event.title}" — curiosità, contesto, confronti con altre epoche…`
                    : `Ask anything about "${event.title}" — curiosities, context, comparisons with other eras…`}
                </p>
                <button
                  className="ip-chat__autosuggest"
                  onClick={handleAutoSuggest}
                  disabled={chatBusy}
                >
                  🔗 {locale === 'it' ? 'suggeriscimi relazioni' : 'suggest connections'}
                </button>
              </div>
            )}
            {chatMsgs.map((msg, i) => (
              <div key={i} className={`ip-chat__msg ip-chat__msg--${msg.role}`}>
                <div className="ip-chat__bubble">{msg.content}</div>
                {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="ip-chat__suggestions">
                    <span className="ip-chat__suggestions-label">
                      {locale === 'it' ? '🔗 Naviga le connessioni:' : '🔗 Navigate connections:'}
                    </span>
                    <div className="ip-chat__chips">
                      {msg.suggestions.map((s, si) => {
                        const ev = matchSuggestion(s);
                        const isDb = !ev.id.startsWith('wiki-suggestion-');
                        return (
                          <button
                            key={si}
                            className="ip-chat__chip ip-chat__chip--link"
                            onClick={() => { onSelectEvent?.(ev); setActiveTab('info'); }}
                            title={isDb ? `${ev.title} — ${formatYear(ev.year)}` : `Apri ${s} su Wikipedia`}
                          >{s}</button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {chatBusy && (
              <div className="ip-chat__msg ip-chat__msg--assistant">
                <div className="ip-chat__bubble ip-chat__bubble--loading">
                  <span className="ip-chat__dot" /><span className="ip-chat__dot" /><span className="ip-chat__dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="ip-chat__input-row">
            <input
              className="ip-chat__input"
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSend()}
              placeholder={locale === 'it' ? 'Scrivi una domanda…' : 'Ask a question…'}
              disabled={chatBusy}
            />
            <button
              className="ip-chat__send"
              onClick={handleChatSend}
              disabled={chatBusy || !chatInput.trim()}
              title={locale === 'it' ? 'Invia' : 'Send'}
            >➤</button>
          </div>
        </div>
      )}

      {/* Corner resize handle */}
      {!minimized && (
        <div
          className="info-panel__corner-resize"
          onMouseDown={onCornerMouseDown}
          title="Ridimensiona"
        />
      )}

      </div>
    </>
  );
}
