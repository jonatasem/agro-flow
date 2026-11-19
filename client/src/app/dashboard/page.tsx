'use client';

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { Header } from "@/components/Header";
import { WorkOrderTable } from "@/components/WorkOrderCard";
import { CreateWorkOrderModal } from "@/components/CreateWorkOrderModal";
import type { SectorService } from "@/types/sectorService";

type StatusFilter = "ABERTA" | "FINALIZADA";

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "Abertas / Em Andamento", value: "ABERTA" },
  { label: "Histórico Concluídas", value: "FINALIZADA" },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ABERTA");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { workOrders, loading, error, refetch } = useWorkOrders(statusFilter);

  const handleEditSector = (_sector: SectorService, _fleet: string) => {
    // Abrir modal de edição de setor quando integrado
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 space-y-6">
      <Header
        user={user}
        handleCreateOpen={() => setIsCreateModalOpen(true)}
        signOut={signOut}
      />

      <main className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-950/5">
          <div className="flex gap-2">
            {FILTER_OPTIONS.map((option) => {
              const isActive = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

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

        {!loading && !error && workOrders.length === 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm shadow-sm">
            Nenhuma Ordem de Serviço encontrada para este filtro.
          </div>
        )}

        {!loading && !error && workOrders.length > 0 && (
          <WorkOrderTable
            workOrders={workOrders}
            onEditSector={handleEditSector}
            onRefresh={refetch}
          />
        )}
      </main>

      <CreateWorkOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={refetch}
      />
    </div>
  );
}