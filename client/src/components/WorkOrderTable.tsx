"use client";

import React, { useState } from "react";
import { workOrderService } from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permission";
import { SectorExpandedPanel } from "./SectorExpandedPanel";
import type {
  SectorService,
  SectorStatus,
  WorkOrder,
} from "@/types/sectorService";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onEditSector: (sector: SectorService, fleet: string) => void;
  onRefresh: () => void;
}

const SECTOR_STATUS_STYLES: Record<
  SectorStatus,
  { badge: string; dot: string; label: string }
> = {
  FINALIZADO: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Finalizado",
  },
  EM_MANUTENCAO: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Em manutenção",
  },
  PAUSADO: {
    badge: "bg-orange-50 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
    label: "Pausado",
  },
  AGUARDANDO_MANUTENCAO: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-emerald-600",
    label: "Aguardando",
  },
};

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  onEditSector,
  onRefresh,
}) => {
  const { hasPermission } = usePermission();
  const canExecute = hasPermission(PERMISSIONS.WORK_ORDER_EXECUTE);

  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);
  const [loadingSectorId, setLoadingSectorId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const rows = workOrders.flatMap((order) =>
    (order.setores ?? []).map((sector) => ({ order, sector }))
  );

  const runAction = async (
    sectorId: string,
    fallbackMessage: string,
    operation: () => Promise<unknown>
  ) => {
    setActionError("");
    try {
      setLoadingSectorId(sectorId);
      await operation();
      onRefresh();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, fallbackMessage));
    } finally {
      setLoadingSectorId(null);
    }
  };

  const renderPrimaryAction = (
    sector: SectorService,
    isFinished: boolean,
    isLoading: boolean,
    hasActiveAction: boolean
  ) => {
    if (isFinished || !canExecute) return null;

    if (sector.status === "AGUARDANDO_MANUTENCAO") {
      return (
        <button
          type="button"
          disabled={hasActiveAction}
          onClick={() =>
            runAction(sector.id, "Erro ao iniciar manutenção.", () =>
              workOrderService.startSector(sector.id)
            )
          }
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "..." : "Iniciar"}
        </button>
      );
    }

    if (sector.status === "PAUSADO") {
      return (
        <button
          type="button"
          disabled={hasActiveAction}
          onClick={() =>
            runAction(sector.id, "Erro ao retomar atendimento.", () =>
              workOrderService.resumeSector(sector.id)
            )
          }
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "..." : "Retomar"}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center justify-between gap-3">
          <span className="font-medium">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="font-bold underline cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Mobile-first: Cards sem rolagem lateral */}
      <div className="space-y-3 md:hidden">
        {rows.map(({ order, sector }) => {
          const isExpanded = expandedSectorId === sector.id;
          const isFinished =
            sector.status === "FINALIZADO" || order.status === "FINALIZADA";
          const isLoading = loadingSectorId === sector.id;
          const hasActiveAction = loadingSectorId !== null;
          const statusStyle = SECTOR_STATUS_STYLES[sector.status];

          return (
            <div
              key={sector.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs"
            >
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Frota #{order.equipment?.fleet || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {order.equipment?.name || "Equipamento Desconhecido"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-bold rounded-full shrink-0 ${statusStyle.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    {statusStyle.label}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-800">
                      {sector.setor}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {sector.qth} • {sector.city}
                    </span>
                  </div>
                  <p className="text-slate-700 line-clamp-2">
                    {sector.qruDescricao}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {renderPrimaryAction(
                    sector,
                    isFinished,
                    isLoading,
                    hasActiveAction
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSectorId(isExpanded ? null : sector.id)
                    }
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isExpanded ? "Fechar" : "Detalhes"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <SectorExpandedPanel
                  order={order}
                  sector={sector}
                  canExecute={canExecute}
                  isLoading={isLoading}
                  hasActiveAction={hasActiveAction}
                  onEditSector={onEditSector}
                  onDeleteSector={(sectorId) =>
                    runAction(sectorId, "Erro ao remover setor.", () =>
                      workOrderService.deleteSector(sectorId)
                    )
                  }
                  onStartRepair={(sectorId) =>
                    runAction(sectorId, "Erro ao iniciar manutenção.", () =>
                      workOrderService.startSector(sectorId)
                    )
                  }
                  onPauseRepair={(sectorId, motivo) =>
                    runAction(sectorId, "Erro ao pausar atendimento.", () =>
                      workOrderService.pauseSector(sectorId, motivo)
                    )
                  }
                  onResumeRepair={(sectorId) =>
                    runAction(sectorId, "Erro ao retomar atendimento.", () =>
                      workOrderService.resumeSector(sectorId)
                    )
                  }
                  onFinishRepair={(sectorId, solucaoTecnico, tipoCausa) =>
                    runAction(sectorId, "Erro ao finalizar manutenção.", () =>
                      workOrderService.finishSector(sectorId, {
                        solucaoTecnico,
                        tipoCausa,
                      })
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Tabela limpa */}
      <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">OS / Frota</th>
                <th className="py-3 px-4">Equipamento</th>
                <th className="py-3 px-4">Setor</th>
                <th className="py-3 px-4">Local / QRU</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map(({ order, sector }) => {
                const isExpanded = expandedSectorId === sector.id;
                const isFinished =
                  sector.status === "FINALIZADO" || order.status === "FINALIZADA";
                const isLoading = loadingSectorId === sector.id;
                const hasActiveAction = loadingSectorId !== null;
                const statusStyle = SECTOR_STATUS_STYLES[sector.status];

                return (
                  <React.Fragment key={sector.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-700">
                          Frota #{order.equipment?.fleet || "N/A"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {order.equipment?.name || "Equipamento Desconhecido"}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-800 whitespace-nowrap">
                        {sector.setor}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[11px] text-slate-500 font-semibold">
                          {sector.qth} • {sector.city}
                        </div>
                        <div
                          className="truncate text-slate-700"
                          title={sector.qruDescricao}
                        >
                          {sector.qruDescricao}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-bold rounded-full ${statusStyle.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          {renderPrimaryAction(
                            sector,
                            isFinished,
                            isLoading,
                            hasActiveAction
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSectorId(isExpanded ? null : sector.id)
                            }
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
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
                            canExecute={canExecute}
                            isLoading={isLoading}
                            hasActiveAction={hasActiveAction}
                            onEditSector={onEditSector}
                            onDeleteSector={(sectorId) =>
                              runAction(
                                sectorId,
                                "Erro ao remover setor.",
                                () => workOrderService.deleteSector(sectorId)
                              )
                            }
                            onStartRepair={(sectorId) =>
                              runAction(
                                sectorId,
                                "Erro ao iniciar manutenção.",
                                () => workOrderService.startSector(sectorId)
                              )
                            }
                            onPauseRepair={(sectorId, motivo) =>
                              runAction(
                                sectorId,
                                "Erro ao pausar atendimento.",
                                () => workOrderService.pauseSector(sectorId, motivo)
                              )
                            }
                            onResumeRepair={(sectorId) =>
                              runAction(
                                sectorId,
                                "Erro ao retomar atendimento.",
                                () => workOrderService.resumeSector(sectorId)
                              )
                            }
                            onFinishRepair={(sectorId, solucaoTecnico, tipoCausa) =>
                              runAction(
                                sectorId,
                                "Erro ao finalizar manutenção.",
                                () =>
                                  workOrderService.finishSector(sectorId, {
                                    solucaoTecnico,
                                    tipoCausa,
                                  })
                              )
                            }
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
    </div>
  );
};