import { Expense, ExpenseCategoryItem, NotificationSettings } from './types';
import { getSupabaseClient, getSupabaseConfig } from './supabaseClient';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_NOTIFICATION_SETTINGS,
  INITIAL_EXPENSES,
  loadExpensesFromStorage,
  saveExpensesToStorage,
  loadCategoriesFromStorage,
  saveCategoriesToStorage,
  loadNotificationSettings,
  saveNotificationSettings,
} from './utils';

export interface DbExpenseRow {
  id?: number;
  descricao: string;
  categoria: string;
  entidade: string;
  valor: number;
  vencimento: string;
  status: string;
  comprovante?: string | null;
  comprovante_nome?: string | null;
  comprovante_tipo?: string | null;
  observacao?: string | null;
  pago_em?: string | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function expenseFromDb(row: DbExpenseRow): Expense {
  return {
    id: Number(row.id),
    descricao: row.descricao || '',
    categoria: row.categoria || 'Outros',
    entidade: (row.entidade as any) || 'Pessoal',
    valor: Number(row.valor) || 0,
    vencimento: row.vencimento || '',
    status: (row.status as any) || 'Pendente',
    comprovante: row.comprovante || undefined,
    comprovanteNome: row.comprovante_nome || undefined,
    comprovanteTipo: (row.comprovante_tipo as any) || undefined,
    observacao: row.observacao || undefined,
    pagoEm: row.pago_em || undefined,
  };
}

export function expenseToDb(exp: Partial<Expense>): Partial<DbExpenseRow> {
  const row: Partial<DbExpenseRow> = {};
  if (exp.descricao !== undefined) row.descricao = exp.descricao;
  if (exp.categoria !== undefined) row.categoria = exp.categoria;
  if (exp.entidade !== undefined) row.entidade = exp.entidade;
  if (exp.valor !== undefined) row.valor = Number(exp.valor);
  if (exp.vencimento !== undefined) row.vencimento = exp.vencimento;
  if (exp.status !== undefined) row.status = exp.status;
  if (exp.comprovante !== undefined) row.comprovante = exp.comprovante;
  if (exp.comprovanteNome !== undefined) row.comprovante_nome = exp.comprovanteNome;
  if (exp.comprovanteTipo !== undefined) row.comprovante_tipo = exp.comprovanteTipo;
  if (exp.observacao !== undefined) row.observacao = exp.observacao;
  if (exp.pagoEm !== undefined) row.pago_em = exp.pagoEm;
  return row;
}

/**
 * Carrega despesas: busca primeiro no Supabase em tempo real.
 * Se offline ou erro, cai no localStorage.
 */
export async function fetchExpensesCloud(): Promise<{ expenses: Expense[]; isFromCloud: boolean }> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { expenses: loadExpensesFromStorage(), isFromCloud: false };
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('id', { ascending: false });

    if (error || !data) {
      console.warn('Supabase fetchExpenses error, using local fallback:', error?.message);
      return { expenses: loadExpensesFromStorage(), isFromCloud: false };
    }

    if (data.length === 0) {
      // Se banco está zerado, faz seed com os locais para não perder
      const local = loadExpensesFromStorage();
      if (local.length > 0) {
        syncSeedExpensesToSupabase(local).catch(() => {});
        return { expenses: local, isFromCloud: true };
      }
      return { expenses: [], isFromCloud: true };
    }

    const cloudExpenses = data.map(expenseFromDb);
    // Atualiza cache local para caso fique sem internet
    saveExpensesToStorage(cloudExpenses);
    return { expenses: cloudExpenses, isFromCloud: true };
  } catch (err) {
    console.error('Failed to fetch from cloud:', err);
    return { expenses: loadExpensesFromStorage(), isFromCloud: false };
  }
}

/**
 * Cria nova despesa tanto no Supabase quanto no localStorage
 */
export async function createExpenseCloud(newExpense: Omit<Expense, 'id'>): Promise<Expense> {
  const localFallback: Expense = {
    ...newExpense,
    id: Date.now(),
  };

  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return localFallback;
  }

  try {
    const supabase = getSupabaseClient();
    const row = expenseToDb(newExpense);
    const { data, error } = await supabase
      .from('expenses')
      .insert([row])
      .select('*')
      .single();

    if (error || !data) {
      console.warn('Erro ao inserir no Supabase, usando ID local:', error?.message);
      return localFallback;
    }

    return expenseFromDb(data);
  } catch (err) {
    console.error('Supabase insert error:', err);
    return localFallback;
  }
}

