// Renderer Three.js per la modalità cosmica — sostituisce Cesium quando isCosmicView=true.
// Fornisce navigazione free-flight, stelle/Via Lattea, pianeti con textures procedurali.
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { type HistoricalEvent, type Locale, type FlyTarget, CATEGORY_COLORS } from '../types';
import { PLANETS, getMoonPosition, getPlanetPosition, toPlanetCard } from '../utils/celestialMechanics';

// ── Scale ────────────────────────────────────────────────────────────────────
const AU      = 149_597_870_700;   // metri per 1 UA
const M_TO_AU = 1 / AU;

// ── Zone cosmiche (in UA) ───────────────────────────────────────────────────
const ZONES = [
  { max: 2e7  * M_TO_AU, it: '🌍 Orbita terrestre',       en: '🌍 Earth orbit'        },
  { max: 5e8  * M_TO_AU, it: '🌕 Sistema Terra-Luna',     en: '🌕 Earth–Moon system'  },
  { max: 4e11 * M_TO_AU, it: '☀️ Sistema Solare interno', en: '☀️ Inner Solar System' },
  { max: 7e12 * M_TO_AU, it: '🪐 Sistema Solare esterno', en: '🪐 Outer Solar System' },
  { max: 2e13 * M_TO_AU, it: '❄️ Fascia di Kuiper',       en: '❄️ Kuiper Belt'        },
  { max: Infinity,        it: '⭐ Spazio interstellare',   en: '⭐ Interstellar space'  },
] as const;

function getZone(distAU: number, locale: Locale): string {
  const z = ZONES.find(z => distAU < z.max) ?? ZONES[ZONES.length - 1];
  return locale === 'en' ? z.en : z.it;
}

