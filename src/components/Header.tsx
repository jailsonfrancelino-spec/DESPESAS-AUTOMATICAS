import React from 'react';
import { Smartphone, MessageCircle, Bell, Clock } from 'lucide-react';
import { formatPhoneNumberBR } from '../utils';

interface HeaderProps {
  pendingCount: number;
  dueTodayCount: number;
  whatsappNumber: string;
  onOpenWhatsAppModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pendingCount,
  dueTodayCount,
  whatsappNumber,
  onOpenWhatsAppModal,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="pt-6 pb-4 px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/70 text-xs font-medium text-slate-700">
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Otimizado para iPhone &amp; Web</span>
        </div>

        <button
          type="button"
          onClick={onOpenWhatsAppModal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium transition-colors shadow-xs active:scale-95"
          title="Ver lembretes programados das 09:00 e enviar via WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp 09h: <strong>{formatPhoneNumberBR(whatsappNumber)}</strong></span>
        </button>

        <div className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1.5 ml-auto sm:ml-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{todayFormatted}</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="Smartphone">📱</span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Gestão Financeira &amp; Lembretes
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
          Controle suas despesas de <strong>Pessoal</strong>, <strong>Academia</strong> e <strong>Bets</strong> com lembretes automáticos às 09:00h via WhatsApp.
        </p>
      </div>

      {/* Due Today / Pending Alert Bar */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {dueTodayCount > 0 ? (
          <div className="flex-1 min-w-[260px] inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-medium shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span>
                <strong>{dueTodayCount} {dueTodayCount === 1 ? 'conta vence HOJE' : 'contas vencem HOJE'}!</strong> (Alerta das 09h)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenWhatsAppModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs active:scale-95 transition-all"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Avisar no WhatsApp</span>
            </button>
          </div>
        ) : pendingCount > 0 ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Você tem <strong>{pendingCount} {pendingCount === 1 ? 'conta pendente' : 'contas pendentes'}</strong></span>
            <button
              type="button"
              onClick={onOpenWhatsAppModal}
              className="ml-2 text-emerald-700 hover:text-emerald-800 font-semibold underline text-[11px]"
            >
              Ver lembretes WhatsApp
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span>✨ Todas as contas estão em dia!</span>
          </div>
        )}
      </div>
    </header>
  );
};
