import React from 'react';
import { Smartphone, Laptop, MessageCircle, Bell, Clock, LogOut, UserCheck, Database } from 'lucide-react';
import { formatPhoneNumberBR } from '../utils';
import { NavigationMode } from '../types';

interface HeaderProps {
  pendingCount: number;
  dueTodayCount: number;
  whatsappNumber: string;
  onOpenWhatsAppModal: () => void;
  navMode: NavigationMode;
  onToggleNavMode: (mode: NavigationMode) => void;
  authUser?: { username: string; email?: string } | null;
  onLogout?: () => void;
  onOpenSupabaseDiagnostic?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pendingCount,
  dueTodayCount,
  whatsappNumber,
  onOpenWhatsAppModal,
  navMode,
  onToggleNavMode,
  authUser,
  onLogout,
  onOpenSupabaseDiagnostic,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <>
      {/* macOS Window Top Bar (shown in MacBook mode) */}
      {navMode === 'macbook' && (
        <div className="bg-slate-900 text-slate-300 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block shadow-2xs"></span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 ml-1.5 hidden sm:inline">
              Despesas Jailson — MacBook Pro (Modo Computador Ativo)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Visualização ampla em múltiplas colunas
            </span>
            <button
              type="button"
              onClick={() => onToggleNavMode('iphone')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold transition-colors flex items-center gap-1.5 border border-slate-700 active:scale-95"
              title="Voltar para visualização vertical do iPhone"
            >
              <Smartphone className="w-3 h-3" />
              <span>Mudar para iPhone</span>
            </button>
          </div>
        </div>
      )}

      <header className={`pt-5 pb-4 px-4 sm:px-6 ${navMode === 'macbook' ? 'border-b border-slate-200/80 bg-white/70 backdrop-blur-xs' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
          {/* Seletor de Modo na Página Principal: iPhone vs MacBook */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 shadow-2xs">
            <button
              type="button"
              id="btn-mode-iphone"
              onClick={() => onToggleNavMode('iphone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none ${
                navMode === 'iphone'
                  ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-300/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Celular (iPhone): Layout vertical compacto"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>📱 iPhone</span>
            </button>
            <button
              type="button"
              id="btn-mode-macbook"
              onClick={() => onToggleNavMode('macbook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none ${
                navMode === 'macbook'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Modo Computador (MacBook): Layout estendido widescreen com múltiplas colunas"
            >
              <Laptop className="w-3.5 h-3.5 text-amber-400" />
              <span>💻 MacBook</span>
            </button>
          </div>

          {/* WhatsApp 09h Button */}
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium transition-colors shadow-xs active:scale-95"
            title="Ver lembretes programados das 09:00 e enviar via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp 09h: <strong>{formatPhoneNumberBR(whatsappNumber)}</strong></span>
          </button>

          {/* Supabase Status Button */}
          {onOpenSupabaseDiagnostic && (
            <button
              type="button"
              onClick={onOpenSupabaseDiagnostic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-medium transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Testar conexão e verificar tabelas do Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Status</span>
            </button>
          )}

          {/* Date & User Session */}
          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {authUser && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold">
                <UserCheck className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">Conectado:</span>
                <span className="font-mono text-slate-900">{authUser.username}</span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Desconectar do sistema"
                    className="ml-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="text-[10px]">Sair</span>
                  </button>
                )}
              </div>
            )}

            <div className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{todayFormatted}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/apple-touch-icon.png"
                alt="Ícone Despesas Jailson"
                className="w-10 h-10 rounded-xl shadow-xs border border-amber-400/50 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Gestão Financeira &amp; Lembretes
                </h1>
                <p className="text-[11px] text-slate-500">
                  {navMode === 'macbook'
                    ? '💻 Visualização MacBook Pro • Widescreen multi-colunas'
                    : '📱 Visualização Celular iPhone • Layout vertical touch'}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
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
  </>
  );
};
