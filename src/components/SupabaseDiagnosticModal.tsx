import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  FileText,
  Bell,
  HardDrive,
  Key,
  Globe,
  Save,
  Check,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  verifySupabaseTables,
  TableVerificationResult,
} from '../supabaseClient';

interface SupabaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDiagnosticModal: React.FC<SupabaseDiagnosticModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState(() => getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<TableVerificationResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingKeys, setIsEditingKeys] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSupabaseConfig();
      setConfig(currentConfig);
      setInputUrl(currentConfig.url);
      setInputKey(currentConfig.key);
      setSavedSuccess(false);

      if (currentConfig.isConfigured) {
        handleRunVerification(currentConfig.url, currentConfig.key);
      } else {
        setIsEditingKeys(true);
      }
    }
  }, [isOpen]);

  const handleRunVerification = async (url?: string, key?: string) => {
    setIsVerifying(true);
    try {
      const result = await verifySupabaseTables(url, key);
      setVerificationResult(result);
    } catch {
      // ignore
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) return;

    saveSupabaseConfig(inputUrl, inputKey);
    const updated = getSupabaseConfig();
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    setIsEditingKeys(false);

    await handleRunVerification(inputUrl, inputKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Diagnóstico de Conexão Supabase
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium">
                Verificador de Tabelas e Permissões SQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Configuração de Chaves (URL + Anon Key) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Credenciais do Projeto Supabase</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditingKeys(!isEditingKeys)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                {isEditingKeys ? 'Ocultar campos' : 'Alterar / Colar chaves'}
              </button>
            </div>

            {isEditingKeys ? (
              <form onSubmit={handleSaveAndTest} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>Project URL (supabaseUrl):</span>
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={e => setInputUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>Project API Key (Anon / Public Key):</span>
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={e => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar e Testar Agora</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">URL:</span>
                  <span className="font-mono text-slate-800 truncate max-w-[280px]">
                    {config.url}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Chave:</span>
                  <span className="font-mono text-slate-500">
                    {config.key && config.key.length > 20
                      ? `${config.key.substring(0, 12)}...${config.key.substring(config.key.length - 6)}`
                      : config.key}
                  </span>
                </div>
              </div>
            )}

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Credenciais salvas com sucesso!</span>
              </div>
            )}
          </div>

          {/* Botão de Verificação Manual */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              Resultado da Verificação:
            </span>
            <button
              type="button"
              onClick={() => handleRunVerification()}
              disabled={isVerifying}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verificando...' : 'Re-testar Conexão'}</span>
            </button>
          </div>

          {/* Cards de Status das Tabelas */}
          {verificationResult ? (
            <div className="space-y-2.5">
              {/* Status Geral */}
              {verificationResult.connected ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Conexão Estabelecida com Sucesso!
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      A aplicação conseguiu se comunicar com o seu projeto Supabase. Veja abaixo o status individual de cada tabela do banco de dados:
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Não foi possível conectar ao Supabase
                    </h4>
                    <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                      {verificationResult.globalError ||
                        'Verifique se a URL e a Anon Key informadas estão corretas.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Grid das Tabelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* 1. Tabela categories */}
                <div className="p-3 rounded-2xl border bg-white shadow-2xs space-y-1.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <Layers className="w-4 h-4 text-sky-600" />
                      <span>Tabela: categories</span>
                    </div>
                    {verificationResult.categories.exists ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Criada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Erro</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {verificationResult.categories.exists
                      ? `✅ ${verificationResult.categories.count} categorias cadastradas encontradas.`
                      : `❌ ${verificationResult.categories.error || 'Tabela não encontrada.'}`}
                  </p>
                </div>

                {/* 2. Tabela expenses */}
                <div className="p-3 rounded-2xl border bg-white shadow-2xs space-y-1.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <FileText className="w-4 h-4 text-violet-600" />
                      <span>Tabela: expenses</span>
                    </div>
                    {verificationResult.expenses.exists ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Criada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Erro</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {verificationResult.expenses.exists
                      ? `✅ ${verificationResult.expenses.count} despesas (Pessoal, Academia, Bets) encontradas.`
                      : `❌ ${verificationResult.expenses.error || 'Tabela não encontrada.'}`}
                  </p>
                </div>

                {/* 3. Tabela notification_settings */}
                <div className="p-3 rounded-2xl border bg-white shadow-2xs space-y-1.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>Tabela: notification_settings</span>
                    </div>
                    {verificationResult.notificationSettings.exists ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Criada</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Erro</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {verificationResult.notificationSettings.exists
                      ? `✅ Configuração do WhatsApp 09:00h ativa.`
                      : `❌ ${verificationResult.notificationSettings.error || 'Tabela não encontrada.'}`}
                  </p>
                </div>

                {/* 4. Bucket Storage 'comprovantes' */}
                <div className="p-3 rounded-2xl border bg-white shadow-2xs space-y-1.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                      <HardDrive className="w-4 h-4 text-amber-600" />
                      <span>Bucket: comprovantes</span>
                    </div>
                    {verificationResult.storageBucket.exists ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Pronto</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <span>Pendente</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {verificationResult.storageBucket.exists
                      ? '✅ Bucket configurado para upload de recibos e comprovantes.'
                      : `Bucket opcional (${verificationResult.storageBucket.error || 'Pode ser criado via SQL'}).`}
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-right">
                Última checagem: {verificationResult.testedAt}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-300 animate-pulse" />
              <p>Clique em <strong>"Salvar e Testar Agora"</strong> acima para verificar a conexão ao vivo.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Ambiente Supabase com persistência segura
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
