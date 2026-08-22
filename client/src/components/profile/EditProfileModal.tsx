import React, { useState } from "react";
import { collaboratorService } from "../../services/collaboratorService";
import { getErrorMessage } from "../../utils/getErrorMessage";
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

      const updatedData = await collaboratorService.update(user.id, payload);

      if (updateUser) {
        updateUser(updatedData);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md space-y-5 shadow-2xl animate-slide-in">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-800">Editar Meu Perfil</h2>
            <p className="text-xs text-slate-400">Atualize suas informações pessoais</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nome Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Matrícula (Somente Leitura)</label>
            <input
              type="text"
              disabled
              value={user.registration || ""}
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Cidade / Base</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nova Senha (Opcional)</label>
            <input
              type="password"
              placeholder="Deixe em branco para manter a atual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>

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
              {loading ? "Salvando..." : "Salvar Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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