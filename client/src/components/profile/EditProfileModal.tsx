import React, { useState } from "react";
import { api } from "../../services/api";
import { getErrorMessage } from "../../utility/getErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../contexts/AuthContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormProps {
  user: User;
  onClose: () => void;
  onSuccess?: () => void;
}

// Componente interno que inicializa o estado diretamente dos dados do usuário
const EditProfileForm: React.FC<FormProps> = ({ user, onClose, onSuccess }) => {
  const { updateUser } = useAuth();

  const [name, setName] = useState(user.name || "");
  const [city, setCity] = useState(user.city || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);
      setError("");

      const payload: Record<string, string> = {
        name,
        city,
      };

      if (password.trim()) {
        payload.password = password;
      }

      const response = await api.put(`/collaborator/${user.id}`, payload);

      if (updateUser) {
        updateUser(response.data);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao atualizar dados do perfil."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-xl text-slate-800">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-800">Editar Meu Perfil</h2>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold">Matrícula (Leitura)</label>
            <input
              type="text"
              disabled
              value={user.registration || ""}
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Cidade / Base</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-700 font-semibold">Nova Senha (Opcional)</label>
            <input
              type="password"
              placeholder="Deixe em branco para manter a atual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              {loading ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Wrapper do Modal
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <EditProfileForm
      key={user.id}
      user={user}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
};