import React, { useEffect, useState } from "react";
import { createWorkOrder, getEquipments } from "../services/workOrder";
import { getErrorMessage } from "../utility/getErrorMessage";

interface Equipment {
  id: string;
  fleet: string;
  name: string;
}

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [fleet, setFleet] = useState("");
  const [setor, setSetor] = useState("");
  const [qruDescricao, setQruDescricao] = useState("");
  const [qth, setQth] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      getEquipments()
        .then((data) => setEquipments(data))
        .catch(() => setError("Erro ao carregar lista de equipamentos"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createWorkOrder({
        fleet,
        setor,
        qruDescricao,
        qth,
        city,
      });

      // Limpa os campos
      setFleet("");
      setSetor("");
      setQruDescricao("");
      setQth("");
      setCity("");
      
      onSuccess(); // Notifica o componente pai
      onClose(); // Fecha o modal
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao criar Ordem de Serviço."));
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Nova Ordem de Serviço</h2>
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
          {/* Frota / Equipamento */}
          <div className="space-y-1">
            <label className="font-semibold">Frota / Equipamento *</label>
            <select
              required
              value={fleet}
              onChange={(e) => setFleet(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Selecione o equipamento...</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.fleet}>
                  Frota #{eq.fleet} - {eq.name}
                </option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div className="space-y-1">
            <label className="font-semibold">Setor Afetado *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mecânica, Elétrica, Hidráulica"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Localização (QTH e Cidade) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold">QTH (Local/Fazenda) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Talhão 04 / Fazenda Santa Maria"
                value={qth}
                onChange={(e) => setQth(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
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
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Descrição do Problema (QRU) */}
          <div className="space-y-1">
            <label className="font-semibold">Descrição do QRU (Problema) *</label>
            <textarea
              required
              rows={3}
              placeholder="Descreva a falha ou manutenção necessária..."
              value={qruDescricao}
              onChange={(e) => setQruDescricao(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {loading ? "Criando..." : "Abrir Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
