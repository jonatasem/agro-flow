// Importa a biblioteca React e o hook useState para o gerenciamento de estados locais de busca, modal e edição.
import React, { useState } from "react";

// Importa o hook customizado responsável por centralizar as requisições assíncronas do módulo de colaboradores.
import { useCollaborator } from "../hooks/useCollaborator";

// Importa o componente modal encarregado tanto de realizar o cadastro quanto as atualizações do funcionário.
import { CreateCollaboratorModal } from "../components/CreateCollaboratorModal";

// Importa a tipagem estruturada de Colaborador do arquivo de serviços.
import { type Collaborator } from "../services/collaboratorService";

// Importa a função utilitária segura para tratamento e formatação de mensagens de erro da API.
import { getErrorMessage } from "../utility/getErrorMessage";

// Define a página utilizando a tipagem padrão Functional Component (FC) do ecossistema React.
export const CollaboratorsPage: React.FC = () => {
  // Desestrutura a lista de colaboradores, estados da requisição, atualização manual e o método de deleção do hook.
  const {
    collaborators,
    loading,
    error,
    refetch,
    deleteCollaborator,
  } = useCollaborator();

  // Estado local para capturar e gerenciar a string de texto digitada na barra de busca.
  const [search, setSearch] = useState("");
  
  // Estado booleano para gerenciar o fluxo de abertura e visibilidade visual do modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado que armazena temporariamente o objeto de um colaborador selecionado para o fluxo de alteração de dados.
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  
  // Estado utilitário que guarda o ID do item em processo de exclusão para controlar carregamentos individuais.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtra de forma dinâmica a lista de colaboradores aplicando varredura por nome, cargo ou matrícula.
  const filteredCollaborators = Array.isArray(collaborators)
    ? collaborators.filter((collab) => {
        // Normaliza o termo de busca em caixa baixa para uma comparação case-insensitive estável.
        const term = search.toLowerCase();
        
        // Verifica correspondências parciais nos campos de texto.
        const nameMatch = collab.name?.toLowerCase().includes(term);
        const roleMatch = collab.role?.toLowerCase().includes(term);
        
        // Verifica a matrícula de forma segura, retornando falso caso ela não esteja populada.
        const regMatch = collab.registration
          ? collab.registration.toLowerCase().includes(term)
          : false;

        // Retorna o item se houver correspondência com qualquer um dos três critérios mapeados.
        return nameMatch || roleMatch || regMatch;
      })
    : []; // Retorna uma lista vazia preventiva se a variável original não for uma estrutura de array válida.

    // Manipulador assíncrono responsável por solicitar a exclusão física do registro no back-end.
    const handleDelete = async (id: string, name: string) => {
      // Exibe uma caixa de confirmação nativa do navegador; se recusada, interrompe o fluxo imediatamente.
      if (!window.confirm(`Tem certeza que deseja excluir o colaborador "${name}"?`)) {
        return;
      }

      try {
        // Ativa o sinalizador visual de progresso de deleção exclusivamente para a linha/cartão do alvo.
        setDeletingId(id);
        // Dispara a chamada HTTP DELETE via hook customizado.
        await deleteCollaborator(id);
      } catch (err: unknown) {
        // Captura falhas ou negações do servidor e as exibe em formato de alerta na tela.
        alert(getErrorMessage(err, "Erro ao excluir colaborador."));
      } finally {
        // Remove a flag de carregamento da linha liberando os botões da interface.
        setDeletingId(null);
      }
    };

  // Manipulador acionado ao clicar em editar: popula o estado do colaborador alvo e abre a janela do modal.
  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator); // Define o objeto que preencherá previamente os inputs.
    setIsModalOpen(true);                 // Abre o modal.
  };

  // Reseta os estados locais de controle de alteração e fecha a janela do formulário de forma limpa.
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollaborator(null); // Limpa o estado para evitar vazamento de dados antigos em novas criações.
  };

  return (
    // Estrutura de layout externo da seção com regras de espaçamento em blocos verticais do Tailwind.
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção: Títulos e painel de ações alinhados de forma responsiva. */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Colaboradores</h1>
          <p className="text-xs text-slate-400">Técnicos, líderes e equipe cadastrada</p>
        </div>

        {/* Input de Busca Avançada, Sincronização de tabelas e Novo Registro de Usuário. */}
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome, cargo ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)} // Atualiza o estado a cada caractere informado.
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />
          {/* Sincroniza e força uma nova atualização de dados chamando o refetch da API. */}
          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl transition-colors"
            title="Atualizar"
          >
            🔄
          </button>
          {/* Botão de criação: Garante que os dados de edição antigos estejam limpos e exibe o modal vazio. */}
          <button
            onClick={() => {
              setEditingCollaborator(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Colaborador
          </button>
        </div>
      </div>

      {/* Alerta de Erro de Conexão: Renderizado sob curto-circuito apenas caso existam mensagens de falha. */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {typeof error === "string" ? error : "Erro ao carregar colaboradores."}
        </div>
      )}

      {/* Bloco de Controle de Estados Visuais de Renderização da Árvore de Componentes. */}
      {loading ? (
        // Estado 1: Buscando a listagem inicial no back-end (Animação Pulse).
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando colaboradores...
        </div>
      ) : filteredCollaborators.length === 0 ? (
        // Estado 2: Concluído com sucesso, porém o array filtrado retornou vazio.
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum colaborador encontrado.
        </div>
      ) : (
        // Estado 3: Lista validada e populada. Renderiza o layout em formato de Grid com duas colunas.
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapeia a estrutura tratada de dados para desenhar os cartões individuais na tela. */}
          {filteredCollaborators.map((c) => (
            <div
              key={c.id} // Identificador único essencial exigido pelo algoritmo de reconciliação do React.
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 hover:border-slate-700 transition-colors shadow-lg"
            >
              {/* Linha Superior do Cartão: Nome, Cargo e Ações Rápidas (CRUD). */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{c.name}</h3>
                  <span className="text-xs text-indigo-300 font-medium">{c.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Tag mono descritiva para exibição da matrícula de acesso. */}
                  {c.registration && (
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      Matrícula: {c.registration}
                    </span>
                  )}
                  {/* Botão de Edição individual de linha. */}
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1 text-slate-400 hover:text-indigo-400 text-xs transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  {/* Botão de Exclusão individual de linha com controle de carregamento interno. */}
                  {/* Botão de Exclusão individual de linha com controle de carregamento interno. */}
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id} // Bloqueia cliques secundários se a linha atual já estiver em processo de exclusão.
                    className="p-1 text-slate-400 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {/* Altera o ícone visual para ampulheta enquanto aguarda a confirmação da promessa HTTP da API. */}
                    {deletingId === c.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>

              {/* Rodapé Interno do Cartão: Dados geográficos de base e Badge Dinâmica de Status. */}
              <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>📍 {c.city || "Localidade não informada"}</span>
                {/* Atribui classes visuais verdes e bordas suaves se ativo, ou tons vermelhos se o status for explicitamente inativo. */}
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    c.status !== false
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                      : "bg-red-950 text-red-400 border border-red-800/40"
                  }`}
                >
                  {c.status !== false ? "ATIVO" : "INATIVO"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Componente Modal: Acoplado de forma abstrata fora do fluxo, recebendo os estados e dados locais de inicialização. */}
      <CreateCollaboratorModal
        isOpen={isModalOpen} // Vincula a visibilidade ao estado booleano local da página.
        onClose={handleCloseModal} // Vincula a rotina de encerramento seguro limpando os estados de edição.
        onSuccess={refetch} // Se uma modificação/criação for executada com sucesso, atualiza o grid de forma automatizada.
        initialData={editingCollaborator} // Transmite o objeto preenchido em caso de fluxo de edição, ou nulo para novas criações.
      />
    </div>
  );
};


