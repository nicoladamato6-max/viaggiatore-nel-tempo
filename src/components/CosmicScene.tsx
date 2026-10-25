// Renderer Three.js per la modalità cosmica — sostituisce Cesium quando isCosmicView=true.
// Fornisce navigazione free-flight, stelle/Via Lattea, pianeti con textures procedurali.
import { useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
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


// ── Sizing (radii visivi corretti — Luna a 0.00257 AU da Terra) ──────────────
const SUN_VR   = 0.025;   // UA visive (era 0.065)
const MOON_VR  = 0.0006;  // UA visive (era 0.004 — troppo grande, nascondeva la Luna nella Terra)
const EARTH_VR = 0.0015;  // UA visive (era 0.004)
const EARTH_APPROACH_AU = 50_000 * 1_000 * M_TO_AU;  // 50.000 km in AU

function getVisualRadius(radiusM: number): number {
  return Math.max(0.0006, radiusM * M_TO_AU * 20); // era 60x, ora 20x
}

// ── Texture — GitHub raw (solo terra/luna disponibili nel repo three.js) ────────
const _TEX = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/';
const PLANET_TEXTURES: Record<string, string> = {
  terra: _TEX + 'earth_atmos_2048.jpg',
  luna:  _TEX + 'moon_1024.jpg',
  // altri pianeti: texture procedurali via canvas (vedi PROC_TEXTURES)
};

function applyTexture(mesh: THREE.Mesh | null, url: string) {
  if (!mesh) return;
  new THREE.TextureLoader().load(url, (tex) => {
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
  });
}

// ── Texture procedurali su canvas per i 7 pianeti ─────────────────────────────
function _makeProc(w: number, h: number, fn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d')!);
  return new THREE.CanvasTexture(c);
}

const _procCache: Record<string, THREE.CanvasTexture> = {};
const PROC_TEX_FNS: Record<string, () => THREE.CanvasTexture> = {
  mercurio: () => _makeProc(256, 128, ctx => {
    ctx.fillStyle = '#888077'; ctx.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 256, y = Math.random() * 128, r = Math.random() * 4 + 1;
      const s = Math.floor(80 + Math.random() * 60);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${s},${s - 10},${s - 15})`; ctx.fill();
    }
  }),
  venere: () => _makeProc(512, 256, ctx => {
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#e8c070'); g.addColorStop(0.5, '#d4a040'); g.addColorStop(1, '#e8c070');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 256;
      ctx.fillStyle = `rgba(${Math.floor(180 + Math.random()*40)},${Math.floor(110 + Math.random()*30)},30,0.3)`;
      ctx.fillRect(0, y, 512, 3 + Math.random() * 7);
    }
  }),
  marte: () => _makeProc(512, 256, ctx => {
    ctx.fillStyle = '#b04422'; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#e8ddd0'; ctx.fillRect(0, 0, 512, 20); ctx.fillRect(0, 236, 512, 20);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(60,20,10,${0.2 + Math.random() * 0.35})`;
      ctx.fillRect(Math.random() * 400, Math.random() * 180 + 28, 80 + Math.random() * 120, 25 + Math.random() * 55);
    }
  }),
  giove: () => _makeProc(512, 256, ctx => {
    const bands = ['#c8a87a','#e0c090','#b8906a','#d4b880','#c89060','#e8d0a0','#b87840','#d0a060'];
    const bh = 256 / bands.length;
    bands.forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(0, i * bh, 512, bh + 1); });
    ctx.fillStyle = '#b84828'; ctx.beginPath(); ctx.ellipse(170, 145, 38, 22, 0, 0, Math.PI * 2); ctx.fill();
  }),
  saturno: () => _makeProc(512, 256, ctx => {
    ctx.fillStyle = '#d8c898'; ctx.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 14; i++) {
      const y = 14 + i * 16;
      ctx.fillStyle = `rgba(175,148,75,${0.12 + Math.random() * 0.22})`;
      ctx.fillRect(0, y, 512, 6 + Math.random() * 8);
    }
  }),
  urano: () => _makeProc(256, 128, ctx => {
    const g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, '#5accd8'); g.addColorStop(1, '#8aeaf2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
  }),
  nettuno: () => _makeProc(256, 128, ctx => {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#1a3ae0'); g.addColorStop(0.5, '#2050c8'); g.addColorStop(1, '#1020a8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(210,220,255,0.35)'; ctx.fillRect(0, 46, 256, 10);
  }),
};

