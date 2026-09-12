import React, { useState, useEffect, useRef } from 'react';
import { Expense, ExpenseCategoryItem } from '../types';
import {
  formatCurrency,
  formatDateToBR,
  formatDateToISO,
  getCategoryBadgeClasses,
} from '../utils';
import {
  CheckCircle2,
  X,
  DollarSign,
  Calendar,
  Paperclip,
  Camera,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  categories?: ExpenseCategoryItem[];
  onConfirm: (
    expenseId: number,
    paidAmount: number,
    paidDate: string,
    notes?: string,
    comprovanteData?: {
      comprovante?: string;
      comprovanteNome?: string;
      comprovanteTipo?: 'image' | 'pdf' | 'file';
    }
  ) => void;
}

export const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  expense,
  categories,
  onConfirm,
}) => {
  const [paidAmountStr, setPaidAmountStr] = useState('');
  const [paidDateISO, setPaidDateISO] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [comprovanteBase64, setComprovanteBase64] = useState<string>('');
  const [comprovanteNome, setComprovanteNome] = useState<string>('');
  const [comprovanteTipo, setComprovanteTipo] = useState<'image' | 'pdf' | 'file'>('image');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever expense changes
  useEffect(() => {
    if (expense) {
      setPaidAmountStr(expense.valor.toString());
      setPaidDateISO(new Date().toISOString().split('T')[0]);
      setPaymentNote(expense.observacao || '');
      setComprovanteBase64(expense.comprovante || '');
      setComprovanteNome(expense.comprovanteNome || '');
      setComprovanteTipo(expense.comprovanteTipo || 'image');
      setErrorMsg(null);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const originalAmount = expense.valor;
  const currentNumericAmount = parseFloat(paidAmountStr.replace(',', '.')) || 0;
  const diffAmount = currentNumericAmount - originalAmount;
  const hasAmountChanged = Math.abs(diffAmount) > 0.001;

  const categoryBadge = getCategoryBadgeClasses(expense.categoria, categories);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setComprovanteNome(file.name);
    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    setComprovanteTipo(isImg ? 'image' : isPdf ? 'pdf' : 'file');

    const reader = new FileReader();
    reader.onload = () => {
      setComprovanteBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetToOriginal = () => {
    setPaidAmountStr(originalAmount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(currentNumericAmount) || currentNumericAmount <= 0) {
      setErrorMsg('Por favor, informe um valor válido para o pagamento.');
      return;
    }

    const paidDateBR = formatDateToBR(paidDateISO);

    onConfirm(
      expense.id,
      currentNumericAmount,
      paidDateBR,
      paymentNote.trim(),
      comprovanteBase64
        ? {
            comprovante: comprovanteBase64,
            comprovanteNome: comprovanteNome,
            comprovanteTipo: comprovanteTipo,
          }
        : undefined
    );

    onClose();
  };

  return (
    <div
      id="payment-confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="payment-confirmation-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Confirmar Pagamento
              </h2>
              <p className="text-[11px] text-emerald-100">
                Revise ou ajuste o valor exato pago
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Expense Identification Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Conta a Pagar ({expense.entidade})
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  {expense.descricao}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0 ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}
              >
                <span>{categoryBadge.simbolo}</span>
                <span>{expense.categoria}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
              <span>📅 Vencimento original:</span>
              <strong className="text-slate-900 font-semibold">{expense.vencimento}</strong>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>💰 Valor previsto original:</span>
              <strong className="text-slate-900 font-bold">{formatCurrency(originalAmount)}</strong>
            </div>
          </div>

          {/* Amount Variation Notice */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-[11px] flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>O valor variou este mês?</strong> Como energia, água, cartão ou horas extras mudam de fatura para fatura, ajuste abaixo o <strong>valor real</strong> que você está pagando:
            </p>
          </div>

          {/* 1. Editable Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="paid-amount-input"
                className="font-bold text-slate-800 text-xs flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valor Efetivamente Pago (R$):</span>
              </label>
              {hasAmountChanged && (
                <button
                  type="button"
                  onClick={handleResetToOriginal}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Restaurar {formatCurrency(originalAmount)}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                R$
              </span>
              <input
                id="paid-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={paidAmountStr}
                onChange={e => {
                  setPaidAmountStr(e.target.value);
                  setErrorMsg(null);
                }}
                className={`w-full pl-10 pr-3.5 py-3 text-base sm:text-lg font-black rounded-xl border focus:outline-none transition-all ${
                  hasAmountChanged
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 text-emerald-950'
                    : 'border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 bg-white'
                }`}
                placeholder="0,00"
              />
            </div>

            {/* Quick amount status indicator */}
            {hasAmountChanged && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                <span>Alterado:</span>
                <span className="line-through text-slate-500">{formatCurrency(originalAmount)}</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                <span className="font-bold">{formatCurrency(currentNumericAmount)}</span>
                <span className="ml-auto text-[10px] font-normal">
                  ({diffAmount > 0 ? `+${formatCurrency(diffAmount)}` : formatCurrency(diffAmount)})
                </span>
              </div>
            )}
          </div>

          {/* 2. Payment Date */}
          <div className="space-y-1.5">
            <label
              htmlFor="paid-date-input"
              className="font-bold text-slate-800 text-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Data do Pagamento:</span>
            </label>
            <input
              id="paid-date-input"
              type="date"
              required
              value={paidDateISO}
              onChange={e => setPaidDateISO(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* 3. Attachment / Comprovante Upload */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                <span>Comprovante / Recibo (Opcional):</span>
              </span>
              {comprovanteNome && (
                <span className="text-[10px] text-emerald-700 font-medium">Anexado ✓</span>
              )}
            </label>

            {comprovanteNome ? (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-xs font-semibold text-slate-800">
                    {comprovanteNome}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setComprovanteBase64('');
                    setComprovanteNome('');
                  }}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remover anexo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-2.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Anexar Arquivo/PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 px-2.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tirar Foto Recibo</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 4. Notes */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="payment-note"
              className="font-bold text-slate-800 text-xs block"
            >
              Observação (Opcional):
            </label>
            <input
              id="payment-note"
              type="text"
              value={paymentNote}
              onChange={e => setPaymentNote(e.target.value)}
              placeholder="Ex: Fatura veio com acréscimo de bandeira ou desconto"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-submit-payment-confirmation"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar {formatCurrency(currentNumericAmount)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
