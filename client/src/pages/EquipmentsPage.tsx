// Importa a biblioteca React e o hook useState para o controle local de busca e exibição do modal.
import React, { useState } from "react";

// Importa o hook customizado responsável por gerenciar os estados e buscar frotas de equipamentos.
import { useEquipments } from "../hooks/useEquipment";

// Importa o componente modal encarregado de realizar o cadastro de novos maquinários.
import { CreateEquipmentModal } from "../components/CreateEquipmentModal";

// Define a página utilizando o tipo Functional Component (FC) padrão do ecossistema React.
export const EquipmentsPage: React.FC = () => {
  // Desestrutura os dados da frota, indicadores de carregamento/erro e a função de atualização manual (refetch).
  const { equipments, loading, error, refetch } = useEquipments();
  
  // Estado local que armazena a string digitada pelo usuário na barra de pesquisa.
  const [search, setSearch] = useState("");
  
  // Estado booleano utilitário para controlar o fluxo de abertura (true) e fechamento (false) do modal.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Aplica um filtro reativo em tempo real na lista de equipamentos com tratamento defensivo de tipo.
  const filtered = Array.isArray(equipments)
    ? equipments.filter((eq) => {
        // Converte o termo pesquisado para letras minúsculas para uma comparação case-insensitive.
        const term = search.toLowerCase();
        // Retorna verdadeiro se o termo coincidir parcialmente com o nome OU com o prefixo da frota.
        return (
          eq.name?.toLowerCase().includes(term) ||
          eq.fleet?.toLowerCase().includes(term)
        );
      })
    : []; // Retorna um array vazio por segurança se 'equipments' não for uma estrutura de lista válida.

  return (
    // Estrutura principal da seção com espaçamento vertical padronizado do Tailwind.
    <div className="space-y-6">
      
      {/* Cabeçalho de Seção: Responsivo, organiza os títulos alinhados à esquerda e ações à direita. */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">Equipamentos</h1>
          <p className="text-xs text-slate-400">Frota cadastrada no AgroFlow</p>
        </div>

        {/* Agrupamento da Barra de Ações: Caixa de Busca, Sincronização e Abertura do Modal. */}
        <div className="flex gap-2 w-full md:w-auto">
          {/* Input controlado conectado diretamente ao estado local de pesquisa. */}
          <input
            type="text"
            placeholder="Buscar por nome ou frota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)} // Captura o valor de digitação a cada caractere informado.
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />
          
          {/* Botão para forçar uma nova consulta HTTP à API e recarregar os dados na tela. */}
          <button
            onClick={refetch}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 rounded-xl"
            title="Atualizar"
          >
            🔄
          </button>
          
          {/* Botão principal que altera o estado local para exibir a janela do modal. */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap"
          >
            + Equipamento
          </button>
        </div>
      </div>

      {/* Box Informativo de Erro: Renderizado sob curto-circuito condicional apenas se houver falhas de rede. */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
          {/* Faz uma verificação de tipo simples para garantir uma exibição de string limpa. */}
          {typeof error === "string" ? error : "Erro ao carregar dados."}
        </div>
      )}

      {/* Gerenciador Condicional de Estados de Tela: Carregando, Lista Vazia ou Listagem em Grid. */}
      {loading ? (
        // Estado 1: Efetuando busca assíncrona de dados (com efeito pulse do Tailwind).
        <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
          Carregando equipamentos...
        </div>
      ) : filtered.length === 0 ? (
        // Estado 2: Concluído sem registros encontrados com base nos filtros informados.
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
          Nenhum equipamento encontrado.
        </div>
      ) : (
        // Estado 3: Lista validada e preenchida. Renderiza cartões em grid responsivo de duas colunas.
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mapeia a estrutura tratada gerando cartões individuais. */}
          {filtered.map((item) => (
            <div
              key={item.id} // Chave de reconciliação de performance obrigatória exigida pelo React.
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors shadow-lg"
            >
              {/* Informações estruturadas: Badge do Prefixo da Frota e Nome/Modelo do Maquinário. */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded font-bold">
                  FROTA #{item.fleet}
                </span>
                <h3 className="font-bold text-slate-100 text-sm">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Componente Modal: Posicionado abstratamente fora do fluxo linear, acionado pelo estado da página. */}
      <CreateEquipmentModal
        isOpen={isModalOpen} // Passa o booleano de visibilidade controlado localmente.
        onClose={() => setIsModalOpen(false)} // Callback repassado para fechar o modal alterando para falso.
        onSuccess={refetch} // Executa o recarregamento instantâneo da listagem após salvar um novo item.
      />
    </div>
  );
};