function getProcTex(id: string): THREE.CanvasTexture | null {
  if (!PROC_TEX_FNS[id]) return null;
  if (!_procCache[id]) _procCache[id] = PROC_TEX_FNS[id]();
  return _procCache[id];
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
const EARTH_CARD: HistoricalEvent = {
  id: 'terra-body', title: 'La Terra', year: -4_500_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'Il nostro pianeta. Raggio: 6.371 km. Distanza dal Sole: 1 UA = 149,6 mln km. Unico pianeta noto ad ospitare vita.',
  wikipediaSlug: 'Earth',
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

const GALAXY_LABEL_STYLE: React.CSSProperties = {
  color: '#ccaaff', fontSize: '10px', fontFamily: 'monospace',
  background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 3,
  pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none',
};

// Galassia ellittica semplice con etichetta — riutilizzabile per galassie nominate
function EllipGalaxy({ pos, rx, ry, rz, rot, color, n, label, show = true }:
  { pos: [number,number,number]; rx: number; ry: number; rz: number;
    rot: [number,number,number]; color: string; n: number; label: string; show?: boolean }) {
  const geo = useMemo(() => {
    const c = new THREE.Color(color);
    const positions = new Float32Array(n * 3);
    const colors    = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r     = Math.pow(Math.random(), 0.5);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = rx * r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = ry * r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = rz * r * Math.cos(phi);
      const t = r;
      colors[i*3]   = Math.min(1, c.r + (1 - t) * 0.25);
      colors[i*3+1] = Math.min(1, c.g + (1 - t) * 0.15);
      colors[i*3+2] = Math.min(1, c.b + (1 - t) * 0.05);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(colors,    3));
    return g;
  }, [n, rx, ry, rz, color]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group position={pos} rotation={rot} visible={show}>
      <points geometry={geo}>
        <pointsMaterial size={1.6} sizeAttenuation={false} vertexColors transparent opacity={0.72} />
      </points>
      <Html center position={[0, ry * 1.4, 0]} style={{ ...GALAXY_LABEL_STYLE, display: show ? undefined : 'none' }}>{label}</Html>
    </group>
  );
}

// ── Galassie distanti — sistema a particelle (ispirato a Google Sky) ──────────
function DistantGalaxies({ show = true }: { show?: boolean }) {
  // Andromeda: disco a spirale ellittica, 8000 particelle, posizione simbolica ~4000 UA
  const androGeo = useMemo(() => {
    const N = 8000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const arm   = Math.floor(Math.random() * 2) * Math.PI; // 2 bracci
      const r     = Math.pow(Math.random(), 0.4) * 160;
      const theta = arm + Math.random() * Math.PI * 2 + r * 0.04;
      const thick = Math.max(0.5, 18 * (1 - r / 160));
      pos[i * 3]     = r * Math.cos(theta);
      pos[i * 3 + 1] = (Math.random() - 0.5) * thick;
      pos[i * 3 + 2] = r * Math.sin(theta) * 0.38; // ellittica (M31 inclinata 77°)
      const t = r / 160;
      if (t < 0.25) { col[i*3]=1.0; col[i*3+1]=0.90; col[i*3+2]=0.70; }   // nucleo caldo
      else if (t < 0.6) { col[i*3]=0.90; col[i*3+1]=0.90; col[i*3+2]=1.0; } // disco neutro
      else { col[i*3]=0.70; col[i*3+1]=0.80; col[i*3+2]=1.0; }             // bordo blu
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);

  // Campo di galassie distanti: 5000 punti tra 2500 e 14000 UA
  const fieldGeo = useMemo(() => {
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2500 + Math.pow(Math.random(), 0.55) * 11500;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const t = Math.random();
      if (t < 0.35) { col[i*3]=1.0; col[i*3+1]=0.82; col[i*3+2]=0.60; }  // ellittica arancio
      else if (t < 0.70) { col[i*3]=0.82; col[i*3+1]=0.90; col[i*3+2]=1.0; } // spirale blu-bianco
      else { col[i*3]=1.0; col[i*3+1]=1.0; col[i*3+2]=0.95; }             // lenticolare bianco
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);

  // Ragnatela cosmica: 1800 punti tra 13000 e 46000 UA — grande struttura
  const webGeo = useMemo(() => {
    const N = 1800;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 13000 + Math.random() * 33000;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      col[i*3]=0.88; col[i*3+1]=0.85; col[i*3+2]=1.0;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []);

  return (
    <>
      {/* Andromeda — spirale ellittica con nucleo luminoso, ~4000 UA a nord-est */}
      <group position={[1800, 3200, -1200]} rotation={[1.35, -0.25, 0.5]} visible={show}>
        <points geometry={androGeo}>
          <pointsMaterial size={1.8} sizeAttenuation={false} vertexColors transparent opacity={0.78} />
        </points>
        <mesh>
          <sphereGeometry args={[9, 8, 8]} />
          <meshBasicMaterial color="#ffe6b0" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* LMC — Grande Nube di Magellano, a sud */}
      <EllipGalaxy show={show} pos={[-750,-2900,500]} rot={[0.2,0.1,0.3]}
        rx={32} ry={18} rz={28} color="#aaddff" n={1800} label="LMC — Grande Nube di Magellano" />

      {/* SMC — Piccola Nube di Magellano */}
      <EllipGalaxy show={show} pos={[-1050,-2650,820]} rot={[0.1,-0.2,0.15]}
        rx={18} ry={12} rz={16} color="#99ccee" n={1000} label="SMC — Piccola Nube di Magellano" />

      {/* M33 — Triangolo (spirale vicina ad Andromeda) */}
      <EllipGalaxy show={show} pos={[2200,3100,-1800]} rot={[0.8,0.4,1.1]}
        rx={55} ry={6} rz={40} color="#99aaff" n={2500} label="M33 — Triangolo" />

      {/* M87 — Virgo A, gigante ellittica con jet */}
      <EllipGalaxy show={show} pos={[5800,-1200,3200]} rot={[0.3,0.7,0.2]}
        rx={90} ry={75} rz={80} color="#ffdd99" n={3000} label="M87 — Vergine A" />

      {/* NGC 1300 — spirale barrata iconica */}
      <EllipGalaxy show={show} pos={[-4200,800,-5500]} rot={[1.2,0.3,0.6]}
        rx={65} ry={7} rz={50} color="#aabbdd" n={2000} label="NGC 1300 — Spirale barrata" />

      {/* Sombrero (M104) */}
      <EllipGalaxy show={show} pos={[3500,-4800,1200]} rot={[0.05,0.2,0.1]}
        rx={70} ry={8} rz={52} color="#ddccaa" n={2500} label="M104 — Sombrero" />

      {/* Occhio del Gatto (M64 — Black Eye) */}
      <EllipGalaxy show={show} pos={[-1800,5200,2400]} rot={[0.4,-0.5,0.9]}
        rx={50} ry={6} rz={38} color="#bbccff" n={1800} label="M64 — Black Eye" />

      {/* Whirlpool (M51) — spirale con satellite */}
      <EllipGalaxy show={show} pos={[700,6500,-800]} rot={[1.5,0.2,0.4]}
        rx={60} ry={5} rz={45} color="#aaccff" n={2200} label="M51 — Whirlpool" />

      {/* Campo di galassie distanti (2500–14000 UA) */}
      <points geometry={fieldGeo} visible={show}>
        <pointsMaterial size={2} sizeAttenuation={false} vertexColors transparent opacity={0.68} />
      </points>

      {/* Ragnatela cosmica (13000–46000 UA) */}
      <points geometry={webGeo} visible={show}>
        <pointsMaterial size={2.5} sizeAttenuation={false} vertexColors transparent opacity={0.42} />
      </points>
    </>
  );
}

// BigBangBackground: cambia il colore del cielo quando siamo all'inizio del tempo
// t=0 (anno -13.8B): nero assoluto | t=1 (anno -13.5B): plasma bianco/arancio
function BigBangBackground({ year }: { year: number }) {
  const { scene } = useThree();
  useEffect(() => () => { scene.background = new THREE.Color(0x00000a); }, [scene]);
  useFrame(() => {
    if (year > -13_500_000_000) {
      scene.background = new THREE.Color(0x00000a);
      return;
    }
    const t = Math.max(0, Math.min(1, (year - (-13_800_000_000)) / 300_000_000));
    // t=0 → buio totale; t=1 → plasma luminoso (bianco-arancio)
    const l   = t * 0.92;
    const sat = t * 0.85;
    const hue = t * 0.06;
    scene.background = new THREE.Color().setHSL(hue, sat, l);
  });
  return null;
}

// BigBangExpansion: fireball espandente + particelle di materia primordiale
// La geometria è computata una sola volta; solo la scala del gruppo varia con t.
function BigBangExpansion({ year }: { year: number }) {
  if (year > -13_500_000_000) return null;
  const t = Math.max(0, Math.min(1, (year - (-13_800_000_000)) / 300_000_000));

  // Particelle distribuite sulla sfera unitaria — scala applicata al gruppo
  const geo = useMemo(() => {
    const N = 5000;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = Math.pow(Math.random(), 0.25); // concentrato verso la superficie
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      const heat = 1 - r * 0.6;
      const hue  = (1 - heat) * 0.09; // bianco→giallo→arancio→rosso
      const c    = new THREE.Color().setHSL(hue, 1.0, 0.65 + heat * 0.35);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
    return g;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // t=0: sfera da 2 UA (camera a 25 UA → ~9° angolare, chiaramente visibile)
  // t→1: espansione a 450 UA — la camera è immersa nell'esplosione
  const scale  = 2 + t * 448;
  const pOpac  = Math.max(0, 0.92 - t * 0.75);
  const coreR  = scale * 0.12;
  const coreHue = t * 0.06;
  const coreColor = new THREE.Color().setHSL(coreHue, 1.0, Math.max(0.5, 0.95 - t * 0.45));

  return (
    <>
      {/* Nube di materia primordiale in espansione */}
      <group scale={[scale, scale, scale]}>
        <points geometry={geo}>
          <pointsMaterial size={2} sizeAttenuation={false} vertexColors transparent opacity={pOpac} />
        </points>
      </group>
      {/* Nucleo denso centrale: DoubleSide per essere visibile da dentro e da fuori */}
      <mesh>
        <sphereGeometry args={[coreR, 20, 20]} />
        <meshBasicMaterial color={coreColor} transparent opacity={Math.max(0, 0.95 - t * 0.80)} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

// ── CameraRig (dentro Canvas) ─────────────────────────────────────────────
interface CameraRigProps {
  navKeysRef:         React.RefObject<Set<string>>;
  yawRef:             React.RefObject<number>;
  pitchRef:           React.RefObject<number>;
  jumpRef:            React.RefObject<THREE.Vector3 | null>;
  cameraPosRef:       React.RefObject<THREE.Vector3>;
  hudAltRef:          React.RefObject<HTMLSpanElement | null>;
  hudZoneRef:         React.RefObject<HTMLSpanElement | null>;
  locale:             Locale;
  wheelRef:           React.RefObject<number>;
  initialAltKm:       number;
  onEarthApproachRef: React.RefObject<(() => void) | null>;
  nearEarthRef:       React.RefObject<boolean>;
  flyToRef:           React.RefObject<((pos: THREE.Vector3, radius: number) => void) | null>;
}

function CameraRig({ navKeysRef, yawRef, pitchRef, jumpRef, cameraPosRef, hudAltRef, hudZoneRef, locale, wheelRef, initialAltKm, onEarthApproachRef, nearEarthRef, flyToRef }: CameraRigProps) {
  const { camera } = useThree();
  const velRef = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.rotation.order = 'YXZ';
    const altAU = initialAltKm > 0 ? initialAltKm * 1_000 * M_TO_AU : 0.05;
    camera.position.set(0, altAU, 0);
    if (initialAltKm > 0) {
      (yawRef   as React.MutableRefObject<number>).current = 0;
      (pitchRef as React.MutableRefObject<number>).current = -Math.PI / 2 + 0.15;
    }
  }, [camera]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const dist    = camera.position.length();
    const maxSpd  = Math.max(8e-8, dist * 0.006);
    const keys    = navKeysRef.current!;
    const boost   = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5 : 1;
    const accel   = maxSpd * 3 * boost;
    const friction = Math.exp(-delta / 0.07);

    camera.rotation.y = yawRef.current!;
    camera.rotation.x = pitchRef.current!;

    const dir   = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation).normalize();
    const right = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation).normalize();
    const up    = new THREE.Vector3(0, 1, 0);
    let hasInput = false;

    if (keys.has('Space')) velRef.current.set(0, 0, 0);
    if (keys.has('BrakePad') || keys.has('KeyF')) velRef.current.multiplyScalar(Math.pow(0.04, delta));

    if (keys.has('KeyW') || keys.has('ArrowUp'))   { velRef.current.addScaledVector(dir,    accel * delta); hasInput = true; }
    if (keys.has('KeyS') || keys.has('ArrowDown'))  { velRef.current.addScaledVector(dir,   -accel * delta); hasInput = true; }
    if (keys.has('KeyA') || keys.has('ArrowLeft'))  { velRef.current.addScaledVector(right, -accel * delta); hasInput = true; }
    if (keys.has('KeyD') || keys.has('ArrowRight')) { velRef.current.addScaledVector(right,  accel * delta); hasInput = true; }
    if (keys.has('KeyQ') || keys.has('PageUp'))     { velRef.current.addScaledVector(up,     accel * delta); hasInput = true; }
    if (keys.has('KeyE') || keys.has('PageDown'))   { velRef.current.addScaledVector(up,    -accel * delta); hasInput = true; }

    const curSpd = velRef.current.length();
    const maxAllowed = maxSpd * boost;
    if (curSpd > maxAllowed) velRef.current.multiplyScalar(maxAllowed / curSpd);
    if (!hasInput) velRef.current.multiplyScalar(friction);

    const wd = wheelRef.current;
    if (wd !== 0) {
      velRef.current.addScaledVector(dir, -wd * maxSpd * 0.8);
      (wheelRef as React.MutableRefObject<number>).current = 0;
    }

    const jt = jumpRef.current;
    if (jt) {
      velRef.current.set(0, 0, 0);
      camera.position.lerp(jt, 0.06);
      if (camera.position.distanceTo(jt) < Math.max(1e-6, jt.length() * 0.001)) {
        (jumpRef as React.MutableRefObject<THREE.Vector3 | null>).current = null;
      }
    } else {
      camera.position.add(velRef.current);
    }

    // flyTo: aggiornato ogni frame per catturare posizione camera corrente
    flyToRef.current = (targetPos: THREE.Vector3, radius: number) => {
      (velRef as React.MutableRefObject<THREE.Vector3>).current.set(0, 0, 0);
      const toTarget = targetPos.clone().sub(camera.position);
      const d = toTarget.length();
      if (d < 1e-8) return;
      const approachDist = Math.max(radius * 8, 0.0005);
      const newPos = d > approachDist
        ? targetPos.clone().sub(toTarget.clone().normalize().multiplyScalar(approachDist))
        : camera.position.clone();
      (jumpRef as React.MutableRefObject<THREE.Vector3 | null>).current = newPos;
      const lookDir = targetPos.clone().sub(newPos).normalize();
      (yawRef   as React.MutableRefObject<number>).current = Math.atan2(lookDir.x, -lookDir.z);
      (pitchRef as React.MutableRefObject<number>).current = Math.asin(Math.max(-1, Math.min(1, lookDir.y)));
    };

    cameraPosRef.current!.copy(camera.position);
    const newDist = camera.position.length();
    if (hudAltRef.current)  hudAltRef.current.textContent  = fmtDist(newDist);
    if (hudZoneRef.current) hudZoneRef.current.textContent = getZone(newDist, locale);

    if (newDist < EARTH_APPROACH_AU) {
      if (!nearEarthRef.current) {
        (nearEarthRef as React.MutableRefObject<boolean>).current = true;
        onEarthApproachRef.current?.();
      }
    } else {
      (nearEarthRef as React.MutableRefObject<boolean>).current = false;
    }
  });

  return null;
}

// ── Corpi celesti ─────────────────────────────────────────────────────────
const LABEL_STYLE: React.CSSProperties = {
  color: '#aaddff', fontSize: '11px', fontFamily: 'monospace',
  background: 'rgba(0,0,0,0.55)', padding: '1px 5px', borderRadius: 4,
  whiteSpace: 'nowrap', userSelect: 'none',
  border: '1px solid rgba(100,180,255,0.25)',
  cursor: 'pointer',
};

type FlyToFn = (pos: THREE.Vector3, radius: number) => void;

function SunSphere({ onClick, flyTo, show = true }: { onClick: () => void; flyTo: FlyToFn; show?: boolean }) {
  return (
    <group position={SUN_POS} visible={show}>
      <mesh onClick={e => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[SUN_VR, 24, 24]} />
        <meshStandardMaterial color="#ffe040" emissive="#ff8800" emissiveIntensity={3} roughness={1} metalness={0} />
      </mesh>
      <Html center position={[0, SUN_VR * 1.6, 0]} style={{ ...LABEL_STYLE, display: show ? undefined : 'none' }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); flyTo(new THREE.Vector3(...SUN_POS), SUN_VR); }}>
        ☀️ Sole
      </Html>
    </group>
  );
}

