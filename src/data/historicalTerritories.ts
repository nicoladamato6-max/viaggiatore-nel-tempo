// Coordinate approssimate per civiltà/imperi storici.
// I poligoni sono semplificati per uso didattico (non confini diplomatici).
// Formato: array piatto [lon, lat, lon, lat, ...] compatibile con Cesium.Cartesian3.fromDegreesArray.

export interface Territory {
  id: string;
  name: string;
  start: number;   // anno d.C. (negativo = a.C.)
  end: number;
  color: string;
  labelLon: number;
  labelLat: number;
  positions: number[];
  wikipediaSlug?: string;
}

export const TERRITORIES: Territory[] = [
  {
    id: 'mesopotamia',
    name: 'Mesopotamia',
    start: -3500, end: -539,
    color: '#a569bd', labelLon: 44, labelLat: 33,
    positions: [36,29, 48,29, 48,37, 40,38, 36,35],
    wikipediaSlug: 'Mesopotamia',
  },
  {
    id: 'egitto',
    name: 'Antico Egitto',
    start: -3100, end: -30,
    color: '#f39c12', labelLon: 30, labelLat: 26,
    positions: [24,22, 36,22, 37,30, 34,31, 32,31.5, 30,31.5, 29,31, 24,30],
    wikipediaSlug: 'Ancient_Egypt',
  },
  {
    id: 'grecia',
    name: 'Grecia Classica',
    start: -800, end: -146,
    color: '#3498db', labelLon: 23, labelLat: 39,
    positions: [20,36, 26,36, 26,38, 28,40, 25,42, 22,42, 20,40],
    wikipediaSlug: 'Classical_Greece',
  },
  {
    id: 'persia',
    name: 'Impero Persiano',
    start: -550, end: -330,
    color: '#e74c3c', labelLon: 52, labelLat: 34,
    positions: [26,28, 26,38, 36,42, 50,44, 64,40, 66,36, 66,28, 56,24, 42,22, 30,24],
    wikipediaSlug: 'Achaemenid_Empire',
  },
  {
    id: 'ellenismo',
    name: 'Mondo Ellenistico',
    start: -323, end: -31,
    color: '#5dade2', labelLon: 42, labelLat: 34,
    positions: [20,29, 20,42, 28,44, 40,42, 52,38, 66,34, 66,28, 56,22, 42,22, 30,28],
    wikipediaSlug: 'Hellenistic_period',
  },
  {
    id: 'roma',
    name: 'Impero Romano',
    start: -753, end: 476,
    color: '#9b59b6', labelLon: 14, labelLat: 41,
    positions: [-8,34, -8,44, 0,52, 4,54, 12,54, 16,52, 24,50, 30,48, 36,44, 44,36, 44,30, 36,28, 28,28, 18,28, 10,30, 2,34],
    wikipediaSlug: 'Roman_Empire',
  },
  {
    id: 'bisanzio',
    name: 'Bisanzio',
    start: 330, end: 1453,
    color: '#d4ac0d', labelLon: 28, labelLat: 40,
    positions: [14,36, 36,36, 36,42, 28,48, 22,46, 14,42],
    wikipediaSlug: 'Byzantine_Empire',
  },
  {
    id: 'califfato',
    name: 'Califfato Islamico',
    start: 632, end: 750,
    color: '#27ae60', labelLon: 36, labelLat: 30,
    positions: [-2,28, 10,24, 20,22, 36,22, 56,22, 66,28, 66,38, 50,40, 36,40, 28,36, 10,36, 0,36, -2,32],
    wikipediaSlug: 'Caliphate',
  },
  {
    id: 'sacro-romano',
    name: 'Sacro Romano Impero',
    start: 800, end: 1806,
    color: '#f39c12', labelLon: 14, labelLat: 50,
    positions: [6,44, 6,54, 18,56, 26,52, 26,46, 20,44, 12,42, 8,44],
    wikipediaSlug: 'Holy_Roman_Empire',
  },
  {
    id: 'mongoli',
    name: 'Impero Mongolo',
    start: 1206, end: 1368,
    color: '#e67e22', labelLon: 60, labelLat: 44,
    positions: [36,36, 40,52, 56,56, 76,52, 86,44, 86,36, 76,28, 60,24, 46,28, 38,36],
    wikipediaSlug: 'Mongol_Empire',
  },
  {
    id: 'ottomani',
    name: 'Impero Ottomano',
    start: 1299, end: 1922,
    color: '#c0392b', labelLon: 32, labelLat: 38,
    positions: [20,20, 20,32, 14,36, 14,44, 20,46, 28,48, 36,46, 44,42, 48,36, 48,28, 40,20],
    wikipediaSlug: 'Ottoman_Empire',
  },
  {
    id: 'stati-italiani',
    name: 'Città-Stato Italiane',
    start: 1000, end: 1600,
    color: '#1abc9c', labelLon: 12, labelLat: 43,
    positions: [7,36, 16,36, 18,38, 18,44, 16,46, 10,46, 7,44, 6,40],
    wikipediaSlug: 'Italian_city-states',
  },
  {
    id: 'napoleone',
    name: 'Primo Impero Francese',
    start: 1799, end: 1815,
    color: '#2980b9', labelLon: 5, labelLat: 48,
    positions: [-4,44, -4,50, 2,54, 14,54, 18,48, 14,44, 10,42, 4,42],
    wikipediaSlug: 'First_French_Empire',
  },
  {
    id: 'urss',
    name: 'URSS',
    start: 1922, end: 1991,
    color: '#e74c3c', labelLon: 60, labelLat: 56,
    positions: [22,46, 22,68, 40,72, 60,72, 80,70, 100,68, 80,44, 60,36, 44,40, 28,48],
    wikipediaSlug: 'Soviet_Union',
  },
];

// Lookup per ID — evita .find() ripetuto nel render loop
export const TERRITORY_BY_ID = new Map(TERRITORIES.map(t => [t.id, t]));
