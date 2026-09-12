import React, { useState, useRef, useEffect } from 'react';
import { Expense, ExpenseCategory, ExpenseEntity, TabType } from '../types';
import {
  CATEGORIES_BY_ENTITY,
  ENTITIES,
  formatDateToBR,
} from '../utils';
import {
  PlusCircle,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Sparkles,
  User,
  Dumbbell,
  Dices,
} from 'lucide-react';

interface NewExpenseTabProps {
  initialEntity?: ExpenseEntity;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onNavigateToTab: (tab: TabType) => void;
}

const ENTITY_SUGGESTIONS: Record<
  ExpenseEntity,
  { name: string; cat: ExpenseCategory }[]
> = {
  Pessoal: [
    { name: 'Aluguel do Apartamento', cat: 'Moradia' },
    { name: 'Supermercado Mensal', cat: 'Alimentação' },
    { name: 'Conta de Luz (Enel)', cat: 'Moradia' },
    { name: 'Internet Residencial', cat: 'Serviços' },
    { name: 'Combustível / Metrô', cat: 'Transporte' },
    { name: 'Plano de Saúde', cat: 'Saúde' },
    { name: 'Assinatura Streaming', cat: 'Lazer' },
  ],
  Academia: [
    { name: 'Aluguel do Ponto da Academia', cat: 'Aluguel Ponto' },
    { name: 'Conta de Luz (Ar Condicionado)', cat: 'Energia & Água' },
    { name: 'Manutenção de Esteiras & Pesos', cat: 'Manutenção' },
    { name: 'Salário dos Instrutores', cat: 'Equipe & Salários' },
    { name: 'Aquisição de Anilhas / Halteres', cat: 'Equipamentos' },
    { name: 'Campanha de Tráfego / Instagram', cat: 'Marketing' },
    { name: 'Produtos de Limpeza & Higiene', cat: 'Serviços' },
  ],
  Bets: [
    { name: 'Aporte de Banca Operacional', cat: 'Banca & Aportes' },
    { name: 'Servidor VPS Alta Performance', cat: 'Servidores & VPS' },
    { name: 'Assinatura Software de Análise', cat: 'Softwares & Ferramentas' },
    { name: 'API de Cotações & Odds em Tempo Real', cat: 'Softwares & Ferramentas' },
    { name: 'Taxas & Comissões de Saque', cat: 'Taxas & Impostos' },
    { name: 'Grupo VIP / Consultoria Esportiva', cat: 'Serviços' },
  ],
};