function EarthSphere({ onClick, flyTo, show = true }: { onClick: () => void; flyTo: FlyToFn; show?: boolean }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  useEffect(() => { applyTexture(meshRef.current, PLANET_TEXTURES.terra); }, []);
  return (
    <group position={[0, 0, 0]} visible={show}>
      <mesh ref={meshRef} onClick={e => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[EARTH_VR, 32, 32]} />
        <meshStandardMaterial color="#1e5fa8" roughness={0.7} metalness={0} />
      </mesh>
      <Html center position={[0, EARTH_VR * 1.8, 0]} style={{ ...LABEL_STYLE, display: show ? undefined : 'none' }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); flyTo(new THREE.Vector3(0, 0, 0), EARTH_VR); }}>
        🌍 Terra
      </Html>
    </group>
  );
}

function MoonSphere({ onClick, flyTo, show = true }: { onClick: () => void; flyTo: FlyToFn; show?: boolean }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const pos = useMemo<[number, number, number]>(() => {
    const [mx, my, mz] = getMoonPosition();
    return [mx * M_TO_AU, my * M_TO_AU, mz * M_TO_AU];
  }, []);
  useEffect(() => { applyTexture(meshRef.current, PLANET_TEXTURES.luna); }, []);
  return (
    <group position={pos} visible={show}>
      <mesh ref={meshRef} onClick={e => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[MOON_VR, 24, 24]} />
        <meshStandardMaterial color="#b8b8b8" roughness={1} metalness={0} />
      </mesh>
      <Html center position={[0, MOON_VR * 2, 0]} style={{ ...LABEL_STYLE, display: show ? undefined : 'none' }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); flyTo(new THREE.Vector3(...pos), MOON_VR); }}>
        🌕 Luna
      </Html>
    </group>
  );
}

