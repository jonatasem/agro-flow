import React, { useState } from "react";
import { useNavigate } from "react-router";

// Hooks da aplicação
import { useAuth } from "./useAuth";

// Utilitários
import { getErrorMessage } from "../utils/getErrorMessage";

// Hook customizado para gerenciamento do fluxo do formulário de login em duas etapas
export function useLoginForm() {
  const { checkRegistration, signIn } = useAuth();
  const navigate = useNavigate();

  // Estados locais do formulário
  const [step, setStep] = useState<1 | 2>(1);
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Etapa 1: Validação e verificação da matrícula do colaborador
  const handleCheckRegistration = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!registration.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const data = await checkRegistration(registration.trim());
      setCollaboratorName(data.name);
      setStep(2);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Erro ao verificar matrícula."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Etapa 2: Autenticação com senha de acesso
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      await signIn(registration.trim(), password);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Senha incorreta ou erro ao entrar.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retorno para a primeira etapa do formulário
  const handleBackToStep1 = () => {
    setStep(1);
    setPassword("");
    setCollaboratorName("");
    setError("");
  };

  return {
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
  };
}