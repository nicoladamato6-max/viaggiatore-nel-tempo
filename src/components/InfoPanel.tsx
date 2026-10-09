import { useState, useRef, useEffect } from 'react';
import { type HistoricalEvent, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';

const MIN_W     = 280;
const DEFAULT_W = 340;
const maxWidth  = () => window.innerWidth - 80;  // lascia almeno 80 px al globo

// ── Fetch pagina Wikipedia completa via Action API (include TOC) ─────────────
// Usa /w/api.php?action=parse che restituisce HTML identico a Wikipedia.org,
// incluso il sommario (TOC) generato da MediaWiki.
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
  };
}

function useWikiHtml(slug: string | undefined) {
  const [srcdoc,  setSrcdoc]  = useState<string | null>(null);
  const [wikiUrl, setWikiUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) { setSrcdoc(null); setWikiUrl(''); return; }
    let cancelled = false;
    setSrcdoc(null);
    setLoading(true);

    (async () => {
      for (const lang of ['it', 'en']) {
        const page = await fetchWikiPage(slug, lang);
        if (page && !cancelled) {
          setWikiUrl(page.url);
          setSrcdoc(buildDoc(page.html, `https://${lang}.wikipedia.org`));
          break;
        }
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  return { srcdoc, wikiUrl, loading };
}

function buildDoc(body: string, base: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<base href="${base}/">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;padding:0;background:#fff;
    font-family:-apple-system,'Linux Libertine',Georgia,serif;
    font-size:13.5px;line-height:1.7;color:#202122;}
  body{padding:12px 18px 32px;}

  /* Tipografia */
  h1{font-size:1.9em;font-weight:normal;border-bottom:1px solid #a2a9b1;
    padding-bottom:.2em;margin:.6em 0 .4em;}
  h2{font-size:1.3em;font-weight:normal;border-bottom:1px solid #a2a9b1;
    padding-bottom:.1em;margin:1.5em 0 .5em;}
  h3{font-size:1.07em;margin:1.2em 0 .4em;}
  h4,h5{font-size:1em;margin:.9em 0 .3em;}
  p{margin:.5em 0;}
  a{color:#3366cc;text-decoration:none;}
  a:hover{text-decoration:underline;}

  /* Immagini e figure */
  img{max-width:100%;height:auto;}
  .thumb{float:right;clear:right;margin:0 0 12px 14px;
    background:#f8f9fa;border:1px solid #a2a9b1;padding:4px;}
  .thumb img{display:block;}
  .thumbcaption{font-size:.8em;color:#54595d;margin-top:4px;text-align:center;}
  .thumbinner{font-size:.9em;}

  /* Infobox */
  .infobox{float:right;clear:right;margin:0 0 12px 16px;
    background:#f8f9fa;border:1px solid #a2a9b1;font-size:.85em;
    padding:4px;max-width:280px;}
  .infobox td,.infobox th{padding:3px 6px;vertical-align:top;}
  .infobox-title,.infobox-header{background:#cee0f2;text-align:center;
    font-weight:bold;padding:5px;}

  /* Tabelle */
  table{border-collapse:collapse;margin:1em 0;font-size:.9em;max-width:100%;}
  td,th{padding:4px 8px;border:1px solid #a2a9b1;vertical-align:top;}
  th{background:#eaecf0;font-weight:600;}
  tr:nth-child(even) td{background:#f8f9fa;}

  /* Sommario (TOC) */
  #toc,.toc{
    background:#f8f9fa;border:1px solid #a2a9b1;
    padding:8px 14px 10px;display:table;
    margin:0 0 18px 0;font-size:.9em;min-width:180px;}
  .toctitle h2{font-size:1em;border:none;margin:0 0 5px;padding:0;font-weight:bold;}
  .toctogglespan{display:none;}
  #toc ul,.toc ul{margin:0;padding-left:20px;list-style:decimal;}
  #toc li,.toc li{margin:2px 0;}
  #toc a,.toc a{color:#3366cc;}

  /* Nascondi elementi non utili */
  .mw-editsection,.mw-jump-link,.mw-references-wrap .reflist,
  .navbox,.ambox,.sistersitebox,.noprint,
  .mw-cite-backlink{display:none!important;}

  /* Note e riferimenti */
  sup.reference{font-size:.75em;}
  ol.references{font-size:.85em;color:#555;}
</style>
</head>
<body>${body}</body>
</html>`;
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
  const panelRef  = useRef<HTMLDivElement>(null);
  const dragging  = useRef(false);
  const startX    = useRef(0);
  const startW    = useRef(0);

  const { srcdoc, wikiUrl, loading } = useWikiHtml(event?.wikipediaSlug);

  // ── resize handle ────────────────────────────────────────────────────────
  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = panelRef.current?.offsetWidth ?? width;

    document.body.style.cursor    = 'col-resize';
    document.body.style.userSelect = 'none';

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      // trascinando a sinistra → pannello cresce
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

  // Doppio clic sul handle → torna alla larghezza di default
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
          <p>Clicca su un evento o un corpo celeste per esplorarlo</p>
        </div>
      </div>
    );
  }

  const color = CATEGORY_COLORS[event.category];

  return (
    <div ref={panelRef} className="info-panel" style={{ width }}>

      {/* ── resize handle (bordo sinistro trascinabile) ── */}
      <div
        className="info-panel__resize-handle"
        onMouseDown={onHandleMouseDown}
        onDoubleClick={onHandleDblClick}
        title="Trascina per ridimensionare · doppio clic per resettare"
      />

      {/* ── intestazione ── */}
      <div className="info-panel__header">
        <span
          className="category-badge"
          style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
        >
          {CATEGORY_LABELS[event.category]}
        </span>
        <button className="info-panel__icon-btn" onClick={onClose} aria-label="Chiudi" title="Chiudi">×</button>
      </div>

      {/* ── dati evento ── */}
      <div className="info-panel__meta">
        <h2 className="info-panel__title">{event.title}</h2>
        <div className="info-panel__year">{formatYear(event.year)}</div>
        <p className="info-panel__desc">{event.description}</p>
      </div>

      {/* ── separatore ── */}
      <div className="info-panel__divider"><span>Wikipedia</span></div>

      {/* ── iframe Wikipedia ── */}
      <div className="info-panel__frame-wrap">
        {loading && (
          <div className="info-panel__loading">
            <span className="info-panel__spinner" /> Caricamento Wikipedia…
          </div>
        )}
        {!loading && srcdoc && (
          <iframe
            srcDoc={srcdoc}
            className="info-panel__wiki-frame"
            title={`Wikipedia: ${event.title}`}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        )}
        {!loading && !srcdoc && (
          <p style={{ fontSize: '0.72rem', color: '#44445a', padding: '12px 14px' }}>
            Articolo Wikipedia non disponibile.
          </p>
        )}
      </div>

      {/* ── footer ── */}
      <div className="info-panel__footer">
        <a
          href={wikiUrl || `https://it.wikipedia.org/wiki/${event.wikipediaSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="info-panel__wiki-btn"
        >
          📖 Apri Wikipedia in una nuova scheda →
        </a>
      </div>
    </div>
  );
}
