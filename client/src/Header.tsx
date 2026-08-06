import React from "react";
import { Link } from "react-router";

interface HeaderProps {
  user: {
    name?: string;
    role?: string;
  } | null;
  handleCreateOpen: () => void;
  signOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, handleCreateOpen, signOut }) => {
  return (
    <header className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-indigo-400">AgroFlow</h1>
        <p className="text-xs text-slate-400">
          Sessão iniciada como:{" "}
          <span className="font-semibold text-slate-200">{user?.name}</span> - {user?.role}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateOpen}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          + Nova O.S.
        </button>

        <Link
          to="/profile"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 inline-block"
        >
          Perfil
        </Link>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
        >
          Sair
        </button>
      </div>
    </header>
  );
};
