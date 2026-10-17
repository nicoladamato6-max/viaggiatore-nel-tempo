import type { MobileTab } from '../types';

interface Props {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasEvent: boolean;
  isLoggedIn: boolean;
  locale: string;
}

const TABS: { id: MobileTab; icon: string; labelIt: string; labelEn: string }[] = [
  { id: 'globe',    icon: '🌍', labelIt: 'Globo',   labelEn: 'Globe'    },
  { id: 'search',   icon: '🔍', labelIt: 'Cerca',   labelEn: 'Search'   },
  { id: 'timeline', icon: '⏳', labelIt: 'Tempo',   labelEn: 'Timeline' },
  { id: 'profile',  icon: '👤', labelIt: 'Profilo', labelEn: 'Profile'  },
];

export function MobileNav({ activeTab, onTabChange, locale }: Props) {
  const it = locale === 'it';

  return (
    <nav className="mobile-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`mobile-nav__btn${activeTab === tab.id ? ' mobile-nav__btn--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="mobile-nav__icon">{tab.icon}</span>
          <span className="mobile-nav__label">{it ? tab.labelIt : tab.labelEn}</span>
        </button>
      ))}
    </nav>
  );
}
