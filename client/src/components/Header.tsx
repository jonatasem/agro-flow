import React from "react";
import { Link } from "react-router";

interface HeaderProps {
  user: {
    name?: string;
    role?: string;
    city?: string;
  } | null;
  handleCreateOpen: () => void;
  signOut: () => void;
  canCreate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  handleCreateOpen, 
  signOut,
  canCreate = true 
}) => {
  return (
    <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-600/20">
          Z
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AgroFlow</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Logado como: <span className="font-semibold text-slate-700">{user?.name || "Operador"}</span> •{" "}
            <span className="text-emerald-700 font-medium">{user?.role || "Técnico"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {canCreate && (
          <button
            onClick={handleCreateOpen}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/15 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nova O.S.
          </button>
        )}

        <Link
          to="/profile"
          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 inline-block text-center"
        >
          Perfil
        </Link>

        <button
          onClick={signOut}
          className="px-3.5 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-200"
          title="Encerrar sessão"
        >
          Sair
        </button>
      </div>
    </header>
  );
};