import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { supabase, supabaseUrl } from '../supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: { username: string; email?: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('jailson12');
  const [password, setPassword] = useState('201212');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier) {
      setErrorMessage('Por favor, informe seu usuário ou e-mail.');
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('Por favor, digite sua senha.');
      setLoading(false);
      return;
    }

    try {
      // 1. Verificação se há conexão real configurada no Supabase
      const isCustomSupabaseConfigured =
        supabaseUrl &&
        !supabaseUrl.includes('seu-projeto.supabase.co') &&
        !supabaseUrl.includes('sua-url-supabase');

      if (isCustomSupabaseConfigured && trimmedIdentifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedIdentifier,
          password: trimmedPassword,
        });

        if (error) {
          throw new Error(error.message || 'Falha ao autenticar com Supabase.');
        }

        if (data.user) {
          const authData = {
            username: data.user.email?.split('@')[0] || 'jailson12',
            email: data.user.email,
          };
          if (rememberMe) {
            localStorage.setItem('jailson_auth_session', JSON.stringify(authData));
          }
          onLoginSuccess(authData);
          return;
        }
      }

      // 2. Verificação das credenciais solicitadas (jailson12 / 201212)
      const validIdentifiers = [
        'jailson12',
        'jailson12@gmail.com',
        'jailsonfrancelino@hotmail.com',
        'jailson12@hotmail.com',
      ];

      const isUserMatch =
        validIdentifiers.includes(trimmedIdentifier.toLowerCase()) ||
        trimmedIdentifier.toLowerCase() === 'jailson12';

      if (isUserMatch && trimmedPassword === '201212') {
        const authData = {
          username: 'jailson12',
          email: trimmedIdentifier.includes('@') ? trimmedIdentifier : 'jailson12@hotmail.com',
        };

        if (rememberMe) {
          localStorage.setItem('jailson_auth_session', JSON.stringify(authData));
        }

        onLoginSuccess(authData);
      } else {
        // Tratamento de erro detalhado
        if (!isUserMatch) {
          setErrorMessage('Usuário ou e-mail não encontrado. Verifique seu login.');
        } else {
          setErrorMessage('Senha incorreta! Verifique a senha digitada e tente novamente.');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Acesso Seguro
              </h1>
              <p className="text-xs text-amber-200/90 font-medium">
                Gestão Financeira Jailson
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Entre com suas credenciais para gerenciar suas contas e lembretes do WhatsApp.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Mensagem de Erro */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Campo E-mail / Usuário */}
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              E-mail ou Usuário
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="jailson12 ou email@exemplo.com"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
            >
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Salvar automaticamente / Lembrar Login */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-xs font-medium text-slate-600">
                Manter login salvo automaticamente
              </span>
            </label>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>

          {/* Dica de Credenciais & Status Supabase */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] font-semibold text-amber-900">
              <span>Credenciais padrão:</span>
              <strong className="font-mono text-slate-900">jailson12</strong>
              <span>|</span>
              <strong className="font-mono text-slate-900">201212</strong>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conexão Supabase (@supabase/supabase-js) pronta</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
