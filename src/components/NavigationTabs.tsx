import React from 'react';
import { TabType, ExpenseEntity } from '../types';
import { BarChart3, PlusCircle, Settings2, User, Dumbbell, Dices } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCounts: {
    total: number;
    Pessoal: number;
    Academia: number;
    Bets: number;
  };
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCounts,
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    highlight?: boolean;
  }[] = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: <BarChart3 className="w-4 h-4" />,
      badgeCount: pendingCounts.total,
    },
    {
      id: 'pessoal',
      label: 'Pessoal',
      icon: <User className="w-4 h-4 text-blue-500" />,
      badgeCount: pendingCounts.Pessoal,
    },
    {
      id: 'academia',
      label: 'Academia',
      icon: <Dumbbell className="w-4 h-4 text-amber-500" />,
      badgeCount: pendingCounts.Academia,
    },
    {
      id: 'bets',
      label: 'Bets',
      icon: <Dices className="w-4 h-4 text-purple-500" />,
      badgeCount: pendingCounts.Bets,
    },
    {
      id: 'new_expense',
      label: 'Nova Despesa',
      icon: <PlusCircle className="w-4 h-4 text-emerald-500" />,
      highlight: true,
    },
    {
      id: 'settings',
      label: 'Ajustes',
      icon: <Settings2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="px-3 sm:px-6 sticky top-2 z-20">
      <nav
        aria-label="Navegação por Abas"
        className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200/90 flex items-center gap-1 overflow-x-auto no-scrollbar"
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-xl font-bold text-xs transition-all duration-200 select-none whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
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
      </nav>
    </div>
  );
};
