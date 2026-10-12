// Meccanica orbitale Kepleriana per i pianeti del Sistema Solare.
// Posizioni geocentriche calcolate in tempo reale dalla data odierna.
import type { HistoricalEvent, EventCategory } from '../types';

const AU         = 149_597_870_700;  // 1 UA in metri
const DEG        = Math.PI / 180;
const OBLIQUITY  = 23.4393 * DEG;   // inclinazione asse terrestre (eclittica → equatoriale)
const J2000      = 2_451_545.0;     // Julian Day per 2000-01-01 12:00 TT

function currentJD(): number {
  return Date.now() / 86_400_000 + 2_440_587.5;
}

// Risolve l'equazione di Keplero M = E − e·sin(E) con Newton-Raphson
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let k = 0; k < 50; k++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

// Rotazione eclittica → equatoriale (rotazione attorno all'asse X per la obliquità)
function eclToEq(x: number, y: number, z: number): [number, number, number] {
  return [
    x,
    y * Math.cos(OBLIQUITY) - z * Math.sin(OBLIQUITY),
    y * Math.sin(OBLIQUITY) + z * Math.cos(OBLIQUITY),
  ];
}

interface OrbEl {
  a: number;   // semiasse maggiore (UA)
  e: number;   // eccentricità
  i: number;   // inclinazione (°)
  O: number;   // longitudine nodo ascendente (°)
  w: number;   // argomento del perielio (°)
  L0: number;  // longitudine media a J2000 (°)
  T: number;   // periodo orbitale (giorni)
}

