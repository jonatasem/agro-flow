import React, { useState } from "react";
import { useEquipments } from "../hooks/useEquipment";
import { CreateEquipmentModal } from "../components/CreateEquipmentModal";

export const Equipments: React.FC = () => {
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Equipamentos</h1>
          <p className="text-xs text-slate-400">Frota cadastrada no AgroFlow</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome ou frota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />
          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl"
            title="Atualizar"
          >
            🔄
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Equipamento
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {typeof error === "string" ? error : "Erro ao carregar dados."}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando equipamentos...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum equipamento encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded font-bold">
                  FROTA #{item.fleet}
                </span>
                <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      <CreateEquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

