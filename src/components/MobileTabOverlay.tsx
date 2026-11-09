import { useState } from 'react';
import {
  type HistoricalEvent,
  type WikiSearchResult,
} from '../types';
import { type Period, MACRO_ERAS, SUBCATEGORIES } from '../data/historicalPeriods';
import { SearchBar } from './SearchBar';
import './MobileTabOverlay.css';

export type MobileTabId = 'tm' | 'cerca' | 'ai' | 'altro';

function SpeedBtn({ code, label, title: t, onDown, onUp }: {
  code: string; label: string; title?: string;
  onDown?: () => void; onUp?: () => void;
}) {
  const kdown = (c: string) => window.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true }));
  const kup   = (c: string) => window.dispatchEvent(new KeyboardEvent('keyup',   { code: c, bubbles: true }));
  return (
    <button
      className="mtab__speed-btn"
      title={t}
      onPointerDown={e => { e.preventDefault(); kdown(code); onDown?.(); }}
      onPointerUp={() => { kup(code); onUp?.(); }}
      onPointerLeave={() => { kup(code); onUp?.(); }}
    >
      {label}
    </button>
  );
}

interface Props {
  tab: MobileTabId;
  onClose: () => void;
  locale: 'it' | 'en';
  sliderValue: number;
  onSliderChange: (v: number) => void;
  currentYear: number;
  formatYear: (y: number) => string;
  getEra: (y: number) => { label: string; color: string };
  yearToSlider: (year: number) => number;
  onThrustStart?: () => void;
  onThrustEnd?: () => void;
  events: HistoricalEvent[];
  onSearch: (ev: HistoricalEvent) => void;
  onWikiSelect?: (r: WikiSearchResult) => void;
  onEpochSelect?: (p: Period) => void;
  showTerritories: boolean;
  onToggleTerritories: () => void;
  showHoloOverlays?: boolean;
  onToggleHoloOverlays?: () => void;
  onLocaleToggle: () => void;
  user: { email: string; role: string } | null;
  onAuthClick: () => void;
}

