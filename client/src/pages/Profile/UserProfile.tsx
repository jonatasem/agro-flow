import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { EditProfileModal } from "../../components/profile/EditProfileModal";

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-4">
      {/* Container com 'relative' para posicionar o botão fechar */}
      <div className="relative bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-xl shadow-emerald-950/5">
        
        {/* Botão Fechar (X) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
            title="Fechar"
          >
            ✕
          </button>
        )}

        {/* Cabeçalho do Perfil */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-5 pt-2">
          <div className="w-16 h-16 bg-emerald-600 text-white font-black text-2xl rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Perfil do Usuário
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Informações da sua conta no sistema AgroFlow
          </p>
        </div>

        {/* Detalhes do Usuário */}
        {user ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nome Completo
                </span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">
                  {user.name || "Não informado"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Unidade / Polo
                  </span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">
                    📍 {user.city || "Zilor Principal"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Função / Cargo
                  </span>
                  <span className="inline-block text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md mt-0.5 uppercase">
                    {user.role || "Colaborador"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditOpen(true)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20"
            >
              Editar Perfil
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-4">
            Nenhum dado de usuário autenticado.
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};