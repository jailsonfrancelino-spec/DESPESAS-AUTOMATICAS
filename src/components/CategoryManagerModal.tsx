import React, { useState } from 'react';
import { ExpenseCategoryItem } from '../types';
import {
  POPULAR_CATEGORY_ICONS,
  DEFAULT_CATEGORIES,
} from '../utils';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Tag,
  Palette,
  Layers,
} from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategoryItem[];
  onSaveCategories: (updatedCategories: ExpenseCategoryItem[]) => void;
}

const COLOR_OPTIONS = [
  { id: 'violet', label: 'Roxo', bg: 'bg-violet-500' },
  { id: 'sky', label: 'Azul Claro', bg: 'bg-sky-500' },
  { id: 'rose', label: 'Rosa/Vinho', bg: 'bg-rose-500' },
  { id: 'teal', label: 'Verde Petróleo', bg: 'bg-teal-500' },
  { id: 'blue', label: 'Azul', bg: 'bg-blue-500' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
  { id: 'red', label: 'Vermelho', bg: 'bg-red-500' },
  { id: 'amber', label: 'Âmbar/Amarelo', bg: 'bg-amber-500' },
  { id: 'cyan', label: 'Ciano', bg: 'bg-cyan-500' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { id: 'orange', label: 'Laranja', bg: 'bg-orange-500' },
  { id: 'slate', label: 'Cinza', bg: 'bg-slate-500' },
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [simbolo, setSimbolo] = useState('💳');
  const [cor, setCor] = useState('violet');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (cat: ExpenseCategoryItem) => {
    setEditingId(cat.id);
    setNome(cat.nome);
    setSimbolo(cat.simbolo || '📦');
    setCor(cat.cor || 'slate');
    setErrorMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNome('');
    setSimbolo('💳');
    setCor('violet');
    setErrorMsg(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNome = nome.trim();
    if (!cleanNome) {
      setErrorMsg('Informe o nome da modalidade/categoria.');
      return;
    }

    const cleanSimbolo = simbolo.trim() || '📦';

    // Duplicate check
    const duplicate = categories.find(
      c => c.id !== editingId && c.nome.toLowerCase().trim() === cleanNome.toLowerCase()
    );
    if (duplicate) {
      setErrorMsg(`Já existe uma modalidade com o nome "${cleanNome}".`);
      return;
    }

    if (editingId) {
      // Update existing
      const updated = categories.map(c =>
        c.id === editingId
          ? {
              ...c,
              nome: cleanNome,
              simbolo: cleanSimbolo,
              cor,
            }
          : c
      );
      onSaveCategories(updated);
    } else {
      // Create new
      const newCat: ExpenseCategoryItem = {
        id: `cat-${Date.now()}`,
        nome: cleanNome,
        simbolo: cleanSimbolo,
        cor,
        padrao: false,
      };
      onSaveCategories([...categories, newCat]);
    }

    handleCancelEdit();
  };

  const handleDelete = (id: string, name: string) => {
    if (categories.length <= 1) {
      alert('Você deve manter ao menos uma modalidade cadastrada.');
      return;
    }
    const updated = categories.filter(c => c.id !== id);
    onSaveCategories(updated);
    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar as modalidades padrão do sistema? Suas categorias serão resetadas para as opções recomendadas.')) {
      onSaveCategories(DEFAULT_CATEGORIES);
      handleCancelEdit();
    }
  };

  const filteredCategories = categories.filter(c =>
    c.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      id="category-manager-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="category-manager-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Modalidades &amp; Símbolos das Despesas
              </h2>
              <p className="text-[11px] text-slate-300">
                Crie, renomeie e defina o ícone de cada categoria
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Create / Edit Form Card */}
          <form
            onSubmit={handleSaveForm}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              editingId
                ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                {editingId ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Editar Modalidade</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Criar Nova Modalidade</span>
                  </>
                )}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Name & Symbol input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>Nome da Modalidade:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => {
                      setNome(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Ex: Cartão de Crédito, Internet, Contador..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Símbolo:
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      maxLength={4}
                      value={simbolo}
                      onChange={e => setSimbolo(e.target.value)}
                      className="w-full px-2 py-2 text-center text-lg bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      title="Digite ou selecione um emoji"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Symbol Palette */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                  <span>Escolha rápida de símbolo/emoji:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Ou digite o emoji acima)
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-white rounded-xl border border-slate-200/90 max-h-24 overflow-y-auto">
                  {POPULAR_CATEGORY_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSimbolo(icon)}
                      className={`w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:scale-110 active:scale-95 transition-all ${
                        simbolo === icon
                          ? 'bg-emerald-100 ring-2 ring-emerald-500'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color options */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-slate-400" />
                  <span>Tom da Etiqueta:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCor(c.id)}
                      className={`w-5 h-5 rounded-full ${c.bg} transition-all ${
                        cor === c.id
                          ? 'ring-2 ring-slate-800 ring-offset-2 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-600 font-semibold">{errorMsg}</p>
              )}

              {/* Submit button */}
              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    editingId
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Atualizar Modalidade' : 'Adicionar Modalidade'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Search & List of Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <span>Modalidades Cadastradas ({categories.length}):</span>
              </span>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
                title="Voltar para as opções padrão"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Padrões</span>
              </button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar modalidade..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-0.5">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    editingId === cat.id
                      ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                      {cat.simbolo || '📦'}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {cat.nome}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Editar nome ou símbolo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.nome)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Excluir modalidade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <p className="text-center py-4 text-slate-400 text-xs col-span-2">
                  Nenhuma modalidade encontrada com esse nome.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
