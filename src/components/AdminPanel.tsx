import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { type Locale } from '../types';

interface Props {
  locale:           Locale;
  open:             boolean;
  setOpen:          (v: boolean) => void;
  wikidataCount:    number;
  staticCount:      number;
  staticBreakdown:  Record<string, number>;
  onEventsRefreshed: (events: unknown[]) => void;
}

interface ApiStatus {
  count:             number;
  lastRefresh:       number | null;
  categoryBreakdown: Record<string, number>;
}

const CAT_ICONS: Record<string, string> = {
  storia: '⚔️', arte: '🎨', scienza: '🔬',
  musica: '🎵', geologia: '🌋', cosmo: '🌌',
};
const CAT_IT: Record<string, string> = {
  storia: 'Storia', arte: 'Arte', scienza: 'Scienza',
  musica: 'Musica', geologia: 'Geologia', cosmo: 'Cosmo',
};
const CAT_EN: Record<string, string> = {
  storia: 'History', arte: 'Art', scienza: 'Science',
  musica: 'Music', geologia: 'Geology', cosmo: 'Cosmos',
};

export function AdminPanel({ locale, open, setOpen, wikidataCount, staticCount, staticBreakdown, onEventsRefreshed }: Props) {
  const { token, user, logout } = useAuth();
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg,      setMsg]      = useState('');
  const [apiInfo,  setApiInfo]  = useState<ApiStatus | null>(null);

  const it = locale === 'it';
  const catLabel = it ? CAT_IT : CAT_EN;

  useEffect(() => {
    if (!open) return;
    fetch('/api/events')
      .then(r => r.json())
      .then((d: { count?: number; lastRefresh?: number; events?: Array<{ category?: string }> }) => {
        const breakdown: Record<string, number> = {};
        for (const e of d.events ?? []) {
          if (e.category) breakdown[e.category] = (breakdown[e.category] ?? 0) + 1;
        }
        setApiInfo({ count: d.count ?? 0, lastRefresh: d.lastRefresh ?? null, categoryBreakdown: breakdown });
      })
      .catch(() => setApiInfo(null));
  }, [open]);

  // Recompute wikidata breakdown from apiInfo when available; fall back to wikidataCount
  const wdBreakdown = useMemo(() => apiInfo?.categoryBreakdown ?? {}, [apiInfo]);
  const wdTotal     = apiInfo?.count ?? wikidataCount;
  const total       = staticCount + wdTotal;

  async function handleRefresh() {
    if (!token) return;
    setStatus('loading');
    setMsg(it ? '▸ Pipeline Wikidata avviata…' : '▸ Wikidata pipeline started…');

    try {
      const res  = await fetch('/api/refresh', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { message?: string; error?: string };

      if (!res.ok) {
        setStatus('error');
        setMsg(`✗ ${data.error ?? 'Errore'}`);
        return;
      }

      setStatus('success');
      setMsg(it
        ? '⚡ Refresh avviato — gli eventi Wikidata saranno disponibili tra circa 30 secondi'
        : '⚡ Refresh started — Wikidata events will be available in ~30 seconds');

      setTimeout(async () => {
        try {
          const r = await fetch('/api/events');
          const d = await r.json() as { events?: unknown[]; count?: number; lastRefresh?: number; events_typed?: Array<{ category?: string }> };
          if (d.events && d.events.length > 0) {
            onEventsRefreshed(d.events);
            const breakdown: Record<string, number> = {};
            for (const e of (d.events as Array<{ category?: string }>)) {
              if (e.category) breakdown[e.category] = (breakdown[e.category] ?? 0) + 1;
            }
            setApiInfo({ count: d.count ?? d.events.length, lastRefresh: d.lastRefresh ?? null, categoryBreakdown: breakdown });
            setMsg(it
              ? `✦ ${d.events.length} eventi da Wikidata caricati sulla mappa`
              : `✦ ${d.events.length} Wikidata events loaded on the map`);
          }
        } catch { /* silent */ }
      }, 35_000);

    } catch {
      setStatus('error');
      setMsg(it ? '✗ Errore di rete' : '✗ Network error');
    }
  }

  function fmtDate(ts: number | null): string {
    if (!ts) return it ? 'Mai' : 'Never';
    return new Date(ts).toLocaleString(it ? 'it-IT' : 'en-US');
  }

  if (!user || user.role !== 'admin') return null;
  if (!open) return null;

  const STATIC_CATS = ['storia', 'arte', 'scienza', 'musica', 'geologia', 'cosmo'];

  return (
    <div className="admin-overlay" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="admin-console">

        <div className="admin-header">
          <div className="admin-title">
            {it ? 'PANNELLO AMMINISTRATORE' : 'ADMINISTRATOR PANEL'}
          </div>
          <button className="admin-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="admin-subtitle">— {user.email} · ADMIN —</div>

        <div className="admin-body">

          {/* ── Sezione eventi statici ── */}
          <div className="admin-stats-section">
            <div className="admin-stats-section__header">
              <span className="admin-stats-section__title">
                {it ? 'EVENTI STATICI' : 'STATIC EVENTS'}
              </span>
              <span className="admin-stats-section__count">{staticCount}</span>
            </div>
            <div className="admin-stats-section__ts">
              {it ? 'Incorporati nella build' : 'Bundled in build'}
            </div>
            <div className="admin-category-pills">
              {STATIC_CATS.map(cat => (
                <span key={cat} className="admin-category-pill">
                  {CAT_ICONS[cat]} {catLabel[cat]}: {staticBreakdown[cat] ?? 0}
                </span>
              ))}
            </div>
          </div>

          {/* ── Sezione eventi Wikidata ── */}
          <div className="admin-stats-section">
            <div className="admin-stats-section__header">
              <span className="admin-stats-section__title">
                {it ? 'EVENTI WIKIDATA' : 'WIKIDATA EVENTS'}
              </span>
              <span className="admin-stats-section__count">{wdTotal}</span>
            </div>
            <div className="admin-stats-section__ts">
              {it ? 'Ultimo aggiornamento: ' : 'Last refresh: '}
              <strong>{fmtDate(apiInfo?.lastRefresh ?? null)}</strong>
            </div>
            {wdTotal > 0 && (
              <div className="admin-category-pills">
                {['storia', 'geologia', 'scienza'].map(cat => (
                  wdBreakdown[cat] ? (
                    <span key={cat} className="admin-category-pill">
                      {CAT_ICONS[cat]} {catLabel[cat]}: {wdBreakdown[cat]}
                    </span>
                  ) : null
                ))}
              </div>
            )}
          </div>

          {/* ── Totale ── */}
          <div className="admin-stats-section admin-stats-section--total">
            <div className="admin-stats-section__header">
              <span className="admin-stats-section__title">
                {it ? 'TOTALE SULLA MAPPA' : 'TOTAL ON MAP'}
              </span>
              <span className="admin-stats-section__count admin-stats-section__count--total">
                {total}
              </span>
            </div>
          </div>

          {/* Log */}
          {msg && (
            <div className={`admin-msg admin-msg--${status}`}>{msg}</div>
          )}

          {/* Refresh button */}
          <button
            className={`admin-refresh-btn${status === 'loading' ? ' admin-refresh-btn--loading' : ''}${status === 'success' ? ' admin-refresh-btn--done' : ''}`}
            onClick={handleRefresh}
            disabled={status === 'loading'}
          >
            {status === 'loading'
              ? (it ? '◌ PIPELINE IN ESECUZIONE…' : '◌ PIPELINE RUNNING…')
              : (it ? '⟳ AGGIORNA DA WIKIDATA' : '⟳ REFRESH FROM WIKIDATA')}
          </button>

          <div className="admin-note">
            {it
              ? 'Recupera battaglie, disastri e scoperte scientifiche geocodificate da Wikidata e li aggiunge alla mappa.'
              : 'Fetches geocoded battles, disasters and scientific discoveries from Wikidata and adds them to the map.'}
          </div>

          {/* Logout */}
          <button className="admin-logout" onClick={() => { logout(); setOpen(false); }}>
            {it ? '⏏ Esci dall\'account' : '⏏ Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