/**
 * Atualiza despesa existente no Supabase e no localStorage
 */
export async function updateExpenseCloud(id: number, updates: Partial<Expense>): Promise<void> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return;

  try {
    const supabase = getSupabaseClient();
    const row = expenseToDb(updates);
    const { error } = await supabase
      .from('expenses')
      .update(row)
      .eq('id', id);

    if (error) {
      console.warn(`Erro ao atualizar despesa #${id} no Supabase:`, error.message);
    }
  } catch (err) {
    console.error('Supabase update error:', err);
  }
}

/**
 * Deleta despesa no Supabase
 */
export async function deleteExpenseCloud(id: number): Promise<void> {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`Erro ao deletar despesa #${id} no Supabase:`, error.message);
    }
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
}

/**
 * Seed inicial se o banco de dados estiver vazio
 */
async function syncSeedExpensesToSupabase(expensesToSeed: Expense[]) {
  try {
    const supabase = getSupabaseClient();
    const rows = expensesToSeed.map(e => expenseToDb(e));
    await supabase.from('expenses').insert(rows);
  } catch (err) {
    // ignore
  }
}

/**
 * Sincroniza configurações de notificação com o Supabase
 */
export async function fetchNotificationSettingsCloud(): Promise<NotificationSettings> {
  const local = loadNotificationSettings();
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return local;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    const cloudSettings: NotificationSettings = {
      whatsappNumber: data.whatsapp_number || local.whatsappNumber,
      notifyHour: data.notify_hour ?? local.notifyHour,
      notifyMinute: data.notify_minute ?? local.notifyMinute,
      browserNotificationsEnabled: data.browser_notifications_enabled ?? local.browserNotificationsEnabled,
      soundEnabled: data.sound_enabled ?? local.soundEnabled,
      notifyOnDueDay: data.notify_on_due_day ?? local.notifyOnDueDay,
      notifyUpcomingDays: data.notify_upcoming_days ?? local.notifyUpcomingDays,
      lastNotifiedDate: data.last_notified_date || local.lastNotifiedDate,
    };

    saveNotificationSettings(cloudSettings);
    return cloudSettings;
  } catch (err) {
    return local;
  }
}

export async function saveNotificationSettingsCloud(settings: NotificationSettings): Promise<void> {
  saveNotificationSettings(settings);
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return;

  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('notification_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    const row = {
      whatsapp_number: settings.whatsappNumber,
      notify_hour: settings.notifyHour,
      notify_minute: settings.notifyMinute,
      browser_notifications_enabled: settings.browserNotificationsEnabled,
      sound_enabled: settings.soundEnabled,
      notify_on_due_day: settings.notifyOnDueDay,
      notify_upcoming_days: settings.notifyUpcomingDays,
      last_notified_date: settings.lastNotifiedDate,
    };

    if (data?.id) {
      await supabase.from('notification_settings').update(row).eq('id', data.id);
    } else {
      await supabase.from('notification_settings').insert([row]);
    }
  } catch (err) {
    console.warn('Erro ao sincronizar notificação com Supabase:', err);
  }
}

/**
 * Carrega categorias do Supabase
 */
export async function fetchCategoriesCloud(): Promise<ExpenseCategoryItem[]> {
  const local = loadCategoriesFromStorage();
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return local;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('nome', { ascending: true });

    if (error || !data || data.length === 0) {
      return local;
    }

    const cloudCats: ExpenseCategoryItem[] = data.map(c => ({
      id: c.id,
      nome: c.nome,
      simbolo: c.simbolo,
      cor: c.cor || 'blue',
      padrao: c.padrao ?? true,
    }));

    saveCategoriesToStorage(cloudCats);
    return cloudCats;
  } catch {
    return local;
  }
}

export async function saveCategoriesCloud(categories: ExpenseCategoryItem[]): Promise<void> {
  saveCategoriesToStorage(categories);
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) return;

  try {
    const supabase = getSupabaseClient();
    const rows = categories.map(c => ({
      id: c.id,
      nome: c.nome,
      simbolo: c.simbolo,
      cor: c.cor,
      padrao: c.padrao ?? false,
    }));
    await supabase.from('categories').upsert(rows);
  } catch (err) {
    console.warn('Erro ao salvar categorias no Supabase:', err);
  }
}
