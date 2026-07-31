import React from "react";
import type { WorkOrder } from "../services/workOrder";

interface WorkOrderCardProps {
  order: WorkOrder;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ order }) => {
  // Função auxiliar para formatar datas ISO em exibição amigável
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

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl hover:border-slate-700/80 transition-colors">
      {/* 1. Cabeçalho da O.S. */}
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
          <span className="text-xs text-indigo-400 font-semibold">
            Frota #{order.equipment?.fleet || "N/A"}
          </span>
        </div>

        {/* Badge de Status da O.S. */}
        <span
          className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${
            order.status === "FINALIZADA"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : order.status === "EM_ANDAMENTO"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* 2. Lista de Manutenções Solicitadas por Setor */}
      <div className="space-y-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Manutenções Solicitadas ({order.setores?.length || 0}):
        </span>

        {order.setores?.map((sec) => (
          <div
            key={sec.id}
            className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/60 space-y-2"
          >
            {/* Topo do Setor: Nome, Status local e QTH/Cidade */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-300 uppercase tracking-wide">
                  [{sec.setor}]
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    sec.status === "FINALIZADO" || sec.status === "CONCLUIDO"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {sec.status}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                📍 QTH: <strong className="text-slate-300">{sec.qth}</strong> — {sec.city}
              </span>
            </div>

            {/* Descrição do Problema (QRU) */}
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
              <strong className="text-slate-400 font-medium">QRU:</strong> {sec.qruDescricao}
            </p>

            {/* Solução do Técnico (caso preenchida) */}
            {sec.solucaoTecnico && (
              <div className="bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg text-xs text-emerald-300">
                <strong>Solução:</strong> {sec.solucaoTecnico}
              </div>
            )}

            {/* Rodapé do Setor: Pessoas envolvidas e tempo */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap justify-between items-center text-[10px] text-slate-500 gap-2">
              <span>
                Aberto por: <strong className="text-slate-400">{sec.criador?.name || "N/A"}</strong>
              </span>

              {sec.tecnicoResponsavel && (
                <span>
                  Técnico: <strong className="text-slate-300">{sec.tecnicoResponsavel.name}</strong>
                </span>
              )}

              {sec.tempoManutencao !== null && sec.tempoManutencao !== undefined && (
                <span className="text-indigo-400 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/30">
                  ⏱️ Tempo: {sec.tempoManutencao} min
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