function fmtDist(au: number): string {
  const m = au * AU;
  if (m >= AU)         return `${au.toFixed(2)} UA`;
  if (m >= 1_000_000)  return `${Math.round(m / 1000).toLocaleString('it-IT')} km`;
  if (m >= 1_000)      return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

// ── Posizioni fisse ─────────────────────────────────────────────────────────
const SUN_DIST = 149_600_000_000;
const SUN_POS: [number, number, number] = [
  SUN_DIST * 0.940 * M_TO_AU,
  SUN_DIST * 0.342 * M_TO_AU,
  0,
];

const SCALE_JUMPS = [
  { icon: '🌍', label: 'Terra',    labelEn: 'Earth',   altM: 1.5e7  },
  { icon: '🌕', label: 'Luna',     labelEn: 'Moon',    altM: 4e8    },
  { icon: '☀️', label: 'Sole',    labelEn: 'Sun',     altM: 1.6e11 },
  { icon: '🪐', label: 'Saturno', labelEn: 'Saturn',  altM: 1.5e12 },
  { icon: '❄️', label: 'Kuiper',  labelEn: 'Kuiper',  altM: 6.5e12 },
] as const;

// ── Sizing ──────────────────────────────────────────────────────────────────
const SUN_VR  = 0.065;   // UA visive
const MOON_VR = 0.004;   // UA visive
function getVisualRadius(radiusM: number): number {
  return Math.max(0.004, radiusM * M_TO_AU * 60);
}

// ── Cards per InfoPanel ─────────────────────────────────────────────────────
const SUN_CARD: HistoricalEvent = {
  id: 'sole-body', title: 'Il Sole', year: -4_600_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'La stella al centro del Sistema Solare, distante 149,6 milioni di km dalla Terra (1 UA). La luce impiega 8 minuti a raggiungerci. Contiene il 99,8% della massa del Sistema Solare.',
  wikipediaSlug: 'Sun',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/240px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
};
const MOON_CARD: HistoricalEvent = {
  id: 'luna-body', title: 'La Luna', year: -4_500_000_000,
  category: 'cosmo', isCosmic: true,
  description: "Il satellite naturale della Terra a ~384.400 km. Formatasi ~4,5 miliardi di anni fa dall'impatto di Theia. L'Apollo 11 vi allunò il 20 luglio 1969.",
  wikipediaSlug: 'Moon',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/240px-FullMoon2010.jpg',
};

// ── Disco della Via Lattea (particelle) ────────────────────────────────────
function MilkyWayDisk() {
  const geo = useMemo(() => {
    const N   = 80_000;
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i < N; i++) {
      const phi   = (Math.random() - 0.5) * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const r     = 800 + Math.random() * 300;
      pos.push(r * Math.cos(phi) * Math.cos(theta), r * Math.sin(phi), r * Math.cos(phi) * Math.sin(theta));
      const t = Math.random();
      if (t < 0.55)      col.push(0.85, 0.88, 1.0);
      else if (t < 0.80) col.push(1.0,  0.95, 0.78);
      else               col.push(0.7,  0.82, 1.0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);

  return (
    <points geometry={geo} rotation={[0.48, 0, 0.28]}>
      <pointsMaterial size={1.1} sizeAttenuation={false} vertexColors transparent opacity={0.5} />
    </points>
  );
}

// ── CameraRig (dentro Canvas) ─────────────────────────────────────────────
interface CameraRigProps {
  navKeysRef:    React.RefObject<Set<string>>;
  yawRef:        React.RefObject<number>;
  pitchRef:      React.RefObject<number>;
  jumpRef:       React.RefObject<THREE.Vector3 | null>;
  cameraPosRef:  React.RefObject<THREE.Vector3>;
  hudAltRef:     React.RefObject<HTMLSpanElement | null>;
  hudZoneRef:    React.RefObject<HTMLSpanElement | null>;
  locale:        Locale;
}

function CameraRig({ navKeysRef, yawRef, pitchRef, jumpRef, cameraPosRef, hudAltRef, hudZoneRef, locale }: CameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    camera.position.set(0, 0.05, 0);
  }, [camera]);

  useFrame(() => {
    const dist  = camera.position.length();
    const speed = Math.max(4e-7, dist * 0.004);

    camera.rotation.y = yawRef.current!;
    camera.rotation.x = pitchRef.current!;

    const dir   = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation).normalize();
    const right  = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);

    const keys  = navKeysRef.current!;
    const boost = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5 : 1;

    if (keys.has('KeyW') || keys.has('ArrowUp'))    camera.position.addScaledVector(dir,      speed * boost);
    if (keys.has('KeyS') || keys.has('ArrowDown'))  camera.position.addScaledVector(dir,     -speed * boost);
    if (keys.has('KeyA') || keys.has('ArrowLeft'))  camera.position.addScaledVector(right,   -speed * boost);
    if (keys.has('KeyD') || keys.has('ArrowRight')) camera.position.addScaledVector(right,    speed * boost);
    if (keys.has('KeyQ') || keys.has('PageUp'))     camera.position.addScaledVector(worldUp,  speed * boost);
    if (keys.has('KeyE') || keys.has('PageDown'))   camera.position.addScaledVector(worldUp, -speed * boost);

    const jt = jumpRef.current;
    if (jt) {
      camera.position.lerp(jt, 0.07);
      if (camera.position.distanceTo(jt) < speed * 0.3) (jumpRef as React.MutableRefObject<THREE.Vector3 | null>).current = null;
    }

    cameraPosRef.current!.copy(camera.position);

    const newDist = camera.position.length();
    if (hudAltRef.current)  hudAltRef.current.textContent  = fmtDist(newDist);
    if (hudZoneRef.current) hudZoneRef.current.textContent = getZone(newDist, locale);
  });

  return null;
}

// ── Corpi celesti ─────────────────────────────────────────────────────────
function SunSphere({ onClick }: { onClick: () => void }) {
  return (
    <mesh position={SUN_POS} onClick={e => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[SUN_VR, 24, 24]} />
      <meshStandardMaterial color="#ffe040" emissive="#ff8800" emissiveIntensity={3} roughness={1} metalness={0} />
    </mesh>
  );
}

function MoonSphere({ onClick }: { onClick: () => void }) {
  const pos = useMemo<[number, number, number]>(() => {
    const [mx, my, mz] = getMoonPosition();
    return [mx * M_TO_AU, my * M_TO_AU, mz * M_TO_AU];
  }, []);
  return (
    <mesh position={pos} onClick={e => { e.stopPropagation(); onClick(); }}>
      <sphereGeometry args={[MOON_VR, 20, 20]} />
      <meshStandardMaterial color="#b8b8b8" roughness={1} metalness={0} />
    </mesh>
  );
}

