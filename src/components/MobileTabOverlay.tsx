import { useState } from 'react';
import {
  type HistoricalEvent,
  type WikiSearchResult,
} from '../types';
import { type Period, SUBCATEGORIES, getCurrentMacroEra, getActivePeriods, assignLanes } from '../data/historicalPeriods';
import { SearchBar } from './SearchBar';
import './MobileTabOverlay.css';

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

export type MobileTabId = 'tm' | 'cerca' | 'ai' | 'altro';

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
  velOpen: boolean;
  onToggleVel: () => void;
  onOpenEraGuide: (p: Period) => void;
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
    velOpen, onToggleVel, onOpenEraGuide,
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
            <button
              className={`mtab-altro__btn${velOpen ? ' mtab-altro__btn--on' : ''}`}
              onClick={onToggleVel}
            >
              <span className="mtab-altro__icon">⚡</span>
              <span className="mtab-altro__lbl">VEL.</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mtab">
      <div className="mtab__hdr">
        <button className="mtab__back" onClick={onClose}>← Torna Indietro</button>
      </div>

      <div className="mtab__body">
        {tab === 'tm' && (
          <div className="mtab__tm">
            <div className="mtab__year" style={{ color: era.color }}>
              {formatYear(currentYear)}
            </div>

            <button
              className="mtab__era-tag"
              style={{ '--chip-color': era.color } as React.CSSProperties}
              onClick={() => onOpenEraGuide(getCurrentMacroEra(currentYear))}
            >
              {era.label}
            </button>

            {/* Sub-era bars per anno corrente */}
            {(() => {
              const active = getActivePeriods(currentYear);
              if (active.length === 0) return null;
              const laned = assignLanes(active);
              const maxLane = Math.max(...laned.map(x => x.lane));
              const macroEra = getCurrentMacroEra(currentYear);
              const fromS = Math.max(0, Math.min(1000, yearToSlider(macroEra.start)));
              const toS = Math.max(0, Math.min(1000, yearToSlider(macroEra.end)));
              const range = Math.max(1, toS - fromS);
              return (
                <div className="mtab__subbars" style={{ height: `${(maxLane + 1) * 28 + 4}px` }}>
                  {laned.map(({ period: p, lane }) => {
                    const pFrom = Math.max(fromS, Math.min(1000, yearToSlider(p.start)));
                    const pTo = Math.max(fromS, Math.min(1000, yearToSlider(p.end)));
                    const leftPct = (pFrom - fromS) / range * 100;
                    const widthPct = Math.max(1, (pTo - pFrom) / range * 100);
                    return (
                      <button
                        key={p.name}
                        className="mtab__subbar"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: `${lane * 28}px`,
                          '--bar-color': p.color,
                        } as React.CSSProperties}
                        onClick={() => onOpenEraGuide(p)}
                        title={p.name}
                      >
                        <span className="mtab__subbar-lbl">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            <div className="mtab__slider-wrap">
              {sliderDragging && (
                <div className="mtab__era-overlay">
                  <div className="mtab__era-macro-row">
                    {[getCurrentMacroEra(currentYear)].map(e => {
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
          </div>
        )}

        {tab === 'cerca' && (
          <div className="mtab__cerca">
            <SearchBar
              events={events}
              onSelect={(ev) => { onSearch(ev); onClose(); }}
              onWikiSelect={(r) => { onWikiSelect?.(r); onClose(); }}
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

// Re-export SpeedBtn for use in App.tsx velocity widget
export { SpeedBtn };
