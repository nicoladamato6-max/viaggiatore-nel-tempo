import { useEffect, useRef } from 'react';
import './MobileDock.css';

export type MobileTabId = 'tm' | 'cerca' | 'ai' | 'altro';

interface Props {
  currentYear: number;
  formatYear: (y: number) => string;
  getEra: (y: number) => { label: string; color: string };
  activeTab: MobileTabId | null;
  onOpenTab: (tab: MobileTabId) => void;
}

export function MobileDock({ currentYear, formatYear, getEra, activeTab, onOpenTab }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const era = getEra(currentYear);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--console-h', `${el.getBoundingClientRect().height}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const buttons: { id: MobileTabId; icon: string; lbl: string }[] = [
    { id: 'tm',    icon: '⏱',  lbl: 'TEMPO' },
    { id: 'cerca', icon: '⌕',  lbl: 'CERCA' },
    { id: 'ai',    icon: '⬡',  lbl: 'AI'    },
    { id: 'altro', icon: '···', lbl: 'ALTRO' },
  ];

  return (
    <div ref={ref} className="mdock">
      <button
        className="mdock__year"
        style={{ color: era.color }}
        onClick={() => onOpenTab('tm')}
        title="Apri Macchina del Tempo"
      >
        {formatYear(currentYear)}
      </button>

      <div className="mdock__btns">
        {buttons.map(({ id, icon, lbl }) => (
          <button
            key={id}
            className={`mdock__btn${activeTab === id ? ' mdock__btn--on' : ''}`}
            onClick={() => onOpenTab(id)}
          >
            <span className="mdock__icon">{icon}</span>
            <span className="mdock__lbl">{lbl}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
