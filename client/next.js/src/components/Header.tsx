'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface HeaderProps {
  user: {
    name: string;
    role: string;
    city: string;
  };
  handleCreateOpen: () => void;
  signOut: () => void;
  canCreate?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  handleCreateOpen,
  signOut,
  canCreate = true,
}) => {
  // Evita dessincronização de hidratação entre o servidor e o cliente
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-950/5">
      
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-600/25">
          Z
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            AgroFlow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sessão iniciada como:{" "}
            <span className="font-bold text-slate-700">
              {mounted ? user?.name : "A carregar..."}
            </span>{" "}
            •{" "}
            <span className="text-emerald-700 font-extrabold">
              {mounted ? user?.role : "A carregar..."}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {canCreate && (
          <button
            type="button"
            onClick={handleCreateOpen}
            className="flex-1 sm:flex-none px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nova O.S.
          </button>
        )}

        <Link
          href="/profile"
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 inline-block text-center"
        >
          Perfil
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
          title="Encerrar sessão"
        >
          Sair
        </button>
      </div>
    </header>
  );
};