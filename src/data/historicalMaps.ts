// Mappe politiche storiche da dataset accademici open-source:
// - aourednik/historical-basemaps (GeoJSON validati per 3000 a.C.–1994)
// - datasets/geo-countries (Natural Earth, confini attuali)
// Geometrie reali ricercate — molto più accurate dei poligoni a mano.

export interface HistoricalMap {
  year: number;   // anno di riferimento della mappa (negativo = a.C.)
  label: string;  // etichetta UI
  url: string;
}

const GH = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/';

export const HISTORICAL_MAPS: HistoricalMap[] = [
  { year: -3000, label: '3000 a.C.', url: `${GH}world_3000bc.geojson` },
  { year: -2000, label: '2000 a.C.', url: `${GH}world_2000bc.geojson` },
  { year: -1500, label: '1500 a.C.', url: `${GH}world_1500bc.geojson` },
  { year: -1000, label: '1000 a.C.', url: `${GH}world_1000bc.geojson` },
  { year:  -500, label:  '500 a.C.', url: `${GH}world_500bc.geojson`  },
  { year:     1, label:    '1 d.C.', url: `${GH}world_1ad.geojson`    },
  { year:   500, label:  '500 d.C.', url: `${GH}world_500ad.geojson`  },
  { year:  1000, label: '1000 d.C.', url: `${GH}world_1000ad.geojson` },
  { year:  1279, label: '1279 d.C.', url: `${GH}world_1279ad.geojson` },
  { year:  1492, label: '1492 d.C.', url: `${GH}world_1492ad.geojson` },
  { year:  1530, label: '1530 d.C.', url: `${GH}world_1530ad.geojson` },
  { year:  1650, label: '1650 d.C.', url: `${GH}world_1650ad.geojson` },
  { year:  1783, label: '1783 d.C.', url: `${GH}world_1783ad.geojson` },
  { year:  1815, label: '1815 d.C.', url: `${GH}world_1815ad.geojson` },
  { year:  1880, label: '1880 d.C.', url: `${GH}world_1880ad.geojson` },
  { year:  1914, label: '1914 d.C.', url: `${GH}world_1914ad.geojson` },
  { year:  1920, label: '1920 d.C.', url: `${GH}world_1920ad.geojson` },
  { year:  1938, label: '1938 d.C.', url: `${GH}world_1938ad.geojson` },
  { year:  1945, label: '1945 d.C.', url: `${GH}world_1945ad.geojson` },
  { year:  1960, label: '1960 d.C.', url: `${GH}world_1960ad.geojson` },
  { year:  1994, label: '1994 d.C.', url: `${GH}world_1994ad.geojson` },
  // Mappa attuale: Natural Earth via datasets/geo-countries (public domain)
  { year:  1995, label: 'Mondo attuale', url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson' },
];

/**
 * Restituisce lo snapshot più recente disponibile per l'anno dato.
 * Torna null se l'anno è antecedente al 3000 a.C. (nessuna mappa disponibile).
 */
export function getBestMap(year: number): HistoricalMap | null {
  if (year < HISTORICAL_MAPS[0].year) return null;
  let best = HISTORICAL_MAPS[0];
  for (const m of HISTORICAL_MAPS) {
    if (m.year <= year) best = m;
  }
  return best;
}

/** Estrae il nome di un territorio dalle properties di una feature GeoJSON. */
export function featureName(props: Record<string, unknown> | null | undefined): string {
  if (!props) return '';
  return String(
    props['NAME'] ?? props['name'] ?? props['ADMIN'] ?? props['admin'] ?? ''
  ).trim();
}

/**
 * Colore deterministico da nome territorio — hue stabile, saturation/lightness fisse.
 * Formato HSL convertito in rgba per Cesium.
 */
export function colorForTerritory(name: string): [number, number, number, number] {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = Math.imul(31, h) + name.charCodeAt(i) | 0;
  }
  const hue = ((h >>> 0) % 360) / 360;  // 0..1
  // HSL(hue, 58%, 50%) → RGB (simplified, good enough for globe overlay)
  const s = 0.58, l = 0.50;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hueToRgb(p, q, hue + 1/3);
  const g = hueToRgb(p, q, hue);
  const b = hueToRgb(p, q, hue - 1/3);
  return [r, g, b, 0.22];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

type Ring = [number, number][];
type Geometry = { type: string; coordinates: unknown };

/** Centroide approssimato (media aritmetica del ring esterno). */
export function getCentroid(geometry: Geometry): [number, number] | null {
  if (geometry.type === 'Polygon') {
    const ring = (geometry.coordinates as Ring[])[0];
    return ring ? avgRing(ring) : null;
  }
  if (geometry.type === 'MultiPolygon') {
    // Usa il poligono più grande (più vertici)
    const polys = geometry.coordinates as Ring[][];
    let best: Ring | null = null;
    for (const poly of polys) {
      if (!best || poly[0].length > best.length) best = poly[0];
    }
    return best ? avgRing(best) : null;
  }
  return null;
}

function avgRing(ring: Ring): [number, number] {
  let x = 0, y = 0;
  for (const [lon, lat] of ring) { x += lon; y += lat; }
  return [x / ring.length, y / ring.length];
}
