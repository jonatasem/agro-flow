'use client';

import React, { useEffect, useState } from "react";
import { equipmentService } from "@/services/equipmentService";
import { operatorService } from "@/services/operatorService";
import { workOrderService } from "@/services/workOrderService";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Equipment } from "@/types/equipment";
import type { Operator } from "@/types/operator";
import type { CreateWorkOrderInput } from "@/types/sectorService";

interface SectorDraft {
  setor: string;
  qth: string;
  city: string;
  operatorId: string;
  qruDescricao: string;
}

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function createEmptySector(): SectorDraft {
  return {
    setor: "",
    qth: "",
    city: "",
    operatorId: "",
    qruDescricao: "",
  };
}

export function CreateWorkOrderModal({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkOrderModalProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [equipmentId, setEquipmentId] = useState("");
  const [sectors, setSectors] = useState<SectorDraft[]>([createEmptySector()]);
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
        setError(getErrorMessage(err, "Erro ao carregar equipamentos e operadores."));
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
    index: number,
    field: keyof SectorDraft,
    value: string
  ) => {
    setSectors((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddSector = () => {
    setSectors((prev) => [...prev, createEmptySector()]);
  };

  const handleRemoveSector = (index: number) => {
    setSectors((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== index) : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!equipmentId) {
      setError("Selecione um equipamento.");
      return;
    }

    const formattedSectors = sectors.map((item) => ({
      setor: item.setor.trim(),
      qth: item.qth.trim(),
      city: item.city.trim(),
      operatorId: item.operatorId || undefined,
      qruDescricao: item.qruDescricao.trim(),
    }));

    const hasInvalidSector = formattedSectors.some(
      (item) => !item.setor || !item.qth || !item.city || !item.qruDescricao
    );

    if (hasInvalidSector) {
      setError("Preencha setor, local (QTH), cidade e relato do QRU em todos os setores.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        equipmentId,
        setores: formattedSectors,
      } as unknown as CreateWorkOrderInput;

      await workOrderService.create(payload);
      onCreated();
      resetAndClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao criar Ordem de Serviço."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-100 my-8">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              Criar Nova Ordem de Serviço
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione o equipamento e informe os dados do atendimento por setor.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl font-medium">
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white disabled:opacity-50"
            >
              <option value="">
                {loadingOptions ? "Carregando equipamentos..." : "Selecione um equipamento"}
              </option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  #{eq.fleet} — {eq.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-800">
                    Setor #{index + 1}
                  </span>
                  {sectors.length > 1 && (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRemoveSector(index)}
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
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      placeholder="Ex: Piloto / Telemetria"
                      value={sector.setor}
                      onChange={(e) => handleSectorChange(index, "setor", e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
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
                      onChange={(e) => handleSectorChange(index, "qth", e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      placeholder="Ex: Lucélia"
                      value={sector.city}
                      onChange={(e) => handleSectorChange(index, "city", e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Operador (Opcional)
                  </label>
                  <select
                    disabled={loadingOptions || submitting}
                    value={sector.operatorId}
                    onChange={(e) =>
                      handleSectorChange(index, "operatorId", e.target.value)
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="">Sem operador vinculado</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name} {op.registration ? `(#${op.registration})` : ""}
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
                      handleSectorChange(index, "qruDescricao", e.target.value)
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
            onClick={handleAddSector}
            className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            + Adicionar outro setor
          </button>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={resetAndClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Salvando..." : "Criar Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}