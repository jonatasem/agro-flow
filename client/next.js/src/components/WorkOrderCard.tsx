'use client';

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  workOrderService
} from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatRepairTime } from "@/utils/formatRepairTime";
import type { WorkOrder } from "@/types/sectorService";
import type { SectorService } from "@/types/sectorService";

interface WorkOrderCardProps {
  order: WorkOrder;
  onEditSector: (sector: SectorService, fleet: string) => void;
  onRefresh: () => void;
}

const SectorItem: React.FC<{
  sector: SectorService;
  order: WorkOrder;
  isTecnico: boolean;
  loadingAction: string | null;
  onEditSector: (sector: SectorService, fleet: string) => void;
  onDeleteSector: (sectorId: string) => void;
  onStartRepair: (sectorId: string) => void;
  onFinishRepair: (sectorId: string, solucao: string, causa?: string) => Promise<void>;
  onPauseRepair: (sectorId: string, motivo: string) => Promise<void>;
  onResumeRepair: (sectorId: string) => Promise<void>;
  getStatusBadge: (status: string) => string;
}> = ({
  sector,
  order,
  isTecnico,
  loadingAction,
  onEditSector,
  onDeleteSector,
  onStartRepair,
  onFinishRepair,
  onPauseRepair,
  onResumeRepair,
  getStatusBadge,
}) => {
  const [solucao, setSolucao] = useState("");
  const [causa, setCausa] = useState("");
  const [motivoPausa, setMotivoPausa] = useState("");
  const [showPauseInput, setShowPauseInput] = useState(false);

  const isFinished = sector.status === "FINALIZADO" || order.status === "FINALIZADA";
  const isLoading = loadingAction === sector.id;

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmitFinish = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!solucao.trim()) return;
    try {
      await onFinishRepair(sector.id, solucao, causa);
      setSolucao("");
      setCausa("");
    } catch {}
  };

  const handleConfirmPause = async () => {
    const trimmedMotivo = motivoPausa.trim();
    if (!trimmedMotivo) return;
    try {
      await onPauseRepair(sector.id, trimmedMotivo);
      setMotivoPausa("");
      setShowPauseInput(false);
    } catch {}
  };

  return (
    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="font-extrabold text-emerald-800 flex items-center gap-1">
          Setor: {sector.setor}
        </span>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 border text-[10px] font-extrabold rounded-lg ${getStatusBadge(sector.status)}`}>
            {sector.status.replace(/_/g, " ")}
          </span>

          {!isTecnico && !isFinished && (
            <div className="flex gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => onEditSector(sector, order.equipment?.fleet || "")}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
                title="Editar Setor"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onDeleteSector(sector.id)}
                className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 rounded-lg text-xs transition-colors cursor-pointer"
                title="Remover Setor"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
        <div>📍 <b>Local:</b> {sector.qth} - {sector.city}</div>
        {sector.operator?.name && (
          <div>👨‍🌾 <b>Operador:</b> {sector.operator.name} {sector.operator.registration ? `(#${sector.operator.registration})` : ""}</div>
        )}
        {sector.criador?.name && (
          <div>📝 <b>Aberto por:</b> {sector.criador.name}</div>
        )}
        {sector.tecnicoResponsavel?.name && (
          <div>👨‍🔧 <b>Técnico Resp:</b> {sector.tecnicoResponsavel.name}</div>
        )}
      </div>

      <div className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <span className="font-extrabold text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">
          Relato do QRU / Falha:
        </span>
        {sector.qruDescricao}
      </div>

      {sector.status === "PAUSADO" && (
        <div className="text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
          <span className="font-extrabold text-amber-800 block text-[10px] uppercase tracking-wider mb-0.5">
            Motivo da Pausa:
          </span>
          {sector.motivoPausa || "Aguardando peças/instruções"}
        </div>
      )}

      {sector.solucaoTecnico && (
        <div className="text-xs text-emerald-900 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
          <span className="font-extrabold text-emerald-800 block text-[10px] uppercase tracking-wider">
            Solução Aplicada:
          </span>
          <p className="font-medium">{sector.solucaoTecnico}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-emerald-800 pt-2 border-t border-emerald-200/60 mt-1">
            {sector.tipoCausa && <span><b>Causa:</b> {sector.tipoCausa}</span>}
            {sector.tempoManutencao !== null && sector.tempoManutencao !== undefined && (
              <span>⏱️ <b>Tempo de Reparo:</b> {formatRepairTime(sector.tempoManutencao)}</span>
            )}
            {sector.dataInicioManutencao && <span><b>Início:</b> {formatDateTime(sector.dataInicioManutencao)}</span>}
            {sector.dataFimManutencao && <span><b>Fim:</b> {formatDateTime(sector.dataFimManutencao)}</span>}
          </div>
        </div>
      )}

      {!isFinished && sector.status === "AGUARDANDO_MANUTENCAO" && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => onStartRepair(sector.id)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isLoading ? "A iniciar..." : "▶️ Iniciar Manutenção"}
        </button>
      )}

      {!isFinished && sector.status === "EM_MANUTENCAO" && (
        <div className="space-y-3 pt-3 border-t border-slate-200/80 mt-2">
          {!showPauseInput ? (
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => setShowPauseInput(true)}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              ⏸️ Pausar Atendimento
            </button>
          ) : (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
              <input
                type="text"
                placeholder="Motivo da pausa (ex: Aguardando peças)... *"
                value={motivoPausa}
                onChange={(e) => setMotivoPausa(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPauseInput(false)}
                  className="w-1/2 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loadingAction !== null || !motivoPausa.trim()}
                  onClick={handleConfirmPause}
                  className="w-1/2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  Confirmar Pausa
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitFinish} className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Descrição da Solução Técnica... *"
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                disabled={loadingAction !== null}
                className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                placeholder="Tipo de Causa (Opcional)..."
                value={causa}
                onChange={(e) => setCausa(e.target.value)}
                disabled={loadingAction !== null}
                className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <button
              type="submit"
              disabled={loadingAction !== null || !solucao.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "A processar..." : "✅ Finalizar Atendimento"}
            </button>
          </form>
        </div>
      )}

      {!isFinished && sector.status === "PAUSADO" && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => onResumeRepair(sector.id)}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {isLoading ? "A retomar..." : "▶️ Retomar Atendimento"}
        </button>
      )}
    </div>
  );
};

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  order,
  onEditSector,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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

  const userRoleLower = user?.role?.toLowerCase().trim() || "";
  const isTecnico = userRoleLower.includes("tecnico") || userRoleLower.includes("técnico");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINALIZADA":
      case "FINALIZADO":
      case "CONCLUIDO":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "EM_ANDAMENTO":
      case "EM_MANUTENCAO":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PAUSADO":
        return "bg-orange-100 text-orange-800 border-orange-200";
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

  const handlePauseRepair = async (sectorServiceId: string, motivoPausa: string) => {
    try {
      setLoadingAction(sectorServiceId);
      await workOrderService.pauseSector(sectorServiceId, motivoPausa.trim());
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao pausar atendimento."));
      throw err;
    } finally {
      setLoadingAction(null);
    }
  };

  const handleResumeRepair = async (sectorServiceId: string) => {
    try {
      setLoadingAction(sectorServiceId);
      await workOrderService.resumeSector(sectorServiceId);
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao retomar atendimento."));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFinishRepair = async (sectorServiceId: string, solucao: string, causa?: string) => {
    try {
      setLoadingAction(sectorServiceId);
      await workOrderService.finishSector(sectorServiceId, {
        solucaoTecnico: solucao,
        tipoCausa: causa?.trim() || undefined,
      });
      onRefresh();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Erro ao finalizar manutenção."));
      throw err;
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-4 shadow-xl shadow-slate-950/5 hover:border-emerald-300 transition-all">
      <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
              OS ID: #{order.id.slice(-6).toUpperCase()}
            </span>
            {order.createdAt && <span className="text-xs text-slate-400">• {formatDate(order.createdAt)}</span>}
          </div>
          <h3 className="font-black text-slate-800 text-base">
            {order.equipment?.name || "Equipamento Desconhecido"}
          </h3>
          <span className="text-xs text-slate-500 block mt-0.5">
            🚜 Frota: <span className="text-emerald-800 font-mono font-bold">#{order.equipment?.fleet || "N/A"}</span>
          </span>
        </div>

        <span className={`px-3 py-1 border text-[10px] font-black rounded-xl uppercase tracking-wider ${getStatusBadge(order.status)}`}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="space-y-3">
        {order.setores?.map((sector) => (
          <SectorItem
            key={sector.id}
            sector={sector}
            order={order}
            isTecnico={isTecnico}
            loadingAction={loadingAction}
            onEditSector={onEditSector}
            onDeleteSector={handleDeleteSector}
            onStartRepair={handleStartRepair}
            onFinishRepair={handleFinishRepair}
            onPauseRepair={handlePauseRepair}
            onResumeRepair={handleResumeRepair}
            getStatusBadge={getStatusBadge}
          />
        ))}
      </div>

      {order.updatedAt && (
        <div className="text-[11px] text-slate-400 pt-1 flex justify-end items-center border-t border-slate-100">
          <span>Última Alt: {formatDate(order.updatedAt)}</span>
        </div>
      )}
    </div>
  );
};