function PlanetSphere({ planet, onClick }: { planet: typeof PLANETS[0]; onClick: () => void }) {
  const pos = useMemo<[number, number, number]>(() => {
    const [px, py, pz] = getPlanetPosition(planet);
    return [px * M_TO_AU, py * M_TO_AU, pz * M_TO_AU];
  }, [planet]);
  const vr = getVisualRadius(planet.radius);
  const isSaturn = planet.id === 'saturno';
  return (
    <group position={pos}>
      <mesh onClick={e => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[vr, 20, 20]} />
        <meshStandardMaterial color={planet.color} roughness={0.85} metalness={0.05} />
      </mesh>
      {isSaturn && (
        <mesh rotation={[0.45, 0, 0]}>
          <torusGeometry args={[vr * 2.4, vr * 0.65, 2, 64]} />
          <meshStandardMaterial color="#c8b570" transparent opacity={0.65} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

// ── NavPad HTML ─────────────────────────────────────────────────────────────
function NavPad({ navKeysRef, locale, distAU }: { navKeysRef: React.RefObject<Set<string>>; locale: Locale; distAU: number }) {
  const press   = (code: string) => navKeysRef.current!.add(code);
  const release = (code: string) => navKeysRef.current!.delete(code);

  const speedMS = distAU * AU * 0.004;
  function fmtSpeed(ms: number): string {
    const c = 299_792_458;
    if (ms >= c * 0.001) return `${(ms / c * 100).toFixed(2)}% c`;
    if (ms >= 1_000_000) return `${(ms / 1_000_000).toFixed(1)} Mm/s`;
    if (ms >= 1_000)     return `${(ms / 1_000).toFixed(0)} km/s`;
    return `${ms.toFixed(0)} m/s`;
  }

  const btnStyle: React.CSSProperties = {
    background: 'rgba(0,20,40,0.78)', border: '1px solid rgba(100,180,255,0.22)',
    borderRadius: 6, color: '#88bbdd', cursor: 'pointer', fontSize: '0.75rem',
    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(6px)', userSelect: 'none',
  };

  function Btn({ code, label }: { code: string; label: string }) {
    return (
      <button
        onPointerDown={e => { e.stopPropagation(); press(code); }}
        onPointerUp={e => { e.stopPropagation(); release(code); }}
        onPointerLeave={() => release(code)}
        style={btnStyle}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 200, pointerEvents: 'all', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', background: 'rgba(0,8,20,0.70)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(10px)' }}>
      <div style={{ color: '#33445577', fontSize: '0.58rem', marginBottom: 2 }}>
        ~{fmtSpeed(speedMS)} · Shift ×5
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <Btn code="KeyW" label="▲" />
        <Btn code="KeyS" label="▼" />
        <div style={{ width: 4 }} />
        <Btn code="KeyQ" label="⬆" />
        <Btn code="KeyE" label="⬇" />
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <Btn code="KeyA" label="◀" />
        <Btn code="KeyD" label="▶" />
      </div>
      <div style={{ color: '#223344', fontSize: '0.55rem', marginTop: 2 }}>
        {locale === 'it' ? '▲▼=avanti/indietro · ⬆⬇=alto/basso' : '▲▼=fwd/back · ⬆⬇=up/dn'}
      </div>
    </div>
  );
}

// ── Bottone evento cosmico ─────────────────────────────────────────────────
function CosmicEventButton({ event, onClick }: { event: HistoricalEvent; onClick: (e: HistoricalEvent) => void }) {
  const color = CATEGORY_COLORS[event.category];
  const handleClick = useCallback(() => onClick(event), [event, onClick]);
  function fmt(y: number): string {
    if (Math.abs(y) >= 1_000_000_000) return `${(Math.abs(y) / 1e9).toFixed(1)} mld a.C.`;
    if (Math.abs(y) >= 1_000_000)     return `${(Math.abs(y) / 1e6).toFixed(0)} mln a.C.`;
    return `${Math.abs(y)} a.C.`;
  }
  return (
    <button onClick={handleClick}
      style={{ background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 10, padding: '8px 12px', color: '#e8e8f0', cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left', transition: 'background 0.2s', lineHeight: 1.35 }}
      onMouseEnter={ev => (ev.currentTarget.style.background = `${color}35`)}
      onMouseLeave={ev => (ev.currentTarget.style.background = `${color}18`)}
    >
      <div style={{ color, fontWeight: 600, marginBottom: 2 }}>{event.title}</div>
      <div style={{ color: '#ffd16699', fontSize: '0.65rem' }}>{fmt(event.year)}</div>
    </button>
  );
}

// ── Componente principale ───────────────────────────────────────────────────
interface CosmicSceneProps {
  events:       HistoricalEvent[];
  locale:       Locale;
  currentYear:  number;
  flyTo:        FlyTarget | null;
  onEventClick: (event: HistoricalEvent) => void;
}

export function CosmicScene({ events, locale, flyTo, onEventClick }: CosmicSceneProps) {
  const navKeysRef   = useRef(new Set<string>());
  const yawRef       = useRef(-Math.PI / 2);  // guarda verso X+ (circa direzione Sole)
  const pitchRef     = useRef(-0.12);
  const jumpRef      = useRef<THREE.Vector3 | null>(null);
  const cameraPosRef = useRef(new THREE.Vector3(0, 0.05, 0));
  const mouseRef     = useRef({ down: false, lastX: 0, lastY: 0 });
  const hudAltRef    = useRef<HTMLSpanElement | null>(null);
  const hudZoneRef   = useRef<HTMLSpanElement | null>(null);
  const distAURef    = useRef(0.05);

  // Tastiera
  useEffect(() => {
    const dn = (e: KeyboardEvent) => navKeysRef.current.add(e.code);
    const up = (e: KeyboardEvent) => navKeysRef.current.delete(e.code);
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Mouse drag per ruotare la vista
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!mouseRef.current.down) return;
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
      yawRef.current   -= dx * 0.003;
      pitchRef.current  = Math.max(-1.5, Math.min(1.5, pitchRef.current - dy * 0.003));
    };
    const up = () => { mouseRef.current.down = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  // Touch drag (mobile)
  useEffect(() => {
    let lastTX = 0, lastTY = 0;
    const ts = (e: TouchEvent) => { lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY; };
    const tm = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - lastTX;
      const dy = e.touches[0].clientY - lastTY;
      lastTX = e.touches[0].clientX; lastTY = e.touches[0].clientY;
      yawRef.current   -= dx * 0.004;
      pitchRef.current  = Math.max(-1.5, Math.min(1.5, pitchRef.current - dy * 0.004));
    };
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove',  tm, { passive: true });
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchmove', tm); };
  }, []);

  // FlyTo da App (ricerca pianeta/luna/sole)
  useEffect(() => {
    if (!flyTo || flyTo.kind !== 'body') return;
    const eid = flyTo.entityId;
    if (eid === 'luna') {
      const [mx, my, mz] = getMoonPosition();
      const moonAU = new THREE.Vector3(mx * M_TO_AU, my * M_TO_AU, mz * M_TO_AU);
      const off    = moonAU.clone().normalize().multiplyScalar(MOON_VR * 8);
      jumpRef.current = moonAU.clone().sub(off);
    } else if (eid === 'sole') {
      const sunV = new THREE.Vector3(...SUN_POS);
      const off  = sunV.clone().normalize().multiplyScalar(SUN_VR * 4);
      jumpRef.current = sunV.sub(off);
    } else if (eid.startsWith('planet-')) {
      const pid = eid.replace('planet-', '');
      const pl  = PLANETS.find(p => p.id === pid);
      if (pl) {
        const [px, py, pz] = getPlanetPosition(pl);
        const pAU = new THREE.Vector3(px * M_TO_AU, py * M_TO_AU, pz * M_TO_AU);
        const vr  = getVisualRadius(pl.radius);
        const off = pAU.clone().normalize().multiplyScalar(vr * 6);
        jumpRef.current = pAU.sub(off);
      }
    }
  }, [flyTo]);

  const jumpTo = useCallback((altM: number) => {
    const altAU = altM * M_TO_AU;
    const cur   = cameraPosRef.current;
    const dir   = cur.length() > 1e-7 ? cur.clone().normalize() : new THREE.Vector3(0, 1, 0);
    jumpRef.current = dir.multiplyScalar(altAU);
  }, []);

  const it = locale === 'it';

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onMouseDown={e => {
        if (e.button !== 0) return;
        mouseRef.current = { down: true, lastX: e.clientX, lastY: e.clientY };
      }}
    >
      <Canvas
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        camera={{ fov: 70, near: 1e-5, far: 2000, position: [0, 0.05, 0] }}
        style={{ background: '#00000a' }}
      >
        <ambientLight intensity={0.05} />
        <pointLight position={SUN_POS} intensity={2.5} color="#ffe0a0" decay={0} />

        <Stars radius={800} depth={120} count={8000} factor={4} saturation={0.25} fade />
        <MilkyWayDisk />
        <SunSphere  onClick={() => onEventClick(SUN_CARD)} />
        <MoonSphere onClick={() => onEventClick(MOON_CARD)} />
        {PLANETS.map(p => (
          <PlanetSphere key={p.id} planet={p} onClick={() => onEventClick(toPlanetCard(p))} />
        ))}

        <CameraRig
          navKeysRef={navKeysRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          jumpRef={jumpRef}
          cameraPosRef={cameraPosRef}
          hudAltRef={hudAltRef}
          hudZoneRef={hudZoneRef}
          locale={locale}
        />
      </Canvas>

      {/* Lista eventi cosmici (sinistra) */}
      <div style={{ position: 'absolute', left: 16, top: 16, bottom: 100, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxWidth: 260, pointerEvents: 'all' }}>
        <p style={{ color: '#1abc9c99', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          🌌 {it ? 'Universo primordiale' : 'Primordial universe'}
        </p>
        {events.length === 0
          ? <p style={{ color: '#445566', fontSize: '0.75rem' }}>{it ? "Sposta lo slider verso sinistra per esplorare l'universo primordiale" : 'Move the slider left to explore the primordial universe'}</p>
          : events.map(e => <CosmicEventButton key={e.id} event={e} onClick={onEventClick} />)
        }
      </div>

      {/* Navigazione scala (destra) */}
      <div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <p style={{ color: '#1abc9c99', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {it ? '🔭 Navigazione' : '🔭 Navigate'}
        </p>
        {SCALE_JUMPS.map(j => (
          <button key={j.label} onClick={() => jumpTo(j.altM)}
            title={`${it ? j.label : j.labelEn} — ${fmtDist(j.altM * M_TO_AU)}`}
            style={{ background: 'rgba(0,20,40,0.72)', border: '1px solid rgba(100,180,255,0.22)', borderRadius: 8, padding: '6px 10px', color: '#a0d8f0', cursor: 'pointer', fontSize: '0.72rem', textAlign: 'right', lineHeight: 1.3, backdropFilter: 'blur(8px)', minWidth: 110 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(100,180,255,0.65)'; e.currentTarget.style.color = '#e0f4ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,180,255,0.22)'; e.currentTarget.style.color = '#a0d8f0'; }}
          >
            <span style={{ fontSize: '0.88rem' }}>{j.icon}</span>{' '}{it ? j.label : j.labelEn}
            <div style={{ color: '#4a8aaa', fontSize: '0.6rem', marginTop: 1 }}>{fmtDist(j.altM * M_TO_AU)}</div>
          </button>
        ))}
      </div>

      {/* HUD altitudine + zona */}
      <div style={{ position: 'absolute', bottom: 52, right: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 12px', color: '#88aacc', fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(100,160,220,0.2)' }}>
        <div><span style={{ color: '#334455' }}>ALT </span><span ref={hudAltRef} style={{ color: '#aaccee' }}>—</span></div>
        <div><span style={{ color: '#334455' }}>POS </span><span ref={hudZoneRef} style={{ color: '#aaccee' }}>—</span></div>
      </div>

      {/* Plancia di navigazione (basso-sinistra) */}
      <NavPad navKeysRef={navKeysRef} locale={locale} distAU={distAURef.current} />

      {/* Hint comandi */}
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', color: '#2a3a4a', fontSize: '0.55rem', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', zIndex: 10 }}>
        {it ? 'Tieni premuto un bottone · Scorri con dito per ruotare' : 'Hold a button · Swipe to look around'}
      </div>
    </div>
  );
}
