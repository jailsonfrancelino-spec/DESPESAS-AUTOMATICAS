import React, { useState, useMemo } from 'react';
import { Expense, ExpenseEntity, NotificationSettings } from '../types';
import {
  generateAccountingTextSummary,
  downloadTextFile,
  openWhatsApp,
  formatPhoneNumberBR,
  cleanPhoneNumber,
} from '../utils';
import {
  FileText,
  Copy,
  Download,
  Check,
  X,
  MessageCircle,
  Share2,
  Building2,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

interface AccountingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  notificationSettings: NotificationSettings;
}

export const AccountingSummaryModal: React.FC<AccountingSummaryModalProps> = ({
  isOpen,
  onClose,
  expenses,
  notificationSettings,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<ExpenseEntity | 'Todas'>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'Todas' | 'Pendente' | 'Pago'>('Todas');
  const [customNotes, setCustomNotes] = useState('');
  const [copied, setCopied] = useState(false);
  const [targetPhone, setTargetPhone] = useState(notificationSettings.whatsappNumber);

  // Generate text whenever filters or notes change
  const summaryText = useMemo(() => {
    return generateAccountingTextSummary(expenses, {
      entity: selectedEntity,
      status: selectedStatus,
      customNotes: customNotes,
    });
  }, [expenses, selectedEntity, selectedStatus, customNotes]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadTxt = () => {
    const today = new Date().toISOString().split('T')[0];
    const entTag = selectedEntity.toLowerCase();
    const filename = `resumo_contabilidade_${entTag}_${today}.txt`;
    downloadTextFile(filename, summaryText);
  };

  const handleSendWhatsApp = () => {
    const phoneToUse = targetPhone.trim() || notificationSettings.whatsappNumber;
    openWhatsApp(phoneToUse, summaryText);
  };

  return (
    <div
      id="accounting-summary-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="accounting-summary-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Resumo Contábil das Empresas
              </h2>
              <p className="text-[11px] text-slate-300">
                Formato texto para WhatsApp, contador ou arquivo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Filters Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Personalizar Resumo:</span>
            </div>

            {/* Entity Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">
                Empresa / Conta:
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                {(['Todas', 'Academia', 'Bets', 'Pessoal'] as (ExpenseEntity | 'Todas')[]).map(
                  ent => (
                    <button
                      key={ent}
                      type="button"
                      onClick={() => setSelectedEntity(ent)}
                      className={`py-1 px-1.5 text-[11px] font-bold rounded-md transition-all text-center truncate ${
                        selectedEntity === ent
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {ent === 'Todas' && 'Todas'}
                      {ent === 'Academia' && '🏋️ Academia'}
                      {ent === 'Bets' && '🎲 Bets'}
                      {ent === 'Pessoal' && '👤 Pessoal'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">
                Status dos Pagamentos:
              </label>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/70 rounded-lg">
                {(['Todas', 'Pendente', 'Pago'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`py-1 px-1.5 text-[11px] font-bold rounded-md transition-all text-center ${
                      selectedStatus === st
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'Todas' && 'Todos Status'}
                    {st === 'Pendente' && '🔴 Pendentes'}
                    {st === 'Pago' && '🟢 Pagos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500 font-medium">
                Observação Adicional (Opcional):
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="Ex: Fechamento referente a Setembro / Enviar para o contador"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Text Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Texto Formatado para Envio / Contabilidade:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                readOnly
                value={summaryText}
                rows={9}
                className="w-full p-3 font-mono text-[11px] leading-relaxed bg-slate-900 text-emerald-300/90 rounded-xl border border-slate-700 resize-none focus:outline-none select-all"
              />
            </div>
          </div>

          {/* Target Phone for WhatsApp */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Destinatário do WhatsApp:
              </label>
              <span className="text-[10px] text-emerald-700 font-medium">
                (Seu número ou do contador)
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetPhone}
                onChange={e => setTargetPhone(e.target.value)}
                placeholder="Ex: 88994419892"
                className="flex-1 px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setTargetPhone('88994419892')}
                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[10px] rounded-lg transition-colors shrink-0"
                title="Restaurar seu número principal"
              >
                Meu Número
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="py-2.5 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Baixar .TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
