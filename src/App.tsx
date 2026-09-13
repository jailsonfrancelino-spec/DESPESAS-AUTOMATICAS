/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseCategoryItem, ExpenseEntity, TabType, NotificationSettings, NavigationMode } from './types';
import {
  loadExpensesFromStorage,
  saveExpensesToStorage,
  loadCategoriesFromStorage,
  saveCategoriesToStorage,
  INITIAL_EXPENSES,
  formatDateToBR,
  formatDateToISO,
  loadNotificationSettings,
  saveNotificationSettings,
  playNotificationChime,
  showNativeNotification,
  formatPhoneNumberBR,
} from './utils';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { OverviewTab } from './components/OverviewTab';
import { EntityTab } from './components/EntityTab';
import { NewExpenseTab } from './components/NewExpenseTab';
import { SettingsTab } from './components/SettingsTab';
import { ReceiptModal } from './components/ReceiptModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { PaymentConfirmationModal } from './components/PaymentConfirmationModal';
import { LoginScreen } from './components/LoginScreen';
import { SupabaseDiagnosticModal } from './components/SupabaseDiagnosticModal';
import { Bell, X } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState<{ username: string; email?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('jailson_auth_session');
      if (saved) {
        return JSON.parse(saved);
      }
      // Sessão inicial salva automaticamente para jailson12
      const defaultAuth = { username: 'jailson12', email: 'jailson12@hotmail.com' };
      localStorage.setItem('jailson_auth_session', JSON.stringify(defaultAuth));
      return defaultAuth;
    } catch {
      return { username: 'jailson12', email: 'jailson12@hotmail.com' };
    }
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    return loadExpensesFromStorage();
  });
  const [categories, setCategories] = useState<ExpenseCategoryItem[]>(() => {
    return loadCategoriesFromStorage();
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    return loadNotificationSettings();
  });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [newExpenseEntity, setNewExpenseEntity] = useState<ExpenseEntity>('Pessoal');
  const [receiptExpense, setReceiptExpense] = useState<Expense | null>(null);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedExpenseForWhatsApp, setSelectedExpenseForWhatsApp] = useState<Expense | null>(null);
  const [dailyAlarmBannerVisible, setDailyAlarmBannerVisible] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [paymentModalExpense, setPaymentModalExpense] = useState<Expense | null>(null);
  const [navMode, setNavMode] = useState<NavigationMode>(() => {
    try {
      const saved = localStorage.getItem('jailson_nav_mode');
      return saved === 'macbook' ? 'macbook' : 'iphone';
    } catch {
      return 'iphone';
    }
  });

  const handleToggleNavMode = (mode: NavigationMode) => {
    setNavMode(mode);
    try {
      localStorage.setItem('jailson_nav_mode', mode);
    } catch {
      // ignore
    }
  };

  // Keyboard navigation shortcuts when in MacBook mode
  useEffect(() => {
    if (navMode !== 'macbook') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in form inputs or modals
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('overview');
      } else if (e.key === '2') {
        setActiveTab('pessoal');
      } else if (e.key === '3') {
        setActiveTab('academia');
      } else if (e.key === '4') {
        setActiveTab('bets');
      } else if (e.key === '+' || e.key === 'n' || e.key === 'N') {
        setActiveTab('new_expense');
      } else if (e.key === '0') {
        setActiveTab('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navMode]);

  // Sync expenses with localStorage
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Sync categories
  const handleSaveCategories = (updatedCategories: ExpenseCategoryItem[]) => {
    setCategories(updatedCategories);
    saveCategoriesToStorage(updatedCategories);
  };

  // Sync notification settings with localStorage
  const handleUpdateNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  // Pending counts per entity and total
  const pendingCounts = useMemo(() => {
    const total = expenses.filter(e => e.status === 'Pendente').length;
    const Pessoal = expenses.filter(
      e => (e.entidade || 'Pessoal') === 'Pessoal' && e.status === 'Pendente'
    ).length;
    const Academia = expenses.filter(
      e => e.entidade === 'Academia' && e.status === 'Pendente'
    ).length;
    const Bets = expenses.filter(
      e => e.entidade === 'Bets' && e.status === 'Pendente'
    ).length;

    return { total, Pessoal, Academia, Bets };
  }, [expenses]);

  // Contas pendentes que vencem HOJE
  const dueTodayExpenses = useMemo(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    return expenses.filter(e => {
      if (e.status === 'Pago') return false;
      const dueISO = formatDateToISO(e.vencimento);
      return dueISO === todayISO;
    });
  }, [expenses]);

  const dueTodayCount = dueTodayExpenses.length;

  // Background Daily 09:00 AM Notification Checker
  useEffect(() => {
    const checkDailyReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayKey = now.toISOString().split('T')[0];

      // Dispara se a hora atual for >= notifyHour (padrão: 9) e ainda não tiver disparado hoje
      if (
        currentHour >= (notificationSettings.notifyHour ?? 9) &&
        notificationSettings.lastNotifiedDate !== todayKey
      ) {
        if (dueTodayExpenses.length > 0) {
          if (notificationSettings.soundEnabled) {
            playNotificationChime();
          }
          if (notificationSettings.browserNotificationsEnabled) {
            showNativeNotification(
              '⏰ Lembrete de Vencimento (09:00)',
              `Você tem ${dueTodayExpenses.length} conta(s) com vencimento hoje! Toque para avisar no WhatsApp ${formatPhoneNumberBR(
                notificationSettings.whatsappNumber
              )}.`,
              () => {
                setSelectedExpenseForWhatsApp(null);
                setWhatsAppModalOpen(true);
              }
            );
          }
          setDailyAlarmBannerVisible(true);
        }

        const updated: NotificationSettings = {
          ...notificationSettings,
          lastNotifiedDate: todayKey,
        };
        setNotificationSettings(updated);
        saveNotificationSettings(updated);
      }
    };

    checkDailyReminder();
    const interval = setInterval(checkDailyReminder, 25000);
    return () => clearInterval(interval);
  }, [notificationSettings, dueTodayExpenses]);

  // Action: Open Payment Modal to confirm and edit varying amount
  const handleOpenPaymentModal = (expense: Expense) => {
    setPaymentModalExpense(expense);
  };

  // Action: Confirm payment with edited amount and details
  const handleConfirmPaymentWithDetails = (
    expenseId: number,
    paidAmount: number,
    paidDate: string,
    notes?: string,
    comprovanteData?: {
      comprovante?: string;
      comprovanteNome?: string;
      comprovanteTipo?: 'image' | 'pdf' | 'file';
    }
  ) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === expenseId) {
          return {
            ...exp,
            status: 'Pago',
            valor: paidAmount,
            pagoEm: paidDate,
            observacao: notes !== undefined && notes !== '' ? notes : exp.observacao,
            comprovante: comprovanteData?.comprovante || exp.comprovante,
            comprovanteNome: comprovanteData?.comprovanteNome || exp.comprovanteNome,
            comprovanteTipo: comprovanteData?.comprovanteTipo || exp.comprovanteTipo,
          };
        }
        return exp;
      })
    );
  };

  // Action: Toggle between Pago and Pendente
  const handleToggleStatus = (id: number) => {
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id
          ? {
              ...exp,
              status: exp.status === 'Pago' ? 'Pendente' : 'Pago',
            }
          : exp
      )
    );
  };

  // Action: Delete
  const handleDeleteExpense = (id: number) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Action: Add new expense
  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: Date.now(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleNavigateToNewWithEntity = (entity: ExpenseEntity) => {
    setNewExpenseEntity(entity);
    setActiveTab('new_expense');
  };

  const handleImportExpenses = (imported: Expense[]) => {
    setExpenses(imported);
  };

  const handleResetExpenses = () => {
    setExpenses(INITIAL_EXPENSES);
  };

  // Open WhatsApp Modal for a specific expense
  const handleNotifyWhatsAppExpense = (expense: Expense) => {
    setSelectedExpenseForWhatsApp(expense);
    setWhatsAppModalOpen(true);
  };

  // Open WhatsApp Modal for Daily Summary
  const handleOpenDailyWhatsAppModal = () => {
    setSelectedExpenseForWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleLoginSuccess = (user: { username: string; email?: string }) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('jailson_auth_session');
    } catch {
      // ignore
    }
    setAuthUser(null);
  };

  // Se o usuário não estiver autenticado, exibe a tela de login moderna com Tailwind
  if (!authUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex justify-center selection:bg-blue-100">
      {/* Mobile-first iPhone Shell or Widescreen MacBook Shell Container */}
      <div
        className={`w-full min-h-screen bg-[#F8F9FA] shadow-md border-x border-slate-200/80 flex flex-col transition-all duration-200 ${
          navMode === 'macbook' ? 'max-w-7xl' : 'max-w-lg'
        }`}
      >
        {/* App Header with WhatsApp 09h Indicator */}
        <Header
          pendingCount={pendingCounts.total}
          dueTodayCount={dueTodayCount}
          whatsappNumber={notificationSettings.whatsappNumber}
          onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
          navMode={navMode}
          onToggleNavMode={handleToggleNavMode}
          authUser={authUser}
          onLogout={handleLogout}
          onOpenSupabaseDiagnostic={() => setIsSupabaseModalOpen(true)}
        />

        {/* 09:00 AM Due Today Push Alert In-App Banner */}
        {dailyAlarmBannerVisible && dueTodayCount > 0 && (
          <div className="mx-4 sm:mx-6 mb-2 p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md flex items-center justify-between gap-2.5 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/20 text-white shrink-0">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">
                  ⏰ Lembrete 09:00: Contas vencem hoje!
                </p>
                <p className="text-[11px] text-emerald-100 truncate">
                  {dueTodayCount} conta(s) a pagar. Número: {formatPhoneNumberBR(notificationSettings.whatsappNumber)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleOpenDailyWhatsAppModal}
                className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-xs active:scale-95 transition-all"
              >
                Avisar Zap
              </button>
              <button
                type="button"
                onClick={() => setDailyAlarmBannerVisible(false)}
                className="p-1 rounded-md hover:bg-white/20 text-white/80 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs (Visão Geral, Pessoal, Academia, Bets, Nova Despesa, Ajustes) */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={tab => {
            setActiveTab(tab);
          }}
          pendingCounts={pendingCounts}
          navMode={navMode}
          onToggleNavMode={handleToggleNavMode}
        />

        {/* Main Content Body */}
        <main className="flex-1 mt-3">
          {/* TAB 1: VISAO GERAL (Resumo Dividido Pessoal + Academia + Bets) */}
          {activeTab === 'overview' && (
            <OverviewTab
              expenses={expenses}
              categories={categories}
              onConfirmPayment={handleOpenPaymentModal}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onNavigateToTab={setActiveTab}
              onNavigateToNewWithEntity={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              whatsappNumber={notificationSettings.whatsappNumber}
              navMode={navMode}
            />
          )}

          {/* TAB 2: PESSOAL (Aba Separada para Despesas Pessoais) */}
          {activeTab === 'pessoal' && (
            <EntityTab
              entity="Pessoal"
              expenses={expenses}
              categories={categories}
              onConfirmPayment={handleOpenPaymentModal}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              navMode={navMode}
            />
          )}

          {/* TAB 3: ACADEMIA (Aba Separada para a Empresa Academia) */}
          {activeTab === 'academia' && (
            <EntityTab
              entity="Academia"
              expenses={expenses}
              categories={categories}
              onConfirmPayment={handleOpenPaymentModal}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              navMode={navMode}
            />
          )}

          {/* TAB 4: BETS (Aba Separada para a Empresa Bets) */}
          {activeTab === 'bets' && (
            <EntityTab
              entity="Bets"
              expenses={expenses}
              categories={categories}
              onConfirmPayment={handleOpenPaymentModal}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              navMode={navMode}
            />
          )}

          {/* TAB 5: NOVA DESPESA */}
          {activeTab === 'new_expense' && (
            <NewExpenseTab
              initialEntity={newExpenseEntity}
              categories={categories}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              onAddExpense={handleAddExpense}
              onNavigateToTab={setActiveTab}
              navMode={navMode}
            />
          )}

          {/* TAB 6: CONFIGURAÇÕES E RELATÓRIOS */}
          {activeTab === 'settings' && (
            <SettingsTab
              expenses={expenses}
              categories={categories}
              onOpenCategoriesModal={() => setIsCategoryModalOpen(true)}
              onImportExpenses={handleImportExpenses}
              onResetExpenses={handleResetExpenses}
              notificationSettings={notificationSettings}
              onUpdateNotificationSettings={handleUpdateNotificationSettings}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              navMode={navMode}
              onToggleNavMode={handleToggleNavMode}
              authUser={authUser}
              onLogout={handleLogout}
              onOpenSupabaseDiagnostic={() => setIsSupabaseModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Supabase Diagnostic & Table Verifier Modal */}
      <SupabaseDiagnosticModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* WhatsApp Modal (Lembrete das 09:00 e envio de mensagem formatada) */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        expenses={expenses}
        selectedExpense={selectedExpenseForWhatsApp}
        notificationSettings={notificationSettings}
        onUpdateSettings={handleUpdateNotificationSettings}
      />

      {/* Receipt Modal (visualizar comprovante ou foto anexada) */}
      <ReceiptModal
        expense={receiptExpense}
        onClose={() => setReceiptExpense(null)}
      />

      {/* Modal de Gestão de Modalidades & Símbolos (Cartão, Energia, Água, etc.) */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />

      {/* Modal de Confirmação de Pagamento com Edição do Valor Variável */}
      <PaymentConfirmationModal
        isOpen={Boolean(paymentModalExpense)}
        expense={paymentModalExpense}
        onClose={() => setPaymentModalExpense(null)}
        onConfirmPayment={handleConfirmPaymentWithDetails}
      />
    </div>
  );
}
