import React, { useState } from "react";
import { useNavigate } from "react-router";
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

  const navigate = useNavigate();

  const handleCheckRegistration = async (e: React.SubmitEvent<HTMLFormElement>) => {
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

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      await signIn(registration, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Palavra-passe incorreta ou erro ao entrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

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