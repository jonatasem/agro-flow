import React from "react";
import { WorkOrderCard } from "../../components/workOrder/WorkOrderCard";
import { type WorkOrder, type SectorService } from "../../services/workOrderService";

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
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Histórico de Ordens Finalizadas
        </h2>
        <button 
          onClick={refetch} 
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-bold text-slate-500">Carregando histórico...</p>
        </div>
      ) : completedWorkOrders.length === 0 ? (
        <div className="bg-white border border-slate-200/80 p-12 rounded-2xl text-center text-slate-500 text-sm shadow-sm">
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