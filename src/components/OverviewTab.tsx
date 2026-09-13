import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategoryItem, ExpenseEntity, FilterStatus, TabType, NavigationMode } from '../types';
import {
  formatCurrency,
  CATEGORY_COLORS,
  getDueDateStatus,
  ENTITIES,
  getCategoryBadgeClasses,
} from '../utils';
import {
  CheckCircle2,
  Trash2,
  Paperclip,
  Search,
  AlertCircle,
  PlusCircle,
  Calendar,
  Tag,
  RotateCcw,
  Building2,
  User,
  Dumbbell,
  Dices,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  MessageCircle,
  Layers,
} from 'lucide-react';

interface OverviewTabProps {
  expenses: Expense[];
  categories?: ExpenseCategoryItem[];
  onConfirmPayment: (expense: Expense) => void;
  onToggleStatus: (id: number) => void;
  onDeleteExpense: (id: number) => void;
  onOpenReceipt: (expense: Expense) => void;
  onNavigateToTab: (tab: TabType) => void;
  onNavigateToNewWithEntity?: (entity: ExpenseEntity) => void;
  onNotifyWhatsAppExpense?: (expense: Expense) => void;
  onOpenWhatsAppModal?: () => void;
  onOpenCategoriesModal?: () => void;
  whatsappNumber?: string;
  navMode?: NavigationMode;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  expenses,
  categories,
  onConfirmPayment,
  onToggleStatus,
  onDeleteExpense,
  onOpenReceipt,
  onNavigateToTab,
  onNavigateToNewWithEntity,
  onNotifyWhatsAppExpense,
  onOpenWhatsAppModal,
  onOpenCategoriesModal,
  whatsappNumber,
  navMode = 'iphone',
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todas');
  const [filterEntity, setFilterEntity] = useState<ExpenseEntity | 'Todas'>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Consolidated Overall Totals
  const totalGeral = useMemo(
    () => expenses.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0),
    [expenses]
  );

  const pagoGeral = useMemo(
    () =>
      expenses
        .filter(exp => exp.status === 'Pago')
        .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0),
    [expenses]
  );

  const pendenteGeral = useMemo(
    () =>
      expenses
        .filter(exp => exp.status === 'Pendente')
        .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0),
    [expenses]
  );

  const countPendenteGeral = useMemo(
    () => expenses.filter(exp => exp.status === 'Pendente').length,
    [expenses]
  );

  const percentPagoGeral =
    totalGeral > 0 ? Math.round((pagoGeral / totalGeral) * 100) : 0;

  // 2. Divided summary per entity (Pessoal, Academia, Bets)
  const entitySummaries = useMemo(() => {
    const list: ExpenseEntity[] = ['Pessoal', 'Academia', 'Bets'];
    return list.map(ent => {
      const entExpenses = expenses.filter(e => (e.entidade || 'Pessoal') === ent);
      const total = entExpenses.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const pago = entExpenses
        .filter(e => e.status === 'Pago')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const pendente = entExpenses
        .filter(e => e.status === 'Pendente')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const percent = total > 0 ? Math.round((pago / total) * 100) : 0;
      const countTotal = entExpenses.length;
      const countPendente = entExpenses.filter(e => e.status === 'Pendente').length;
      const countPago = entExpenses.filter(e => e.status === 'Pago').length;

      return {
        entity: ent,
        total,
        pago,
        pendente,
        percent,
        countTotal,
        countPendente,
        countPago,
      };
    });
  }, [expenses]);

  // Filtered expense list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expEntity = exp.entidade || 'Pessoal';
      const matchesEntity =
        filterEntity === 'Todas' ? true : expEntity === filterEntity;
      const matchesStatus =
        filterStatus === 'Todas' ? true : exp.status === filterStatus;
      const matchesSearch =
        searchQuery.trim() === '' ||
        exp.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expEntity.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesEntity && matchesStatus && matchesSearch;
    });
  }, [expenses, filterEntity, filterStatus, searchQuery]);

  const getEntityIcon = (entity: ExpenseEntity) => {
    switch (entity) {
      case 'Pessoal':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'Academia':
        return <Dumbbell className="w-4 h-4 text-amber-600" />;
      case 'Bets':
        return <Dices className="w-4 h-4 text-purple-600" />;
    }
  };

  const getEntityBadgeStyle = (entity: ExpenseEntity) => {
    switch (entity) {
      case 'Pessoal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Academia':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Bets':
        return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6 px-3 sm:px-6 pb-20">
      {/* 1. Resumo Geral Consolidado */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Total Consolidado (Geral)
          </h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
            {expenses.length} contas no total
          </span>
        </div>

        {/* Global Cards */}
        <div className={`grid gap-2.5 sm:gap-3 ${navMode === 'macbook' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Gasto Geral Previsto
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight my-1">
              {formatCurrency(totalGeral)}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Pessoal + Academia + Bets
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pendente Geral
            </span>
            <span className="text-lg sm:text-2xl font-black text-rose-600 tracking-tight my-1">
              {formatCurrency(pendenteGeral)}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              <span>{countPendenteGeral} contas a pagar</span>
            </div>
          </div>

          <div className={`bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between ${navMode === 'macbook' ? 'flex' : 'col-span-2 hidden sm:flex'}`}>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Quitado
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight my-1">
              {formatCurrency(pagoGeral)}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>{percentPagoGeral}% liquidado</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        {totalGeral > 0 && (
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Quitação Geral</span>
              <span className="text-slate-900">{percentPagoGeral}% Pago</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentPagoGeral}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* 2. RESUMO DIVIDIDO DE CADA: Pessoal, Academia e Bets (Solicitado explicitamente!) */}
      <section className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Resumo Dividido por Conta &amp; Empresas</span>
            </h2>
            <p className="text-xs text-slate-500">
              Noção exata do valor pago e pendente em cada uma
            </p>
          </div>
        </div>

        {/* 3 Dedicated Cards for Pessoal, Academia and Bets */}
        <div className={`grid gap-3.5 ${navMode === 'macbook' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {entitySummaries.map(item => {
            const isPersonal = item.entity === 'Pessoal';
            const tabTarget: TabType =
              item.entity === 'Pessoal'
                ? 'pessoal'
                : item.entity === 'Academia'
                ? 'academia'
                : 'bets';

            return (
              <div
                key={item.entity}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Card Header with Entity Name and Quick Link */}
                <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      {getEntityIcon(item.entity)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {item.entity === 'Pessoal' && '👤 Despesas Pessoais'}
                          {item.entity === 'Academia' && '🏋️ Academia'}
                          {item.entity === 'Bets' && '🎲 Bets'}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isPersonal
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isPersonal ? 'Pessoal' : 'Empresa'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {item.countTotal} {item.countTotal === 1 ? 'conta cadastrada' : 'contas cadastradas'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigateToTab(tabTarget)}
                    className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-200/90 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl shadow-2xs transition-colors"
                  >
                    <span>Ver Aba</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body: Highlights of Valor Pago vs Pendente vs Total */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* 1. Total Previsto */}
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                        Total
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5 truncate">
                        {formatCurrency(item.total)}
                      </span>
                    </div>

                    {/* 2. VALOR PAGO (Highlighted in Green) */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block flex items-center justify-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Pago</span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5 truncate">
                        {formatCurrency(item.pago)}
                      </span>
                    </div>

                    {/* 3. VALOR PENDENTE (Highlighted in Red) */}
                    <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80">
                      <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide block flex items-center justify-center gap-0.5">
                        <Clock className="w-3 h-3 text-rose-600" />
                        <span>Pendente</span>
                      </span>
                      <span className="text-xs sm:text-sm font-black text-rose-700 block mt-0.5 truncate">
                        {formatCurrency(item.pendente)}
                      </span>
                    </div>
                  </div>

                  {/* Individual Quota Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Status de Pagamento</span>
                      <span className="font-bold text-slate-900">
                        {item.percent}% quitado ({item.countPago} de {item.countTotal})
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percent === 100
                            ? 'bg-emerald-500'
                            : item.percent > 0
                            ? 'bg-blue-500'
                            : 'bg-slate-300'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <hr className="border-slate-200/80" />

      {/* 3. Suas Contas (Lista Completa com Filtro de Entidade e Status) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Todas as Suas Contas
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie e confirme pagamentos em tempo real
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('new_expense')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Nova Despesa</span>
          </button>
        </div>

        {/* Filtro 1: Entidade / Empresa (Todas, Pessoal, Academia, Bets) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Filtrar por Conta / Empresa:
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl">
            {(['Todas', 'Pessoal', 'Academia', 'Bets'] as (ExpenseEntity | 'Todas')[]).map(
              ent => {
                const isActive = filterEntity === ent;
                return (
                  <button
                    key={ent}
                    type="button"
                    onClick={() => setFilterEntity(ent)}
                    className={`py-1.5 px-1 text-xs font-bold rounded-lg transition-all text-center select-none truncate ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ent === 'Todas' && 'Todas'}
                    {ent === 'Pessoal' && '👤 Pessoal'}
                    {ent === 'Academia' && '🏋️ Academia'}
                    {ent === 'Bets' && '🎲 Bets'}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Filtro 2: Status (Todas, Pendente, Pago) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Filtrar por Status:
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
            {(['Todas', 'Pendente', 'Pago'] as FilterStatus[]).map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all text-center select-none ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'Todas' && 'Todas'}
                {status === 'Pendente' && '🔴 Pendente'}
                {status === 'Pago' && '🟢 Pago'}
              </button>
            ))}
          </div>
        </div>

        {/* Banner de Disparo de Lembrete WhatsApp das 09:00 */}
        {onOpenWhatsAppModal && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Lembrete das 09h: WhatsApp Vinculado
                </p>
                <p className="text-[11px] text-slate-600 truncate">
                  {whatsappNumber ? `Para: ${whatsappNumber}` : 'Para: (88) 99441-9892'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenWhatsAppModal}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
            >
              <span>Enviar Resumo</span>
            </button>
          </div>
        )}

        {/* Filter Bar Action: Search + Categories */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por descrição, categoria..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {onOpenCategoriesModal && (
            <button
              type="button"
              onClick={onOpenCategoriesModal}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-2xs transition-colors"
              title="Criar e editar modalidades e símbolos das despesas"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Modalidades</span>
            </button>
          )}
        </div>

        {/* Expense Cards List */}
        {filteredExpenses.length > 0 ? (
          <div className={`gap-3 ${navMode === 'macbook' ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-3'}`}>
            {filteredExpenses.map(exp => {
              const isPaid = exp.status === 'Pago';
              const entity = exp.entidade || 'Pessoal';
              const categoryBadge = getCategoryBadgeClasses(exp.categoria, categories);
              const dueInfo = getDueDateStatus(exp.vencimento, exp.status);
              const hasReceipt = Boolean(exp.comprovante || exp.comprovanteNome);

              return (
                <div
                  key={exp.id}
                  className={`bg-white p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-sm ${
                    isPaid
                      ? 'border-slate-200 bg-slate-50/40'
                      : dueInfo.isOverdue
                      ? 'border-rose-300 ring-1 ring-rose-200/50'
                      : dueInfo.isToday
                      ? 'border-amber-300 ring-1 ring-amber-200/50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top: Entity Badge + Status Emoji + Name */}
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-base select-none mt-0.5">
                        {isPaid ? '🟢' : '🔴'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {/* Entity Tag */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getEntityBadgeStyle(
                              entity
                            )}`}
                          >
                            {getEntityIcon(entity)}
                            <span>{entity}</span>
                          </span>

                          {/* Category Tag with Custom Symbol */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
                          >
                            <span className="text-xs">{categoryBadge.simbolo}</span>
                            <span>{exp.categoria}</span>
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                          {exp.descricao}
                        </h3>

                        {/* Due Date & Alerts */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700'
                                : dueInfo.isOverdue
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : dueInfo.isToday
                                ? 'bg-amber-100 text-amber-800 font-bold'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Vence: {exp.vencimento}</span>
                            {!isPaid && (
                              <span className="opacity-90 font-bold">
                                ({dueInfo.label})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base sm:text-lg font-black text-slate-900 block">
                        {formatCurrency(exp.valor)}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide inline-block px-1.5 py-0.5 rounded ${
                          isPaid
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {exp.status}
                      </span>
                      {!isPaid && onNotifyWhatsAppExpense && (
                        <button
                          type="button"
                          onClick={() => onNotifyWhatsAppExpense(exp)}
                          className="mt-1.5 flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 px-1.5 py-0.5 rounded transition-colors ml-auto shadow-xs active:scale-95"
                          title="Enviar lembrete desta conta para o WhatsApp"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Avisar Zap</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attachment/Comprovante info */}
                  {hasReceipt && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(exp)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline truncate max-w-[260px]"
                      >
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          📁 Comprovante: {exp.comprovanteNome || 'Ver anexo'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(exp)}
                        className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Visualizar
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    {exp.status === 'Pendente' ? (
                      <button
                        type="button"
                        id={`pay-${exp.id}`}
                        onClick={() => onConfirmPayment(exp)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                        title="Confirmar pagamento e ajustar valor caso tenha variado"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar Pagamento</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(exp.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                        title="Desfazer e marcar como Pendente"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>Pago (Desfazer)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      id={`del-${exp.id}`}
                      onClick={() => onDeleteExpense(exp.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Nenhuma despesa encontrada com estes filtros.
            </p>
            <p className="text-xs text-slate-500">
              Tente selecionar 'Todas' nas opções acima ou cadastre uma nova despesa.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
