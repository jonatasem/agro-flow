import React, { useState } from "react";

// Hooks da aplicação
import { useEquipments } from "../../hooks/useEquipment";
import { useAuth } from "../../hooks/useAuth";

// Utilitários de permissão e erros
import { PERMISSIONS, hasPermission } from "../../utils/permission";
import { getErrorMessage } from "../../utils/getErrorMessage";

// Componentes e Tipos
import { CreateEquipmentModal } from "../../components/equipment/CreateEquipmentModal";
import { type Equipment } from "../../services/equipmentService";

export const EquipmentsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    equipments,
    loading,
    error,
    refetch,
    deleteEquipment,
  } = useEquipments();

  // Estados locais
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Permissão de gerenciamento do usuário atual
  const canManage = hasPermission(user?.role, PERMISSIONS.EQUIPMENT_CREATE);

  // Filtro de equipamentos por nome ou frota
  const filteredEquipments = Array.isArray(equipments)
    ? equipments.filter((equipment) => {
        const term = search.toLowerCase().trim();
        if (!term) return true;
        return (
          equipment.name?.toLowerCase().includes(term) ||
          equipment.fleet?.toLowerCase().includes(term)
        );
      })
    : [];

  // Abertura do modal de edição
  const handleEdit = (equipment: Equipment) => {
    if (!canManage) return;
    setEditingEquipment(equipment);
    setIsModalOpen(true);
  };

  // Exclusão de equipamento
  const handleDelete = async (id: string, fleet: string) => {
    if (!canManage) return;

    if (!window.confirm(`Tem certeza que deseja excluir o equipamento frota #${fleet}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteEquipment(id);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao excluir equipamento."));
    } finally {
      setDeletingId(null);
    }
  };

  // Fechamento do modal de equipamento
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Ações */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Equipamentos e Maquinários
          </h1>
          <p className="text-xs text-slate-500">
            Frota agrícola cadastrada
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome ou frota..."
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
                setEditingEquipment(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/15 whitespace-nowrap cursor-pointer"
            >
              + Novo Equipamento
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
          {typeof error === "string" ? error : "Erro ao carregar frota de equipamentos."}
        </div>
      )}

      {/* Indicador de Carregamento */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
          Carregando frota de equipamentos...
        </div>
      ) : filteredEquipments.length === 0 ? (
        /* Estado Vazio */
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
          Nenhum equipamento localizado.
        </div>
      ) : (
        /* Lista de Equipamentos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition-all shadow-sm"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                  FROTA #{equipment.fleet}
                </span>
                <h3 className="font-bold text-slate-800 text-sm">{equipment.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                {canManage && (
                  <div className="flex items-center gap-1 mr-1">
                    <button
                      onClick={() => handleEdit(equipment)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 text-xs transition-colors cursor-pointer"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(equipment.id, equipment.fleet)}
                      disabled={deletingId === equipment.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      title="Excluir"
                    >
                      {deletingId === equipment.id ? "⏳" : "🗑️"}
                    </button>
                  </div>
                )}
                <div className="w-8 h-8 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  🚜
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {canManage && (
        <CreateEquipmentModal
          key={editingEquipment?.id || (isModalOpen ? "open" : "closed")}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={refetch}
          initialData={editingEquipment}
        />
      )}
    </div>
  );
};