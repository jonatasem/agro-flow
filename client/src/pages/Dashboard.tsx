import React from "react";
import { useAuth } from "../hooks/useAuth";

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <header className="max-w-4xl mx-auto flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">AgroFlow - Dashboard</h1>
          <p className="text-xs text-slate-400">
            Olá, <span className="font-semibold text-slate-200">{user?.name}</span> ({user?.role})
          </p>
        </div>

        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-xl transition-all"
        >
          Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-lg font-bold mb-2">Sessão Autenticada!</h2>
          <p className="text-sm text-slate-400">
            Token validado e configurado nas requisições.
          </p>
        </div>
      </main>
    </div>
  );
};