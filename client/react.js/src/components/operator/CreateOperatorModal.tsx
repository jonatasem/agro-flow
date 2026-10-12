import React, { useState } from "react";

// Serviços e Tipos
import {
  operatorService,
  type Operator,
} from "../../services/operatorService";

// Utilitários
import { getErrorMessage } from "../../utils/getErrorMessage";
import { CITIES } from "../../utils/cities";

// Interface das propriedades do Modal de Criação e Edição de Operadores
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Operator | null;
}

// Modal responsável por cadastrar um novo operador ou atualizar um existente
export const CreateOperatorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  // Estados dos campos do formulário
  const [name, setName] = useState(initialData?.name || "");
  const [registration, setRegistration] = useState(
    initialData?.registration || ""
  );
  const [city, setCity] = useState(initialData?.city || "");

  // Estados de carregamento e mensagem de erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Submissão do formulário para criação ou atualização
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !registration.trim() || !city.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = { name, registration, city };

      if (initialData?.id) {
        await operatorService.update(initialData.id, payload);
      } else {
        await operatorService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Erro ao salvar operador. Verifique os dados fornecidos."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md space-y-5 shadow-2xl animate-slide-in">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {initialData ? "Editar Operador" : "Novo Operador"}
            </h2>
            <p className="text-xs text-slate-400">
              {initialData
                ? "Atualizar dados do operador"
                : "Cadastrar operador de máquinas agrícolas"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Matrícula *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 102030"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">
                Cidade / Filial *
              </label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="">Selecione uma cidade...</option>
                {CITIES.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/15 disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Salvando..."
                : initialData
                ? "Salvar Alterações"
                : "Cadastrar Operador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
