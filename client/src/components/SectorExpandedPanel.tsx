"use client";

import React, { useState } from "react";
import { formatRepairTime } from "@/utils/formatRepairTime";
import type { SectorService, WorkOrder } from "@/types/sectorService";

interface SectorExpandedPanelProps {
  order: WorkOrder;
  sector: SectorService;
  canExecute: boolean;
  isLoading: boolean;
  hasActiveAction: boolean;
  onEditSector: (sector: SectorService, fleet: string) => void;
  onDeleteSector: (sectorId: string) => Promise<void>;
  onStartRepair: (sectorId: string) => Promise<void>;
  onPauseRepair: (sectorId: string, motivo: string) => Promise<void>;
  onResumeRepair: (sectorId: string) => Promise<void>;
  onFinishRepair: (
    sectorId: string,
    solucao: string,
    causa?: string
  ) => Promise<void>;
}

function formatDateTime(dateString?: string | null): string | null {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SectorExpandedPanel: React.FC<SectorExpandedPanelProps> = ({
  order,
  sector,
  canExecute,
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

  const isFinished =
    sector.status === "FINALIZADO" || order.status === "FINALIZADA";

  const handleFinish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!solucao.trim()) return;
    await onFinishRepair(sector.id, solucao.trim(), causa.trim() || undefined);
    setSolucao("");
    setCausa("");
  };

  const handlePause = async () => {
    if (!motivoPausa.trim()) return;
    await onPauseRepair(sector.id, motivoPausa.trim());
    setMotivoPausa("");
    setShowPauseBox(false);
  };

  return (
    <div className="p-3.5 sm:p-4 bg-slate-50/90 border-t border-slate-200 space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-800">Local:</span> {sector.qth} •{" "}
          {sector.city}
        </div>
        <div>
          <span className="font-bold text-slate-800">Operador:</span>{" "}
          {sector.operator?.name
            ? `${sector.operator.name}${
                sector.operator.registration ? ` (#${sector.operator.registration})` : ""
              }`
            : "Não informado"}
        </div>
        <div>
          <span className="font-bold text-slate-800">Aberto / Técnico:</span>{" "}
          {sector.criador?.name || "-"} /{" "}
          {sector.tecnicoResponsavel?.name || "-"}
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-slate-700">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Relato do QRU / Falha
        </span>
        <p className="leading-relaxed">{sector.qruDescricao}</p>
      </div>

      {sector.status === "PAUSADO" && (
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">
            Motivo da Pausa
          </span>
          {sector.motivoPausa || "Aguardando peças/instruções"}
        </div>
      )}

      {sector.solucaoTecnico && (
        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Solução Aplicada
          </span>
          <p className="font-medium leading-relaxed">{sector.solucaoTecnico}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-emerald-800 pt-1.5 border-t border-emerald-200/70">
            {sector.tipoCausa && (
              <span>
                <b>Causa:</b> {sector.tipoCausa}
              </span>
            )}
            {sector.tempoManutencao != null && (
              <span>
                <b>Tempo:</b> {formatRepairTime(sector.tempoManutencao)}
              </span>
            )}
            {sector.dataInicioManutencao && (
              <span>
                <b>Início:</b> {formatDateTime(sector.dataInicioManutencao)}
              </span>
            )}
            {sector.dataFimManutencao && (
              <span>
                <b>Fim:</b> {formatDateTime(sector.dataFimManutencao)}
              </span>
            )}
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          {canExecute ? (
            <div className="flex flex-wrap gap-2">
              {sector.status === "AGUARDANDO_MANUTENCAO" && (
                <button
                  type="button"
                  disabled={hasActiveAction}
                  onClick={() => onStartRepair(sector.id)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Iniciando..." : "Iniciar Manutenção"}
                </button>
              )}

              {sector.status === "EM_MANUTENCAO" && !showPauseBox && (
                <button
                  type="button"
                  disabled={hasActiveAction}
                  onClick={() => setShowPauseBox(true)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Pausar Atendimento
                </button>
              )}

              {sector.status === "PAUSADO" && (
                <button
                  type="button"
                  disabled={hasActiveAction}
                  onClick={() => onResumeRepair(sector.id)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Retomando..." : "Retomar Atendimento"}
                </button>
              )}
            </div>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEditSector(sector, order.equipment?.fleet || "")}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Editar Setor
            </button>
            <button
              type="button"
              disabled={hasActiveAction}
              onClick={() => onDeleteSector(sector.id)}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-red-50 border border-slate-200 text-red-600 font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {!isFinished && canExecute && sector.status === "EM_MANUTENCAO" && showPauseBox && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Motivo da pausa (ex: Aguardando peça)..."
            value={motivoPausa}
            onChange={(e) => setMotivoPausa(e.target.value)}
            className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPauseBox(false)}
              className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={hasActiveAction || !motivoPausa.trim()}
              onClick={handlePause}
              className="flex-1 sm:flex-none px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Confirmar Pausa
            </button>
          </div>
        </div>
      )}

      {!isFinished && canExecute && sector.status === "EM_MANUTENCAO" && (
        <form
          onSubmit={handleFinish}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1"
        >
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
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? "Finalizando..." : "Finalizar Atendimento"}
          </button>
        </form>
      )}
    </div>
  );
};