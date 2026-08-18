import React, { useState } from "react";
import { api } from "../../services/api";
import { getErrorMessage } from "../../utility/getErrorMessage";
import type { Collaborator } from "../../services/collaboratorService";

interface ModalProps {
  isOpen: boolean;               
  onClose: () => void;           
  onSuccess: () => void;         
  initialData?: Collaborator | null;
}

export const CreateCollaboratorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [registration, setRegistration] = useState(initialData?.registration || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialData?.role || "TECNICO");
  const [sector, setSector] = useState(initialData?.sector || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
  
    if (!name.trim() || !registration.trim() || (!initialData && !password.trim())) return;

    try {
      setLoading(true);
      setError("");

      const payload: Record<string, string> = {
        name,
        registration,
        role,
        sector,
        city,
      };
    
      if (password.trim()) {
        payload.password = password;
      }
    
      if (initialData?.id) {
        await api.put(`/collaborator/${initialData.id}`, payload);
      } else {
        await api.post("/collaborator", payload);
      }
    
      setName("");
      setRegistration("");
      setPassword("");
      setRole("");
      setSector("");
      setCity("");
      onSuccess();
      onClose();

    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao salvar dados do colaborador. Verifique as informações."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl text-slate-800">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? "Editar Colaborador" : "Novo Colaborador"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Nome Completo</label>
            <input
              type="text"
              required
              placeholder="Ex: Fernando Souza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Matrícula</label>
              <input
                type="text"
                required
                placeholder="Ex: 1024"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
           
            <div className="space-y-1">
              <label className="text-xs text-slate-700 font-semibold">Cargo / Função</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="TECNICO">Técnico</option>
                <option value="LIDER">Líder</option>
                <option value="COA">COA</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Setor do Técnico</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="">Selecione o Setor</option>
              <option value="AGRICULTURA_PRECISAO">Agricultura de Precisão</option>
              <option value="MECANICA">Mecânica / Oficina</option>
              <option value="GERAL">Geral</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">
              {initialData ? "Nova Senha (Opcional)" : "Senha de Acesso"}
            </label>
            <input
              type="password"
              required={!initialData}
              placeholder={initialData ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Cidade / Base</label>
            <input
              type="text"
              placeholder="Ex: Sertãozinho - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              {loading ? "Salvando..." : initialData ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};