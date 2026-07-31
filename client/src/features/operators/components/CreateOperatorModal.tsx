import React, { useState } from "react";
import { api } from "../../../services/api";
import { getErrorMessage } from "../../../utility/getErrorMessage";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOperatorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // CORREÇÃO: Alterado de React.SubmitEvent para React.FormEvent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registration.trim()) return;

    try {
      setLoading(true);
      setError("");

      // Mantido estritamente na rota de operadores
      await api.post("/operator", {
        name,
        registration,
        city,
        password,
      });

      setName("");
      setRegistration("");
      setCity("");
      setPassword("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao cadastrar operador. Verifique os dados fornecidos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100">Novo Operador</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Nome Completo *</label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Matrícula *</label>
            <input
              type="text"
              required
              placeholder="Ex: OP-503"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Cidade / Base</label>
            <input
              type="text"
              placeholder="Ex: Lucélia - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Senha de Acesso</label>
            <input
              type="password"
              placeholder="Padrão: 123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all"
            >
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
