import React, { useState, useRef, useMemo } from 'react';
import { Expense, ExpenseEntity, NotificationSettings } from '../types';
import {
  exportExpensesToCSV,
  formatCurrency,
  INITIAL_EXPENSES,
  ENTITIES,
  formatPhoneNumberBR,
  cleanPhoneNumber,
  playNotificationChime,
  requestNotificationPermission,
  showNativeNotification,
  generateAccountingTextSummary,
  downloadTextFile,
  openWhatsApp,
} from '../utils';
import {
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  FileSpreadsheet,
  PieChart,
  BarChart3,
  User,
  Dumbbell,
  Dices,
  Info,
  MessageCircle,
  Bell,
  Clock,
  Phone,
  Volume2,
  Send,
  FileText,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { AccountingSummaryModal } from './AccountingSummaryModal';

interface SettingsTabProps {
  expenses: Expense[];
  onImportExpenses: (expenses: Expense[]) => void;
  onResetExpenses: () => void;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (settings: NotificationSettings) => void;
  onOpenWhatsAppModal: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  expenses,
  onImportExpenses,
  onResetExpenses,
  notificationSettings,
  onUpdateNotificationSettings,
  onOpenWhatsAppModal,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState(notificationSettings.whatsappNumber);
  const [phoneSavedFeedback, setPhoneSavedFeedback] = useState(false);
  const [testingAlarm, setTestingAlarm] = useState(false);
  const [accountingModalOpen, setAccountingModalOpen] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQuickCopyText = async () => {
    const text = generateAccountingTextSummary(expenses);
    try {
      await navigator.clipboard.writeText(text);
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickDownloadTxt = () => {
    const today = new Date().toISOString().split('T')[0];
    const text = generateAccountingTextSummary(expenses);
    downloadTextFile(`resumo_contabilidade_${today}.txt`, text);
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanPhoneNumber(phoneInput);
    onUpdateNotificationSettings({
      ...notificationSettings,
      whatsappNumber: cleaned,
    });
    setPhoneSavedFeedback(true);
    setTimeout(() => setPhoneSavedFeedback(false), 2500);
  };

  const handleTestAlarm = async () => {
    setTestingAlarm(true);
    playNotificationChime();
    const granted = await requestNotificationPermission();
    showNativeNotification(
      '⏰ Teste do Lembrete das 09:00',
      `Tudo pronto! Seus lembretes de vencimento serão enviados para ${formatPhoneNumberBR(
        notificationSettings.whatsappNumber
      )}`
    );
    setTimeout(() => setTestingAlarm(false), 2500);
  };

  // Entities breakdown
  const entityStats = useMemo(() => {
    const list: ExpenseEntity[] = ['Pessoal', 'Academia', 'Bets'];
    return list.map(ent => {
      const filtered = expenses.filter(e => (e.entidade || 'Pessoal') === ent);
      const total = filtered.reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const pago = filtered
        .filter(e => e.status === 'Pago')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const pendente = filtered
        .filter(e => e.status === 'Pendente')
        .reduce((acc, c) => acc + (Number(c.valor) || 0), 0);
      const count = filtered.length;
      return { entity: ent, total, pago, pendente, count };
    });
  }, [expenses]);

  const totalGeral = useMemo(
    () => expenses.reduce((acc, c) => acc + (Number(c.valor) || 0), 0),
    [expenses]
  );

  const handleExportCSV = () => {
    exportExpensesToCSV(expenses);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 0);

        if (lines.length <= 1) {
          setImportStatus('Arquivo CSV vazio ou sem registros.');
          return;
        }

        const headerLine = lines[0].toLowerCase();
        const hasEntidadeCol = headerLine.includes('entidade');

        const imported: Expense[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i];
          // Simple CSV splitter respecting quotes
          const cols: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let j = 0; j < row.length; j++) {
            const char = row[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(current);
              current = '';
            } else {
              current += char;
            }
          }
          cols.push(current);

          if (hasEntidadeCol && cols.length >= 6) {
            // ID, Descricao, Entidade, Categoria, Valor, Vencimento, Status, Comprovante
            const id = Number(cols[0]) || Date.now() + i;
            const desc = cols[1]?.replace(/^"|"$/g, '').trim() || 'Sem descrição';
            const rawEnt = cols[2]?.replace(/^"|"$/g, '').trim();
            const ent: ExpenseEntity =
              rawEnt === 'Academia' || rawEnt === 'Bets' ? rawEnt : 'Pessoal';
            const cat = cols[3]?.replace(/^"|"$/g, '').trim() || 'Outros';
            const val = parseFloat(cols[4]?.replace(/^"|"$/g, '').trim()) || 0;
            const venc = cols[5]?.replace(/^"|"$/g, '').trim() || '';
            const status =
              cols[6]?.replace(/^"|"$/g, '').trim() === 'Pago' ? 'Pago' : 'Pendente';
            const comp = cols[7]?.replace(/^"|"$/g, '').trim();

            imported.push({
              id,
              descricao: desc,
              entidade: ent,
              categoria: cat,
              valor: val,
              vencimento: venc,
              status,
              comprovanteNome: comp || undefined,
            });
          } else if (cols.length >= 6) {
            // Backward compatibility format without Entidade column
            const id = Number(cols[0]) || Date.now() + i;
            const desc = cols[1]?.replace(/^"|"$/g, '').trim() || 'Sem descrição';
            const cat = cols[2]?.replace(/^"|"$/g, '').trim() || 'Outros';
            const val = parseFloat(cols[3]?.replace(/^"|"$/g, '').trim()) || 0;
            const venc = cols[4]?.replace(/^"|"$/g, '').trim() || '';
            const status =
              cols[5]?.replace(/^"|"$/g, '').trim() === 'Pago' ? 'Pago' : 'Pendente';
            const comp = cols[6]?.replace(/^"|"$/g, '').trim();

            imported.push({
              id,
              descricao: desc,
              entidade: 'Pessoal',
              categoria: cat,
              valor: val,
              vencimento: venc,
              status,
              comprovanteNome: comp || undefined,
            });
          }
        }

        if (imported.length > 0) {
          onImportExpenses(imported);
          setImportStatus(`Sucesso! ${imported.length} despesas importadas do CSV.`);
        } else {
          setImportStatus('Nenhum dado válido reconhecido no CSV.');
        }
      } catch (err) {
        console.error(err);
        setImportStatus('Erro ao ler arquivo CSV. Verifique o formato das colunas.');
      }
    };

    reader.readAsText(file);
  };

  const getEntityIcon = (entity: ExpenseEntity) => {
    switch (entity) {
      case 'Pessoal':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'Academia':
        return <Dumbbell className="w-4 h-4 text-amber-600" />;
      case 'Bets':
        return <Dices className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-5 px-3 sm:px-6 pb-20 pt-1">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900">
          Relatórios &amp; Ajustes
        </h2>
        <p className="text-xs text-slate-500">
          WhatsApp de lembretes das 09h, comparativo financeiro e backup.
        </p>
      </div>

      {/* 0. Notificações & WhatsApp das 09:00 */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/90 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Lembrete no WhatsApp &amp; Alarme 09h
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Notificação automática no dia do vencimento às 09:00 da manhã.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Phone Form */}
        <form onSubmit={handleSavePhone} className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              Número do seu WhatsApp:
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Atual: {formatPhoneNumberBR(notificationSettings.whatsappNumber)}
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              placeholder="Ex: 88994419892"
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Salvar
            </button>
          </div>
          {phoneSavedFeedback && (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Número atualizado com sucesso para {formatPhoneNumberBR(notificationSettings.whatsappNumber)}!</span>
            </p>
          )}
        </form>

        {/* Configurations Grid */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Horário do Lembrete Diário
                </span>
                <span className="text-[11px] text-slate-500">
                  Dispara no dia exato do vencimento
                </span>
              </div>
            </div>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              09:00 da manhã
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Som de Alerta no Dispositivo
                </span>
                <span className="text-[11px] text-slate-500">
                  Toca aviso sonoro quando o app estiver aberto
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.soundEnabled}
              onChange={e =>
                onUpdateNotificationSettings({
                  ...notificationSettings,
                  soundEnabled: e.target.checked,
                })
              }
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Notificações do Navegador / Push
                </span>
                <span className="text-[11px] text-slate-500">
                  Notificação no banner do sistema
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.browserNotificationsEnabled}
              onChange={async e => {
                const checked = e.target.checked;
                if (checked) {
                  await requestNotificationPermission();
                }
                onUpdateNotificationSettings({
                  ...notificationSettings,
                  browserNotificationsEnabled: checked,
                });
              }}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onOpenWhatsAppModal}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Abrir Painel WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleTestAlarm}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{testingAlarm ? 'Testando...' : 'Testar Alarme 09:00'}</span>
          </button>
        </div>
      </section>

      {/* 1. Comparativo de Gastos: Pessoal vs Academia vs Bets */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Distribuição: Pessoal vs Empresas
            </h3>
            <p className="text-xs text-slate-500">
              Participação de cada conta no seu volume financeiro
            </p>
          </div>
        </div>

        {/* Visual Bar Breakdown */}
        {totalGeral > 0 && (
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
              {entityStats.map(stat => {
                const percent = (stat.total / totalGeral) * 100;
                const bg =
                  stat.entity === 'Pessoal'
                    ? 'bg-blue-600'
                    : stat.entity === 'Academia'
                    ? 'bg-amber-500'
                    : 'bg-purple-600';
                return (
                  <div
                    key={stat.entity}
                    title={`${stat.entity}: ${percent.toFixed(1)}%`}
                    style={{ width: `${percent}%` }}
                    className={`${bg} h-full transition-all duration-300`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-around text-[11px] text-slate-600 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Pessoal (
                {totalGeral > 0
                  ? (
                      ((entityStats.find(e => e.entity === 'Pessoal')?.total || 0) /
                        totalGeral) *
                      100
                    ).toFixed(0)
                  : 0}
                %)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Academia (
                {totalGeral > 0
                  ? (
                      ((entityStats.find(e => e.entity === 'Academia')?.total || 0) /
                        totalGeral) *
                      100
                    ).toFixed(0)
                  : 0}
                %)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                Bets (
                {totalGeral > 0
                  ? (
                      ((entityStats.find(e => e.entity === 'Bets')?.total || 0) /
                        totalGeral) *
                      100
                    ).toFixed(0)
                  : 0}
                %)
              </span>
            </div>
          </div>
        )}

        {/* Detailed Breakdown List */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          {entityStats.map(stat => (
            <div
              key={stat.entity}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                {getEntityIcon(stat.entity)}
                <div>
                  <span className="font-bold text-slate-800 block">
                    {stat.entity === 'Pessoal' && 'Pessoal'}
                    {stat.entity === 'Academia' && 'Academia (Empresa)'}
                    {stat.entity === 'Bets' && 'Bets (Empresa)'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {stat.count} contas cadastradas
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-extrabold text-slate-900 block">
                  Total: {formatCurrency(stat.total)}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  Pago: {formatCurrency(stat.pago)}
                </span>
                <span className="text-[10px] text-rose-700 font-bold block">
                  Pendente: {formatCurrency(stat.pendente)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Resumo das Despesas em Formato Texto (Contabilidade & WhatsApp) */}
      <section className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/90 shadow-xs space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">
                  Resumo das Despesas em Texto
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Contabilidade
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gere um resumo simples em texto para compartilhar no WhatsApp ou exportar (.txt) facilitando a contabilidade das empresas.
              </p>
            </div>
          </div>
        </div>

        {/* Informative breakdown banner */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Organizado por empresa: <strong>Academia</strong>, <strong>Bets</strong> e <strong>Pessoal</strong>
          </p>
          <p className="text-slate-500 text-[11px]">
            Totais discriminados com o que foi liquidado e pendências para envio rápido ao contador ou sócios.
          </p>
        </div>

        {/* Primary Action Button to open Generator Modal */}
        <button
          type="button"
          id="btn-open-accounting-summary"
          onClick={() => setAccountingModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Gerar Resumo em Texto (WhatsApp / Exportar)</span>
        </button>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={handleQuickCopyText}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            {quickCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Texto Rápido</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleQuickDownloadTxt}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar .TXT</span>
          </button>
        </div>
      </section>

      {/* 3. Exportação & Importação de Arquivo CSV */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Exportar &amp; Importar Dados (CSV)
            </h3>
            <p className="text-xs text-slate-500">
              Arquivo 100% compatível com Excel, Numbers e o Streamlit original
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar despesas_dados.csv</span>
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Restaurar de CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Como Usar no iPhone como App Nativo */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Salvar no iPhone (Tela de Início)
            </h3>
            <p className="text-xs text-slate-500">
              Abra em tela cheia sem a barra do Safari
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-1.5 pl-2 border-l-2 border-blue-400">
          <p>
            1. Abra este link no navegador <strong>Safari</strong> do seu iPhone.
          </p>
          <p>
            2. Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima na barra inferior).
          </p>
          <p>
            3. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
          </p>
          <p>
            4. Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
          </p>
        </div>
      </section>

      {/* 4. Resetar / Restaurar Demonstração */}
      <section className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Restaurar Dados Exemplo
            </h3>
            <p className="text-[11px] text-slate-500">
              Recarrega o exemplo completo com Pessoal, Academia e Bets
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  'Tem certeza que deseja restaurar os dados de exemplo com Pessoal, Academia e Bets?'
                )
              ) {
                onResetExpenses();
              }
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restaurar</span>
          </button>
        </div>
      </section>
      {/* Modal de Resumo Contábil das Empresas */}
      <AccountingSummaryModal
        isOpen={accountingModalOpen}
        onClose={() => setAccountingModalOpen(false)}
        expenses={expenses}
        notificationSettings={notificationSettings}
      />
    </div>
  );
};
