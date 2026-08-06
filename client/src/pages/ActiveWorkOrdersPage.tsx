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
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Ordens de Serviço Ativas
        </h2>
        <button onClick={refetch} className="text-xs text-indigo-400 hover:underline">
          Atualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          A carregar Ordens de Serviço...
        </div>
      ) : activeWorkOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhuma Ordem de Serviço ativa no momento.
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
