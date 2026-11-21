"use client";

import React, { useEffect, useState } from "react";
import { equipmentService } from "@/services/equipmentService";
import { operatorService } from "@/services/operatorService";
import { workOrderService } from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  CITIES,
  SETORES,
  type CreateSectorInput,
  type SectorService,
  type WorkOrder,
} from "@/types/sectorService";
import type { Equipment } from "@/types/equipment";
import type { Operator } from "@/types/operator";

interface SectorDraft extends CreateSectorInput {
  uid: string;
}

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (created: WorkOrder) => void;
  editingSector?: { sector: SectorService; fleet: string } | null;
}

function createEmptySector(): SectorDraft {
  return {
    uid: crypto.randomUUID(),
    setor: SETORES[0],
    qth: "",
    city: CITIES[0],
    operatorId: "",
    qruDescricao: "",
  };
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  onCreated,
  editingSector,
}: CreateWorkOrderModalProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [equipmentId, setEquipmentId] = useState("");
  const [sectors, setSectors] = useState<SectorDraft[]>(() => [
    createEmptySector(),
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoadingOptions(true);
    setError("");

    Promise.all([equipmentService.getAll(), operatorService.getAll()])
      .then(([equipmentList, operatorList]) => {
        if (!active) return;
        setEquipments(equipmentList);
        setOperators(operatorList);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          getErrorMessage(err, "Erro ao carregar equipamentos e operadores.")
        );
      })
      .finally(() => {
        if (active) setLoadingOptions(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setEquipmentId("");
    setSectors([createEmptySector()]);
    setError("");
    onClose();
  };

  const handleSectorChange = (
    uid: string,
    field: keyof CreateSectorInput,
    value: string
  ) => {
    setSectors((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveSector = (uid: string) => {
    setSectors((prev) =>
      prev.length > 1 ? prev.filter((item) => item.uid !== uid) : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!equipmentId) {
      setError("Selecione um equipamento.");
      return;
    }

    const formattedSectors: CreateSectorInput[] = sectors.map((item) => ({
      setor: item.setor.trim(),
      qth: item.qth.trim(),
      city: item.city.trim(),
      operatorId: item.operatorId || undefined,
      qruDescricao: item.qruDescricao.trim(),
    }));

    const hasInvalid = formattedSectors.some(
      (s) => !s.setor || !s.qth || !s.city || !s.qruDescricao
    );

    if (hasInvalid) {
      setError(
        "Preencha setor, local (QTH), cidade e relato do QRU em todos os setores."
      );
      return;
    }

    try {
      setSubmitting(true);
      const created = await workOrderService.create({
        equipmentId,
        setores: formattedSectors,
      });
      onCreated(created);
      resetAndClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao criar Ordem de Serviço."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 max-w-2xl w-full space-y-4 sm:space-y-5 border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {editingSector
                ? `Setor em edição — Frota #${editingSector.fleet}`
                : "Criar Nova Ordem de Serviço"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione o equipamento e informe os dados do atendimento por setor.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="equipment-select"
              className="text-xs font-bold text-slate-700"
            >
              Equipamento / Frota *
            </label>
            <select
              id="equipment-select"
              required
              disabled={loadingOptions || submitting}
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white disabled:opacity-50"
            >
              <option value="">
                {loadingOptions
                  ? "Carregando equipamentos..."
                  : "Selecione um equipamento"}
              </option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  #{eq.fleet} — {eq.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {sectors.map((sector, index) => (
              <div
                key={sector.uid}
                className="p-3.5 sm:p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-800">
                    Setor #{index + 1}
                  </span>
                  {sectors.length > 1 && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRemoveSector(sector.uid)}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Remover setor
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Setor *
                    </label>
                    <select
                      required
                      disabled={submitting}
                      value={sector.setor}
                      onChange={(e) =>
                        handleSectorChange(sector.uid, "setor", e.target.value)
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    >
                      {SETORES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Local (QTH) *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      placeholder="Ex: Talhão 14"
                      value={sector.qth}
                      onChange={(e) =>
                        handleSectorChange(sector.uid, "qth", e.target.value)
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Cidade *
                    </label>
                    <select
                      required
                      disabled={submitting}
                      value={sector.city}
                      onChange={(e) =>
                        handleSectorChange(sector.uid, "city", e.target.value)
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Operador (Opcional)
                  </label>
                  <select
                    disabled={loadingOptions || submitting}
                    value={sector.operatorId ?? ""}
                    onChange={(e) =>
                      handleSectorChange(
                        sector.uid,
                        "operatorId",
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">Sem operador vinculado</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}{" "}
                        {op.registration ? `(#${op.registration})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Relato do QRU / Falha *
                  </label>
                  <textarea
                    rows={2}
                    required
                    disabled={submitting}
                    placeholder="Descreva a falha apresentada no campo..."
                    value={sector.qruDescricao}
                    onChange={(e) =>
                      handleSectorChange(
                        sector.uid,
                        "qruDescricao",
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={() =>
              setSectors((prev) => [...prev, createEmptySector()])
            }
            className="w-full py-2.5 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            + Adicionar outro setor
          </button>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={resetAndClose}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Salvando..." : "Criar Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}