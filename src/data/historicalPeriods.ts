export interface Period {
  name: string;
  start: number;
  end: number;
  color: string;
  wikipediaSlug?: string;
}

// Macro-ere corrette (fonte: tabella utente)
export const MACRO_ERAS: Period[] = [
  { name: '🌌 Universo primordiale', start: -13_800_000_000, end: -4_600_000_000, color: '#1abc9c', wikipediaSlug: 'Observable_universe' },
  { name: '🌍 Terra primordiale',    start:  -4_600_000_000, end:   -541_000_000, color: '#27ae60', wikipediaSlug: 'History_of_Earth' },
  { name: '🐟 Era Paleozoica',       start:    -541_000_000, end:   -252_000_000, color: '#2ecc71', wikipediaSlug: 'Paleozoic' },
  { name: '🦕 Era Mesozoica',        start:    -252_000_000, end:    -66_000_000, color: '#f39c12', wikipediaSlug: 'Mesozoic' },
  { name: '🦎 Era Cenozoica',        start:     -66_000_000, end:     -2_500_000, color: '#e67e22', wikipediaSlug: 'Cenozoic' },
  { name: '🦴 Preistoria',           start:      -2_500_000, end:         -3_500, color: '#e74c3c', wikipediaSlug: 'Prehistory' },
  { name: '📜 Età Antica',           start:          -3_500, end:            476, color: '#9b59b6', wikipediaSlug: 'Ancient_history' },
  { name: '🏰 Medioevo',             start:             476, end:           1492, color: '#2980b9', wikipediaSlug: 'Middle_Ages' },
  { name: '🎨 Età Moderna',          start:            1492, end:           1789, color: '#8e44ad', wikipediaSlug: 'Early_modern_period' },
  { name: '⚙️ Età Contemporanea',    start:            1789, end:           2025, color: '#a8c8ff', wikipediaSlug: 'Modern_history' },
];

