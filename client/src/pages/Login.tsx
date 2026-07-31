import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../utility/getErrorMessage";

export const Login: React.FC = () => {
  const { checkRegistration, signIn } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check registration
  const handleCheckRegistration = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await checkRegistration(registration);
      setCollaboratorName(data.name);
      setStep(2);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao verificar matrícula."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login
  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(registration, password);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Senha incorreta ou erro ao entrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-indigo-400">AgroFlow</h1>
          <p className="text-xs text-slate-400">Acesso ao Sistema</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckRegistration} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="registration" className="text-xs text-slate-300 font-semibold">
                Matrícula
              </label>
              <input
                id="registration"
                type="text"
                required
                placeholder="Informe sua matrícula"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Verificando..." : "Avançar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Colaborador:</p>
                <p className="text-sm font-bold text-indigo-300">{collaboratorName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPassword("");
                }}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Trocar
              </button>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs text-slate-300 font-semibold">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="Informe sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
