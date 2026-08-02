// Importa o tipo FormEvent do React para tipar corretamente os eventos de envio de formulário.
import { useState, type FormEvent } from "react";

// Importa o hook personalizado useAuth para acessar as funções globais de autenticação.
import { useAuth } from "./useAuth";

// Importa a função auxiliar para tratar e extrair mensagens de erro com segurança.
// Nota: Se o arquivo continuar com extensão .tsx na pasta utility, a importação continua funcionando normalmente.
import { getErrorMessage } from "../utility/getErrorMessage";

// Define e exporta a função do hook personalizado que encapsula a lógica do formulário de login.
export function useLoginForm() {
  // Extrai os métodos assíncronos checkRegistration e signIn obtidos através do contexto global.
  const { checkRegistration, signIn } = useAuth();

  // Estado que controla o passo atual do fluxo (número 1 para matrícula ou 2 para senha).
  const [step, setStep] = useState<1 | 2>(1);
  
  // Estado que armazena o texto digitado no campo de matrícula.
  const [registration, setRegistration] = useState("");
  
  // Estado que armazena o texto digitado no campo de senha (palavra-passe).
  const [password, setPassword] = useState("");
  
  // Estado que guarda o nome do colaborador retornado pela API após a validação da matrícula.
  const [collaboratorName, setCollaboratorName] = useState("");

  // Estado que armazena mensagens de erro para exibição na interface do usuário.
  const [error, setError] = useState("");
  
  // Estado booleano que indica se o sistema está executando alguma chamada à API no momento.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função assíncrona responsável por submeter a primeira etapa (verificação de matrícula).
  // CORREÇÃO: Alterado de React.FormEvent para FormEvent importado explicitamente.
  const handleCheckRegistration = async (e: FormEvent) => {
    // Impede o comportamento padrão do navegador de recarregar a página no envio do formulário.
    e.preventDefault();
    // Bloqueia a execução se a matrícula contiver apenas espaços em branco.
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
      // Garante que o estado de carregamento seja desativado ao encerrar o processo (sucesso ou falha).
      setIsSubmitting(false);
    }
  };

  // Função assíncrona responsável por submeter a segunda etapa (validação de senha).
  // CORREÇÃO: Alterado de React.FormEvent para FormEvent importado explicitamente.
  const handleLogin = async (e: FormEvent) => {
    // Impede o recarregamento automático da página ao enviar o formulário.
    e.preventDefault();
    // Interrompe o processo se o campo de senha estiver vazio.
    if (!password.trim()) return;

    // Reseta qualquer mensagem de erro visível.
    setError("");
    // Ativa o estado de carregamento do botão de envio final.
    setIsSubmitting(true);

    try {
      // Envia a matrícula e a senha informadas para realizar o login e obter o token.
      await signIn(registration, password);
    } catch (err: unknown) {
      // Atualiza o estado de erro caso as credenciais ou a requisição falhem.
      setError(getErrorMessage(err, "Senha incorreta ou erro ao entrar."));
    } finally {
      // Finaliza o carregamento da requisição limpando o indicador visual.
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

  // Retorna todos os estados e manipuladores de eventos necessários para o componente de visualização.
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
