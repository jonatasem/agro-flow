import { useState } from "react";
import { useAuth } from "./useAuth";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useLoginForm() {
  const { checkRegistration, signIn } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Etapa 1: Verificar se a matrícula existe
  const handleCheckRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration.trim()) return;

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

  // Etapa 2: Realizar a autenticação
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

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

  // Resetar para alterar a matrícula
  const handleBackToStep1 = () => {
    setStep(1);
    setPassword("");
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