// Posizione eliocentrica equatoriale in metri
function helioEq(el: OrbEl, jd: number): [number, number, number] {
  const d  = jd - J2000;
  const M0 = (el.L0 - el.w - el.O) * DEG;
  const n  = (2 * Math.PI) / el.T;   // moto medio (rad/giorno)
  const M  = ((M0 + n * d) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

  const E  = solveKepler(M, el.e);
  const v  = 2 * Math.atan2(Math.sqrt(1 + el.e) * Math.sin(E / 2), Math.sqrt(1 - el.e) * Math.cos(E / 2));
  const r  = el.a * (1 - el.e * Math.cos(E)) * AU;

  // Rotazione piano orbitale → eclittica
  const iR = el.i * DEG, OR = el.O * DEG, wR = el.w * DEG;
  const [cO, sO, cW, sW, cI, sI] = [Math.cos(OR), Math.sin(OR), Math.cos(wR), Math.sin(wR), Math.cos(iR), Math.sin(iR)];
  const xv = r * Math.cos(v), yv = r * Math.sin(v);

  return eclToEq(
    xv * (cO * cW - sO * sW * cI) + yv * (-cO * sW - sO * cW * cI),
    xv * (sO * cW + cO * sW * cI) + yv * (-sO * sW + cO * cW * cI),
    xv * (sW * sI)                 + yv * (cW * sI),
  );
}

const EARTH_EL: OrbEl = { a: 1.00000, e: 0.01671, i: 0.000, O: -11.261, w: 102.937, L0: 100.464, T: 365.256 };

// ── Struttura dati pianeta ──────────────────────────────────────────────────
export interface PlanetData {
  id: string;
  name: string;
  radius: number;        // metri
  color: string;         // hex CSS
  el: OrbEl;
  discoveryYear: number;
  discoverer: string;
  wikipediaSlug: string;
  description: string;
}

// ── Catalogo pianeti + pianeti nani + comete ────────────────────────────────
export const PLANETS: PlanetData[] = [
  {
    id: 'mercurio', name: 'Mercurio', radius: 2_439_700, color: '#b8b8b8',
    el: { a: 0.38710, e: 0.20563, i: 7.005, O: 48.331,  w: 29.125,  L0: 252.251, T: 87.969   },
    discoveryYear: -2000, discoverer: 'Antichi Babilonesi', wikipediaSlug: 'Mercury_(planet)',
    description: 'Il pianeta più vicino al Sole, con un\'orbita di 88 giorni. Escursioni termiche estreme: −180°C di notte e +430°C di giorno. La sua superficie è costellata di crateri, simile alla Luna.',
  },
  {
    id: 'venere', name: 'Venere', radius: 6_051_800, color: '#e8c87a',
    el: { a: 0.72333, e: 0.00677, i: 3.395, O: 76.680,  w: 54.884,  L0: 181.980, T: 224.701  },
    discoveryYear: -2000, discoverer: 'Antichi Babilonesi', wikipediaSlug: 'Venus',
    description: 'Il pianeta più luminoso nel cielo notturno. La densa atmosfera di CO₂ crea un effetto serra estremo: 465°C costanti, più caldo di Mercurio. Ruota al contrario — il Sole sorge a Ovest.',
  },
  {
    id: 'marte', name: 'Marte', radius: 3_389_500, color: '#c1440e',
    el: { a: 1.52368, e: 0.09341, i: 1.850, O: 49.558,  w: 286.537, L0: 355.453, T: 686.971  },
    discoveryYear: -2000, discoverer: 'Antichi Egizi', wikipediaSlug: 'Mars',
    description: 'Il Pianeta Rosso. Ospita Olympus Mons (21 km — il vulcano più alto del Sistema Solare) e Valles Marineris (4.000 km di canyon). Prima meta per l\'esplorazione umana futura.',
  },
  {
    id: 'giove', name: 'Giove', radius: 71_492_000, color: '#c88b3a',
    el: { a: 5.20260, e: 0.04849, i: 1.303, O: 100.464, w: 275.066, L0: 34.396,  T: 4332.589 },
    discoveryYear: -2000, discoverer: 'Antichi Babilonesi', wikipediaSlug: 'Jupiter',
    description: 'Il gigante del Sistema Solare: 318 volte la massa terrestre. La Grande Macchia Rossa è una tempesta attiva da oltre 350 anni. Ha 95 lune; Ganimede è più grande di Mercurio.',
  },
  {
    id: 'saturno', name: 'Saturno', radius: 60_268_000, color: '#e8d5a3',
    el: { a: 9.55491, e: 0.05551, i: 2.489, O: 113.665, w: 336.061, L0: 50.078,  T: 10759.22 },
    discoveryYear: -2000, discoverer: 'Antichi Romani', wikipediaSlug: 'Saturn',
    description: 'Famoso per i suoi magnifici anelli di ghiaccio e roccia, scoperti da Galileo nel 1610. Meno denso dell\'acqua: galleggerebbe in un oceano abbastanza grande. Ha 146 lune, tra cui Titano.',
  },
  {
    id: 'urano', name: 'Urano', radius: 25_559_000, color: '#7de8e8',
    el: { a: 19.2184, e: 0.04630, i: 0.773, O: 74.006,  w: 96.999,  L0: 314.055, T: 30688.5  },
    discoveryYear: 1781, discoverer: 'William Herschel', wikipediaSlug: 'Uranus',
    description: 'Scoperto il 13 marzo 1781 da William Herschel a Bath, Inghilterra — primo pianeta scoperto con il telescopio nella storia. Ruota su un fianco (inclinazione 98°), con stagioni lunghe 21 anni.',
  },
  {
    id: 'nettuno', name: 'Nettuno', radius: 24_764_000, color: '#4080ff',
    el: { a: 30.1104, e: 0.00898, i: 1.770, O: 131.784, w: 273.187, L0: 304.349, T: 60195    },
    discoveryYear: 1846, discoverer: 'Le Verrier / Galle', wikipediaSlug: 'Neptune',
    description: 'Scoperto il 23 settembre 1846 da Johann Galle a Berlino, grazie ai calcoli di Le Verrier. Primo pianeta previsto matematicamente prima di essere osservato. Venti fino a 2.100 km/h.',
  },
  {
    id: 'plutone', name: 'Plutone', radius: 1_188_300, color: '#d4a574',
    el: { a: 39.482, e: 0.2488, i: 17.14, O: 110.30,  w: 113.83,  L0: 238.93,  T: 90560    },
    discoveryYear: 1930, discoverer: 'Clyde Tombaugh', wikipediaSlug: 'Pluto',
    description: 'Scoperto il 18 febbraio 1930 da Clyde Tombaugh al Lowell Observatory di Flagstaff, Arizona. Pianeta nano dal 2006. La sonda New Horizons nel 2015 ha rivelato montagne di ghiaccio e un cuore rosato.',
  },
  // ── Pianeti nani ─────────────────────────────────────────────────────────
  {
    id: 'cerere', name: 'Cerere', radius: 476_200, color: '#a89880',
    el: { a: 2.7692, e: 0.0760, i: 10.594, O: 80.305, w: 73.597, L0: 95.989, T: 1681.63 },
    discoveryYear: 1801, discoverer: 'Giuseppe Piazzi', wikipediaSlug: 'Ceres_(dwarf_planet)',
    description: 'Scoperto il 1° gennaio 1801 dall\'astronomo siciliano Giuseppe Piazzi. È il corpo più grande della fascia degli asteroidi e l\'unico pianeta nano della fascia interna. La sonda Dawn (2015) ha rivelato macchie luminose di sali nei crateri.',
  },
  {
    id: 'eris', name: 'Eris', radius: 1_163_000, color: '#d8d0c8',
    el: { a: 67.868, e: 0.4418, i: 44.040, O: 35.951, w: 151.087, L0: 204.16, T: 204_196 },
    discoveryYear: 2005, discoverer: 'Brown, Trujillo, Rabinowitz', wikipediaSlug: 'Eris_(dwarf_planet)',
    description: 'Scoperta nel 2005 da Mike Brown et al. al Palomar Observatory. Con massa leggermente superiore a Plutone, la sua scoperta ha innescato il dibattito che ha portato alla reclassificazione dei pianeti nani nel 2006. Ha una luna, Disnomia.',
  },
  {
    id: 'makemake', name: 'Makemake', radius: 715_000, color: '#c47c5a',
    el: { a: 45.791, e: 0.1613, i: 29.006, O: 79.620, w: 294.83, L0: 81.26, T: 112_885 },
    discoveryYear: 2005, discoverer: 'Brown, Trujillo, Rabinowitz', wikipediaSlug: 'Makemake',
    description: 'Scoperto nel 2005 dallo stesso team che scoprì Eris. Il terzo pianeta nano per dimensioni nel Sistema Solare esterno, prende il nome dal dio creatore della mitologia Rapa Nui (Isola di Pasqua). Ha una piccola luna scoperta nel 2016.',
  },
  {
    id: 'haumea', name: 'Haumea', radius: 780_000, color: '#e0d4c0',
    el: { a: 43.218, e: 0.1964, i: 28.213, O: 122.167, w: 239.508, L0: 218.21, T: 103_774 },
    discoveryYear: 2004, discoverer: 'Brown / Ortiz', wikipediaSlug: 'Haumea',
    description: 'Pianeta nano dalla forma elissoidale elongata: ruota così velocemente (3,9 ore) da essere "schiacciato" agli equatori. Ha un sistema di anelli e due lune: Hi\'iaka e Namaka. Prende il nome dalla dea hawaiiana della fertilità.',
  },
];

// ── Posizioni calcolate in tempo reale ──────────────────────────────────────

/** Posizione geocentrica equatoriale del pianeta, in metri (ECEF approssimato). */
export function getPlanetPosition(planet: PlanetData): [number, number, number] {
  const jd = currentJD();
  const [px, py, pz] = helioEq(planet.el, jd);
  const [ex, ey, ez] = helioEq(EARTH_EL, jd);
  return [px - ex, py - ey, pz - ez];
}

/** Posizione geocentrica della Luna — formula semplificata di Chapront, accuratezza ~1°. */
export function getMoonPosition(): [number, number, number] {
  const d  = currentJD() - J2000;
  const N  = ((125.1228 - 0.0529538083 * d) % 360 + 360) % 360;   // nodo ascendente (°)
  const w  = ((318.0634 + 0.1643573223 * d) % 360 + 360) % 360;   // argomento del perigeo (°)
  const M  = ((115.3654 + 13.0649929509 * d) % 360 + 360) % 360;  // anomalia media (°)
  const e  = 0.054900;
  const a  = 384_400_000; // distanza media Terra-Luna in metri
  const iDeg = 5.1454;

  const E  = solveKepler(M * DEG, e);
  const v  = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r  = a * (1 - e * Math.cos(E));
  const vwR = v + w * DEG;
  const NR = N * DEG, iR = iDeg * DEG;

  return eclToEq(
    r * (Math.cos(NR) * Math.cos(vwR) - Math.sin(NR) * Math.sin(vwR) * Math.cos(iR)),
    r * (Math.sin(NR) * Math.cos(vwR) + Math.cos(NR) * Math.sin(vwR) * Math.cos(iR)),
    r * Math.sin(vwR) * Math.sin(iR),
  );
}

// ── Conversione a HistoricalEvent ───────────────────────────────────────────

/**
 * Card da mostrare nell'EventCard quando l'utente clicca sull'entità pianeta nel globo.
 * Usa id "{id}-card" (NON "planet-{id}") per non innescare il flyTo da App.
 */
export function toPlanetCard(planet: PlanetData): HistoricalEvent {
  return {
    id: `${planet.id}-card`,
    title: planet.name,
    year: planet.discoveryYear,
    category: 'cosmo' as EventCategory,
    isCosmic: false,
    description: planet.description,
    wikipediaSlug: planet.wikipediaSlug,
  };
}

/**
 * Stub cercabile nella SearchBar.
 * Usa id "planet-{id}" per matchare l'ID dell'entità CesiumJS e innescare il flyTo da App.
 */
export function toPlanetSearchItem(planet: PlanetData): HistoricalEvent {
  return {
    id: `planet-${planet.id}`,
    title: planet.name,
    year: planet.discoveryYear,
    category: 'cosmo' as EventCategory,
    isCosmic: false,
    description: planet.description,
    wikipediaSlug: planet.wikipediaSlug,
  };
}

// ── Lune principali ──────────────────────────────────────────────────────────

export interface MoonData {
  id: string;
  name: string;
  parentPlanetId: string;   // id del pianeta in PLANETS (es. 'giove')
  radius: number;
  color: string;
  discoveryYear: number;
  discoverer: string;
  wikipediaSlug: string;
  description: string;
}

export const MOONS: MoonData[] = [
  {
    id: 'io', name: 'Io', parentPlanetId: 'giove', radius: 1_821_600, color: '#f0d060',
    discoveryYear: 1610, discoverer: 'Galileo Galilei', wikipediaSlug: 'Io_(moon)',
    description: 'La luna più interna e la più vulcanicamente attiva del Sistema Solare. Scoperta da Galileo nel 1610, ha oltre 400 vulcani attivi. Le eruzioni di Io possono proiettare materiale a centinaia di km di quota.',
  },
  {
    id: 'europa', name: 'Europa', parentPlanetId: 'giove', radius: 1_560_800, color: '#b8c8e8',
    discoveryYear: 1610, discoverer: 'Galileo Galilei', wikipediaSlug: 'Europa_(moon)',
    description: 'Coperta da uno strato di ghiaccio sotto cui si cela un oceano d\'acqua liquida profondo circa 100 km. Scoperta da Galileo nel 1610, è uno dei luoghi più promettenti per la ricerca di vita extraterrestre nel Sistema Solare.',
  },
  {
    id: 'ganimede', name: 'Ganimede', parentPlanetId: 'giove', radius: 2_634_100, color: '#a0a0a0',
    discoveryYear: 1610, discoverer: 'Galileo Galilei', wikipediaSlug: 'Ganymede_(moon)',
    description: 'La luna più grande del Sistema Solare: più grande del pianeta Mercurio. Scoperta da Galileo nel 1610, è l\'unica luna con un campo magnetico proprio. Possiede un oceano salato sotto la crosta ghiacciata.',
  },
  {
    id: 'callisto', name: 'Callisto', parentPlanetId: 'giove', radius: 2_410_300, color: '#706050',
    discoveryYear: 1610, discoverer: 'Galileo Galilei', wikipediaSlug: 'Callisto_(moon)',
    description: 'La luna più esterna delle quattro galileiane. Scoperta da Galileo nel 1610, ha la superficie più craterizzata del Sistema Solare — un record di bombardamenti risalente a 4 miliardi di anni fa. Possibile candidata per future basi umane.',
  },
  {
    id: 'titano', name: 'Titano', parentPlanetId: 'saturno', radius: 2_574_700, color: '#d4a840',
    discoveryYear: 1655, discoverer: 'Christiaan Huygens', wikipediaSlug: 'Titan_(moon)',
    description: 'La più grande luna di Saturno, scoperta da Huygens nel 1655. È l\'unico corpo del Sistema Solare oltre la Terra con liquidi stabili in superficie: laghi e fiumi di metano. La sonda Cassini-Huygens l\'ha esplorata tra il 2004 e il 2017.',
  },
  {
    id: 'encelado', name: 'Encelado', parentPlanetId: 'saturno', radius: 252_100, color: '#f0f8ff',
    discoveryYear: 1789, discoverer: 'William Herschel', wikipediaSlug: 'Enceladus',
    description: 'Scoperto da William Herschel nel 1789. La sua superficie ghiacciata riflette il 99% della luce solare — la più alta albedo del Sistema Solare. Cassini ha scoperto geyser di vapore acqueo e molecole organiche che scaturiscono da un oceano sotterraneo.',
  },
  {
    id: 'tritone', name: 'Tritone', parentPlanetId: 'nettuno', radius: 1_353_400, color: '#c0d8d0',
    discoveryYear: 1846, discoverer: 'William Lassell', wikipediaSlug: 'Triton_(moon)',
    description: 'Scoperto appena 17 giorni dopo Nettuno da William Lassell nel 1846. Orbita in senso retrogrado (opposto alla rotazione del pianeta), suggerendo una cattura dall\'esterno. Ha geyser di azoto e si avvicina lentamente a Nettuno — tra ~3,6 miliardi di anni si disintegrerà.',
  },
  {
    id: 'caronte', name: 'Caronte', parentPlanetId: 'plutone', radius: 606_000, color: '#908888',
    discoveryYear: 1978, discoverer: 'James Christy', wikipediaSlug: 'Charon_(moon)',
    description: 'Scoperto nel 1978 da James Christy all\'US Naval Observatory. È così grande rispetto a Plutone (metà del diametro) che i due sono considerati un sistema binario. New Horizons nel 2015 ha rivelato canyon profondi e una regione rossastra al polo nord.',
  },
  {
    id: 'miranda', name: 'Miranda', parentPlanetId: 'urano', radius: 235_800, color: '#d0c8b8',
    discoveryYear: 1948, discoverer: 'Gerard Kuiper', wikipediaSlug: 'Miranda_(moon)',
    description: 'Scoperta da Gerard Kuiper nel 1948. Ha le scogliere più alte del Sistema Solare: Verona Rupes è alta fino a 20 km — dieci volte l\'Everest. La superficie caotica suggerisce che Miranda potrebbe essersi frantumata e riassemblata nel passato.',
  },
  {
    id: 'titania', name: 'Titania', parentPlanetId: 'urano', radius: 788_400, color: '#b8c0c8',
    discoveryYear: 1787, discoverer: 'William Herschel', wikipediaSlug: 'Titania_(moon)',
    description: 'La più grande luna di Urano, scoperta da William Herschel nel 1787. Prende il nome dalla regina delle fate nell\'opera di Shakespeare "Sogno di una notte di mezza estate". Ha graben (valli da faglia) che suggeriscono antiche espansioni tettoniche.',
  },
];

/** Item cercabile nella SearchBar per una luna — vola verso il pianeta genitore in vista cosmica. */
export function toMoonSearchItem(moon: MoonData): HistoricalEvent {
  return {
    id: `moon-${moon.id}`,
    title: moon.name,
    year: moon.discoveryYear,
    category: 'cosmo' as EventCategory,
    isCosmic: false,
    description: moon.description,
    wikipediaSlug: moon.wikipediaSlug,
  };
}
