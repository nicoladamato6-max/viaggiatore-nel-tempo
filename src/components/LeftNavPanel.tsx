import { useState, useMemo } from 'react';
import { type HistoricalEvent, type Locale, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { MACRO_ERAS, SUBCATEGORIES, type Period } from '../data/historicalPeriods';

interface Props {
  open: boolean;
  onClose: () => void;
  events: HistoricalEvent[];
  currentYear: number;
  onSelectEvent: (ev: HistoricalEvent) => void;
  onSelectEra: (period: Period) => void;
  locale: Locale;
  formatYear: (year: number) => string;
}

type Tab = 'cronologia' | 'scopri';

// Sub-eras grouped by parent macro-era (keyed by macro-era name)
function buildSubEraMap(): Map<string, Period[]> {
  const map = new Map<string, Period[]>();
  for (const macro of MACRO_ERAS) {
    const subs = SUBCATEGORIES.filter(sub => sub.start >= macro.start && sub.start < macro.end);
    if (subs.length > 0) map.set(macro.name, subs);
  }
  return map;
}
const SUB_ERA_MAP = buildSubEraMap();

export function LeftNavPanel({ open, onClose, events, currentYear, onSelectEvent, onSelectEra, locale, formatYear }: Props) {
  const [tab, setTab] = useState<Tab>('cronologia');
  const [expandedEras, setExpandedEras] = useState<Set<string>>(new Set());

  // Sorted by proximity to currentYear so visible events near current position come first
  const sortedEvents = useMemo(() =>
    [...events]
      .filter(e => !e.isCosmic)
      .sort((a, b) => Math.abs(a.year - currentYear) - Math.abs(b.year - currentYear))
      .slice(0, 80),
    [events, currentYear]
  );

  const currentEra = useMemo(() =>
    MACRO_ERAS.find(era => currentYear >= era.start && currentYear <= era.end),
    [currentYear]
  );

  function toggleEra(name: string) {
    setExpandedEras(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const groups: { label: string; eras: typeof MACRO_ERAS }[] = [
    {
      label: locale === 'it' ? '🌌 Cosmo & Origini' : '🌌 Cosmos & Origins',
      eras: MACRO_ERAS.filter(e => e.name.startsWith('🌌') || e.name.startsWith('🌍')),
    },
    {
      label: locale === 'it' ? '🦕 Ere Geologiche' : '🦕 Geological Eras',
      eras: MACRO_ERAS.filter(e => e.name.startsWith('🐟') || e.name.startsWith('🦕') || e.name.startsWith('🦎')),
    },
    {
      label: locale === 'it' ? '🦴 Preistoria & Storia' : '🦴 Prehistory & History',
      eras: MACRO_ERAS.filter(e =>
        !e.name.startsWith('🌌') && !e.name.startsWith('🌍') &&
        !e.name.startsWith('🐟') && !e.name.startsWith('🦕') && !e.name.startsWith('🦎')
      ),
    },
  ];

  return (
    <>
      {open && (
        <div
          className="left-nav-panel__overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div className={`left-nav-panel${open ? '' : ' left-nav-panel--closed'}`}>
        {/* Header */}
        <div className="left-nav-panel__header">
          <span className="left-nav-panel__title">
            {locale === 'it' ? 'Navigazione' : 'Navigation'}
          </span>
          <button
            className="left-nav-panel__close-btn"
            onClick={onClose}
            aria-label="Chiudi pannello"
          >✕</button>
        </div>

        {/* Era corrente */}
        {currentEra && (
          <div className="left-nav-panel__current-era">
            <span className="left-nav-panel__era-dot" />
            <span className="left-nav-panel__era-name">{currentEra.name}</span>
            <span className="left-nav-panel__era-year">{formatYear(currentYear)}</span>
          </div>
        )}

        {/* Tab bar */}
        <div className="left-nav-panel__tabs">
          <button
            className={`left-nav-panel__tab${tab === 'cronologia' ? ' left-nav-panel__tab--active' : ''}`}
            onClick={() => setTab('cronologia')}
          >
            {locale === 'it' ? 'Nel periodo' : 'In period'}
          </button>
          <button
            className={`left-nav-panel__tab${tab === 'scopri' ? ' left-nav-panel__tab--active' : ''}`}
            onClick={() => setTab('scopri')}
          >
            {locale === 'it' ? 'Scopri' : 'Discover'}
          </button>
        </div>

        {/* Content */}
        <div className="left-nav-panel__content">

          {/* ── Cronologia: eventi nel periodo, ordinati per prossimità all'anno corrente ── */}
          {tab === 'cronologia' && (
            sortedEvents.length === 0 ? (
              <p className="left-nav-panel__empty">
                {locale === 'it' ? 'Nessun evento visibile nel periodo corrente.' : 'No events visible in the current period.'}
              </p>
            ) : (<>
              <p className="left-nav-panel__hint">
                {locale === 'it'
                  ? `Eventi vicino al ${formatYear(currentYear)}`
                  : `Events near ${formatYear(currentYear)}`}
              </p>
              {sortedEvents.map(ev => {
                const color = CATEGORY_COLORS[ev.category];
                return (
                  <button
                    key={ev.id}
                    className="left-nav-panel__ev-item"
                    onClick={() => { onSelectEvent(ev); onClose(); }}
                  >
                    <span
                      className="left-nav-panel__ev-dot"
                      style={{ background: color }}
                    />
                    <span className="left-nav-panel__ev-body">
                      <span className="left-nav-panel__ev-title">{ev.title}</span>
                      <span className="left-nav-panel__ev-meta">
                        {formatYear(ev.year)} · {CATEGORY_LABELS[ev.category]}
                      </span>
                    </span>
                  </button>
                );
              })}
            </>)
          )}

          {/* ── Scopri: epoche con sotto-epoche espandibili ── */}
          {tab === 'scopri' && groups.map(group => group.eras.length === 0 ? null : (
            <div key={group.label} className="left-nav-panel__era-group">
              <div className="left-nav-panel__era-group-label">{group.label}</div>
              {group.eras.map(era => {
                const subs = SUB_ERA_MAP.get(era.name) ?? [];
                const isExpanded = expandedEras.has(era.name);
                const isActive = currentEra?.name === era.name;
                return (
                  <div key={era.name}>
                    <div className={`left-nav-panel__era-row${isActive ? ' left-nav-panel__era-item--active' : ''}`}>
                      {/* Click sul nome → naviga + apre EraGuide */}
                      <button
                        className="left-nav-panel__era-item"
                        onClick={() => { onSelectEra(era); onClose(); }}
                      >
                        <span className="left-nav-panel__era-item-label">{era.name}</span>
                        <span className="left-nav-panel__era-item-range">
                          {formatYear(era.start)} → {formatYear(era.end)}
                        </span>
                      </button>
                      {/* Freccia → espande/comprime sotto-epoche */}
                      {subs.length > 0 && (
                        <button
                          className="left-nav-panel__era-expand"
                          onClick={() => toggleEra(era.name)}
                          aria-label={isExpanded ? 'Comprimi' : 'Espandi'}
                        >
                          {isExpanded ? '▾' : '▸'}
                        </button>
                      )}
                    </div>

                    {/* Sotto-epoche */}
                    {isExpanded && subs.map(sub => (
                      <button
                        key={sub.name}
                        className={`left-nav-panel__sub-era-item${currentYear >= sub.start && currentYear <= sub.end ? ' left-nav-panel__era-item--active' : ''}`}
                        onClick={() => { onSelectEra(sub); onClose(); }}
                      >
                        <span className="left-nav-panel__sub-era-dot" style={{ background: sub.color }} />
                        <span className="left-nav-panel__era-item-label">{sub.name}</span>
                        <span className="left-nav-panel__era-item-range">
                          {formatYear(sub.start)} → {formatYear(sub.end)}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>
    </>
  );
}
