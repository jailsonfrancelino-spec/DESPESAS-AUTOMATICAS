/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, ExpenseEntity, TabType, NotificationSettings } from './types';
import {
  loadExpensesFromStorage,
  saveExpensesToStorage,
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
import { Bell, X } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    return loadExpensesFromStorage();
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

  // Sync expenses with localStorage
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

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

  // Action: Mark as Paid
  const handleConfirmPayment = (id: number) => {
    const todayBR = formatDateToBR(new Date().toISOString().split('T')[0]);
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id
          ? {
              ...exp,
              status: 'Pago',
              pagoEm: todayBR,
            }
          : exp
      )
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

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex justify-center selection:bg-blue-100">
      {/* Mobile-first iPhone Shell Container */}
      <div className="w-full max-w-lg min-h-screen bg-[#F8F9FA] shadow-md border-x border-slate-200/80 flex flex-col">
        {/* App Header with WhatsApp 09h Indicator */}
        <Header
          pendingCount={pendingCounts.total}
          dueTodayCount={dueTodayCount}
          whatsappNumber={notificationSettings.whatsappNumber}
          onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
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
        />

        {/* Main Content Body */}
        <main className="flex-1 mt-3">
          {/* TAB 1: VISAO GERAL (Resumo Dividido Pessoal + Academia + Bets) */}
          {activeTab === 'overview' && (
            <OverviewTab
              expenses={expenses}
              onConfirmPayment={handleConfirmPayment}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onNavigateToTab={setActiveTab}
              onNavigateToNewWithEntity={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
              whatsappNumber={notificationSettings.whatsappNumber}
            />
          )}

          {/* TAB 2: PESSOAL (Aba Separada para Despesas Pessoais) */}
          {activeTab === 'pessoal' && (
            <EntityTab
              entity="Pessoal"
              expenses={expenses}
              onConfirmPayment={handleConfirmPayment}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
            />
          )}

          {/* TAB 3: ACADEMIA (Aba Separada para a Empresa Academia) */}
          {activeTab === 'academia' && (
            <EntityTab
              entity="Academia"
              expenses={expenses}
              onConfirmPayment={handleConfirmPayment}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
            />
          )}

          {/* TAB 4: BETS (Aba Separada para a Empresa Bets) */}
          {activeTab === 'bets' && (
            <EntityTab
              entity="Bets"
              expenses={expenses}
              onConfirmPayment={handleConfirmPayment}
              onToggleStatus={handleToggleStatus}
              onDeleteExpense={handleDeleteExpense}
              onOpenReceipt={setReceiptExpense}
              onAddNewExpense={handleNavigateToNewWithEntity}
              onNotifyWhatsAppExpense={handleNotifyWhatsAppExpense}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
            />
          )}

          {/* TAB 5: NOVA DESPESA */}
          {activeTab === 'new_expense' && (
            <NewExpenseTab
              initialEntity={newExpenseEntity}
              onAddExpense={handleAddExpense}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* TAB 6: CONFIGURAÇÕES E RELATÓRIOS */}
          {activeTab === 'settings' && (
            <SettingsTab
              expenses={expenses}
              onImportExpenses={handleImportExpenses}
              onResetExpenses={handleResetExpenses}
              notificationSettings={notificationSettings}
              onUpdateNotificationSettings={handleUpdateNotificationSettings}
              onOpenWhatsAppModal={handleOpenDailyWhatsAppModal}
            />
          )}
        </main>
      </div>

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
    </div>
  );
}
