// Importa a biblioteca React e o hook useState para gerenciar os estados locais do formulário.
import React, { useState } from "react";

// Importa a instância global do Axios configurada com a URL base e interceptores.
import { api } from "../../../services/api";

// Importa o utilitário seguro para tratamento e formatação de mensagens de erro da API.
import { getErrorMessage } from "../../../utility/getErrorMessage";

// Importa a tipagem estruturada de Colaborador do arquivo de serviços.
import type { Collaborator } from "../services/collaboratorService";

// Define a interface TypeScript especificando as propriedades recebidas do componente pai.
interface ModalProps {
  isOpen: boolean;                // Controla se a janela do modal está aberta ou invisível.
  onClose: () => void;            // Função callback disparada para fechar o modal.
  onSuccess: () => void;          // Função callback para atualizar a listagem após salvar dados.
  initialData?: Collaborator | null; // Objeto opcional com dados do colaborador para o fluxo de edição.
}

// Define e exporta o componente utilizando a tipagem padrão Functional Component (FC) do React.
export const CreateCollaboratorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData, // CORREÇÃO: Injetado corretamente no escopo destructured do componente.
}) => {
  // CORREÇÃO: Inicialização estável dos estados com funções anônimas (lazy initialization).
  // Isso carrega os dados do colaborador na edição e evita erros de re-renderização em cascata.
  const [name, setName] = useState(() => initialData?.name || "");
  const [registration, setRegistration] = useState(() => initialData?.registration || "");
  const [password, setPassword] = useState(""); // Senha inicia vazia por segurança.
  const [role, setRole] = useState(() => initialData?.role || "TECNICO");
  const [city, setCity] = useState(() => initialData?.city || "");
  
  // Estados utilitários para gerenciar o andamento assíncrono do envio (loading) e alertas de erro.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Curto-circuito protetor: se o estado 'isOpen' for falso, remove completamente o modal da árvore do DOM.
  if (!isOpen) return null;

  // Manipulador assíncrono responsável por processar e submeter o formulário (Criação e Edição unificadas).
  const handleSubmit = async (e: React.FormEvent) => {
    // Intercepta e impede o comportamento padrão do navegador de recarregar a tela inteira.
    e.preventDefault();
    
    // Validação de segurança: barra o envio se campos essenciais contiverem apenas espaços vazios.
    // Nota: No fluxo de edição, a senha deixa de ser obrigatória caso o usuário queira manter a antiga.
    if (!name.trim() || !registration.trim() || (!initialData && !password.trim())) return;

    try {
      // Ativa o estado de carregamento e limpa traços de mensagens de erro antigas da interface.
      setLoading(true);
      setError("");

      // Monta o payload básico estruturado com os dados dos inputs locais.
      const payload: Record<string, string> = {
        name,
        registration,
        role,
        city,
      };

      // Inclui a senha no payload apenas se ela foi digitada (obrigatório em cadastro, opcional em alteração).
      if (password.trim()) {
        payload.password = password;
      }

      // CORREÇÃO: Condicional dinâmico que verifica a existência de ID para decidir a rota e o verbo HTTP.
      if (initialData?.id) {
        // Fluxo de Edição: faz uma chamada HTTP PUT enviando as alterações para a rota com ID específico.
        await api.put(`/collaborator/${initialData.id}`, payload);
      } else {
        // Fluxo de Criação: faz uma chamada HTTP POST criando um novo colaborador do zero.
        await api.post("/collaborator", payload);
      }

      // Reseta todos os campos locais do formulário de volta para o estado inicial neutro.
      setName("");
      setRegistration("");
      setPassword("");
      setRole("TECNICO");
      setCity("");
      
      // Notifica a página pai sobre o sucesso do salvamento para recarregar a lista e fecha a janela.
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // Captura falhas na requisição HTTP e exibe uma mensagem tratada e amigável em tela.
      setError(getErrorMessage(err, "Erro ao salvar dados do colaborador. Verifique as informações."));
    } finally {
      // Garante a desativação do indicador visual de processamento de dados (sucesso ou falha na API).
      setLoading(false);
    }
  };

  return (
    // Telhado/Overlay de fundo escuro fixado cobrindo toda a tela para focar a atenção do usuário no modal.
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      {/* Caixa/Card principal do formulário com bordas arredondadas e sombra pesada de sobreposição. */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
        
        {/* Barra superior contendo o título dinâmico e o botão rápido de fechar (X). */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100">
            {/* CORREÇÃO: Altera o título de forma reativa baseando-se no contexto de criação ou alteração. */}
            {initialData ? "Editar Colaborador" : "Novo Colaborador"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Bloco de alerta visual para mensagens de erro, renderizado sob curto-circuito condicional. */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Início do Formulário de Cadastro / Edição. */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo 1: Nome Completo do Colaborador. */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Nome Completo</label>
            <input
              type="text"
              required // Ativa a validação nativa de preenchimento obrigatório pelo navegador.
              placeholder="Ex: Fernando Souza"
              value={name}
              onChange={(e) => setName(e.target.value)} // Sincroniza a digitação do usuário com o estado local.
              disabled={loading} // Bloqueia edições enquanto os dados estão trafegando na API.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Divisor em Grid contendo duas colunas lado a lado para Matrícula e Cargo/Função. */}
          <div className="grid grid-cols-2 gap-2">
            {/* Campo 2: Código de Matrícula (ID Funcional). */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Matrícula</label>
              <input
                type="text"
                required
                placeholder="Ex: 1024"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Campo 3: Caixa de Seleção Dinâmica (Select) para Cargo ou Alocação de Nível. */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Cargo / Função</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="TECNICO">Técnico</option>
                <option value="LIDER">Líder</option>
                <option value="COA">COA</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          {/* Campo 4: Senha de Acesso para o Sistema. */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">
              {/* CORREÇÃO: Ajusta a legenda para indicar que a alteração da senha é opcional na edição. */}
              {initialData ? "Nova Senha (Opcional)" : "Senha de Acesso"}
            </label>
            <input
              type="password" // Oculta visualmente os caracteres digitados por motivos de privacidade.
              required={!initialData} // CORREÇÃO: Torna a senha obrigatória apenas no cadastro.
              placeholder={initialData ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

{/* Campo 5: Cidade / Base Operacional (Opcional). */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Cidade / Base</label>
            <input
              type="text"
              placeholder="Ex: Sertãozinho - SP"
              value={city}
              // Atualiza o estado da cidade a cada caractere digitado pelo usuário.
              onChange={(e) => setCity(e.target.value)}
              disabled={loading} // Bloqueia a edição do campo se o formulário estiver salvando dados.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Seção inferior contendo o alinhamento dos botões de ação final do formulário. */}
          <div className="flex justify-end gap-2 pt-2">
            {/* Botão de Cancelar: aborta a operação corrente e fecha a janela. */}
            <button
              type="button"
              onClick={onClose} // Dispara a rotina de encerramento seguro definida no componente pai.
              disabled={loading} // Desativa o botão se a requisição HTTP estiver em andamento.
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
            >
              Cancelar
            </button>
            
            {/* Botão de Envio: submete todos os dados inseridos para criação ou edição. */}
            <button
              type="submit"
              disabled={loading} // Evita envios duplicados desativando o clique durante o processamento.
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all"
            >
              {/* Exibe dinamicamente o status textual com base no carregamento e no modo (edição ou criação). */}
              {loading ? "Salvando..." : initialData ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};