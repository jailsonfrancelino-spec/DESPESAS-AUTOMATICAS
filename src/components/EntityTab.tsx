import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategoryItem, ExpenseEntity, FilterStatus, NavigationMode } from '../types';
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
  PlusCircle,
  Calendar,
  Tag,
  RotateCcw,
  Clock,
  User,
  Dumbbell,
  Dices,
  Briefcase,
  Layers,
  MessageCircle,
} from 'lucide-react';

interface EntityTabProps {
  entity: ExpenseEntity;
  expenses: Expense[];
  categories?: ExpenseCategoryItem[];
  onConfirmPayment: (expense: Expense) => void;
  onToggleStatus: (id: number) => void;
  onDeleteExpense: (id: number) => void;
  onOpenReceipt: (expense: Expense) => void;
  onAddNewExpense: (entity: ExpenseEntity) => void;
  onNotifyWhatsAppExpense?: (expense: Expense) => void;
  onOpenWhatsAppModal?: () => void;
  onOpenCategoriesModal?: () => void;
  navMode?: NavigationMode;
}

export const EntityTab: React.FC<EntityTabProps> = ({
  entity,
  expenses,
  categories,
  onConfirmPayment,
  onToggleStatus,
  onDeleteExpense,
  onOpenReceipt,
  onAddNewExpense,
  onNotifyWhatsAppExpense,
  onOpenWhatsAppModal,
  onOpenCategoriesModal,
  navMode = 'iphone',
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only for this entity
  const entityExpenses = useMemo(() => {
    return expenses.filter(e => (e.entidade || 'Pessoal') === entity);
  }, [expenses, entity]);

  // Calculations for this entity
  const total = useMemo(
    () => entityExpenses.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    [entityExpenses]
  );

  const pago = useMemo(
    () =>
      entityExpenses
        .filter(e => e.status === 'Pago')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    [entityExpenses]
  );

  const pendente = useMemo(
    () =>
      entityExpenses
        .filter(e => e.status === 'Pendente')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    [entityExpenses]
  );

  const percentPago = total > 0 ? Math.round((pago / total) * 100) : 0;
  const countPago = entityExpenses.filter(e => e.status === 'Pago').length;
  const countPendente = entityExpenses.filter(e => e.status === 'Pendente').length;

  // Filtered by status and search
  const displayedExpenses = useMemo(() => {
    return entityExpenses.filter(exp => {
      const matchesStatus =
        filterStatus === 'Todas' ? true : exp.status === filterStatus;
      const matchesSearch =
        searchQuery.trim() === '' ||
        exp.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [entityExpenses, filterStatus, searchQuery]);

  const entityConfig = ENTITIES.find(e => e.id === entity) || ENTITIES[0];

  const getEntityIcon = () => {
    if (entity === 'Pessoal') return <User className="w-5 h-5 text-blue-600" />;
    if (entity === 'Academia') return <Dumbbell className="w-5 h-5 text-amber-600" />;
    return <Dices className="w-5 h-5 text-purple-600" />;
  };

  return (
    <div className="space-y-6 px-3 sm:px-6 pb-20 pt-1">
      {/* Entity Title & Header Card */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${entityConfig.lightBg} border ${entityConfig.borderColor}`}>
              {getEntityIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {entity === 'Pessoal' && 'Despesas Pessoais'}
                  {entity === 'Academia' && 'Empresa: Academia'}
                  {entity === 'Bets' && 'Empresa: Bets'}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${entityConfig.lightBg} ${entityConfig.textColor} ${entityConfig.borderColor}`}
                >
                  {entityConfig.badgeLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {entityConfig.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAddNewExpense(entity)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Adicionar Conta</span>
            <span className="sm:hidden">+ Nova</span>
          </button>
        </div>

        {/* Resumo Exclusivo da Entidade: Total, Pago, Pendente */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
              Total Previsto
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5 truncate">
              {formatCurrency(total)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {entityExpenses.length} contas
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block">
              ✅ Valor Pago
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5 truncate">
              {formatCurrency(pago)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              {countPago} quitada(s)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wide block">
              ⏳ Pendente
            </span>
            <span className="text-xs sm:text-sm font-black text-rose-700 block mt-0.5 truncate">
              {formatCurrency(pendente)}
            </span>
            <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">
              {countPendente} a pagar
            </span>
          </div>
        </div>

        {/* Barra de Quitação */}
        {total > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Taxa de Quitação em {entity}</span>
              <span className="font-bold text-slate-900">{percentPago}% Pago</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentPago}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* Listagem de Contas desta Entidade */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Contas de {entity} ({displayedExpenses.length})
          </h3>
        </div>

        {/* Filtro de Status */}
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
              {status === 'Pendente' && `🔴 Pendente (${countPendente})`}
              {status === 'Pago' && `🟢 Pago (${countPago})`}
            </button>
          ))}
        </div>

        {/* Busca rápida */}
        {entityExpenses.length > 2 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Buscar conta em ${entity}...`}
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
        )}

        {/* Cards */}
        {displayedExpenses.length > 0 ? (
          <div className={`gap-3 ${navMode === 'macbook' ? 'grid grid-cols-1 lg:grid-cols-2' : 'space-y-3'}`}>
            {displayedExpenses.map(exp => {
              const isPaid = exp.status === 'Pago';
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
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-base select-none mt-0.5">
                        {isPaid ? '🟢' : '🔴'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
                          >
                            <span className="text-xs">{categoryBadge.simbolo}</span>
                            <span>{exp.categoria}</span>
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">
                          {exp.descricao}
                        </h4>

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

                  {/* Attachment */}
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

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    {exp.status === 'Pendente' ? (
                      <button
                        type="button"
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
                      >
                        <RotateCcw className="w-3 h-3 text-slate-500" />
                        <span>Pago (Desfazer)</span>
                      </button>
                    )}

                    <button
                      type="button"
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
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              Nenhuma conta cadastrada para {entity} neste filtro.
            </p>
            <button
              type="button"
              onClick={() => onAddNewExpense(entity)}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Cadastrar Despesa em {entity}</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
