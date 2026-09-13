import React from 'react';
import { TabType, NavigationMode } from '../types';
import { BarChart3, PlusCircle, Settings2, User, Dumbbell, Dices, Smartphone, Laptop } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCounts: {
    total: number;
    Pessoal: number;
    Academia: number;
    Bets: number;
  };
  navMode?: NavigationMode;
  onToggleNavMode?: (mode: NavigationMode) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCounts,
  navMode = 'iphone',
  onToggleNavMode,
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    badgeCount?: number;
    highlight?: boolean;
  }[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      shortcut: '1',
      icon: <BarChart3 className="w-4 h-4" />,
      badgeCount: pendingCounts.total,
    },
    {
      id: 'pessoal',
      label: 'Pessoal',
      shortcut: '2',
      icon: <User className="w-4 h-4 text-blue-500" />,
      badgeCount: pendingCounts.Pessoal,
    },
    {
      id: 'academia',
      label: 'Academia',
      shortcut: '3',
      icon: <Dumbbell className="w-4 h-4 text-amber-500" />,
      badgeCount: pendingCounts.Academia,
    },
    {
      id: 'bets',
      label: 'Bets',
      shortcut: '4',
      icon: <Dices className="w-4 h-4 text-purple-500" />,
      badgeCount: pendingCounts.Bets,
    },
    {
      id: 'new_expense',
      label: 'Nova Despesa',
      shortcut: '+',
      icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
      highlight: true,
    },
    {
      id: 'settings',
      label: 'Ajustes',
      shortcut: '0',
      icon: <Settings2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className={`px-3 sm:px-6 sticky top-2 z-20 ${navMode === 'macbook' ? 'max-w-7xl mx-auto w-full' : ''}`}>
      <nav
        aria-label="Navegação por Abas"
        className={`bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center justify-between gap-1 ${
          navMode === 'macbook' ? 'w-full' : 'overflow-x-auto no-scrollbar'
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3.5 rounded-xl font-bold text-xs transition-all duration-200 select-none whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span>{tab.label}</span>
                {navMode === 'macbook' && tab.shortcut && (
                  <span className={`text-[10px] px-1 rounded hidden lg:inline-block font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-500'}`}>
                    {tab.shortcut}
                  </span>
                )}
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* MacBook Mode Switcher in the Navigation bar */}
        {onToggleNavMode && (
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onToggleNavMode(navMode === 'iphone' ? 'macbook' : 'iphone')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title={navMode === 'iphone' ? 'Mudar para Modo MacBook' : 'Mudar para Modo iPhone'}
            >
              {navMode === 'iphone' ? (
                <>
                  <Laptop className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px]">Modo MacBook</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px]">Modo iPhone</span>
                </>
              )}
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};
