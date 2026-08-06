import React, { useState } from "react";
import { useEquipments } from "../hooks/useEquipment";
import { CreateEquipmentModal } from "../components/CreateEquipmentModal";

export const EquipmentsPage: React.FC = () => {
  const { equipments, loading, error, refetch } = useEquipments();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = Array.isArray(equipments)
    ? equipments.filter((eq) => {
        const term = search.toLowerCase();
        return (
          eq.name?.toLowerCase().includes(term) ||
          eq.fleet?.toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Equipamentos e Maquinários
          </h1>
          <p className="text-xs text-slate-500">
            Frota agrícola cadastrada na Unidade Zilor
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
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-600 rounded-xl shadow-sm transition-colors"
            title="Atualizar lista"
          >
            🔄
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/15 whitespace-nowrap"
          >
            + Novo Equipamento
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
          {typeof error === "string" ? error : "Erro ao carregar frota de equipamentos."}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs animate-pulse">
          A carregar frota de equipamentos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
          Nenhum equipamento localizado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition-all shadow-sm"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-md font-extrabold uppercase">
                  FROTA #{item.fleet}
                </span>
                <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
              </div>
              <div className="w-8 h-8 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 text-sm">
                🚜
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};