export const NewExpenseTab: React.FC<NewExpenseTabProps> = ({
  initialEntity = 'Pessoal',
  onAddExpense,
  onNavigateToTab,
}) => {
  const [entidade, setEntidade] = useState<ExpenseEntity>(initialEntity);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<ExpenseCategory>(() => {
    return CATEGORIES_BY_ENTITY[initialEntity][0] || 'Outros';
  });
  const [valorStr, setValorStr] = useState('');
  const [vencimento, setVencimento] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [comprovanteBase64, setComprovanteBase64] = useState<string>('');
  const [comprovanteNome, setComprovanteNome] = useState<string>('');
  const [comprovanteTipo, setComprovanteTipo] = useState<'image' | 'pdf' | 'file'>('image');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // When user changes entity, ensure the category matches the new entity's options
  const handleEntityChange = (newEntity: ExpenseEntity) => {
    setEntidade(newEntity);
    const availableCategories = CATEGORIES_BY_ENTITY[newEntity];
    if (!availableCategories.includes(categoria)) {
      setCategoria(availableCategories[0] || 'Outros');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setComprovanteNome(file.name);
    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    setComprovanteTipo(isImg ? 'image' : isPdf ? 'pdf' : 'file');

    const reader = new FileReader();
    reader.onload = () => {
      setComprovanteBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setComprovanteBase64('');
    setComprovanteNome('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const numericValor = parseFloat(valorStr.replace(',', '.'));

    if (!descricao.trim() || isNaN(numericValor) || numericValor <= 0) {
      setErrorMessage('Preencha a descrição e um valor válido maior que zero.');
      return;
    }

    onAddExpense({
      descricao: descricao.trim(),
      entidade,
      categoria,
      valor: numericValor,
      vencimento: formatDateToBR(vencimento),
      status: 'Pendente',
      comprovante: comprovanteBase64 || (comprovanteNome ? comprovanteNome : ''),
      comprovanteNome: comprovanteNome || undefined,
      comprovanteTipo: comprovanteNome ? comprovanteTipo : undefined,
    });

    setSuccessMessage(`Despesa adicionada com sucesso na conta "${entidade}"!`);

    // Reset form
    setDescricao('');
    setValorStr('');
    setComprovanteBase64('');
    setComprovanteNome('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleApplySuggestion = (item: { name: string; cat: ExpenseCategory }) => {
    setDescricao(item.name);
    setCategoria(item.cat);
  };

  const currentCategories = CATEGORIES_BY_ENTITY[entidade] || [];
  const currentSuggestions = ENTITY_SUGGESTIONS[entidade] || [];

  return (
    <div className="space-y-5 px-3 sm:px-6 pb-20 pt-1">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black text-slate-900">
          Cadastrar Nova Despesa
        </h2>
        <p className="text-xs text-slate-500">
          Selecione a conta/empresa de destino e preencha os dados da fatura.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold">{successMessage}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Status inicial: <strong>Pendente</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab(entidade === 'Pessoal' ? 'pessoal' : entidade === 'Academia' ? 'academia' : 'bets')}
            className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Ver em {entidade}
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4"
      >
        {/* 1. SELEÇÃO DA CONTA / EMPRESA */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Conta / Empresa da Despesa <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ENTITIES.map(item => {
              const isSelected = entidade === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleEntityChange(item.id)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base select-none">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-slate-800 text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.badgeLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sugestões Rápidas da Empresa/Conta selecionada */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Sugestões frequentes para {entidade}:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {currentSuggestions.map(sug => (
              <button
                key={sug.name}
                type="button"
                onClick={() => handleApplySuggestion(sug)}
                className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200/80"
              >
                {sug.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Nome da Despesa */}
        <div>
          <label
            htmlFor="expense-desc"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Nome da Despesa <span className="text-rose-500">*</span>
          </label>
          <input
            id="expense-desc"
            type="text"
            required
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder={`Ex: ${
              entidade === 'Pessoal'
                ? 'Aluguel residencial, internet...'
                : entidade === 'Academia'
                ? 'Aluguel do ponto, conta de luz...'
                : 'Aporte de banca, servidor VPS...'
            }`}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* 4. Categoria (atualizada pela Entidade) */}
        <div>
          <label
            htmlFor="expense-cat"
            className="block text-xs font-bold text-slate-700 mb-1.5"
          >
            Categoria ({entidade})
          </label>
          <select
            id="expense-cat"
            value={categoria}
            onChange={e => setCategoria(e.target.value as ExpenseCategory)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            {currentCategories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Valor (R$) & Vencimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="expense-value"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Valor (R$) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                R$
              </span>
              <input
                id="expense-value"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={valorStr}
                onChange={e => setValorStr(e.target.value)}
                placeholder="0,00"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="expense-due"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Data de Vencimento
            </label>
            <input
              id="expense-due"
              type="date"
              required
              value={vencimento}
              onChange={e => setVencimento(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* 6. Upload de Comprovante */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Comprovante / Fatura (Foto ou PDF)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {!comprovanteNome ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-3.5 text-center hover:border-slate-300 transition-colors bg-slate-50/50">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>
                <span className="text-xs text-slate-400">ou</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Arquivo / PDF</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Guardar comprovante anexado no iPhone
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {comprovanteBase64 && comprovanteTipo === 'image' ? (
                  <img
                    src={comprovanteBase64}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {comprovanteNome}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Anexo vinculado a esta despesa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-full hover:bg-rose-100 text-rose-600 transition-colors shrink-0"
                title="Remover anexo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Botão de Envio */}
        <div className="pt-2">
          <button
            type="submit"
            id="submit-new-expense"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Salvar Despesa em {entidade}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
