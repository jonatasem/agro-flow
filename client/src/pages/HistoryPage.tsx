import React from "react";
import { WorkOrderCard } from "../components/WorkOrderCard";
import { type WorkOrder, type SectorService } from "../services/workOrderService";

// Interface para definir a tipagem exata das props recebidas
interface HistoryPageProps {
  refetch: () => void;
  loading: boolean;
  completedWorkOrders: WorkOrder[];
  onEditSector: (sector: SectorService, fleet: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  refetch,
  loading,
  completedWorkOrders,
  onEditSector,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Histórico de Ordens Finalizadas
        </h2>
        <button onClick={refetch} className="text-xs text-indigo-400 hover:underline">
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          A carregar Histórico...
        </div>
      ) : completedWorkOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhuma Ordem de Serviço finalizada até o momento.
        </div>
      ) : (
        <div className="grid gap-4">
          {completedWorkOrders.map((order) => (
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