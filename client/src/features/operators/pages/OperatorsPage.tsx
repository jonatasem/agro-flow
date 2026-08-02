// Importa o React e o hook useState para gerenciar o estado da busca local e a abertura do modal.
import React, { useState } from "react";

// Importa o hook customizado que centraliza as chamadas e estados do módulo de operadores.
// Nota técnica: Certifique-se de que o nome do arquivo seja exatamente 'useOperator' ou 'useOperators' para evitar erros de importação.
import { useOperators } from "../hooks/useOperator";

// Importa o componente do modal responsável por cadastrar os novos operadores no sistema.
import { CreateOperatorModal } from "../components/CreateOperatorModal";

/**
 * Componente de página para visualização, busca e cadastro de Operadores
 */
export const OperatorsPage: React.FC = () => {
  // Desestrutura os dados, estados de carregamento/erro e a função de atualização vindos do hook customizado.
  const { operators, loading, error, refetch } = useOperators();
  
  // Estado local para capturar e armazenar o texto digitado pelo usuário na barra de busca.
  const [search, setSearch] = useState("");
  
  // Estado booleano para gerenciar se o modal de cadastro está aberto (true) ou fechado (false).
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtra de forma dinâmica os operadores pelo nome ou pela matrícula em tempo real.
  const filteredOperators = (operators || []).filter((op) => {
    // Transforma o termo de pesquisa em letras minúsculas para uma busca case-insensitive (sem diferenciar maiúsculas).
    const term = search.toLowerCase();
    
    // Verifica de forma segura se o nome do operador contém o termo digitado.
    const nameMatch = op.name ? op.name.toLowerCase().includes(term) : false;
    
    // Verifica de forma segura se a matrícula do operador contém o termo digitado.
    const regMatch = op.registration ? op.registration.toLowerCase().includes(term) : false;

    // Retorna verdadeiro se o termo coincidir com o nome OU com a matrícula.
    return nameMatch || regMatch;
  });

  return (
    // Container externo da listagem com espaçamento vertical flexível usando Tailwind.
    <div className="space-y-6">
      
      {/* Cabeçalho da Seção: Título descritivo e alinhamento responsivo para dispositivos móveis e desktop. */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Operadores</h1>
          <p className="text-xs text-slate-400">
            Operadores de tratores, colhedoras e frotas agrícolas
          </p>
        </div>

        {/* Barra de Ações agrupada: Input de Busca, Botão de Sincronização e Botão de Criação. */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          {/* Campo de texto de busca integrado ao estado local. */}
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={search}
            // Atualiza o estado da busca a cada caractere digitado pelo usuário.
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />

          {/* Botão rápido para re-executar a consulta de dados diretamente na API (Refetch). */}
          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl transition-colors"
            title="Atualizar lista"
          >
            🔄
          </button>

          {/* Botão de ação principal que altera o estado local para exibir o modal de cadastro. */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Novo Operador
          </button>
        </div>
      </div>

      {/* Renderização condicional de Alerta: Exibido em tela se o hook retornar alguma mensagem de erro. */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Bloco Condicional de Conteúdo: Controla as telas de carregamento, lista vazia ou exibição do grid. */}
      {loading ? (
        // Estado 1: Buscando registros de operadores no banco de dados.
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando operadores...
        </div>
      ) : filteredOperators.length === 0 ? (
        // Estado 2: Terminou de carregar, mas a busca ou o banco não retornaram registros.
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum operador encontrado.
        </div>
      ) : (
        // Estado 3: Lista preenchida com sucesso. Renderiza o layout em formato de Grid com duas colunas no desktop.
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapeia o array filtrado para desenhar os cartões na tela. */}
          {filteredOperators.map((op) => (
            <div
              key={op.id} // Atribui o ID único do operador como chave do React para performance de renderização.
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              {/* Lado esquerdo do cartão: Nome e localidade física. */}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-100 text-sm">{op.name}</h3>
                <span className="text-xs text-slate-400 block">
                  📍 {op.city || "Localidade não informada"}
                </span>
              </div>

              {/* Lado direito do cartão: Badge estilizado contendo a matrícula. */}
              <div className="text-right space-y-1">
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/40 px-2.5 py-1 rounded-lg font-bold inline-block">
                  Matrícula: {op.registration || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Componente de Modal: Posicionado fora do fluxo visual comum, controlado pelos estados locais da página. */}
      <CreateOperatorModal
        isOpen={isModalOpen} // Passa o estado de visibilidade.
        onClose={() => setIsModalOpen(false)} // Passa a função que fecha o modal alterando o estado para false.
        onSuccess={refetch} // Passa o método refetch para recarregar a lista automaticamente após um cadastro bem-sucedido.
      />
    </div>
  );
};
