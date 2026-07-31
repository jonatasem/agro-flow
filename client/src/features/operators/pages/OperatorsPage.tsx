import React, { useState } from "react";
import { useOperators } from "../hooks/useOperator";
import { CreateOperatorModal } from "../components/CreateOperatorModal";

/**
 * Componente de página para visualização, busca e cadastro de Operadores
 */
export const OperatorsPage: React.FC = () => {
  const { operators, loading, error, refetch } = useOperators();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtra operadores pelo nome ou pela matrícula de forma segura
  const filteredOperators = operators.filter((op) => {
    const term = search.toLowerCase();
    const nameMatch = op.name?.toLowerCase().includes(term);
    const regMatch = op.registration
      ? op.registration.toLowerCase().includes(term)
      : false;

    return nameMatch || regMatch;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Operadores</h1>
          <p className="text-xs text-slate-400">
            Operadores de tratores, colhedoras e frotas agrícolas
          </p>
        </div>

        {/* Barra de Ações: Busca, Atualizar e Novo Operador */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />

          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl transition-colors"
            title="Atualizar lista"
          >
            🔄
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Novo Operador
          </button>
        </div>
      </div>

      {/* Exibição de Mensagem de Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Conteúdo Principal / Grid de Operadores */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando operadores...
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum operador encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOperators.map((op) => (
            <div
              key={op.id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-sm">{op.name}</h3>
                <span className="text-xs text-slate-400 block">
                  📍 {op.city || "Localidade não informada"}
                </span>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/40 px-2.5 py-1 rounded-lg font-bold inline-block">
                  Matrícula: {op.registration || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Cadastro de Novo Operador */}
      <CreateOperatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};
