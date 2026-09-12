import React from 'react';
import { X, Download, FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils';

interface ReceiptModalProps {
  expense: Expense | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ expense, onClose }) => {
  if (!expense) return null;

  const receiptSource = expense.comprovante;
  const fileName = expense.comprovanteNome || 'comprovante';
  const isImage =
    expense.comprovanteTipo === 'image' ||
    (receiptSource && (receiptSource.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)));
  const isPdf =
    expense.comprovanteTipo === 'pdf' ||
    (receiptSource && (receiptSource.startsWith('data:application/pdf') || /\.pdf$/i.test(fileName)));

  const handleDownload = () => {
    if (!receiptSource) return;
    const link = document.createElement('a');
    link.href = receiptSource;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                {expense.descricao}
              </h3>
              <p className="text-xs text-slate-500">
                {formatCurrency(expense.valor)} • {expense.vencimento}
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

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col items-center justify-center min-h-[220px] bg-slate-50">
          {receiptSource && isImage ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm max-h-[50vh] flex items-center justify-center">
              <img
                src={receiptSource}
                alt={`Comprovante de ${expense.descricao}`}
                className="w-full h-auto max-h-[48vh] object-contain"
              />
            </div>
          ) : receiptSource && isPdf ? (
            <div className="w-full text-center py-8 px-4 bg-white rounded-xl border border-dashed border-slate-300">
              <FileText className="w-16 h-16 text-rose-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-900 text-sm">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">Documento PDF anexado à despesa</p>
            </div>
          ) : (
            <div className="w-full text-center py-8 px-4 bg-white rounded-xl border border-dashed border-slate-300">
              <FileText className="w-14 h-14 text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-900 text-sm">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">Comprovante anexado no dispositivo</p>
            </div>
          )}

          <div className="mt-4 w-full bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="truncate max-w-[200px] font-medium">{fileName}</span>
            <span className="text-slate-400">
              {expense.status === 'Pago' ? '🟢 Pagamento Confirmado' : '🔴 Pendente'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
          {receiptSource ? (
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Comprovante</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-all text-center"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
