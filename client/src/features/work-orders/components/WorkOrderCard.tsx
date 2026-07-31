import React from "react";
import type { WorkOrder } from "../services/workOrderService";

interface WorkOrderCardProps {
  order: WorkOrder;
  onEdit: () => void;   
  onDelete: () => void; 
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ order, onEdit, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "FINALIZADA":
        return "bg-emerald-950 text-emerald-400 border-emerald-800/40";
      case "EM_ANDAMENTO":
        return "bg-amber-950 text-amber-400 border-amber-800/40";
      default:
        return "bg-blue-950 text-blue-400 border-blue-800/40";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl hover:border-slate-700/80 transition-colors">
      <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              ID: #{order.id.slice(-6).toUpperCase()}
            </span>
            {order.createdAt && (
              <span className="text-xs text-slate-500">
                • {formatDate(order.createdAt)}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-100 text-base">
            {order.equipment?.name || "Equipamento Desconhecido"}
          </h3>
          <span className="text-xs text-slate-400 block mt-0.5">
            🚜 Frota Prefixo: <span className="text-slate-200 font-mono font-bold">#{order.equipment?.fleet || "N/A"}</span>
          </span>
        </div>


        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-lg ${getStatusStyle(order.status)}`}>
            {order.status}
          </span>
          
          <div className="flex gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={onEdit}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              title="Editar O.S."
            >
              ✏️
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg text-xs transition-colors"
              title="Remover O.S."
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {order.setores?.map((sector) => (
          <div key={sector.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-400">🔧 Setor: {sector.setor}</span>
              <span className="text-[10px] text-slate-400 font-medium">📍 {sector.qth} - {sector.city}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-900">
              <span className="font-semibold text-slate-400 block mb-0.5 text-[10px] uppercase">Relato do QRU / Falha:</span>
              {sector.qruDescricao}
            </p>
          </div>
        ))}
      </div>

      {order.operator && (
        <div className="text-[11px] text-slate-500 pt-1 flex justify-between items-center">
          <span>
            Operador Responsável: <span className="text-slate-300 font-medium">{order.operator.name}</span>
          </span>
          {order.updatedAt && (
            <span>Alt: {formatDate(order.updatedAt)}</span>
          )}
        </div>
      )}
    </div>
  );
};
