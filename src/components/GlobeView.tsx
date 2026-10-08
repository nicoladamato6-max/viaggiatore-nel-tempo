import { useRef, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { HistoricalEvent, CATEGORY_COLORS } from '../types';

interface Props {
  events: HistoricalEvent[];
  currentYear: number;
  onEventClick: (event: HistoricalEvent) => void;
}

export function GlobeView({ events, currentYear, onEventClick }: Props) {
  const globeRef = useRef<any>(null);

  // Solo eventi con coordinate geografiche (esclude eventi cosmici)
  const earthEvents = events.filter(e => !e.isCosmic && e.lat != null && e.lng != null);
  const isCosmicView = currentYear < -4_000_000_000;

  const handlePointClick = useCallback((point: object) => {
    const event = point as HistoricalEvent;
    onEventClick(event);
  }, [onEventClick]);

  const pointLabel = useCallback((point: object) => {
    const e = point as HistoricalEvent;
    return `<div class="globe-tooltip"><strong>${e.title}</strong></div>`;
  }, []);

  const pointColor = useCallback((point: object) => {
    const e = point as HistoricalEvent;
    return CATEGORY_COLORS[e.category] ?? '#ffffff';
  }, []);

  if (isCosmicView) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0d0d2b 0%, #000005 100%)',
        gap: 20,
        cursor: 'default',
      }}>
        <CosmicBackground />
        {events.filter(e => e.isCosmic).map(e => (
          <button
            key={e.id}
            onClick={() => onEventClick(e)}
            style={{
              background: 'rgba(26, 188, 156, 0.15)',
              border: '1px solid rgba(26, 188, 156, 0.5)',
              borderRadius: 12,
              padding: '10px 20px',
              color: '#e8e8f0',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26, 188, 156, 0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(26, 188, 156, 0.15)')}
          >
            ✦ {e.title}
          </button>
        ))}
      </div>
    );
  }

  return (
    <Globe
      ref={globeRef}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={earthEvents}
      pointLat={(d: object) => (d as HistoricalEvent).lat ?? 0}
      pointLng={(d: object) => (d as HistoricalEvent).lng ?? 0}
      pointColor={pointColor}
      pointAltitude={0.02}
      pointRadius={0.6}
      pointLabel={pointLabel}
      onPointClick={handlePointClick}
      width={undefined}
      height={undefined}
      atmosphereColor="#4488ff"
      atmosphereAltitude={0.15}
    />
  );
}

function CosmicBackground() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
  }));

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {stars.map(s => (
        <circle
          key={s.id}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.size}
          fill="white"
          opacity={s.opacity}
        />
      ))}
      <circle cx="50%" cy="50%" r="8" fill="#ffd166" opacity={0.9} />
      <circle cx="50%" cy="50%" r="30" fill="none" stroke="#ffd16640" strokeWidth="1" />
      <circle cx="50%" cy="50%" r="60" fill="none" stroke="#ffd16620" strokeWidth="1" />
    </svg>
  );
}
