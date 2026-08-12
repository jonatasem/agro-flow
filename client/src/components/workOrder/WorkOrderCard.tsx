import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { workOrderService, type WorkOrder, type SectorService } from "../../services/workOrderService";
import { getErrorMessage } from "../../utility/getErrorMessage";

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

  // Normaliza o cargo para validação flexível de maiúsculas/minúsculas e acentos
  const userRoleLower = user?.role?.toLowerCase().trim() || "";
  const isTecnico = userRoleLower.includes("tecnico") || userRoleLower.includes("técnico");

  // Mapeamento visual das pílulas de Status para o tema Zilor
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINALIZADA":
      case "FINALIZADO":
      case "CONCLUIDO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "EM_ANDAMENTO":
      case "EM_MANUTENCAO":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
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
    <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm hover:border-emerald-300 transition-all">
      
      {/* Seção do Cabeçalho da Ordem de Serviço */}
      <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
              OS ID: #{order.id.slice(-6).toUpperCase()}
            </span>
            {order.createdAt && (
              <span className="text-xs text-slate-400">
                • {formatDate(order.createdAt)}
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-slate-800 text-base">
            {order.equipment?.name || "Equipamento Desconhecido"}
          </h3>
          <span className="text-xs text-slate-500 block mt-0.5">
            🚜 Frota: <span className="text-emerald-800 font-mono font-bold">#{order.equipment?.fleet || "N/A"}</span>
          </span>
        </div>

        <span className={`px-2.5 py-1 border text-[10px] font-extrabold rounded-lg uppercase tracking-wider ${getStatusBadge(order.status)}`}>
          {order.status.replace("_", " ")}
        </span>
      </div>

      {/* Lista de Setores Mapeados */}
      <div className="space-y-3">
        {order.setores?.map((sector) => {
          const isFinished = sector.status === "FINALIZADO";

          return (
            <div key={sector.id} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  Setor: {sector.setor}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-md ${getStatusBadge(sector.status)}`}>
                    {sector.status.replace("_", " ")}
                  </span>

                  {/* Exibido apenas se o usuário NÃO for Técnico e se o Setor NÃO estiver Finalizado */}
                  {!isTecnico && !isFinished && (
                    <div className="flex gap-1 border-l border-slate-200 pl-2">
                      <button
                        onClick={() => onEditSector(sector, order.equipment?.fleet || "")}
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded text-xs transition-colors"
                        title="Editar Setor"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        className="p-1 bg-white hover:bg-red-50 hover:border-red-200 border border-slate-200 text-slate-400 hover:text-red-600 rounded text-xs transition-colors"
                        title="Remover Setor"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                <span>Local: {sector.qth} - {sector.city}</span>
                {sector.tecnicoResponsavel?.name && (
                  <span className="text-slate-700 font-semibold">👨‍🔧 Resp: {sector.tecnicoResponsavel.name}</span>
                )}
              </div>

              {order.operator && (
                <div className="text-[11px] text-slate-400 pt-1 flex justify-between items-center border-t border-slate-100">
                  <span>
                    Operador: <span className="text-slate-700 font-semibold">{order.operator.name}</span>
                  </span>
                  
                </div>
              )}

              <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">Relato do QRU / Falha:</span>
                {sector.qruDescricao}
              </div>

              {sector.solucaoTecnico && (
                <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200/80">
                  <span className="font-bold text-emerald-800 block text-[10px] uppercase tracking-wider">Solução Aplicada:</span>
                  {sector.solucaoTecnico}
                  {sector.tipoCausa && (
                    <span className="block text-[10px] text-emerald-700 font-medium mt-1">
                      Causa: {sector.tipoCausa}
                    </span>
                  )}
                </div>
              )}

              {/* Ações de Manutenção do Técnico */}
              {sector.status === "AGUARDANDO_MANUTENCAO" && (
                <button
                  type="button"
                  disabled={loadingAction !== null}
                  onClick={() => handleStartRepair(sector.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-600/15 disabled:opacity-50 mt-2"
                >
                  {loadingAction === sector.id ? "Iniciando..." : "▶️ Iniciar Manutenção"}
                </button>
              )}

              {sector.status === "EM_MANUTENCAO" && (
                <form onSubmit={(e) => handleFinishRepair(e, sector.id)} className="space-y-2 pt-2 border-t border-slate-200 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Descrição da Solução Técnica... *"
                      value={solucao}
                      onChange={(e) => setSolucao(e.target.value)}
                      disabled={loadingAction !== null}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                    <input
                      type="text"
                      placeholder="Tipo de Causa (Opcional)..."
                      value={causa}
                      onChange={(e) => setCausa(e.target.value)}
                      disabled={loadingAction !== null}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAction !== null || !solucao.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-600/15 disabled:opacity-50"
                  >
                    {loadingAction === sector.id ? "Processando..." : "✅ Finalizar Atendimento"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* Rodapé do Card */}
      {order.operator && (
        <div className="text-[11px] text-slate-400 pt-1 flex justify-end items-center border-t border-slate-100">
          {order.updatedAt && (
            <span>Última Alt: {formatDate(order.updatedAt)}</span>
          )}
        </div>
      )}
    </div>
  );
};