function PlanetSphere({ planet, onClick, flyTo, show = true }: { planet: typeof PLANETS[0]; onClick: () => void; flyTo: FlyToFn; show?: boolean }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const pos = useMemo<[number, number, number]>(() => {
    const [px, py, pz] = getPlanetPosition(planet);
    return [px * M_TO_AU, py * M_TO_AU, pz * M_TO_AU];
  }, [planet]);
  const vr = getVisualRadius(planet.radius);
  const isSaturn = planet.id === 'saturno';
  const texUrl = PLANET_TEXTURES[planet.id];
  useEffect(() => {
    if (texUrl) {
      applyTexture(meshRef.current, texUrl);
    } else {
      const proc = getProcTex(planet.id);
      if (proc && meshRef.current) {
        const mat = meshRef.current.material as THREE.MeshStandardMaterial;
        mat.map = proc; mat.color.set(0xffffff); mat.needsUpdate = true;
      }
    }
  }, [texUrl, planet.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const PLANET_ICONS: Record<string, string> = {
    mercurio: '🪨', venere: '🌫️', marte: '🔴', giove: '🪐', saturno: '💫',
    urano: '🔵', nettuno: '🌊',
  };
  return (
    <group position={pos} visible={show}>
      <mesh ref={meshRef} onClick={e => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[vr, 24, 24]} />
        <meshStandardMaterial color={planet.color} roughness={0.85} metalness={0.05} />
      </mesh>
      {isSaturn && (
        <mesh rotation={[0.45, 0, 0]}>
          <torusGeometry args={[vr * 2.4, vr * 0.65, 2, 64]} />
          <meshStandardMaterial color="#c8b570" transparent opacity={0.65} roughness={1} />
        </mesh>
      )}
      <Html center position={[0, vr * 1.8, 0]} style={{ ...LABEL_STYLE, display: show ? undefined : 'none' }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); flyTo(new THREE.Vector3(...pos), vr); }}>
        {PLANET_ICONS[planet.id] ?? '🪐'} {planet.name}
      </Html>
    </group>
  );
}

