import React, { useState } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Copy,
  Check,
  Bell,
  Volume2,
  Clock,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Expense, NotificationSettings } from '../types';
import {
  createWhatsAppDailySummary,
  createWhatsAppExpenseMessage,
  formatPhoneNumberBR,
  openWhatsApp,
  playNotificationChime,
  requestNotificationPermission,
  showNativeNotification,
} from '../utils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  selectedExpense?: Expense | null;
  notificationSettings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  expenses,
  selectedExpense,
  notificationSettings,
  onUpdateSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(notificationSettings.whatsappNumber);
  const [testedNotification, setTestedNotification] = useState(false);

  if (!isOpen) return null;

  // Decide message based on whether a specific expense is selected or daily summary
  const messageText = selectedExpense
    ? createWhatsAppExpenseMessage(selectedExpense)
    : createWhatsAppDailySummary(expenses);

  const handleSendWhatsApp = () => {
    openWhatsApp(notificationSettings.whatsappNumber, messageText);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...notificationSettings,
      whatsappNumber: tempPhone,
    });
    setIsEditingPhone(false);
  };

  const handleTestDailyAlarm = async () => {
    playNotificationChime();
    setTestedNotification(true);
    const granted = await requestNotificationPermission();

    showNativeNotification(
      '⏰ Lembrete de Vencimento (09:00)',
      `Alerta diário ativo para o WhatsApp ${formatPhoneNumberBR(notificationSettings.whatsappNumber)}. Toque para abrir o app!`,
      () => {
        handleSendWhatsApp();
      }
    );

    setTimeout(() => {
      setTestedNotification(false);
    }, 4000);
  };

  const todayIso = new Date().toISOString().split('T')[0];
  const dueTodayCount = expenses.filter(
    e => e.status === 'Pendente' && e.vencimento.includes(todayIso.split('-').reverse().join('/'))
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedExpense ? 'Notificar Despesa no WhatsApp' : 'Lembrete Diário de Vencimento'}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                  09:00h
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <span>Vinculado a:</span>
                <strong className="text-emerald-950 font-semibold">
                  {formatPhoneNumberBR(notificationSettings.whatsappNumber)}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/80 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {/* Highlight Card */}
          <div className="p-3.5 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  Horário de Disparo: 09:00 da Manhã
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ativo
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Todo dia com contas a vencer, um aviso é emitido às 09:00 com os valores de{' '}
                <strong>Pessoal</strong>, <strong>Academia</strong> e <strong>Bets</strong>.
              </p>
            </div>
          </div>

          {/* WhatsApp Number Edit Form */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                Número para Notificações:
              </span>
              {!isEditingPhone ? (
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-[11px] underline"
                >
                  Alterar número
                </button>
              ) : null}
            </div>

            {isEditingPhone ? (
              <form onSubmit={handleSavePhone} className="flex gap-2">
                <input
                  type="text"
                  value={tempPhone}
                  onChange={e => setTempPhone(e.target.value)}
                  placeholder="Ex: 88994419892"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempPhone(notificationSettings.whatsappNumber);
                    setIsEditingPhone(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-mono text-sm font-bold text-slate-800 tracking-wide">
                  {formatPhoneNumberBR(notificationSettings.whatsappNumber)}
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-medium">
                  WhatsApp Conectado
                </span>
              </div>
            )}
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Mensagem Formatada para Envio:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-56 overflow-y-auto shadow-inner select-all">
              {messageText}
            </div>
          </div>

          {/* Audio / Native notification test button */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Bell className="w-4 h-4 text-amber-500" />
              <div>
                <p className="font-medium text-slate-900">Alarme e Som das 09:00</p>
                <p className="text-[11px] text-slate-500">Toca toque sonoro e notificação push</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestDailyAlarm}
              className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testedNotification ? 'Tocando...' : 'Testar Alarme'}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Abrir WhatsApp ({formatPhoneNumberBR(notificationSettings.whatsappNumber)})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    </div>
  );
};
