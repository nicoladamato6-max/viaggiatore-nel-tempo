import { useState, useMemo } from 'react';
import { type HistoricalEvent, type Locale, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { MACRO_ERAS, type Period } from '../data/historicalPeriods';

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

export function LeftNavPanel({ open, onClose, events, currentYear, onSelectEvent, onSelectEra, locale, formatYear }: Props) {
  const [tab, setTab] = useState<Tab>('cronologia');

  const sortedEvents = useMemo(() =>
    [...events]
      .filter(e => !e.isCosmic)
      .sort((a, b) => a.year - b.year)
      .slice(0, 80),
    [events]
  );

  const currentEra = useMemo(() =>
    MACRO_ERAS.find(era => currentYear >= era.start && currentYear <= era.end),
    [currentYear]
  );

  return (
    <>
      {/* Overlay per chiudere il pannello */}
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
            {locale === 'it' ? 'Cronologia' : 'Timeline'}
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

          {tab === 'cronologia' && (
            sortedEvents.length === 0 ? (
              <p className="left-nav-panel__empty">
                {locale === 'it' ? 'Nessun evento visibile nel periodo corrente.' : 'No events visible in the current period.'}
              </p>
            ) : (
              sortedEvents.map(ev => {
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
              })
            )
          )}

          {tab === 'scopri' && (
            MACRO_ERAS.map(era => (
              <button
                key={era.name}
                className={`left-nav-panel__era-item${currentEra?.name === era.name ? ' left-nav-panel__era-item--active' : ''}`}
                onClick={() => { onSelectEra(era); onClose(); }}
              >
                <span className="left-nav-panel__era-item-label">{era.name}</span>
                <span className="left-nav-panel__era-item-range">
                  {formatYear(era.start)} → {formatYear(era.end)}
                </span>
              </button>
            ))
          )}

        </div>
      </div>
    </>
  );
}