// ── Cintura degli asteroidi (Marte–Giove, 2.2–3.3 UA) ─────────────────────────
function AsteroidBelt() {
  const geo = useMemo(() => {
    const N = 4000;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r     = 2.2 + Math.random() * 1.1;
      const theta = Math.random() * Math.PI * 2;
      const incl  = (Math.random() - 0.5) * 0.12;
      pos[i*3]   = r * Math.cos(theta);
      pos[i*3+1] = incl;
      pos[i*3+2] = r * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.8} sizeAttenuation={false} color="#9a9080" transparent opacity={0.55} />
    </points>
  );
}

// ── Cintura di Kuiper (30–55 UA) ──────────────────────────────────────────────
function KuiperBelt() {
  const geo = useMemo(() => {
    const N = 2500;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r     = 30 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const incl  = (Math.random() - 0.5) * 0.3;
      pos[i*3]   = r * Math.cos(theta);
      pos[i*3+1] = incl;
      pos[i*3+2] = r * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.7} sizeAttenuation={false} color="#7a8898" transparent opacity={0.45} />
    </points>
  );
}

// ── Stelle vicine (simboliche — scala compressa per visibilità) ───────────────
const NEARBY_STARS = [
  { name: 'Proxima Centauri', pos: [-320,  50,  180] as [number,number,number], color: '#ff9980' },
  { name: 'Alpha Centauri',   pos: [-310,  55,  190] as [number,number,number], color: '#ffffaa' },
  { name: 'Stella di Barnard',pos: [  80, -200,  350] as [number,number,number], color: '#ffaa88' },
  { name: 'Sirius',           pos: [ 450, -120,  -60] as [number,number,number], color: '#aaccff' },
  { name: 'Vega',             pos: [-120,  380, -200] as [number,number,number], color: '#bbccff' },
  { name: 'Betelgeuse',       pos: [ 600,  140,  300] as [number,number,number], color: '#ff6633' },
  { name: 'Rigel',            pos: [ 580,  -80, -320] as [number,number,number], color: '#aabbff' },
];

