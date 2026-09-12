export type ExpenseEntity = 'Pessoal' | 'Academia' | 'Bets';

export type ExpenseCategory =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Serviços'
  | 'Saúde'
  | 'Lazer'
  | 'Equipamentos'
  | 'Manutenção'
  | 'Aluguel Ponto'
  | 'Equipe & Salários'
  | 'Energia & Água'
  | 'Marketing'
  | 'Banca & Aportes'
  | 'Softwares & Ferramentas'
  | 'Servidores & VPS'
  | 'Taxas & Impostos'
  | 'Outros';

export type ExpenseStatus = 'Pendente' | 'Pago';

export interface Expense {
  id: number;
  descricao: string;
  categoria: ExpenseCategory | string;
  entidade: ExpenseEntity;
  valor: number;
  vencimento: string; // Formato DD/MM/AAAA ou ISO YYYY-MM-DD
  status: ExpenseStatus;
  comprovante?: string; // Data URL or file name
  comprovanteNome?: string;
  comprovanteTipo?: 'image' | 'pdf' | 'file';
  observacao?: string;
  pagoEm?: string;
}

export type TabType =
  | 'overview'
  | 'pessoal'
  | 'academia'
  | 'bets'
  | 'new_expense'
  | 'settings';

export type FilterStatus = 'Todas' | 'Pendente' | 'Pago';

export interface NotificationSettings {
  whatsappNumber: string; // e.g. "5588994419892"
  notifyHour: number; // 9
  notifyMinute: number; // 0
  browserNotificationsEnabled: boolean;
  soundEnabled: boolean;
  notifyOnDueDay: boolean; // Notificar no dia do vencimento
  notifyUpcomingDays: number; // 0 = só no dia, 1 = 1 dia antes também
  lastNotifiedDate?: string; // YYYY-MM-DD
}

