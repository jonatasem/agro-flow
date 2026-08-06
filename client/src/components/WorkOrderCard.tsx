import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { workOrderService, type WorkOrder, type SectorService } from "../services/workOrderService";
import { getErrorMessage } from "../utility/getErrorMessage";

interface WorkOrderCardProps {
  order: WorkOrder;
  onEditSector: (sector: SectorService, fleet: string) => void; 
  onRefresh: () => void;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({ order, onEditSector, onRefresh }) => {
  const { user } = useAuth();
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [solucao, setSolucao] = useState("");
  const [causa, setCausa] = useState("");

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
      case "FINALIZADO":
      case "CONCLUIDO":
        return "bg-emerald-950 text-emerald-400 border-emerald-800/40";
      case "EM_ANDAMENTO":
      case "EM_MANUTENCAO":
        return "bg-amber-950 text-amber-400 border-amber-800/40";
      default:
        return "bg-blue-950 text-blue-400 border-blue-800/40";
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    if (!window.confirm("Deseja realmente remover este setor da Ordem de Serviço?")) return;
    try {
      await workOrderService.deleteSector(sectorId);
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao remover setor."));
    }
  };

  const handleStartRepair = async (sectorServiceId: string) => {
    try {
      setLoadingAction(sectorServiceId);
      await workOrderService.startSector(sectorServiceId);
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao iniciar manutenção do setor."));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinishRepair = async (e: React.FormEvent<HTMLFormElement>, sectorServiceId: string) => {
    e.preventDefault();
    if (!solucao.trim()) return;

    try {
      setLoadingAction(sectorServiceId);
      await workOrderService.finishSector(sectorServiceId, {
        solucaoTecnico: solucao,
        tipoCausa: causa.trim() || undefined
      });
      setSolucao("");
      setCausa("");
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao finalizar manutenção do setor."));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl hover:border-slate-700/80 transition-colors">
      
      {/* Seção do Cabeçalho da Ordem de Serviço */}
      <div className="flex justify-between items-start gap-4 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              OS ID: #{order.id.slice(-6).toUpperCase()}
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
            🚜 Prefixo: <span className="text-slate-200 font-mono font-bold">#{order.equipment?.fleet || "N/A"}</span>
          </span>
        </div>

        <span className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg ${getStatusStyle(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Lista de Setores Mapeados */}
      <div className="space-y-3">
        {order.setores?.map((sector) => {
          const isFinished = sector.status === "FINALIZADO" || sector.status === "CONCLUIDO";

          return (
            <div key={sector.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-400">🔧 Setor: {sector.setor}</span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${getStatusStyle(sector.status)}`}>
                    {sector.status.replace("_", " ")}
                  </span>

                  {/* 🚀 EXIBIÇÃO CONDICIONAL: Só renderiza os botões se o usuário NÃO for TÉCNICO E o setor NÃO estiver FINALIZADO */}
                  {user?.role !== "TECNICO" && !isFinished && (
                    <div className="flex gap-1 border-l border-slate-800 pl-2">
                      <button
                        onClick={() => onEditSector(sector, order.equipment?.fleet || "")}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                        title="Editar Setor"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        className="p-1 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded text-xs transition-colors"
                        title="Remover Setor"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>📍 Local: {sector.qth} - {sector.city}</span>
                {sector.tecnicoResponsavel?.name && (
                  <span className="text-slate-300 font-medium">👨‍🔧 Resp: {sector.tecnicoResponsavel.name}</span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="font-semibold text-slate-400 block mb-0.5 text-[10px] uppercase">Relato do QRU / Falha:</span>
                {sector.qruDescricao}
              </p>

              {sector.solucaoTecnico && (
                <div className="text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                  <span className="font-semibold text-emerald-500 block text-[10px] uppercase">Solução Aplicada:</span>
                  {sector.solucaoTecnico}
                  {sector.tipoCausa && <span className="block text-[10px] text-slate-500 mt-1">Causa: {sector.tipoCausa}</span>}
                </div>
              )}

              {/* Ações de manutenção */}
              {sector.status === "AGUARDANDO_MANUTENCAO" && (
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleStartRepair(sector.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl transition-all disabled:opacity-50 mt-2"
                >
                  {loadingAction === sector.id ? "Iniciando..." : "▶️ Iniciar Manutenção"}
                </button>
              )}

              {sector.status === "EM_MANUTENCAO" && (
                <form onSubmit={(e) => handleFinishRepair(e, sector.id)} className="space-y-2 pt-1 border-t border-slate-900 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Descrição da Solução Técnica... *"
                      value={solucao}
                      onChange={(e) => setSolucao(e.target.value)}
                      disabled={loadingAction !== null}
                      className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Tipo de Causa (Opcional)..."
                      value={causa}
                      onChange={(e) => setCausa(e.target.value)}
                      disabled={loadingAction !== null}
                      className="p-2 bg-slate-950 border border-slate-900 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAction !== null || !solucao.trim()}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    {loadingAction === sector.id ? "Processando..." : "✅ Finalizar Atendimento"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {order.operator && (
        <div className="text-[11px] text-slate-500 pt-1 flex justify-between items-center">
          <span>
            Operador Solicitante: <span className="text-slate-300 font-medium">{order.operator.name}</span>
          </span>
          {order.updatedAt && (
            <span>Última Alt: {`formatDate(order.updatedAt)`}</span>
          )}
        </div>
      )}
    </div>
  );
};