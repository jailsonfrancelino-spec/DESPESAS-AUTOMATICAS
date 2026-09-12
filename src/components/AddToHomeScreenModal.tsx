import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Download,
} from 'lucide-react';

interface AddToHomeScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstallPromptSuccess?: () => void;
}

export const AddToHomeScreenModal: React.FC<AddToHomeScreenModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPromptSuccess,
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('ios');
  const [isStandalone, setIsStandalone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOS =
        /iphone|ipad|ipod/.test(userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /android/.test(userAgent);

      if (isIOS) {
        setPlatform('ios');
      } else if (isAndroid) {
        setPlatform('android');
      } else {
        setPlatform('other');
      }

      // Check if already running standalone
      const isRunningStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isRunningStandalone);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Despesas - Jailson',
          text: 'Controle de Despesas e Lembretes',
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted' && onInstallPromptSuccess) {
          onInstallPromptSuccess();
          onClose();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header com Banner Dourado */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <img
              src="/apple-touch-icon.png"
              alt="Ícone Despesas Jailson"
              className="w-14 h-14 rounded-2xl border-2 border-amber-400 shadow-lg object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Aplicativo
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Tela Inicial
                </span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight mt-0.5">
                Adicionar à Tela Inicial
              </h2>
              <p className="text-xs text-slate-300">
                Acesse como aplicativo direto pelo ícone no seu celular
              </p>
            </div>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 p-1">
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              platform === 'ios'
                ? 'bg-white text-amber-600 shadow-xs border border-slate-200/80 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone (iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              platform === 'android'
                ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/80 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatform('other')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              platform === 'other'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-extrabold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Computador</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
          {isStandalone && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-bold">Você já está usando o app instalado!</strong>
                <p className="text-emerald-700">
                  O aplicativo já está funcionando em modo tela cheia na sua tela inicial.
                </p>
              </div>
            </div>
          )}

          {/* iOS Instructions */}
          {platform === 'ios' && (
            <div className="space-y-3.5">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <span>📱 Passo a Passo no Safari do iPhone</span>
                </div>
                <p className="text-slate-600">
                  Siga os 3 passos simples para colocar o ícone <strong className="text-slate-900">DESPESAS JAILSON</strong> na sua tela inicial:
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">
                      Toque no botão Compartilhar do Safari
                    </p>
                    <p className="text-slate-500">
                      Na barra inferior do navegador Safari, toque no ícone com um quadrado e a seta apontando para cima:
                    </p>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-amber-700 font-bold">
                      <Share className="w-3.5 h-3.5 text-amber-600" />
                      <span>Botão Compartilhar</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">
                      Selecione "Adicionar à Tela de Início"
                    </p>
                    <p className="text-slate-500">
                      Role o menu do Safari para baixo e toque na opção com o símbolo de mais (➕):
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-bold">
                      <PlusSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Adicionar à Tela de Início</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900">
                      Toque em "Adicionar"
                    </p>
                    <p className="text-slate-500">
                      O nome sugerido virá como <strong>"Despesas"</strong> com o ícone oficial dourado. Toque em <strong>Adicionar</strong> no canto superior direito.
                    </p>
                  </div>
                </div>
              </div>

              {/* iOS Direct Share Button */}
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Share className="w-4 h-4" />
                  <span>Abrir Menu do Safari Agora</span>
                </button>
              )}

              {/* Warning for inside WhatsApp/Instagram */}
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed border border-slate-200/60">
                <span className="font-bold text-slate-800">Dica:</span> Se abriu o app por dentro do WhatsApp, toque nos três pontinhos no topo e escolha <strong>"Abrir no Safari"</strong> para conseguir salvar na tela inicial.
              </div>
            </div>
          )}

          {/* Android Instructions */}
          {platform === 'android' && (
            <div className="space-y-3.5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                  <span>🤖 Instalação no Android / Chrome</span>
                </div>
                <p className="text-slate-600">
                  Instale diretamente no seu aparelho como um aplicativo nativo.
                </p>
              </div>

              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallAndroid}
                  disabled={installing}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{installing ? 'Instalando...' : 'Instalar Aplicativo Agora'}</span>
                </button>
              ) : (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="font-bold text-slate-900">1. Abra o menu do Google Chrome (⋮)</p>
                    <p className="text-slate-500">Toque nos 3 pontinhos no canto superior direito do navegador.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="font-bold text-slate-900">2. Toque em "Instalar aplicativo" ou "Adicionar à tela inicial"</p>
                    <p className="text-slate-500">O ícone será adicionado automaticamente à sua tela inicial.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop Instructions */}
          {platform === 'other' && (
            <div className="space-y-3.5">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                  <span>💻 No Computador (Chrome / Edge)</span>
                </div>
                <p className="text-slate-600">
                  No Chrome ou Edge, clique no ícone de <strong>Instalar</strong> (computador com seta para baixo) na barra de endereços ao lado da estrela de favoritos.
                </p>
              </div>

              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallAndroid}
                  disabled={installing}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar no Computador</span>
                </button>
              )}
            </div>
          )}

          {/* Botão Copiar Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 truncate">
              Link do app: {typeof window !== 'undefined' ? window.location.origin : ''}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-all"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