// Sottocategorie storiche (solo dopo -2.5M anni, parte umana)
export const SUBCATEGORIES: Period[] = [
  // Preistoria
  { name: 'Paleolitico Inferiore', start: -2_500_000, end: -300_000, color: '#e55039', wikipediaSlug: 'Lower_Paleolithic' },
  { name: 'Paleolitico Medio',     start:   -300_000, end:  -40_000, color: '#ec7063', wikipediaSlug: 'Middle_Paleolithic' },
  { name: 'Paleolitico Superiore', start:    -40_000, end:  -10_000, color: '#f1948a', wikipediaSlug: 'Upper_Paleolithic' },
  { name: 'Mesolitico',            start:    -10_000, end:   -8_000, color: '#f5b7b1', wikipediaSlug: 'Mesolithic' },
  { name: 'Neolitico',             start:     -8_000, end:   -3_500, color: '#fadbd8', wikipediaSlug: 'Neolithic' },
  { name: 'Età del Rame',          start:     -4_500, end:   -3_300, color: '#cd6155', wikipediaSlug: 'Chalcolithic' },
  { name: 'Età del Bronzo',        start:     -3_300, end:   -1_200, color: '#a93226', wikipediaSlug: 'Bronze_Age' },
  { name: 'Età del Ferro',         start:     -1_200, end:     -600, color: '#922b21', wikipediaSlug: 'Iron_Age' },
  // Età Antica
  { name: 'Civiltà Mesopotamiche', start:     -3_500, end:     -539, color: '#a569bd', wikipediaSlug: 'Mesopotamia' },
  { name: 'Antico Egitto',         start:     -3_100, end:      -30, color: '#bb8fce', wikipediaSlug: 'Ancient_Egypt' },
  { name: 'Grecia Arcaica',        start:       -800, end:     -500, color: '#d7bde2', wikipediaSlug: 'Archaic_Greece' },
  { name: 'Grecia Classica',       start:       -500, end:     -323, color: '#c39bd3', wikipediaSlug: 'Classical_Greece' },
  { name: 'Ellenismo',             start:       -323, end:      -31, color: '#af7ac5', wikipediaSlug: 'Hellenistic_period' },
  { name: 'Roma Monarchica',       start:       -753, end:     -509, color: '#9b59b6', wikipediaSlug: 'Kingdom_of_Rome' },
  { name: 'Repubblica Romana',     start:       -509, end:      -27, color: '#8e44ad', wikipediaSlug: 'Roman_Republic' },
  { name: 'Impero Romano',         start:        -27, end:      476, color: '#76448a', wikipediaSlug: 'Roman_Empire' },
  // Medioevo
  { name: 'Alto Medioevo',         start:        476, end:     1000, color: '#2e86c1', wikipediaSlug: 'Early_Middle_Ages' },
  { name: 'Età Carolingia',        start:        800, end:      887, color: '#5dade2', wikipediaSlug: 'Carolingian_Empire' },
  { name: 'Età Feudale',           start:        900, end:     1100, color: '#7fb3d3', wikipediaSlug: 'Feudalism' },
  { name: 'Basso Medioevo',        start:       1000, end:     1492, color: '#3498db', wikipediaSlug: 'High_Middle_Ages' },
  { name: 'Età Comunale',          start:       1000, end:     1300, color: '#85c1e9', wikipediaSlug: 'Italian_city-states' },
  { name: 'Età delle Crociate',    start:       1096, end:     1291, color: '#52be80', wikipediaSlug: 'Crusades' },
  { name: 'Umanesimo',             start:       1350, end:     1492, color: '#abebc6', wikipediaSlug: 'Renaissance_humanism' },
  { name: 'Primo Rinascimento',    start:       1400, end:     1492, color: '#82e0aa', wikipediaSlug: 'Italian_Renaissance' },
  // Età Moderna
  { name: 'Rinascimento',          start:       1492, end:     1600, color: '#1abc9c', wikipediaSlug: 'Renaissance' },
  { name: 'Riforma Protestante',   start:       1517, end:     1648, color: '#16a085', wikipediaSlug: 'Protestant_Reformation' },
  { name: 'Controriforma',         start:       1545, end:     1648, color: '#0e6655', wikipediaSlug: 'Counter-Reformation' },
  { name: 'Monarchie Assolute',    start:       1600, end:     1789, color: '#148f77', wikipediaSlug: 'Absolute_monarchy' },
  { name: 'Riv. Scientifica',      start:       1543, end:     1700, color: '#117a65', wikipediaSlug: 'Scientific_Revolution' },
  { name: 'Illuminismo',           start:       1715, end:     1789, color: '#0e6251', wikipediaSlug: 'Age_of_Enlightenment' },
  // Età Contemporanea
  { name: 'Età delle Rivoluzioni', start:       1789, end:     1815, color: '#f0b27a', wikipediaSlug: 'Age_of_Revolution' },
  { name: 'Restaurazione',         start:       1815, end:     1848, color: '#e59866', wikipediaSlug: 'Concert_of_Europe' },
  { name: 'Risorgimento',          start:       1815, end:     1871, color: '#d4a76a', wikipediaSlug: 'Risorgimento' },
  { name: 'Riv. Industriale',      start:       1760, end:     1914, color: '#c8a96e', wikipediaSlug: 'Industrial_Revolution' },
  { name: 'Imperialismo',          start:       1870, end:     1914, color: '#b7950b', wikipediaSlug: 'Age_of_imperialism' },
  { name: 'Belle Époque',          start:       1871, end:     1914, color: '#d4ac0d', wikipediaSlug: 'Belle_Époque' },
  { name: 'I Guerra Mondiale',     start:       1914, end:     1918, color: '#c0392b', wikipediaSlug: 'World_War_I' },
  { name: 'Tra le due guerre',     start:       1919, end:     1939, color: '#a93226', wikipediaSlug: 'Interwar_period' },
  { name: 'II Guerra Mondiale',    start:       1939, end:     1945, color: '#922b21', wikipediaSlug: 'World_War_II' },
  { name: 'Guerra Fredda',         start:       1947, end:     1991, color: '#1f618d', wikipediaSlug: 'Cold_War' },
  { name: 'Globalizzazione',       start:       1991, end:     2001, color: '#2e86c1', wikipediaSlug: 'Globalization' },
  { name: 'Era Digitale',          start:       2001, end:     2025, color: '#a8c8ff', wikipediaSlug: 'Digital_age' },
];

export function getActivePeriods(year: number): Period[] {
  return SUBCATEGORIES.filter(p => year >= p.start && year <= p.end);
}

export function getCurrentMacroEra(year: number): Period {
  return MACRO_ERAS.find(e => year >= e.start && year < e.end) ?? MACRO_ERAS[MACRO_ERAS.length - 1];
}

// Greedy swim-lane assignment per il Gantt: evita sovrapposizioni visive
export function assignLanes(periods: Period[]): Array<{ period: Period; lane: number }> {
  const sorted = [...periods].sort((a, b) => a.start - b.start);
  const result: Array<{ period: Period; lane: number }> = [];
  const laneEnds: number[] = [];
  for (const p of sorted) {
    let lane = laneEnds.findIndex(end => end <= p.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = p.end;
    result.push({ period: p, lane });
  }
  return result;
}
