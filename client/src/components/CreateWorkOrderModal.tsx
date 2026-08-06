import React, { useEffect, useState } from "react";
import { useEquipments } from "../hooks/useEquipment";
import { workOrderService, type SectorService } from "../services/workOrderService";
import { getErrorMessage } from "../utility/getErrorMessage";


interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSectorData?: SectorService | null;
  initialFleet?: string;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialSectorData,
  initialFleet = "",
}) => {
  const { equipments, refetch: fetchEquipments } = useEquipments();

  // 1. Inicialização dos estados
  const [fleet, setFleet] = useState(initialFleet);
  const [setor, setSetor] = useState(initialSectorData?.setor || "");
  const [qruDescricao, setQruDescricao] = useState(initialSectorData?.qruDescricao || "");
  const [qth, setQth] = useState(initialSectorData?.qth || "");
  const [city, setCity] = useState(initialSectorData?.city || "");

  // 2. Estado para monitorar a transição das props (Padrão Oficial React para redefinição de estado)
  const [prevSector, setPrevSector] = useState(initialSectorData);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sincroniza o formulário diretamente no ciclo de renderização (evita o erro do useEffect)
  if (isOpen !== prevIsOpen || initialSectorData !== prevSector) {
    setPrevIsOpen(isOpen);
    setPrevSector(initialSectorData);
    
    setFleet(initialSectorData ? initialFleet : "");
    setSetor(initialSectorData?.setor || "");
    setQruDescricao(initialSectorData?.qruDescricao || "");
    setQth(initialSectorData?.qth || "");
    setCity(initialSectorData?.city || "");
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 3. O useEffect agora cuida EXCLUSIVAMENTE de efeitos colaterais externos (buscar equipamentos)
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen, fetchEquipments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!setor.trim() || !qruDescricao.trim() || !qth.trim() || !city.trim()) return;

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
        if (!fleet.trim()) return;
        await workOrderService.create({
          fleet,
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">
            {initialSectorData ? "Editar Setor da Ordem de Serviço" : "Nova Ordem de Serviço"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
          
          {!initialSectorData && (
            <div className="space-y-1">
              <label className="font-semibold">Frota / Equipamento *</label>
              <select
                required
                value={fleet}
                onChange={(e) => setFleet(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
            <label className="font-semibold">Setor Afetado *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mecânica, Elétrica, Hidráulica"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">QTH (Local/Fazenda) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Talhão 04 / Fazenda Santa Maria"
                value={qth}
                onChange={(e) => setQth(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold">Cidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Lucélia"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Descrição do QRU (Problema) *</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva a falha ou manutenção necessária..."
              value={qruDescricao}
              onChange={(e) => setQruDescricao(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Salvando..." : initialSectorData ? "Salvar Alterações" : "Abrir Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};