'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function LoginPage() {
  const { checkRegistration, signIn } = useAuth();
  const router = useRouter();

  // Estados locais do formulário de login
  const [step, setStep] = useState<1 | 2>(1); // 1: Matrícula | 2: Senha
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manipulador da Etapa 1: Validação da Matrícula
  const handleCheckRegistration = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!registration.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const data = await checkRegistration(registration.trim());
      setCollaboratorName(data.name);
      setStep(2); // Avança para a etapa de senha se a matrícula existir
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao verificar matrícula."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador da Etapa 2: Autenticação por Senha
  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      await signIn(registration.trim(), password);
      router.push("/dashboard"); // Redireciona para o painel principal após logar
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Senha incorreta ou erro ao entrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retorna para a etapa 1 caso o usuário queira trocar a matrícula
  const handleBackToStep1 = () => {
    setStep(1);
    setPassword("");
    setCollaboratorName("");
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-800 p-4">
      <div className="bg-white border border-slate-200 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-xl shadow-emerald-950/5">
        
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-600 text-white font-black text-2xl rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20">
            Z
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            AgroFlow
          </h1>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest">
            Gestão Operacional
          </p>
        </div>

        {/* Exibição de Alertas de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Formulário - Etapa 1: Inserir Matrícula */}
        {step === 1 ? (
          <form onSubmit={handleCheckRegistration} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="registration" className="text-xs text-slate-700 font-bold">
                Matrícula do Colaborador
              </label>
              <input
                id="registration"
                type="text"
                required
                autoFocus
                placeholder="Ex: 102030"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !registration.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Verificando..." : "Avançar"}
            </button>
          </form>
        ) : (
          /* Formulário - Etapa 2: Inserir Senha */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase">
                  Colaborador Identificado:
                </p>
                <p className="text-sm font-bold text-slate-800">{collaboratorName}</p>
              </div>
              <button
                type="button"
                onClick={handleBackToStep1}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
              >
                Trocar
              </button>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs text-slate-700 font-bold">
                Senha de Acesso
              </label>
              <input
                id="password"
                type="password"
                required
                autoFocus
                placeholder="Ex: 102030"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-600 focus:bg-white text-slate-800 disabled:opacity-50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Entrando..." : "Entrar no Sistema"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}