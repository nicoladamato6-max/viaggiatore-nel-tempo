// Mappe politiche storiche da dataset accademici open-source:
// - aourednik/historical-basemaps (GeoJSON validati, ~54 snapshot da 123.000 a.C. al 2010)
// - datasets/geo-countries (Natural Earth, confini attuali)
// Nomi file verificati sull'API GitHub: world_bc<N>.geojson e world_<N>.geojson

export interface HistoricalMap {
  year: number;   // anno di riferimento della mappa (negativo = a.C.)
  label: string;  // etichetta UI
  url: string;
}

const GH = 'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/';

export const HISTORICAL_MAPS: HistoricalMap[] = [
  // Preistoria / Prima della scrittura
  { year: -123000, label: '123.000 a.C.', url: `${GH}world_bc123000.geojson` },
  { year:  -10000, label:  '10.000 a.C.', url: `${GH}world_bc10000.geojson`  },
  { year:   -8000, label:   '8.000 a.C.', url: `${GH}world_bc8000.geojson`   },
  { year:   -5000, label:   '5.000 a.C.', url: `${GH}world_bc5000.geojson`   },
  { year:   -4000, label:   '4.000 a.C.', url: `${GH}world_bc4000.geojson`   },
  // Antichità
  { year:   -3000, label:   '3.000 a.C.', url: `${GH}world_bc3000.geojson`   },
  { year:   -2000, label:   '2.000 a.C.', url: `${GH}world_bc2000.geojson`   },
  { year:   -1500, label:   '1.500 a.C.', url: `${GH}world_bc1500.geojson`   },
  { year:   -1000, label:   '1.000 a.C.', url: `${GH}world_bc1000.geojson`   },
  { year:    -700, label:     '700 a.C.', url: `${GH}world_bc700.geojson`    },
  { year:    -500, label:     '500 a.C.', url: `${GH}world_bc500.geojson`    },
  { year:    -400, label:     '400 a.C.', url: `${GH}world_bc400.geojson`    },
  { year:    -323, label:     '323 a.C.', url: `${GH}world_bc323.geojson`    },
  { year:    -300, label:     '300 a.C.', url: `${GH}world_bc300.geojson`    },
  { year:    -200, label:     '200 a.C.', url: `${GH}world_bc200.geojson`    },
  { year:    -100, label:     '100 a.C.', url: `${GH}world_bc100.geojson`    },
  { year:      -1, label:       '1 a.C.', url: `${GH}world_bc1.geojson`      },
  // Epoca imperiale e medievale
  { year:     100, label:     '100 d.C.', url: `${GH}world_100.geojson`      },
  { year:     200, label:     '200 d.C.', url: `${GH}world_200.geojson`      },
  { year:     300, label:     '300 d.C.', url: `${GH}world_300.geojson`      },
  { year:     400, label:     '400 d.C.', url: `${GH}world_400.geojson`      },
  { year:     500, label:     '500 d.C.', url: `${GH}world_500.geojson`      },
  { year:     600, label:     '600 d.C.', url: `${GH}world_600.geojson`      },
  { year:     700, label:     '700 d.C.', url: `${GH}world_700.geojson`      },
  { year:     800, label:     '800 d.C.', url: `${GH}world_800.geojson`      },
  { year:     900, label:     '900 d.C.', url: `${GH}world_900.geojson`      },
  { year:    1000, label:   '1.000 d.C.', url: `${GH}world_1000.geojson`     },
  { year:    1100, label:   '1.100 d.C.', url: `${GH}world_1100.geojson`     },
  { year:    1200, label:   '1.200 d.C.', url: `${GH}world_1200.geojson`     },
  { year:    1279, label:   '1.279 d.C.', url: `${GH}world_1279.geojson`     },
  { year:    1300, label:   '1.300 d.C.', url: `${GH}world_1300.geojson`     },
  { year:    1400, label:   '1.400 d.C.', url: `${GH}world_1400.geojson`     },
  { year:    1492, label:   '1.492 d.C.', url: `${GH}world_1492.geojson`     },
  { year:    1500, label:   '1.500 d.C.', url: `${GH}world_1500.geojson`     },
  { year:    1530, label:   '1.530 d.C.', url: `${GH}world_1530.geojson`     },
  { year:    1600, label:   '1.600 d.C.', url: `${GH}world_1600.geojson`     },
  { year:    1650, label:   '1.650 d.C.', url: `${GH}world_1650.geojson`     },
  { year:    1700, label:   '1.700 d.C.', url: `${GH}world_1700.geojson`     },
  { year:    1715, label:   '1.715 d.C.', url: `${GH}world_1715.geojson`     },
  { year:    1783, label:   '1.783 d.C.', url: `${GH}world_1783.geojson`     },
  { year:    1800, label:   '1.800 d.C.', url: `${GH}world_1800.geojson`     },
  { year:    1815, label:   '1.815 d.C.', url: `${GH}world_1815.geojson`     },
  { year:    1878, label:   '1.878 d.C.', url: `${GH}world_1878.geojson`     },
  { year:    1880, label:   '1.880 d.C.', url: `${GH}world_1880.geojson`     },
  { year:    1900, label:   '1.900 d.C.', url: `${GH}world_1900.geojson`     },
  { year:    1914, label:   '1.914 d.C.', url: `${GH}world_1914.geojson`     },
  { year:    1920, label:   '1.920 d.C.', url: `${GH}world_1920.geojson`     },
  { year:    1930, label:   '1.930 d.C.', url: `${GH}world_1930.geojson`     },
  { year:    1938, label:   '1.938 d.C.', url: `${GH}world_1938.geojson`     },
  { year:    1945, label:   '1.945 d.C.', url: `${GH}world_1945.geojson`     },
  { year:    1960, label:   '1.960 d.C.', url: `${GH}world_1960.geojson`     },
  { year:    1994, label:   '1.994 d.C.', url: `${GH}world_1994.geojson`     },
  { year:    2000, label:   '2.000 d.C.', url: `${GH}world_2000.geojson`     },
  { year:    2010, label:   '2.010 d.C.', url: `${GH}world_2010.geojson`     },
  // Mappa attuale: Natural Earth via datasets/geo-countries (public domain)
  { year:    2011, label: 'Mondo attuale', url: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson' },
];

/**
 * Restituisce lo snapshot più recente disponibile per l'anno dato.
 * Torna null se l'anno è antecedente al 123.000 a.C. (nessuna mappa disponibile).
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
  const hue = ((h >>> 0) % 360) / 360;
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
