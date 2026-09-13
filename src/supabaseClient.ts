import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env || {};

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  let storedUrl = '';
  let storedKey = '';
  try {
    storedUrl = localStorage.getItem('jailson_supabase_url') || '';
    storedKey = localStorage.getItem('jailson_supabase_anon_key') || '';
  } catch {
    // ignore
  }

  const rawUrl = (storedUrl || metaEnv.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co').trim();
  const url = sanitizeSupabaseUrl(rawUrl);
  const key = (storedKey || metaEnv.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon-aqui').trim();

  const isConfigured =
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('seu-projeto.supabase.co') &&
    !key.includes('sua-chave-anon-aqui');

  return { url, key, isConfigured };
}

export function saveSupabaseConfig(url: string, key: string) {
  try {
    localStorage.setItem('jailson_supabase_url', url.trim());
    localStorage.setItem('jailson_supabase_anon_key', key.trim());
    // Refresh client instance
    activeClient = null;
  } catch {
    // ignore
  }
}

let activeClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const { url, key } = getSupabaseConfig();
  if (!activeClient) {
    activeClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return activeClient;
}

// Export default client instance for backwards compatibility
export const supabase = getSupabaseClient();
export const supabaseUrl = getSupabaseConfig().url;
export const supabaseAnonKey = getSupabaseConfig().key;

export interface TableVerificationResult {
  isConfigured: boolean;
  url: string;
  connected: boolean;
  categories: { exists: boolean; count: number; error: string | null };
  expenses: { exists: boolean; count: number; error: string | null };
  notificationSettings: { exists: boolean; count: number; error: string | null };
  storageBucket: { exists: boolean; error: string | null };
  globalError: string | null;
  testedAt: string;
}

/**
 * Verifica a conexão e a existência de todas as tabelas no Supabase
 */
export async function verifySupabaseTables(customUrl?: string, customKey?: string): Promise<TableVerificationResult> {
  const config = getSupabaseConfig();
  const urlToTest = sanitizeSupabaseUrl(customUrl?.trim() || config.url);
  const keyToTest = (customKey?.trim() || config.key).trim();

  const isConfigured =
    Boolean(urlToTest) &&
    Boolean(keyToTest) &&
    !urlToTest.includes('seu-projeto.supabase.co') &&
    !keyToTest.includes('sua-chave-anon-aqui');

  const result: TableVerificationResult = {
    isConfigured,
    url: urlToTest,
    connected: false,
    categories: { exists: false, count: 0, error: null },
    expenses: { exists: false, count: 0, error: null },
    notificationSettings: { exists: false, count: 0, error: null },
    storageBucket: { exists: false, error: null },
    globalError: null,
    testedAt: new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date()),
  };

  if (!isConfigured) {
    result.globalError = 'A URL e a chave anon do Supabase ainda não foram informadas.';
    return result;
  }

  try {
    const testClient = createClient(urlToTest, keyToTest, {
      auth: { persistSession: false },
    });

    // 1. Testar tabela 'categories'
    try {
      const { data: catData, error: catError, count: catCount } = await testClient
        .from('categories')
        .select('*', { count: 'exact' });

      if (catError) {
        result.categories.error = catError.message;
      } else {
        result.categories.exists = true;
        result.categories.count = catCount ?? (catData ? catData.length : 0);
        result.connected = true;
      }
    } catch (e: unknown) {
      result.categories.error = e instanceof Error ? e.message : 'Erro ao consultar categorias';
    }

    // 2. Testar tabela 'expenses'
    try {
      const { data: expData, error: expError, count: expCount } = await testClient
        .from('expenses')
        .select('*', { count: 'exact' });

      if (expError) {
        result.expenses.error = expError.message;
      } else {
        result.expenses.exists = true;
        result.expenses.count = expCount ?? (expData ? expData.length : 0);
        result.connected = true;
      }
    } catch (e: unknown) {
      result.expenses.error = e instanceof Error ? e.message : 'Erro ao consultar despesas';
    }

    // 3. Testar tabela 'notification_settings'
    try {
      const { data: notifData, error: notifError, count: notifCount } = await testClient
        .from('notification_settings')
        .select('*', { count: 'exact' });

      if (notifError) {
        result.notificationSettings.error = notifError.message;
      } else {
        result.notificationSettings.exists = true;
        result.notificationSettings.count = notifCount ?? (notifData ? notifData.length : 0);
        result.connected = true;
      }
    } catch (e: unknown) {
      result.notificationSettings.error = e instanceof Error ? e.message : 'Erro ao consultar configurações';
    }

    // 4. Testar bucket 'comprovantes'
    try {
      const { data: bucketData, error: bucketError } = await testClient
        .storage
        .getBucket('comprovantes');

      if (bucketError) {
        result.storageBucket.error = bucketError.message;
      } else if (bucketData) {
        result.storageBucket.exists = true;
      }
    } catch (e: unknown) {
      result.storageBucket.error = e instanceof Error ? e.message : 'Erro ao verificar bucket';
    }

  } catch (err: unknown) {
    result.globalError = err instanceof Error ? err.message : 'Falha ao conectar com o Supabase';
  }

  return result;
}