export function MobileTabOverlay(props: Props) {
  const {
    tab, onClose, locale,
    sliderValue, onSliderChange, currentYear, formatYear, getEra, yearToSlider,
    onThrustStart, onThrustEnd,
    events, onSearch, onWikiSelect, onEpochSelect,
    showTerritories, onToggleTerritories,
    showHoloOverlays, onToggleHoloOverlays,
    onLocaleToggle, user, onAuthClick,
  } = props;

  const [sliderDragging, setSliderDragging] = useState(false);
  const era = getEra(currentYear);

  if (tab === 'altro') {
    return (
      <div className="mtab-altro__backdrop" onClick={onClose}>
        <div className="mtab-altro" onClick={e => e.stopPropagation()}>
          <div className="mtab-altro__grip" />
          <div className="mtab-altro__row">
            <button
              className={`mtab-altro__btn${showTerritories ? ' mtab-altro__btn--on' : ''}`}
              onClick={onToggleTerritories}
            >
              <span className="mtab-altro__icon">🌐</span>
              <span className="mtab-altro__lbl">MAP</span>
            </button>
            {onToggleHoloOverlays && (
              <button
                className={`mtab-altro__btn${showHoloOverlays ? ' mtab-altro__btn--on' : ''}`}
                onClick={onToggleHoloOverlays}
              >
                <span className="mtab-altro__icon">◎</span>
                <span className="mtab-altro__lbl">HUD</span>
              </button>
            )}
            <button className="mtab-altro__btn" onClick={onLocaleToggle}>
              <span className="mtab-altro__icon">{locale === 'it' ? 'IT' : 'EN'}</span>
              <span className="mtab-altro__lbl">LANG</span>
            </button>
            <button className="mtab-altro__btn" onClick={() => { onAuthClick(); onClose(); }}>
              <span className="mtab-altro__icon">{user ? '●' : '○'}</span>
              <span className="mtab-altro__lbl">{user ? 'ACC' : 'LOG'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const titles: Record<string, string> = {
    tm:    locale === 'it' ? 'Macchina del Tempo' : 'Time Machine',
    cerca: locale === 'it' ? 'Cerca' : 'Search',
  };

  return (
    <div className="mtab">
      <div className="mtab__hdr">
        <button className="mtab__back" onClick={onClose}>← Globo</button>
        <span className="mtab__title">{titles[tab] ?? tab}</span>
      </div>

      <div className="mtab__body">
        {tab === 'tm' && (
          <div className="mtab__tm">
            <div className="mtab__year" style={{ color: era.color }}>
              {formatYear(currentYear)}
            </div>
            <div className="mtab__era-name" style={{ color: era.color }}>
              {era.label}
            </div>

            <div className="mtab__era-chips">
              {MACRO_ERAS.map(e => {
                const fromS = Math.max(0, Math.min(1000, yearToSlider(e.start)));
                const toS   = Math.max(0, Math.min(1000, yearToSlider(e.end)));
                const active = sliderValue >= fromS && sliderValue < toS;
                return (
                  <button
                    key={e.name}
                    className={`mtab__era-chip${active ? ' mtab__era-chip--on' : ''}`}
                    style={{ '--chip-color': e.color } as React.CSSProperties}
                    onClick={() => onSliderChange(Math.round((fromS + toS) / 2))}
                  >
                    {e.name}
                  </button>
                );
              })}
            </div>

            <div className="mtab__slider-wrap">
              {sliderDragging && (
                <div className="mtab__era-overlay">
                  <div className="mtab__era-macro-row">
                    {MACRO_ERAS.map(e => {
                      const fromS = Math.max(0, Math.min(1000, yearToSlider(e.start)));
                      const toS   = Math.max(0, Math.min(1000, yearToSlider(e.end)));
                      const active = sliderValue >= fromS && sliderValue < toS;
                      return (
                        <div
                          key={e.name}
                          className={`mtab__era-seg${active ? ' mtab__era-seg--on' : ''}`}
                          style={{ left: `${fromS / 10}%`, width: `${Math.max(0.5, (toS - fromS) / 10)}%`, '--seg-color': e.color } as React.CSSProperties}
                        >
                          <span className="mtab__era-seg-lbl">{e.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <input
                className="mtab__slider"
                type="range"
                min={0}
                max={1000}
                value={sliderValue}
                style={{ '--val': sliderValue } as React.CSSProperties}
                onChange={e => onSliderChange(Number(e.target.value))}
                onTouchStart={() => setSliderDragging(true)}
                onTouchEnd={() => setSliderDragging(false)}
                onMouseDown={() => setSliderDragging(true)}
                onMouseUp={() => setSliderDragging(false)}
              />
              <div className="mtab__slider-labels">
                <span>13.8 Mld a.C.</span>
                <span>OGGI</span>
              </div>
            </div>

            <div className="mtab__speed-row">
              <SpeedBtn code="HyperBack" label="⏪ Iper-rev" title="Iper-rev" onDown={onThrustStart} onUp={onThrustEnd} />
              <SpeedBtn code="KeyS"      label="◀ Retro"    title="Retro" />
              <SpeedBtn code="KeyW"      label="Avanti ▶"   title="Avanti" onDown={onThrustStart} onUp={onThrustEnd} />
              <SpeedBtn code="HyperFwd"  label="Iper ⏩"    title="Iper" onDown={onThrustStart} onUp={onThrustEnd} />
            </div>
          </div>
        )}

        {tab === 'cerca' && (
          <div className="mtab__cerca">
            <SearchBar
              events={events}
              onSelect={(ev) => { onSearch(ev); onClose(); }}
              onWikiSelect={onWikiSelect ?? (() => {})}
              onEpochSelect={onEpochSelect}
              epochs={SUBCATEGORIES}
              locale={locale}
            />
          </div>
        )}
      </div>
    </div>
  );
}
