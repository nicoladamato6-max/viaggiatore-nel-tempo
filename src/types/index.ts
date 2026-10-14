export type EventCategory = 'storia' | 'arte' | 'musica' | 'scienza' | 'geologia' | 'cosmo' | 'filosofia' | 'sport';

/** Tipo di entità storica — secondo livello di filtro ortogonale alla disciplina */
export type EntityType = 'persona' | 'evento' | 'conflitto' | 'opera' | 'luogo' | 'scoperta';

export type Locale = 'it' | 'en';

export interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  lat?: number;
  lng?: number;
  category: EventCategory;
  tipo?: EntityType;
  description: string;
  wikipediaSlug: string;
  imageUrl?: string;
  isCosmic: boolean;
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  persona:   '👤 Personaggi',
  evento:    '⚡ Eventi',
  conflitto: '⚔️ Conflitti',
  opera:     '🎭 Opere',
  luogo:     '📍 Luoghi',
  scoperta:  '💡 Scoperte',
};

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  persona:   '#f1c40f',
  evento:    '#e67e22',
  conflitto: '#ef4444',
  opera:     '#e056a0',
  luogo:     '#1abc9c',
  scoperta:  '#00bcd4',
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  storia:    '#e74c3c',
  arte:      '#9b59b6',
  musica:    '#f39c12',
  scienza:   '#3498db',
  geologia:  '#27ae60',
  cosmo:     '#1abc9c',
  filosofia: '#8b5cf6',
  sport:     '#22d3ee',
};

/** Target per la telecamera: coordinata geografica, corpo celeste, o transizione cosmo↔Terra. */
export type FlyTarget =
  | { kind: 'geo';    lat: number; lng: number; ts: number; range?: number }
  | { kind: 'body';   entityId: string; ts: number }
  | { kind: 'cosmic'; ts: number }
  | { kind: 'earth';  ts: number };

export interface WikiSearchResult {
  pageid: number;
  title: string;
  slug: string;
  snippet: string;
}

/** Marker temporaneo per risultati Wikipedia con coordinate Wikidata */
export interface WikiMarker {
  lat: number;
  lng: number;
  title: string;
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  storia:    'Storia',
  arte:      'Arte',
  musica:    'Musica',
  scienza:   'Scienza',
  geologia:  'Geologia',
  cosmo:     'Cosmo',
  filosofia: 'Fil. & Rel.',
  sport:     'Sport',
};
