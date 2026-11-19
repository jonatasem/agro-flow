'use client';

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workOrderService } from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatRepairTime } from "@/utils/formatRepairTime";
import type { WorkOrder, SectorService } from "@/types/sectorService";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onEditSector: (sector: SectorService, fleet: string) => void;
  onRefresh: () => void;
}

interface SectorRowData {
  order: WorkOrder;
  sector: SectorService;
}

const STATUS_STYLES: Record<string, string> = {
  FINALIZADA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  FINALIZADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CONCLUIDO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  EM_ANDAMENTO: "bg-amber-100 text-amber-800 border-amber-200",
  EM_MANUTENCAO: "bg-amber-100 text-amber-800 border-amber-200",
  PAUSADO: "bg-orange-100 text-orange-800 border-orange-200",
};

function getBadgeStyle(status: string): string {
  return STATUS_STYLES[status] ?? "bg-blue-100 text-blue-800 border-blue-200";
}

function formatDateTime(dateString?: string | null, includeYear = false): string | null {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    ...(includeYear && { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SectorExpandedPanel: React.FC<{
  order: WorkOrder;
  sector: SectorService;
  isTecnico: boolean;
  isFinished: boolean;
  isLoading: boolean;
  hasActiveAction: boolean;
  onEditSector: (sector: SectorService, fleet: string) => void;
  onDeleteSector: (sectorId: string) => Promise<void>;
  onStartRepair: (sectorId: string) => Promise<void>;
  onPauseRepair: (sectorId: string, motivo: string) => Promise<void>;
  onResumeRepair: (sectorId: string) => Promise<void>;
  onFinishRepair: (sectorId: string, solucao: string, causa?: string) => Promise<void>;
}> = ({
  order,
  sector,
  isTecnico,
  isFinished,
  isLoading,
  hasActiveAction,
  onEditSector,
  onDeleteSector,
  onStartRepair,
  onPauseRepair,
  onResumeRepair,
  onFinishRepair,
}) => {
  const [solucao, setSolucao] = useState("");
  const [causa, setCausa] = useState("");
  const [motivoPausa, setMotivoPausa] = useState("");
  const [showPauseBox, setShowPauseBox] = useState(false);

  const handleFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!solucao.trim()) return;
    await onFinishRepair(sector.id, solucao.trim(), causa.trim() || undefined);
    setSolucao("");
    setCausa("");
  };

  const handlePause = async () => {
    const trimmed = motivoPausa.trim();
    if (!trimmed) return;
    await onPauseRepair(sector.id, trimmed);
    setMotivoPausa("");
    setShowPauseBox(false);
  };

  return (
    <div className="p-4 bg-slate-50/90 border-t border-slate-200 space-y-3 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
        <div>
          <span className="font-bold text-slate-800">Local:</span> {sector.qth} - {sector.city}
        </div>
        <div>
          <span className="font-bold text-slate-800">Operador:</span>{" "}
          {sector.operator?.name
            ? `${sector.operator.name}${sector.operator.registration ? ` (#${sector.operator.registration})` : ""}`
            : "Não informado"}
        </div>
        <div>
          <span className="font-bold text-slate-800">Aberto / Técnico:</span>{" "}
          {sector.criador?.name || "-"} / {sector.tecnicoResponsavel?.name || "-"}
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700">
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
          Relato do QRU / Falha
        </span>
        {sector.qruDescricao}
      </div>

      {sector.status === "PAUSADO" && (
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-800 mb-0.5">
            Motivo da Pausa
          </span>
          {sector.motivoPausa || "Aguardando peças/instruções"}
        </div>
      )}

      {sector.solucaoTecnico && (
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-900 space-y-1.5">
          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Solução Aplicada
          </span>
          <p className="font-medium">{sector.solucaoTecnico}</p>
          <div className="flex flex-wrap gap-4 text-[10px] text-emerald-800 pt-1.5 border-t border-emerald-200/70">
            {sector.tipoCausa && <span><b>Causa:</b> {sector.tipoCausa}</span>}
            {sector.tempoManutencao != null && (
              <span><b>Tempo:</b> {formatRepairTime(sector.tempoManutencao)}</span>
            )}
            {sector.dataInicioManutencao && (
              <span><b>Início:</b> {formatDateTime(sector.dataInicioManutencao)}</span>
            )}
            {sector.dataFimManutencao && (
              <span><b>Fim:</b> {formatDateTime(sector.dataFimManutencao)}</span>
            )}
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {sector.status === "AGUARDANDO_MANUTENCAO" && (
              <button
                type="button"
                disabled={hasActiveAction}
                onClick={() => onStartRepair(sector.id)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Iniciando..." : "Iniciar Manutenção"}
              </button>
            )}

            {sector.status === "EM_MANUTENCAO" && !showPauseBox && (
              <button
                type="button"
                disabled={hasActiveAction}
                onClick={() => setShowPauseBox(true)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Pausar Atendimento
              </button>
            )}

            {sector.status === "PAUSADO" && (
              <button
                type="button"
                disabled={hasActiveAction}
                onClick={() => onResumeRepair(sector.id)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Retomando..." : "Retomar Atendimento"}
              </button>
            )}
          </div>

          {!isTecnico && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEditSector(sector, order.equipment?.fleet || "")}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
              >
                Editar Setor
              </button>
              <button
                type="button"
                disabled={hasActiveAction}
                onClick={() => onDeleteSector(sector.id)}
                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-slate-200 text-red-600 font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      )}

      {!isFinished && sector.status === "EM_MANUTENCAO" && showPauseBox && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Motivo da pausa (ex: Aguardando peça)..."
            value={motivoPausa}
            onChange={(e) => setMotivoPausa(e.target.value)}
            className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPauseBox(false)}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={hasActiveAction || !motivoPausa.trim()}
              onClick={handlePause}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Confirmar Pausa
            </button>
          </div>
        </div>
      )}

      {!isFinished && sector.status === "EM_MANUTENCAO" && (
        <form onSubmit={handleFinish} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <input
            type="text"
            required
            placeholder="Solução técnica aplicada... *"
            value={solucao}
            onChange={(e) => setSolucao(e.target.value)}
            disabled={hasActiveAction}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
          />
          <input
            type="text"
            placeholder="Tipo de causa (opcional)"
            value={causa}
            onChange={(e) => setCausa(e.target.value)}
            disabled={hasActiveAction}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={hasActiveAction || !solucao.trim()}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Finalizando..." : "Finalizar Atendimento"}
          </button>
        </form>
      )}
    </div>
  );
};

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  onEditSector,
  onRefresh,
}) => {
  const { user } = useAuth();
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);
  const [loadingSectorId, setLoadingSectorId] = useState<string | null>(null);

  const normalizedRole = user?.role?.toLowerCase().trim() ?? "";
  const isTecnico = normalizedRole.includes("tecnico") || normalizedRole.includes("técnico");

  const rows: SectorRowData[] = workOrders.flatMap((order) =>
    (order.setores ?? []).map((sector) => ({ order, sector }))
  );

  const runAction = async <T,>(
    sectorId: string,
    fallbackMessage: string,
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      setLoadingSectorId(sectorId);
      const result = await operation();
      onRefresh();
      return result;
    } catch (err: unknown) {
      alert(getErrorMessage(err, fallbackMessage));
      return undefined;
    } finally {
      setLoadingSectorId(null);
    }
  };

  const handleDeleteSector = async (sectorId: string) => {
    if (!window.confirm("Deseja realmente remover este setor da Ordem de Serviço?")) return;
    await runAction(sectorId, "Erro ao remover setor.", () =>
      workOrderService.deleteSector(sectorId)
    );
  };

  const handleStartRepair = async (sectorId: string) => {
    await runAction(sectorId, "Erro ao iniciar manutenção.", () =>
      workOrderService.startSector(sectorId)
    );
  };

  const handlePauseRepair = async (sectorId: string, motivo: string) => {
    await runAction(sectorId, "Erro ao pausar atendimento.", () =>
      workOrderService.pauseSector(sectorId, motivo)
    );
  };

  const handleResumeRepair = async (sectorId: string) => {
    await runAction(sectorId, "Erro ao retomar atendimento.", () =>
      workOrderService.resumeSector(sectorId)
    );
  };

  const handleFinishRepair = async (
    sectorId: string,
    solucaoTecnico: string,
    tipoCausa?: string
  ) => {
    await runAction(sectorId, "Erro ao finalizar manutenção.", () =>
      workOrderService.finishSector(sectorId, { solucaoTecnico, tipoCausa })
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-950/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">OS / Frota</th>
              <th className="py-3.5 px-4">Equipamento</th>
              <th className="py-3.5 px-4">Setor</th>
              <th className="py-3.5 px-4">Local / QRU</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map(({ order, sector }) => {
              const isExpanded = expandedSectorId === sector.id;
              const isFinished = sector.status === "FINALIZADO" || order.status === "FINALIZADA";
              const isLoading = loadingSectorId === sector.id;
              const hasActiveAction = loadingSectorId !== null;

              return (
                <React.Fragment key={sector.id}>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800">
                        #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-emerald-700">
                        Frota #{order.equipment?.fleet || "N/A"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {order.equipment?.name || "Equipamento Desconhecido"}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-800 whitespace-nowrap">
                      {sector.setor}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {sector.qth} - {sector.city}
                      </div>
                      <div className="truncate text-slate-700" title={sector.qruDescricao}>
                        {sector.qruDescricao}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 border text-[10px] font-extrabold rounded-lg ${getBadgeStyle(
                          sector.status
                        )}`}
                      >
                        {sector.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        {!isFinished && sector.status === "AGUARDANDO_MANUTENCAO" && (
                          <button
                            type="button"
                            disabled={hasActiveAction}
                            onClick={() => handleStartRepair(sector.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg disabled:opacity-50 cursor-pointer"
                          >
                            {isLoading ? "..." : "Iniciar"}
                          </button>
                        )}

                        {!isFinished && sector.status === "PAUSADO" && (
                          <button
                            type="button"
                            disabled={hasActiveAction}
                            onClick={() => handleResumeRepair(sector.id)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg disabled:opacity-50 cursor-pointer"
                          >
                            {isLoading ? "..." : "Retomar"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSectorId(isExpanded ? null : sector.id)
                          }
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg cursor-pointer"
                        >
                          {isExpanded ? "Fechar" : "Detalhes"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <SectorExpandedPanel
                          order={order}
                          sector={sector}
                          isTecnico={isTecnico}
                          isFinished={isFinished}
                          isLoading={isLoading}
                          hasActiveAction={hasActiveAction}
                          onEditSector={onEditSector}
                          onDeleteSector={handleDeleteSector}
                          onStartRepair={handleStartRepair}
                          onPauseRepair={handlePauseRepair}
                          onResumeRepair={handleResumeRepair}
                          onFinishRepair={handleFinishRepair}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};