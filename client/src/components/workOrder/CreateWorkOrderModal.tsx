import React, { useEffect, useState } from "react";
import { useEquipments } from "../../hooks/useEquipment";
import { workOrderService, type SectorService } from "../../services/workOrderService";
import { getErrorMessage } from "../../utils/getErrorMessage";

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSectorData?: SectorService | null;
  initialFleet?: string;
  operatorId?: string;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialSectorData,
  initialFleet = "",
  operatorId = "",
}) => {
  const { equipments, refetch: fetchEquipments } = useEquipments();

  const [fleet, setFleet] = useState(initialFleet);
  const [setor, setSetor] = useState(initialSectorData?.setor || "");
  const [qruDescricao, setQruDescricao] = useState(initialSectorData?.qruDescricao || "");
  const [qth, setQth] = useState(initialSectorData?.qth || "");
  const [city, setCity] = useState(initialSectorData?.city || "");
  const [selectedOperatorId, setSelectedOperatorId] = useState(operatorId);

  const [prevSector, setPrevSector] = useState(initialSectorData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen || initialSectorData !== prevSector) {
    setPrevIsOpen(isOpen);
    setPrevSector(initialSectorData);
    
    setFleet(initialFleet || "");
    setSetor(initialSectorData?.setor || "");
    setQruDescricao(initialSectorData?.qruDescricao || "");
    setQth(initialSectorData?.qth || "");
    setCity(initialSectorData?.city || "");
    setSelectedOperatorId(operatorId);
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen, fetchEquipments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setor.trim() || !qruDescricao.trim() || !qth.trim() || !city.trim() || (!initialSectorData && (!fleet.trim() || !selectedOperatorId.trim()))) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (initialSectorData?.id) {
        await workOrderService.updateSector(initialSectorData.id, {
          setor,
          qruDescricao,
          qth,
          city,
        });
      } else {
        await workOrderService.create({
          fleet,
          operatorId: selectedOperatorId,
          setor,
          qruDescricao,
          qth,
          city,
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao salvar informações."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-neutral-200 p-6 rounded-3xl w-full max-w-lg space-y-4 shadow-2xl">
        
        <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
          <h2 className="text-lg font-bold text-neutral-950">
            {initialSectorData ? "Editar Setor da Ordem de Serviço" : "Nova Ordem de Serviço"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-neutral-500 hover:text-neutral-800 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-neutral-700">
          {!initialSectorData && (
            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">Frota / Equipamento *</label>
              <select
                required
                value={fleet}
                onChange={(e) => setFleet(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="">Selecione o equipamento...</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.fleet}>
                    Frota #{eq.fleet} - {eq.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-neutral-800">Setor Afetado *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mecânica, Elétrica, Hidráulica"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">QTH (Local/Fazenda) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Talhão 04 / Fazenda Santa Maria"
                value={qth}
                onChange={(e) => setQth(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">Cidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Lucélia"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
          </div>

          {!initialSectorData && (
            <div className="space-y-1">
              <label className="font-semibold text-neutral-800">ID / Matrícula do Operador *</label>
              <input
                type="text"
                required
                placeholder="Ex: 23805"
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-neutral-800">Descrição do QRU (Problema) *</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva a falha ou manutenção necessária..."
              value={qruDescricao}
              onChange={(e) => setQruDescricao(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Salvando..." : initialSectorData ? "Salvar Alterações" : "Abrir Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};