export type EventCategory = 'storia' | 'arte' | 'musica' | 'scienza' | 'geologia' | 'cosmo';

export interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  lat?: number;
  lng?: number;
  category: EventCategory;
  description: string;
  wikipediaSlug: string;
  imageUrl?: string;
  isCosmic: boolean;
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  storia:   '#e74c3c',
  arte:     '#9b59b6',
  musica:   '#f39c12',
  scienza:  '#3498db',
  geologia: '#27ae60',
  cosmo:    '#1abc9c',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  storia:   'Storia',
  arte:     'Arte',
  musica:   'Musica',
  scienza:  'Scienza',
  geologia: 'Geologia',
  cosmo:    'Cosmo',
};
