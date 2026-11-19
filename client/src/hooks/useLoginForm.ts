import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { getErrorMessage } from "@/utils/getErrorMessage";

// Gerir o fluxo do formulário de login em duas etapas.
export function useLoginForm() {
  const { checkRegistration, signIn } = useAuth();
  const router = useRouter();

  // Estados locais
  const [step, setStep] = useState<1 | 2>(1);
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Etapa 1: Validação e verificação da matrícula
  const handleCheckRegistration = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

  // Etapa 2: Autenticação com senha
  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      await signIn(registration.trim(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Senha incorreta ou erro ao entrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retorna para a primeira etapa do formulário
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