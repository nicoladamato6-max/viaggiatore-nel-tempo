import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { type Locale } from '../types';

interface Props {
  locale:           Locale;
  wikidataCount:    number;
  staticCount:      number;
  onEventsRefreshed: (events: unknown[]) => void;
}

interface ApiStatus {
  count:       number;
  lastRefresh: number | null;
}

export function AdminPanel({ locale, wikidataCount, staticCount, onEventsRefreshed }: Props) {
  const { token, user, logout } = useAuth();
  const [open,     setOpen]     = useState(false);
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg,      setMsg]      = useState('');
  const [apiInfo,  setApiInfo]  = useState<ApiStatus | null>(null);

  const it = locale === 'it';

  // Load current API cache info
  useEffect(() => {
    if (!open) return;
    fetch('/api/events')
      .then(r => r.json())
      .then((d: { count?: number; lastRefresh?: number }) => {
        setApiInfo({ count: d.count ?? 0, lastRefresh: d.lastRefresh ?? null });
      })
      .catch(() => setApiInfo(null));
  }, [open]);

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

      // After 35 seconds, poll for new events
      setTimeout(async () => {
        try {
          const r = await fetch('/api/events');
          const d = await r.json() as { events?: unknown[]; count?: number; lastRefresh?: number };
          if (d.events && d.events.length > 0) {
            onEventsRefreshed(d.events);
            setApiInfo({ count: d.count ?? d.events.length, lastRefresh: d.lastRefresh ?? null });
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

  return (
    <>
      {/* Floating trigger */}
      <button
        className="admin-trigger"
        onClick={() => setOpen(v => !v)}
        title={it ? 'Pannello Amministratore' : 'Admin Panel'}
      >
        ⚙️
      </button>

      {/* Overlay */}
      {open && (
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

              {/* Stats */}
              <div className="admin-stats">
                <div className="admin-stat">
                  <span className="admin-stat__label">{it ? 'EVENTI BASE' : 'BASE EVENTS'}</span>
                  <span className="admin-stat__value">{staticCount}</span>
                </div>
                <div className="admin-stat">
                  <span className="admin-stat__label">{it ? 'DA WIKIDATA' : 'FROM WIKIDATA'}</span>
                  <span className="admin-stat__value">{wikidataCount > 0 ? wikidataCount : (apiInfo?.count ?? 0)}</span>
                </div>
                <div className="admin-stat admin-stat--wide">
                  <span className="admin-stat__label">{it ? 'ULTIMO REFRESH' : 'LAST REFRESH'}</span>
                  <span className="admin-stat__value admin-stat__value--small">
                    {fmtDate(apiInfo?.lastRefresh ?? null)}
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
      )}
    </>
  );
}
