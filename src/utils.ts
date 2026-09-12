import { Expense, ExpenseCategory, ExpenseEntity, NotificationSettings } from './types';

export const DEFAULT_WHATSAPP_NUMBER = '5588994419892';
export const NOTIFICATION_STORAGE_KEY = 'gestao_notificacoes_config_v1';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  whatsappNumber: '5588994419892',
  notifyHour: 9,
  notifyMinute: 0,
  browserNotificationsEnabled: true,
  soundEnabled: true,
  notifyOnDueDay: true,
  notifyUpcomingDays: 1,
};

export const ENTITIES: {
  id: ExpenseEntity;
  label: string;
  badgeLabel: string;
  icon: string;
  color: string;
  lightBg: string;
  borderColor: string;
  textColor: string;
  description: string;
}[] = [
  {
    id: 'Pessoal',
    label: 'Pessoal',
    badgeLabel: 'Pessoal',
    icon: '👤',
    color: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'Despesas pessoais e domésticas',
  },
  {
    id: 'Academia',
    label: 'Academia',
    badgeLabel: 'Empresa',
    icon: '🏋️',
    color: 'bg-amber-600',
    lightBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    description: 'Empresa Academia & Fitness',
  },
  {
    id: 'Bets',
    label: 'Bets',
    badgeLabel: 'Empresa',
    icon: '🎲',
    color: 'bg-purple-600',
    lightBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    description: 'Empresa de Operações & Apostas',
  },
];

export const CATEGORIES_BY_ENTITY: Record<ExpenseEntity, ExpenseCategory[]> = {
  Pessoal: [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Serviços',
    'Saúde',
    'Lazer',
    'Outros',
  ],
  Academia: [
    'Aluguel Ponto',
    'Equipamentos',
    'Manutenção',
    'Equipe & Salários',
    'Energia & Água',
    'Marketing',
    'Serviços',
    'Outros',
  ],
  Bets: [
    'Banca & Aportes',
    'Softwares & Ferramentas',
    'Servidores & VPS',
    'Taxas & Impostos',
    'Serviços',
    'Outros',
  ],
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Serviços',
  'Saúde',
  'Lazer',
  'Aluguel Ponto',
  'Equipamentos',
  'Manutenção',
  'Equipe & Salários',
  'Energia & Água',
  'Marketing',
  'Banca & Aportes',
  'Softwares & Ferramentas',
  'Servidores & VPS',
  'Taxas & Impostos',
  'Outros',
];

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Moradia: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Alimentação: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Transporte: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Serviços: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Saúde: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Lazer: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Aluguel Ponto': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Equipamentos: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  Manutenção: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Equipe & Salários': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'Energia & Água': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  Marketing: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  'Banca & Aportes': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Softwares & Ferramentas': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'Servidores & VPS': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  'Taxas & Impostos': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Outros: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

