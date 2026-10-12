'use client';

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { Header } from "@/components/Header";
import { WorkOrderCard } from "@/components/WorkOrderCard";
import type { SectorService } from "@/services/workOrderService";

// Página do Dashboard Principal - Gestão de Ordens de Serviço (AgroFlow).
export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState("ABERTA");
  const { workOrders, loading, error, refetch } = useWorkOrders(statusFilter);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleEditSector = (sector: SectorService, fleet: string) => {
    console.log("Editar setor:", sector, fleet);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 space-y-6">
      {/* Cabeçalho Global */}
      <Header
        user={user}
        handleCreateOpen={() => setIsCreateModalOpen(true)}
        signOut={signOut}
      />

      <main className="max-w-6xl mx-auto space-y-4">
        
        {/* Barra de Navegação e Filtros de Estado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-950/5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("ABERTA")}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                statusFilter === "ABERTA"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Abertas / Em Andamento
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("FINALIZADA")}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                statusFilter === "FINALIZADA"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Histórico Concluídas
            </button>
          </div>

          <Link
            href="/metrics"
            className="px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-extrabold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5"
          >
            📊 Ver Indicadores e Métricas
          </Link>
        </div>

        {/* Estados de Carregamento e Erro */}
        {loading && (
          <div className="text-center py-16 text-slate-500 font-medium text-sm">
            A carregar Ordens de Serviço...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Listagem Vazia */}
        {!loading && !error && workOrders.length === 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm shadow-sm">
            Nenhuma Ordem de Serviço encontrada para este filtro.
          </div>
        )}

        {/* Grelha de Ordens de Serviço */}
        <div className="grid grid-cols-1 gap-4">
          {workOrders.map((order) => (
            <WorkOrderCard
              key={order.id}
              order={order}
              onEditSector={handleEditSector}
              onRefresh={refetch}
            />
          ))}
        </div>
      </main>

      {/* Modal de Criação de Nova O.S. */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-black text-slate-800">Criar Nova Ordem de Serviço</h2>
            <p className="text-xs text-slate-500">
              Preencha os dados do equipamento e setor para abrir a nova O.S.
            </p>
            
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}