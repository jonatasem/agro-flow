// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { Header } from "@/components/Header";
import { WorkOrderTable } from "@/components/WorkOrderTable";
import { CreateWorkOrderModal } from "@/components/CreateWorkOrderModal";
import type { SectorService, WorkOrderStatus } from "@/types/sectorService";

const FILTER_OPTIONS: { label: string; value: WorkOrderStatus }[] = [
  { label: "Abertas", value: "ABERTA" },
  { label: "Concluídas", value: "FINALIZADA" },
];

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus>("ABERTA");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<{
    sector: SectorService;
    fleet: string;
  } | null>(null);

  const { workOrders, loading, error, refetch } = useWorkOrders(statusFilter);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-500 flex items-center justify-center text-xs font-semibold">
        Carregando sessão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        user={user}
        onCreateOpen={() => {
          setEditingSector(null);
          setIsCreateModalOpen(true);
        }}
        onSignOut={signOut}
      />

      <main className="w-full max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 flex-1">
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/90 w-full sm:w-fit">
          {FILTER_OPTIONS.map((option) => {
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center text-slate-500 font-medium text-xs">
            Carregando Ordens de Serviço...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {!loading && !error && workOrders.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center text-slate-500 text-xs font-medium">
            Nenhuma Ordem de Serviço encontrada para este filtro.
          </div>
        )}

        {!loading && !error && workOrders.length > 0 && (
          <WorkOrderTable
            workOrders={workOrders}
            onEditSector={(sector, fleet) => {
              setEditingSector({ sector, fleet });
              setIsCreateModalOpen(true);
            }}
            onRefresh={refetch}
          />
        )}
      </main>

      <CreateWorkOrderModal
        isOpen={isCreateModalOpen}
        editingSector={editingSector}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingSector(null);
        }}
        onCreated={() => {
          void refetch();
        }}
      />
    </div>
  );
}