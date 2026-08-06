import React, { useState } from "react";
import { useNavigate } from "react-router";
// Importa o hook customizado do contexto de autenticação para ter acesso aos métodos de API.
import { useAuth } from "./useAuth";

// Importa o utilitário de captura e formatação de mensagens de erro.
import { getErrorMessage } from "../utility/getErrorMessage";

/**
 * Custom Hook responsável por gerenciar toda a regra de negócio do formulário de login em 2 etapas.
 */
export function useLoginForm() {
  // Extrai os métodos assíncronos checkRegistration e signIn obtidos através do contexto global.
  const { checkRegistration, signIn } = useAuth();

  // Estado que controla o passo atual do fluxo (número 1 para matrícula ou 2 para palavra-passe).
  const [step, setStep] = useState<1 | 2>(1);
  
  // Estados para os campos de entrada de dados.
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // Hook do React Router para navegação programática.
  
  // Estado booleano que indica se o sistema está executando alguma chamada à API no momento.
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Função assíncrona responsável pela primeira etapa (verificação de matrícula).
   * Tipagem atualizada para React.FormEvent<HTMLFormElement> para resolver o alerta de 'deprecated'.
   */
  const handleCheckRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Se o campo de matrícula estiver vazio ou contiver apenas espaços em branco, cancela a execução.
    if (!registration.trim()) return;

    // Limpa qualquer erro anterior exibido na tela.
    setError("");
    // Ativa o estado de carregamento para desabilitar inputs e botões.
    setIsSubmitting(true);

    try {
      // Faz a chamada à API passando a matrícula fornecida.
      const data = await checkRegistration(registration);
      // Atualiza o estado com o nome do colaborador encontrado na resposta.
      setCollaboratorName(data.name);
      // Avança o fluxo do formulário para a etapa de palavra-passe.
      setStep(2);
    } catch (err: unknown) {
      // Captura o erro, extrai a mensagem e atualiza o estado de erro.
      setError(getErrorMessage(err, "Erro ao verificar matrícula."));
    } finally {
      // Garante que o estado de carregamento seja desativado ao encerrar o processo.
      setIsSubmitting(false);
    }
  };

  /**
   * Função assíncrona responsável pela segunda etapa (validação de palavra-passe e autenticação).
   * Tipagem atualizada para React.FormEvent<HTMLFormElement>.
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      // Dispara a tentativa de autenticação com o login e a palavra-passe informados.
      await signIn(registration, password);
      navigate("/dashboard"); // Redireciona para a página principal após login bem-sucedido.
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Palavra-passe incorreta ou erro ao entrar."));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Função utilitária que permite ao utilizador retroceder caso queira alterar a matrícula digitada.
   */
  const handleBackToStep1 = () => {
    // Define o passo atual de volta para a primeira etapa.
    setStep(1);
    // Limpa o campo de palavra-passe digitado por motivos de segurança.
    setPassword("");
    // Limpa os alertas de erro antigos da tela.
    setError("");
  };

  // Retorna todos os estados e manipuladores de eventos necessários para a tela de login.
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