// src/app/login/page.tsx
"use client";

import React from "react";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const {
    step,
    registration,
    setRegistration,
    password,
    setPassword,
    collaboratorName,
    error,
    isSubmitting,
    handleCheckRegistration,
    handleLogin,
    handleBackToStep1,
  } = useLoginForm();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 px-4 py-8">
      <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xs">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-emerald-600 text-white font-black text-xl rounded-xl mx-auto flex items-center justify-center">
            Z
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            AgroFlow
          </h1>
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Gestão Operacional
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckRegistration} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="registration"
                className="text-xs text-slate-700 font-bold"
              >
                Matrícula do Colaborador
              </label>
              <input
                id="registration"
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="Ex: 102030"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !registration.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Verificando..." : "Avançar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/70 flex justify-between items-center gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-emerald-800 uppercase">
                  Colaborador
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {collaboratorName}
                </p>
              </div>
              <button
                type="button"
                onClick={handleBackToStep1}
                className="text-xs text-emerald-700 hover:underline font-bold cursor-pointer shrink-0"
              >
                Trocar
              </button>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs text-slate-700 font-bold"
              >
                Senha de Acesso
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Entrando..." : "Entrar no Sistema"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}