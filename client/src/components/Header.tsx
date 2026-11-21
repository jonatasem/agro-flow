"use client";

import React, { useSyncExternalStore } from "react";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/utils/permission";

interface HeaderUser {
  name?: string;
  role?: string;
  city?: string;
}

interface HeaderProps {
  user: HeaderUser | null;
  onCreateOpen: () => void;
  onSignOut: () => void;
}

const emptySubscribe = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Header({ user, onCreateOpen, onSignOut }: HeaderProps) {
  const isClient = useIsClient();
  const { hasPermission } = usePermission();

  const canCreate = isClient && hasPermission(PERMISSIONS.WORK_ORDER_CREATE);
  const displayName = isClient ? user?.name || "Colaborador" : "Carregando...";
  const displayRole = isClient ? user?.role || "Sem perfil" : "...";

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3.5 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-xs">
            Z
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                AgroFlow
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {displayRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              Operador:{" "}
              <span className="font-semibold text-slate-700">{displayName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canCreate && (
            <button
              type="button"
              onClick={onCreateOpen}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+ Nova O.S.</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-2 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors border border-slate-200 cursor-pointer shrink-0"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}