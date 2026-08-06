import React from "react";
import { WorkOrderCard } from "../components/WorkOrderCard";
import { type WorkOrder, type SectorService } from "../services/workOrderService";

// Interface com as props necessárias que vêm do DashboardPage
interface ActiveWorkOrdersPageProps {
  refetch: () => void;
  loading: boolean;
  error: string | null;
  activeWorkOrders: WorkOrder[];
  onEditSector: (sector: SectorService, fleet: string) => void;
}

export const ActiveWorkOrdersPage: React.FC<ActiveWorkOrdersPageProps> = ({
  refetch,
  loading,
  error,
  activeWorkOrders,
  onEditSector,
}) => {
  return (
    <div className="space-y-4">
      {/* Alerta de Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Estado de Carregamento / Vazio / Lista de Cards */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-semibold animate-pulse bg-white rounded-2xl border border-slate-200 shadow-sm">
          A carregar Ordens de Serviço...
        </div>
      ) : activeWorkOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
          <p className="font-bold text-slate-700 text-base mb-1">Tudo limpo por aqui! 🌾</p>
          <p className="text-xs text-slate-400">Nenhuma Ordem de Serviço ativa no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeWorkOrders.map((order) => (
            <WorkOrderCard 
              key={order.id}
              order={order}
              onEditSector={onEditSector}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
};