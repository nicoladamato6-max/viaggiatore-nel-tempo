export interface Period {
  name: string;
  start: number;
  end: number;
  color: string;
}

// Macro-ere corrette (fonte: tabella utente)
export const MACRO_ERAS: Period[] = [
  { name: '🌌 Universo primordiale', start: -13_800_000_000, end: -4_600_000_000, color: '#1abc9c' },
  { name: '🌍 Terra primordiale',    start:  -4_600_000_000, end:   -541_000_000, color: '#27ae60' },
  { name: '🐟 Era Paleozoica',       start:    -541_000_000, end:   -252_000_000, color: '#2ecc71' },
  { name: '🦕 Era Mesozoica',        start:    -252_000_000, end:    -66_000_000, color: '#f39c12' },
  { name: '🦎 Era Cenozoica',        start:     -66_000_000, end:     -2_500_000, color: '#e67e22' },
  { name: '🦴 Preistoria',           start:      -2_500_000, end:         -3_500, color: '#e74c3c' },
  { name: '📜 Età Antica',           start:          -3_500, end:            476, color: '#9b59b6' },
  { name: '🏰 Medioevo',             start:             476, end:           1492, color: '#2980b9' },
  { name: '🎨 Età Moderna',          start:            1492, end:           1789, color: '#8e44ad' },
  { name: '⚙️ Età Contemporanea',    start:            1789, end:           2025, color: '#a8c8ff' },
];

// Sottocategorie storiche (solo dopo -2.5M anni, parte umana)
export const SUBCATEGORIES: Period[] = [
  // Preistoria
  { name: 'Paleolitico Inferiore', start: -2_500_000, end: -300_000, color: '#e55039' },
  { name: 'Paleolitico Medio',     start:   -300_000, end:  -40_000, color: '#ec7063' },
  { name: 'Paleolitico Superiore', start:    -40_000, end:  -10_000, color: '#f1948a' },
  { name: 'Mesolitico',            start:    -10_000, end:   -8_000, color: '#f5b7b1' },
  { name: 'Neolitico',             start:     -8_000, end:   -3_500, color: '#fadbd8' },
  { name: 'Età del Rame',          start:     -4_500, end:   -3_300, color: '#cd6155' },
  { name: 'Età del Bronzo',        start:     -3_300, end:   -1_200, color: '#a93226' },
  { name: 'Età del Ferro',         start:     -1_200, end:     -600, color: '#922b21' },
  // Età Antica
  { name: 'Civiltà Mesopotamiche', start:     -3_500, end:     -539, color: '#a569bd' },
  { name: 'Antico Egitto',         start:     -3_100, end:      -30, color: '#bb8fce' },
  { name: 'Grecia Arcaica',        start:       -800, end:     -500, color: '#d7bde2' },
  { name: 'Grecia Classica',       start:       -500, end:     -323, color: '#c39bd3' },
  { name: 'Ellenismo',             start:       -323, end:      -31, color: '#af7ac5' },
  { name: 'Roma Monarchica',       start:       -753, end:     -509, color: '#9b59b6' },
  { name: 'Repubblica Romana',     start:       -509, end:      -27, color: '#8e44ad' },
  { name: 'Impero Romano',         start:        -27, end:      476, color: '#76448a' },
  // Medioevo
  { name: 'Alto Medioevo',         start:        476, end:     1000, color: '#2e86c1' },
  { name: 'Età Carolingia',        start:        800, end:      887, color: '#5dade2' },
  { name: 'Età Feudale',           start:        900, end:     1100, color: '#7fb3d3' },
  { name: 'Basso Medioevo',        start:       1000, end:     1492, color: '#3498db' },
  { name: 'Età Comunale',          start:       1000, end:     1300, color: '#85c1e9' },
  { name: 'Età delle Crociate',    start:       1096, end:     1291, color: '#52be80' },
  { name: 'Umanesimo',             start:       1350, end:     1492, color: '#abebc6' },
  { name: 'Primo Rinascimento',    start:       1400, end:     1492, color: '#82e0aa' },
  // Età Moderna
  { name: 'Rinascimento',          start:       1492, end:     1600, color: '#1abc9c' },
  { name: 'Riforma Protestante',   start:       1517, end:     1648, color: '#16a085' },
  { name: 'Controriforma',         start:       1545, end:     1648, color: '#0e6655' },
  { name: 'Monarchie Assolute',    start:       1600, end:     1789, color: '#148f77' },
  { name: 'Riv. Scientifica',      start:       1543, end:     1700, color: '#117a65' },
  { name: 'Illuminismo',           start:       1715, end:     1789, color: '#0e6251' },
  // Età Contemporanea
  { name: 'Età delle Rivoluzioni', start:       1789, end:     1815, color: '#f0b27a' },
  { name: 'Restaurazione',         start:       1815, end:     1848, color: '#e59866' },
  { name: 'Risorgimento',          start:       1815, end:     1871, color: '#d4a76a' },
  { name: 'Riv. Industriale',      start:       1760, end:     1914, color: '#c8a96e' },
  { name: 'Imperialismo',          start:       1870, end:     1914, color: '#b7950b' },
  { name: 'Belle Époque',          start:       1871, end:     1914, color: '#d4ac0d' },
  { name: 'I Guerra Mondiale',     start:       1914, end:     1918, color: '#c0392b' },
  { name: 'Tra le due guerre',     start:       1919, end:     1939, color: '#a93226' },
  { name: 'II Guerra Mondiale',    start:       1939, end:     1945, color: '#922b21' },
  { name: 'Guerra Fredda',         start:       1947, end:     1991, color: '#1f618d' },
  { name: 'Globalizzazione',       start:       1991, end:     2001, color: '#2e86c1' },
  { name: 'Era Digitale',          start:       2001, end:     2025, color: '#a8c8ff' },
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
