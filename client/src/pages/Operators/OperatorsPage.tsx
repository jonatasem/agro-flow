import React, { useState } from "react";

// Hooks da aplicação
import { useOperators } from "../../hooks/useOperator";
import { useAuth } from "../../hooks/useAuth";

// Utilitários de permissão e erros
import { PERMISSIONS, hasPermission } from "../../utils/permission";

// Componentes e Tipos
import { CreateOperatorModal } from "../../components/operator/CreateOperatorModal";
import { type Operator } from "../../services/operatorService";

export const OperatorsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    operators,
    loading,
    error,
    refetch
  } = useOperators();

  // Estados locais
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);

  // Permissão de gerenciamento do usuário atual
  const canManage = hasPermission(user?.role, PERMISSIONS.OPERATOR_MANAGE);

  // Filtro de operadores por nome, matrícula ou cidade
  const filteredOperators = Array.isArray(operators)
    ? operators.filter((operator) => {
        const term = search.toLowerCase().trim();
        if (!term) return true;
        return (
          operator.name?.toLowerCase().includes(term) ||
          operator.registration?.toLowerCase().includes(term) ||
          operator.city?.toLowerCase().includes(term)
        );
      })
    : [];

  // Abertura do modal de edição
  const handleEdit = (operator: Operator) => {
    if (!canManage) return;
    setEditingOperator(operator);
    setIsModalOpen(true);
  };

  // Fechamento do modal de operador
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOperator(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Ações */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Operadores
          </h1>
          <p className="text-xs text-slate-500">
            Operadores de máquinas e equipamentos cadastrados
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 w-full md:w-64 shadow-sm"
          />

          <button
            onClick={refetch}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-xl shadow-sm transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            🔄
          </button>

          {canManage && (
            <button
              onClick={() => {
                setEditingOperator(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/15 whitespace-nowrap cursor-pointer"
            >
              + Novo Operador
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
          {typeof error === "string" ? error : "Erro ao carregar lista de operadores."}
        </div>
      )}

      {/* Indicador de Carregamento */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
          Carregando operadores...
        </div>
      ) : filteredOperators.length === 0 ? (
        /* Estado Vazio */
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
          Nenhum operador localizado.
        </div>
      ) : (
        /* Lista de Operadores */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperators.map((operator) => (
            <div
              key={operator.id}
              className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition-all shadow-sm"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                  MATRÍCULA #{operator.registration}
                </span>
                <h3 className="font-bold text-slate-800 text-sm">{operator.name}</h3>
                {operator.city && (
                  <p className="text-xs text-slate-400">📍 {operator.city}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canManage && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      onClick={() => handleEdit(operator)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 text-xs transition-colors cursor-pointer"
                      title="Editar"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <div className="w-8 h-8 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  👨‍🌾
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {canManage && (
        <CreateOperatorModal
          key={editingOperator?.id || (isModalOpen ? "open" : "closed")}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={refetch}
          initialData={editingOperator}
        />
      )}
    </div>
  );
};