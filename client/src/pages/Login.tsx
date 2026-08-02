// Importa a biblioteca React para criar componentes e interfaces visuais.
import React from "react";

// Importa o hook personalizado useLoginForm que gerencia todo o estado e lógica desse formulário.
import { useLoginForm } from "../hooks/useLoginForm";

// Define e exporta o componente Login usando a tipagem Functional Component (FC) do React.
export const Login: React.FC = () => {
  // Desestrutura todas as variáveis e funções necessárias retornadas pelo hook de controle do formulário.
  const {
    step,                  // Indica a etapa atual do login (1 para matrícula, 2 para senha).
    registration,          // Guarda o texto digitado no campo de matrícula.
    setRegistration,       // Função para atualizar o estado da matrícula.
    password,              // Guarda o texto digitado no campo de senha.
    setPassword,           // Função para atualizar o estado da senha.
    collaboratorName,      // Nome do funcionário retornado pelo servidor após validar a matrícula.
    error,                 // Mensagem de erro caso aconteça alguma falha na autenticação.
    isSubmitting,          // Estado booleano que indica se há uma requisição sendo feita no momento.
    handleCheckRegistration, // Função disparada ao enviar o formulário da etapa 1.
    handleLogin,           // Função disparada ao enviar o formulário da etapa 2.
    handleBackToStep1,     // Função que permite ao usuário voltar e corrigir a matrícula digitada.
  } = useLoginForm();

  return (
    // Container principal ocupando a tela inteira, centralizando o card de login com fundo escuro.
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      {/* Card centralizado que agrupa todo o formulário de login com bordas e sombras suaves. */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl">
        
        {/* Cabeçalho do card contendo o nome do sistema (AgroFlow) e o subtítulo. */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-indigo-400">AgroFlow</h1>
          <p className="text-xs text-slate-400">Acesso ao Sistema</p>
        </div>

        {/* Renderização condicional: Exibe este bloco de alerta apenas se houver alguma mensagem de erro. */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Renderização condicional por etapas: Se 'step' for igual a 1, mostra o formulário de matrícula. */}
        {step === 1 ? (
          // Formulário da Etapa 1 - Validação da Matrícula.
          <form onSubmit={handleCheckRegistration} className="space-y-4">
            <div className="space-y-1">
              {/* Rótulo de acessibilidade vinculado ao campo de entrada. */}
              <label htmlFor="registration" className="text-xs text-slate-300 font-semibold">
                Matrícula
              </label>
              {/* Campo de texto para digitação da matrícula. */}
              <input
                id="registration"
                type="text"
                required
                autoFocus // Foca o cursor no campo automaticamente ao abrir a página.
                placeholder="Informe a sua matrícula"
                value={registration}
                // Atualiza o estado da matrícula a cada caractere digitado pelo usuário.
                onChange={(e) => setRegistration(e.target.value)}
                disabled={isSubmitting} // Desativa a edição enquanto envia os dados.
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white disabled:opacity-50"
              />
            </div>

            {/* Botão de envio da primeira etapa. */}
            <button
              type="submit"
              // Fica desativado se estiver carregando ou se o campo de matrícula contiver apenas espaços.
              disabled={isSubmitting || !registration.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Texto dinâmico que muda quando o formulário está processando. */}
              {isSubmitting ? "A verificar..." : "Avançar"}
            </button>
          </form>
        ) : (
          // Formulário da Etapa 2 - Inserção de senha (Exibido apenas quando step não for 1).
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Box informativo que exibe o nome do colaborador encontrado no banco de dados. */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400">Colaborador:</p>
                <p className="text-sm font-bold text-indigo-300">{collaboratorName}</p>
              </div>
              {/* Botão para voltar ao step 1 caso o usuário queira trocar a matrícula informada. */}
              <button
                type="button"
                onClick={handleBackToStep1}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Trocar
              </button>
            </div>

            <div className="space-y-1">
              {/* Rótulo de acessibilidade para o campo de senha. */}
              <label htmlFor="password" className="text-xs text-slate-300 font-semibold">
                Palavra-passe
              </label>
              {/* Campo para digitação oculta de senhas. */}
              <input
                id="password"
                type="password"
                required
                autoFocus // Foca o cursor automaticamente na senha assim que mudar de etapa.
                placeholder="Informe a sua palavra-passe"
                value={password}
                // Atualiza o estado da senha a cada caractere digitado.
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting} // Bloqueia digitação enquanto valida a senha.
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white disabled:opacity-50"
              />
            </div>

            {/* Botão final para submissão do login. */}
            <button
              type="submit"
              // Fica desativado se estiver enviando ou se o campo de senha estiver vazio.
              disabled={isSubmitting || !password.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Texto dinâmico que avisa o usuário do carregamento interno do login. */}
              {isSubmitting ? "A entrar..." : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