function NearbyStar({ name, pos, color, show = true }: { name: string; pos: [number,number,number]; color: string; show?: boolean }) {
  return (
    <group position={pos} visible={show}>
      <mesh>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html center position={[0, 1.2, 0]} style={{ ...GALAXY_LABEL_STYLE, display: show ? undefined : 'none' }}>{name}</Html>
    </group>
  );
}

// ── Pianeti nani ──────────────────────────────────────────────────────────────
interface DwarfData { id: string; name: string; color: string; radiusM: number; pos: [number,number,number] }
const DWARF_PLANETS: DwarfData[] = [
  { id: 'plutone',  name: 'Plutone',  color: '#c5a87a', radiusM: 1_188_000, pos: [39.5,  0.5,  0]   },
  { id: 'eris',     name: 'Eris',     color: '#e8e8e0', radiusM: 1_163_000, pos: [-67,  -1.2, 18]   },
  { id: 'cerere',   name: 'Cerere',   color: '#9a9690', radiusM:   476_000, pos: [2.77,  0.15, 0.1] },
  { id: 'makemake', name: 'Makemake', color: '#d4a870', radiusM:   715_000, pos: [45.8, -0.4,  8]   },
  { id: 'haumea',   name: 'Haumea',   color: '#e0ddd8', radiusM:   620_000, pos: [43.1,  0.6, -12]  },
];

function DwarfPlanetSphere({ dwarf, flyTo, show = true }: { dwarf: DwarfData; flyTo: FlyToFn; show?: boolean }) {
  const vr = Math.max(0.0004, dwarf.radiusM * M_TO_AU * 20);
  return (
    <group position={dwarf.pos} visible={show}>
      <mesh>
        <sphereGeometry args={[vr, 14, 14]} />
        <meshStandardMaterial color={dwarf.color} roughness={0.9} metalness={0.02} />
      </mesh>
      <Html center position={[0, vr * 2, 0]} style={{ ...LABEL_STYLE, display: show ? undefined : 'none' }}
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); flyTo(new THREE.Vector3(...dwarf.pos), vr); }}>
        ⚫ {dwarf.name}
      </Html>
    </group>
  );
}

// ── NavPad HTML ─────────────────────────────────────────────────────────────
function NavPad({ navKeysRef, locale, distAU }: { navKeysRef: React.RefObject<Set<string>>; locale: Locale; distAU: number }) {
  const press   = (code: string) => navKeysRef.current!.add(code);
  const release = (code: string) => navKeysRef.current!.delete(code);

  const speedMS = distAU * AU * 0.006;
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
        onMouseDown={e => e.stopPropagation()}
        style={btnStyle}
      >
        {label}
      </button>
    );
  }

  return (
    <div
      style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 200, pointerEvents: 'all', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', background: 'rgba(0,8,20,0.72)', border: '1px solid rgba(100,180,255,0.18)', borderRadius: 12, padding: '8px 14px', backdropFilter: 'blur(10px)' }}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <div style={{ color: '#4a6680', fontSize: '0.55rem', marginBottom: 2 }}>
        ~{fmtSpeed(speedMS)}
      </div>
      {/* Direzionali */}
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
      {/* Velocità */}
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        <Btn code="BrakePad"  label="🐢" />
        <Btn code="Space"     label="⏹" />
        <Btn code="ShiftLeft" label="⚡" />
      </div>
      <div style={{ color: '#3a4a5a', fontSize: '0.50rem', display: 'flex', gap: 8 }}>
        <span>{locale === 'it' ? 'Frena' : 'Brake'}</span>
        <span>Stop</span>
        <span>Turbo</span>
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
  events:           HistoricalEvent[];
  locale:           Locale;
  currentYear:      number;
  flyTo:            FlyTarget | null;
  onEventClick:     (event: HistoricalEvent) => void;
  initialAltKm?:    number;
  onEarthApproach?: () => void;
}

