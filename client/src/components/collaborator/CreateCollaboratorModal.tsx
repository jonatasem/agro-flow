import React, { useState } from "react";

// Serviços e Tipos
import {
  collaboratorService,
  type Collaborator,
} from "../../services/collaboratorService";

// Utilitários
import { getErrorMessage } from "../../utils/getErrorMessage";

// Interface das propriedades do Modal de Criação e Edição de Colaboradores
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Collaborator | null;
}

// Modal responsável por cadastrar um novo colaborador ou atualizar os dados de um existente
export const CreateCollaboratorModal: React.FC<ModalProps> = ({
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
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialData?.role || "TECNICO");
  const [sector, setSector] = useState(initialData?.sector || "");
  const [city, setCity] = useState(initialData?.city || "");

  // Estados de carregamento e mensagem de erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Submissão do formulário para criação ou atualização
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !registration.trim() ||
      (!initialData && !password.trim())
    )
      return;

    try {
      setLoading(true);
      setError("");

      const payload = {
        name,
        registration,
        role,
        sector,
        city,
        ...(password.trim() ? { password } : {}),
      };

      if (initialData?.id) {
        await collaboratorService.update(initialData.id, payload);
      } else {
        await collaboratorService.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Erro ao salvar dados do colaborador. Verifique as informações."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl text-slate-800">
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? "Editar Colaborador" : "Novo Colaborador"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">
              Nome Completo
            </label>
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
              <label className="text-xs text-slate-700 font-semibold">
                Matrícula
              </label>
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
              <label className="text-xs text-slate-700 font-semibold">
                Cargo / Função
              </label>
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
            <label className="text-xs text-slate-700 font-semibold">
              Setor
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="">Selecione o Setor</option>
              <option value="AGRICULTURA_PRECISAO">
                Agricultura de Precisão
              </option>
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
              placeholder={
                initialData
                  ? "Deixe em branco para manter"
                  : "Mínimo 6 caracteres"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">
              Cidade / Filial
            </label>
            <input
              type="text"
              placeholder="Ex: Sertãozinho - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {loading
                ? "Salvando..."
                : initialData
                ? "Salvar Alterações"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};