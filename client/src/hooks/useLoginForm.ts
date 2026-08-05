import { useState, type SubmitEvent } from "react";
import { useAuth } from "./useAuth";
import { getErrorMessage } from "../utility/getErrorMessage";

export function useLoginForm() {
  // Extrai os métodos assíncronos checkRegistration e signIn obtidos através do contexto global.
  const { checkRegistration, signIn } = useAuth();

  // Estado que controla o passo atual do fluxo (número 1 para matrícula ou 2 para senha).
  const [step, setStep] = useState<1 | 2>(1);
  
  const [registration, setRegistration] = useState("");
  const [password, setPassword] = useState("");
  const [collaboratorName, setCollaboratorName] = useState("");
  const [error, setError] = useState("");
  
  // Estado booleano que indica se o sistema está executando alguma chamada à API no momento.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função assíncrona responsável pelaa primeira etapa (verificação de matrícula).
  const handleCheckRegistration = async (e: SubmitEvent) => {
    e.preventDefault();
    // Se o campo de matrícula estiver vazio ou contiver apenas espaços em branco, a função retorna imediatamente, evitando chamadas desnecessárias à API.
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
      // Avança o fluxo do formulário para o passo de senha.
      setStep(2);
    } catch (err: unknown) {
      // Captura o erro, extrai a mensagem e atualiza o estado de erro.
      setError(getErrorMessage(err, "Erro ao verificar matrícula."));
    } finally {
      // Garante que o estado de carregamento seja desativado ao encerrar o processo, independentemente do sucesso ou falha da requisição.
      setIsSubmitting(false);
    }
  };

  // Função assíncrona responsável pela segunda etapa (validação de senha).
  const handleLogin = async (e: SubmitEvent) => {
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

  // Função utilitária que permite ao usuário retroceder caso queira alterar a matrícula digitada.
  const handleBackToStep1 = () => {
    // Define o passo atual de volta para a primeira etapa.
    setStep(1);
    // Limpa o campo de senha digitado por motivos de segurança.
    setPassword("");
    // Limpa os alertas de erros antigos da tela.
    setError("");
  };

  // Retorna todos os estados e manipuladores de eventos do login
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