export function CosmicScene({ events, locale, currentYear, flyTo, onEventClick, initialAltKm = 0, onEarthApproach }: CosmicSceneProps) {
  const navKeysRef         = useRef(new Set<string>());
  const yawRef             = useRef(-Math.PI / 2);
  const pitchRef           = useRef(-0.12);
  const jumpRef            = useRef<THREE.Vector3 | null>(null);
  const cameraPosRef       = useRef(new THREE.Vector3(0, 0.05, 0));
  const mouseRef           = useRef({ down: false, lastX: 0, lastY: 0 });
  const lastTXRef          = useRef(0);
  const lastTYRef          = useRef(0);
  const hudAltRef          = useRef<HTMLSpanElement | null>(null);
  const hudZoneRef         = useRef<HTMLSpanElement | null>(null);
  const distAURef          = useRef(0.05);
  const wheelRef           = useRef(0);
  const onEarthApproachRef = useRef<(() => void) | null>(onEarthApproach ?? null);
  const nearEarthRef       = useRef(false);
  const flyToRef           = useRef<((pos: THREE.Vector3, radius: number) => void) | null>(null);
  const prevEraRef         = useRef('solar');

  // Keep callback ref current on every render
  onEarthApproachRef.current = onEarthApproach ?? null;

  const flyToBody = useCallback((pos: THREE.Vector3, radius: number) => {
    flyToRef.current?.(pos, radius);
  }, []);

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

  // Touch drag gestito via React onTouchStart/onTouchMove sull'outer div,
  // così NavPad.onTouchStart con stopPropagation() previene correttamente il drag.

  // Posizionamento automatico camera al cambio di era cosmica
  useEffect(() => {
    function getEra(y: number): string {
      if (y <= -13_700_000_000) return 'bigbang';
      if (y <= -13_500_000_000) return 'plasma';
      if (y <= -13_200_000_000) return 'darkages';
      if (y <= -13_000_000_000) return 'firstgal';
      if (y <= -5_000_000_000)  return 'galactic';
      if (y <= -4_600_000_000)  return 'stellar';
      return 'solar';
    }
    const ERA_POS: Record<string, [number, number, number]> = {
      bigbang:  [0,  25,  0],
      plasma:   [0, 180,  0],
      darkages: [0, 700,  0],
      firstgal: [0, 1200, 0],
      galactic: [0, 900,  0],
      stellar:  [0, 350,  0],
    };
    const ERA_PITCH: Record<string, number> = {
      bigbang:  -Math.PI / 2 + 0.05,
      plasma:   -Math.PI / 2 + 0.1,
      darkages: -0.35,
      firstgal: -0.25,
      galactic: -0.2,
      stellar:  -0.15,
    };
    const era = getEra(currentYear);
    if (era === prevEraRef.current) return;
    prevEraRef.current = era;
    const pos = ERA_POS[era];
    if (pos) {
      (jumpRef as React.MutableRefObject<THREE.Vector3 | null>).current = new THREE.Vector3(...pos);
      (pitchRef as React.MutableRefObject<number>).current = ERA_PITCH[era] ?? -0.12;
    }
  }, [currentYear]);

  // FlyTo da App (ricerca pianeta/luna/sole)
  useEffect(() => {
    if (!flyTo || flyTo.kind !== 'body') return;
    const eid = flyTo.entityId;

    function orient(dest: THREE.Vector3, target: THREE.Vector3) {
      const d = target.clone().sub(dest).normalize();
      (yawRef as React.MutableRefObject<number>).current = Math.atan2(d.x, -d.z);
      (pitchRef as React.MutableRefObject<number>).current = Math.asin(Math.max(-1, Math.min(1, d.y)));
    }

    if (eid === 'luna') {
      const [mx, my, mz] = getMoonPosition();
      const target = new THREE.Vector3(mx * M_TO_AU, my * M_TO_AU, mz * M_TO_AU);
      const dest   = target.clone().sub(target.clone().normalize().multiplyScalar(MOON_VR * 8));
      jumpRef.current = dest;
      orient(dest, target);
    } else if (eid === 'sole') {
      const target = new THREE.Vector3(...SUN_POS);
      const dest   = target.clone().sub(target.clone().normalize().multiplyScalar(SUN_VR * 4));
      jumpRef.current = dest;
      orient(dest, target);
    } else if (eid.startsWith('planet-')) {
      const pid = eid.replace('planet-', '');
      const pl  = PLANETS.find(p => p.id === pid);
      if (pl) {
        const [px, py, pz] = getPlanetPosition(pl);
        const target = new THREE.Vector3(px * M_TO_AU, py * M_TO_AU, pz * M_TO_AU);
        const vr     = getVisualRadius(pl.radius);
        const dest   = target.clone().sub(target.clone().normalize().multiplyScalar(vr * 6));
        jumpRef.current = dest;
        orient(dest, target);
      }
    } else if (eid.startsWith('dwarf-')) {
      const dwarfId = eid.replace('dwarf-', '');
      const dw = DWARF_PLANETS.find(d => d.id === dwarfId);
      if (dw) {
        const target = new THREE.Vector3(...dw.pos);
        const vr     = Math.max(0.0004, dw.radiusM * M_TO_AU * 20);
        const dest   = target.clone().sub(target.clone().normalize().multiplyScalar(vr * 8));
        jumpRef.current = dest;
        orient(dest, target);
      }
    } else if (eid.startsWith('star-')) {
      const slug = eid.replace('star-', '');
      const slugMap: Record<string, string> = {
        'proxima':        'Proxima Centauri',
        'alpha-centauri': 'Alpha Centauri',
        'barnard':        'Stella di Barnard',
        'sirius':         'Sirio',
        'vega':           'Vega',
        'betelgeuse':     'Betelgeuse',
        'rigel':          'Rigel',
      };
      const star = NEARBY_STARS.find(s => s.name === slugMap[slug]);
      if (star) {
        const target = new THREE.Vector3(...star.pos);
        const dest   = target.clone().sub(target.clone().normalize().multiplyScalar(5));
        jumpRef.current = dest;
        orient(dest, target);
      }
    }
  }, [flyTo]);

  const it = locale === 'it';

  return (
    <div
      style={{ position: 'absolute', inset: 0 }}
      onMouseDown={e => {
        if (e.button !== 0) return;
        mouseRef.current = { down: true, lastX: e.clientX, lastY: e.clientY };
      }}
      onWheel={e => {
        (wheelRef as React.MutableRefObject<number>).current += Math.sign(e.deltaY);
      }}
      onTouchStart={e => {
        if (e.touches.length === 0) return;
        lastTXRef.current = e.touches[0].clientX;
        lastTYRef.current = e.touches[0].clientY;
      }}
      onTouchMove={e => {
        if (e.touches.length === 0) return;
        const dx = e.touches[0].clientX - lastTXRef.current;
        const dy = e.touches[0].clientY - lastTYRef.current;
        lastTXRef.current = e.touches[0].clientX;
        lastTYRef.current = e.touches[0].clientY;
        yawRef.current   -= dx * 0.004;
        pitchRef.current  = Math.max(-1.5, Math.min(1.5, pitchRef.current - dy * 0.004));
      }}
    >
      <Canvas
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        camera={{ fov: 70, near: 1e-5, far: 100000, position: [0, 0.05, 0] }}
        style={{ background: '#00000a' }}
      >
        <ambientLight intensity={0.15} />
        <hemisphereLight args={['#112244', '#000010', 0.3]} />
        {currentYear >= -4_600_000_000 && <pointLight position={SUN_POS} intensity={2.5} color="#ffe0a0" decay={0} />}

        {/* Big Bang: visuale primordiale (attivo solo prima di -13.5 mld a.C.) */}
        <BigBangBackground year={currentYear} />
        <BigBangExpansion year={currentYear} />

        {/* Galassie distanti: sempre montate per evitare crash removeChild su Html */}
        <DistantGalaxies show={currentYear >= -13_200_000_000} />

        {/* Via Lattea e stelle di sfondo: formazione ~13 mld a.C. (no Html, ok con mount condizionale) */}
        {currentYear >= -13_000_000_000 && (
          <>
            <Stars radius={800}  depth={120} count={8000} factor={4}   saturation={0.25} fade />
            <Stars radius={2500} depth={500} count={3000} factor={5}   saturation={0.15} fade />
            <Stars radius={9000} depth={800} count={1500} factor={6.5} saturation={0.10} fade />
            <MilkyWayDisk />
          </>
        )}

        {/* Stelle vicine: sempre montate per evitare crash removeChild su Html */}
        {NEARBY_STARS.map(s => <NearbyStar key={s.name} {...s} show={currentYear >= -5_000_000_000} />)}

        {/* Sole, Terra, Luna, pianeti, pianeti nani: sempre montati per evitare crash removeChild */}
        <SunSphere   onClick={() => onEventClick(SUN_CARD)}   flyTo={flyToBody} show={currentYear >= -4_600_000_000} />
        <EarthSphere onClick={() => onEventClick(EARTH_CARD)} flyTo={flyToBody} show={currentYear >= -4_600_000_000} />
        <MoonSphere  onClick={() => onEventClick(MOON_CARD)}  flyTo={flyToBody} show={currentYear >= -4_600_000_000} />
        {PLANETS.map(p => (
          <PlanetSphere key={p.id} planet={p} onClick={() => onEventClick(toPlanetCard(p))} flyTo={flyToBody} show={currentYear >= -4_600_000_000} />
        ))}
        {DWARF_PLANETS.map(d => <DwarfPlanetSphere key={d.id} dwarf={d} flyTo={flyToBody} show={currentYear >= -4_600_000_000} />)}

        {/* Cinture: no Html, ok con mount condizionale */}
        {currentYear >= -4_600_000_000 && <AsteroidBelt />}
        {currentYear >= -4_600_000_000 && <KuiperBelt />}

        <CameraRig
          navKeysRef={navKeysRef}
          yawRef={yawRef}
          pitchRef={pitchRef}
          jumpRef={jumpRef}
          cameraPosRef={cameraPosRef}
          hudAltRef={hudAltRef}
          hudZoneRef={hudZoneRef}
          locale={locale}
          wheelRef={wheelRef}
          initialAltKm={initialAltKm}
          onEarthApproachRef={onEarthApproachRef}
          nearEarthRef={nearEarthRef}
          flyToRef={flyToRef}
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

      {/* HUD altitudine + zona */}
      <div style={{ position: 'absolute', bottom: 52, right: 16, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 12px', color: '#88aacc', fontSize: '0.7rem', fontFamily: 'monospace', border: '1px solid rgba(100,160,220,0.2)' }}>
        <div><span style={{ color: '#334455' }}>ALT </span><span ref={hudAltRef} style={{ color: '#aaccee' }}>—</span></div>
        <div><span style={{ color: '#334455' }}>POS </span><span ref={hudZoneRef} style={{ color: '#aaccee' }}>—</span></div>
      </div>

      {/* Plancia di navigazione (basso-centro) */}
      <NavPad navKeysRef={navKeysRef} locale={locale} distAU={distAURef.current} />

      {/* Hint comandi */}
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', color: '#2a3a4a', fontSize: '0.55rem', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', zIndex: 10 }}>
        {it ? 'Tieni premuto un bottone · Scorri con dito per ruotare' : 'Hold a button · Swipe to look around'}
      </div>
    </div>
  );
}