export function formatCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Convert YYYY-MM-DD to DD/MM/YYYY
export function formatDateToBR(dateString: string): string {
  if (!dateString) return '';
  if (dateString.includes('/')) return dateString;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

// Convert DD/MM/YYYY to YYYY-MM-DD for date inputs
export function formatDateToISO(dateString: string): string {
  if (!dateString) return new Date().toISOString().split('T')[0];
  if (dateString.includes('-')) return dateString;
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

// Check date status (overdue, today, upcoming)
export function getDueDateStatus(vencimento: string, status: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  daysDiff: number;
} {
  if (status === 'Pago') {
    return { label: 'Pago', isOverdue: false, isToday: false, daysDiff: 0 };
  }

  const iso = formatDateToISO(vencimento);
  const dueDate = new Date(iso + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Atrasada (${Math.abs(diffDays)}d)`,
      isOverdue: true,
      isToday: false,
      daysDiff: diffDays,
    };
  } else if (diffDays === 0) {
    return {
      label: 'Vence Hoje!',
      isOverdue: false,
      isToday: true,
      daysDiff: 0,
    };
  } else if (diffDays === 1) {
    return {
      label: 'Vence amanhã',
      isOverdue: false,
      isToday: false,
      daysDiff: 1,
    };
  } else {
    return {
      label: `Vence em ${diffDays} dias`,
      isOverdue: false,
      isToday: false,
      daysDiff: diffDays,
    };
  }
}

export const INITIAL_EXPENSES: Expense[] = [
  // --- PESSOAL ---
  {
    id: 1726050000001,
    descricao: 'Aluguel do Apartamento Residencial',
    categoria: 'Moradia',
    entidade: 'Pessoal',
    valor: 1650.0,
    vencimento: '10/10/2026',
    status: 'Pago',
    comprovanteNome: 'comprovante_aluguel.pdf',
    comprovanteTipo: 'pdf',
    pagoEm: '08/10/2026',
  },
  {
    id: 1726050000002,
    descricao: 'Supermercado da Família',
    categoria: 'Alimentação',
    entidade: 'Pessoal',
    valor: 640.0,
    vencimento: '12/09/2026',
    status: 'Pendente',
  },
  {
    id: 1726050000003,
    descricao: 'Internet Residencial Fibra',
    categoria: 'Serviços',
    entidade: 'Pessoal',
    valor: 119.9,
    vencimento: '18/10/2026',
    status: 'Pago',
    pagoEm: '14/10/2026',
  },

  // --- ACADEMIA (EMPRESA) ---
  {
    id: 1726050000004,
    descricao: 'Aluguel do Ponto Comercial (Academia)',
    categoria: 'Aluguel Ponto',
    entidade: 'Academia',
    valor: 3800.0,
    vencimento: '05/10/2026',
    status: 'Pago',
    comprovanteNome: 'recibo_aluguel_academia.pdf',
    comprovanteTipo: 'pdf',
    pagoEm: '04/10/2026',
  },
  {
    id: 1726050000005,
    descricao: 'Conta de Energia Elétrica (Ar Condicionado)',
    categoria: 'Energia & Água',
    entidade: 'Academia',
    valor: 1450.0,
    vencimento: '12/09/2026',
    status: 'Pendente',
  },
  {
    id: 1726050000006,
    descricao: 'Manutenção de Esteiras e Aparelhos',
    categoria: 'Manutenção',
    entidade: 'Academia',
    valor: 850.0,
    vencimento: '22/10/2026',
    status: 'Pendente',
  },
  {
    id: 1726050000007,
    descricao: 'Instrutores & Equipe de Treino',
    categoria: 'Equipe & Salários',
    entidade: 'Academia',
    valor: 4200.0,
    vencimento: '05/10/2026',
    status: 'Pago',
    pagoEm: '05/10/2026',
  },

  // --- BETS (EMPRESA) ---
  {
    id: 1726050000008,
    descricao: 'Aporte de Banca Operacional',
    categoria: 'Banca & Aportes',
    entidade: 'Bets',
    valor: 5000.0,
    vencimento: '01/10/2026',
    status: 'Pago',
    comprovanteNome: 'ted_aporte_banca.png',
    comprovanteTipo: 'image',
    pagoEm: '01/10/2026',
  },
  {
    id: 1726050000009,
    descricao: 'Servidor VPS Alta Velocidade (Bots)',
    categoria: 'Servidores & VPS',
    entidade: 'Bets',
    valor: 240.0,
    vencimento: '14/10/2026',
    status: 'Pago',
    pagoEm: '12/10/2026',
  },
  {
    id: 1726050000010,
    descricao: 'Licença Software de Análise & Odds API',
    categoria: 'Softwares & Ferramentas',
    entidade: 'Bets',
    valor: 480.0,
    vencimento: '13/09/2026',
    status: 'Pendente',
  },
  {
    id: 1726050000011,
    descricao: 'Taxas de Saque & Plataformas',
    categoria: 'Taxas & Impostos',
    entidade: 'Bets',
    valor: 310.0,
    vencimento: '28/10/2026',
    status: 'Pendente',
  },
];

export const STORAGE_KEY = 'despesas_dados_csv_store_v2';

export function loadExpensesFromStorage(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy key
      const legacyRaw = localStorage.getItem('despesas_dados_csv_store');
      if (legacyRaw) {
        const parsedLegacy = JSON.parse(legacyRaw);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const migrated: Expense[] = parsedLegacy.map(e => ({
            ...e,
            entidade: e.entidade || 'Pessoal',
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(e => ({
        ...e,
        entidade: (e.entidade as ExpenseEntity) || 'Pessoal',
      }));
    }
    return INITIAL_EXPENSES;
  } catch (err) {
    console.error('Error loading expenses from storage:', err);
    return INITIAL_EXPENSES;
  }
}

export function saveExpensesToStorage(expenses: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Error saving expenses to storage:', err);
  }
}

export function exportExpensesToCSV(expenses: Expense[]): void {
  // Schema with Entidade included: ID,Descricao,Entidade,Categoria,Valor,Vencimento,Status,Comprovante
  const header = [
    'ID',
    'Descricao',
    'Entidade',
    'Categoria',
    'Valor',
    'Vencimento',
    'Status',
    'Comprovante',
  ];
  const rows = expenses.map(exp => [
    exp.id,
    `"${(exp.descricao || '').replace(/"/g, '""')}"`,
    `"${exp.entidade || 'Pessoal'}"`,
    `"${(exp.categoria || '').replace(/"/g, '""')}"`,
    exp.valor.toFixed(2),
    exp.vencimento,
    exp.status,
    `"${(exp.comprovanteNome || exp.comprovante || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'despesas_dados.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------
// NOTIFICAÇÕES & WHATSAPP HELPERS
// ----------------------------------------------------

export function cleanPhoneNumber(raw: string): string {
  if (!raw) return DEFAULT_WHATSAPP_NUMBER;
  let digits = raw.replace(/\D/g, '');
  // If user typed '88994419892' (11 digits: DDD + number), prepend Brazil code 55
  if (digits.length === 11 || digits.length === 10) {
    digits = '55' + digits;
  }
  return digits;
}

export function formatPhoneNumberBR(phone: string): string {
  if (!phone) return '(88) 99441-9892';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length === 13) {
    const ddd = digits.slice(2, 4);
    const num1 = digits.slice(4, 9);
    const num2 = digits.slice(9, 13);
    return `+55 (${ddd}) ${num1}-${num2}`;
  }
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const num1 = digits.slice(2, 7);
    const num2 = digits.slice(7, 11);
    return `(${ddd}) ${num1}-${num2}`;
  }
  return phone;
}

export function createWhatsAppExpenseMessage(expense: Expense): string {
  const entityEmoji =
    expense.entidade === 'Pessoal' ? '👤' : expense.entidade === 'Academia' ? '🏋️' : '🎲';
  const dueInfo = getDueDateStatus(expense.vencimento, expense.status);
  const statusEmoji = expense.status === 'Pago' ? '✅ Pago' : '🔴 Pendente';

  return `🔔 *LEMBRETE DE VENCIMENTO: ${expense.descricao.toUpperCase()}*

${entityEmoji} *Conta/Empresa:* ${expense.entidade}
🏷️ *Categoria:* ${expense.categoria}
💰 *Valor:* ${formatCurrency(expense.valor)}
📅 *Vencimento:* ${expense.vencimento} (${dueInfo.label})
⚠️ *Situação:* ${statusEmoji}

📱 *Gestão Financeira & Lembretes*
Acesse seu painel para confirmar o pagamento ou anexar o comprovante!`;
}

export function createWhatsAppDailySummary(
  expenses: Expense[],
  dateStr?: string,
  includeUpcoming = true
): string {
  const todayISO = new Date().toISOString().split('T')[0];
  const todayBR = formatDateToBR(todayISO);
  const targetDate = dateStr || todayBR;

  // Contas pendentes com vencimento hoje
  const dueToday = expenses.filter(e => {
    if (e.status === 'Pago') return false;
    const dueISO = formatDateToISO(e.vencimento);
    return dueISO === todayISO;
  });

  // Contas vencidas / atrasadas
  const overdue = expenses.filter(e => {
    if (e.status === 'Pago') return false;
    const dueInfo = getDueDateStatus(e.vencimento, e.status);
    return dueInfo.isOverdue;
  });

  // Contas que vencem amanhã
  const upcomingTomorrow = expenses.filter(e => {
    if (e.status === 'Pago') return false;
    const dueInfo = getDueDateStatus(e.vencimento, e.status);
    return dueInfo.daysDiff === 1;
  });

  const totalHoje = dueToday.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);

  let msg = `⏰ *LEMBRETE DAS 09:00 - CONTAS A VENCER HOJE*\n`;
  msg += `📅 *Data:* ${targetDate}\n\n`;

  if (dueToday.length === 0) {
    msg += `✅ *Nenhuma conta vence hoje (${targetDate})!*\n`;
  } else {
    msg += `⚠️ *Atenção! Você tem ${dueToday.length} conta(s) com vencimento HOJE:*\n\n`;

    const pessoal = dueToday.filter(e => (e.entidade || 'Pessoal') === 'Pessoal');
    const academia = dueToday.filter(e => e.entidade === 'Academia');
    const bets = dueToday.filter(e => e.entidade === 'Bets');

    if (pessoal.length > 0) {
      msg += `👤 *PESSOAL:*\n`;
      pessoal.forEach(e => {
        msg += ` • ${e.descricao}: ${formatCurrency(e.valor)}\n`;
      });
      msg += `\n`;
    }

    if (academia.length > 0) {
      msg += `🏋️ *ACADEMIA (EMPRESA):*\n`;
      academia.forEach(e => {
        msg += ` • ${e.descricao}: ${formatCurrency(e.valor)}\n`;
      });
      msg += `\n`;
    }

    if (bets.length > 0) {
      msg += `🎲 *BETS (EMPRESA):*\n`;
      bets.forEach(e => {
        msg += ` • ${e.descricao}: ${formatCurrency(e.valor)}\n`;
      });
      msg += `\n`;
    }

    msg += `💵 *TOTAL A PAGAR HOJE:* *${formatCurrency(totalHoje)}*\n\n`;
  }

  if (overdue.length > 0) {
    const totalOverdue = overdue.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
    msg += `🚨 *Contas em Atraso (${overdue.length}):* Total de ${formatCurrency(totalOverdue)}\n`;
    overdue.forEach(e => {
      msg += ` • [${e.entidade}] ${e.descricao}: ${formatCurrency(e.valor)} (Venceu em ${e.vencimento})\n`;
    });
    msg += `\n`;
  }

  if (includeUpcoming && upcomingTomorrow.length > 0) {
    msg += `⏳ *Vencem Amanhã (${upcomingTomorrow.length}):*\n`;
    upcomingTomorrow.forEach(e => {
      msg += ` • [${e.entidade}] ${e.descricao}: ${formatCurrency(e.valor)}\n`;
    });
    msg += `\n`;
  }

  msg += `👉 Abra seu app para dar baixa e salvar o comprovante bancário!`;

  return msg;
}

export function openWhatsApp(phone: string, text: string) {
  const clean = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(text);
  const url = `https://api.whatsapp.com/send?phone=${clean}&text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Tom 1 - D5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tom 2 - A5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Notification audio notice:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function showNativeNotification(
  title: string,
  body: string,
  onClick?: () => void
) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/icon.png',
        tag: 'lembrete-vencimento-' + Date.now(),
      });
      if (onClick) {
        notif.onclick = () => {
          window.focus();
          onClick();
          notif.close();
        };
      }
    } catch (e) {
      console.warn('Native notification failed', e);
    }
  }
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        whatsappNumber: parsed.whatsappNumber || DEFAULT_WHATSAPP_NUMBER,
      };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function saveNotificationSettings(settings: NotificationSettings) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}
