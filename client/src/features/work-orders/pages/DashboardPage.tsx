// Importa o React e o hook useState para controle de estados locais do componente.
import React, { useState } from "react";

// Importa o hook de autenticação para ter acesso aos dados do usuário e função de logout.
import { useAuth } from "../../../hooks/useAuth";

// Importa o hook customizado que centraliza a busca e estados das ordens de serviço.
import { useWorkOrders } from "../hooks/useWorkOrders";

// Importa o modal utilizado tanto para criação quanto para edição de ordens de serviço.
import { CreateWorkOrderModal } from "../components/CreateWorkOrderModal";

// Importa o componente visual de cartão de exibição individual para cada Ordem de Serviço.
import { WorkOrderCard } from "../components/WorkOrderCard";

// Importa as subpáginas/abas que serão renderizadas dinamicamente de outros módulos.
import { EquipmentsPage } from "../../equipments/pages/EquipmentsPage";
import { CollaboratorsPage } from "../../collaborators/pages/CollaboratorsPage";
import { OperatorsPage } from "../../operators/pages/OperatorsPage";

// Importa o serviço que lida com requisições diretas de OS e o seu formato de tipo.
import { workOrderService, type WorkOrder } from "../services/workOrderService";

// Define um tipo estrito de união literal contendo as únicas abas válidas para a navegação.
type TabType = "work-orders" | "equipments" | "operators" | "collaborators";

/**
 * Painel Principal com Navegação por Abas (Tabs) e Gestão de O.S. (CRUD)
 */
export const DashboardPage: React.FC = () => {
  // Extrai as informações do usuário atualizado e a rotina de deslogar do hook useAuth.
  const { user, signOut } = useAuth();
  
  // Extrai a lista de OS, estados de requisição e a função refetch para atualizar a listagem.
  const { workOrders, loading, error, refetch } = useWorkOrders();
  
  // Estado que armazena qual aba de navegação está selecionada no momento (Padrão: "work-orders").
  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  
  // Estado booleano para controlar a visibilidade de exibição (abrir/fechar) do Modal.
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado que guarda a OS selecionada para edição (se nulo, significa que o modal criará uma nova).
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Manipulador disparado ao clicar em criar nova OS: limpa dados antigos e abre o modal.
  const handleCreateOpen = () => {
    setSelectedOrder(null); // Define como nulo para indicar fluxo de criação.
    setIsModalOpen(true);    // Abre o modal na interface.
  };

  // Manipulador disparado ao clicar em editar: popula a OS selecionada e abre o modal.
  const handleEditOpen = (order: WorkOrder) => {
    setSelectedOrder(order); // Define a OS alvo que preencherá o formulário do modal.
    setIsModalOpen(true);     // Abre o modal na interface.
  };

  // Manipulador assíncrono responsável por solicitar a exclusão de uma OS com base no ID.
  const handleDelete = async (id: string) => {
    // Exibe uma caixa de confirmação nativa do navegador; se recusado, interrompe a execução.
    if (!window.confirm("Deseja realmente remover esta Ordem de Serviço?")) return;
    try {
      // Executa a chamada HTTP DELETE para remover o registro no back-end.
      await workOrderService.delete(id);
      // Recarrega a lista de Ordens de Serviço em tela para refletir a exclusão.
      refetch();
    } catch (err: unknown) {
      // Exibe um alerta visual simples caso ocorra algum erro no processo de deleção.
      alert(err || "Erro ao remover Ordem de Serviço.");
    }
  };

  return (
    // Estrutura principal da página com estilo de espaçamento e fundo escuro.
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6">
      
      {/* Cabeçalho da aplicação contendo título, informações de sessão e botões de ação. */}
      <header className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">AgroFlow</h1>
          <p className="text-xs text-slate-400">
            Sessão iniciada como:{" "}
            {/* Exibe dinamicamente o nome e cargo obtidos do contexto de autenticação. */}
            <span className="font-semibold text-slate-200">{user?.name}</span> ({user?.role})
          </p>
        </div>

        <div className="flex gap-2">
          {/* Botão que aciona a abertura do formulário de novas Ordens de Serviço. */}
          <button
            onClick={handleCreateOpen}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            + Nova O.S.
          </button>
          {/* Botão que aciona o método de encerramento da sessão activa. */}
          <button
            onClick={signOut}
            className="px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Menu de navegação superior baseado em Abas com rolagem horizontal automática caso falte espaço. */}
      <nav className="max-w-5xl mx-auto flex gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {/* Aba de Ordens de Serviço - Liberada para todos */}
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "work-orders"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Ordens de Serviço
        </button>
        
        {/* Aba de Equipamentos - Liberada para todos */}
        <button
          onClick={() => setActiveTab("equipments")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "equipments"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Equipamentos
        </button>
        
        {/* Aba de Operadores - Oculta visualmente se o usuário for um TECNICO */}
        {user?.role !== "TECNICO" && (
          <button
            onClick={() => setActiveTab("operators")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "operators"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Operadores
          </button>
        )}
        
        {/* Aba de Colaboradores - Exclusiva apenas para administradores (ADMIN) */}
        {user?.role === "ADMIN" && (
          <button
            onClick={() => setActiveTab("collaborators")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "collaborators"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Colaboradores
          </button>
        )}
      </nav>

      {/* Bloco de renderização de conteúdo principal que varia de acordo com a aba activa. */}
      <main className="max-w-5xl mx-auto space-y-4">
        {/* Renderiza a sub-visão de OS apenas se activeTab for igual a "work-orders" */}
        {activeTab === "work-orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Ordens de Serviço Ativas
              </h2>
              {/* Permite recarregar manualmente a lista sem recarregar a página inteira. */}
              <button
                onClick={refetch}
                className="text-xs text-indigo-400 hover:underline"
              >
                Atualizar
              </button>
            </div>

            {/* Exibe o box de mensagem de erro caso falte conexão ou ocorra falha na requisição de dados. */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Renderizações condicionais para a lista de OS baseadas em carregamento e volume de dados. */}
            {loading ? (
              // Estado 1: Carregando dados da API.
              <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
                A carregar Ordens de Serviço...
              </div>
            ) : workOrders.length === 0 ? (
              // Estado 2: Requisição finalizada, mas nenhuma ordem retornou do banco.
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
                Nenhuma Ordem de Serviço encontrada.
              </div>
            ) : (
              // Estado 3: Lista preenchida, renderiza os cartões mapeando o array de dados.
              <div className="grid gap-4">
                {workOrders.map((order) => (
                  <WorkOrderCard 
                    key={order.id} // Chave única exigida pelo React para controle de reconciliação.
                    order={order}  // Injeta os dados da respectiva ordem no cartão.
                    onEdit={() => handleEditOpen(order)} // Passa a ação para disparar a edição.
                    onDelete={() => handleDelete(order.id)} // Passa a ação para disparar a exclusão.
                    onRefresh={refetch} // 🚀 CORREÇÃO: Passa o método refetch para sanar o erro ts(2741) e atualizar a tela em tempo real.
                  />
                ))}
              </div>
            )}
          </div>
        )}
        {/* Renderizações dinâmicas das abas de páginas completas baseadas em curto-circuito condicional. */}
        {activeTab === "equipments" && <EquipmentsPage />}
        
        {/* Proteção secundária no DOM: Só renderiza as páginas se o usuário atual possuir o cargo elegível */}
        {activeTab === "operators" && user?.role !== "TECNICO" && <OperatorsPage />}
        {activeTab === "collaborators" && user?.role === "ADMIN" && <CollaboratorsPage />}
      </main>

      {/* Componente de Modal gerenciável posicionado fora do fluxo linear comum de layout. */}
      <CreateWorkOrderModal
        isOpen={isModalOpen} // Vincula a visibilidade ao estado local do dashboard.
        onClose={() => {
          setIsModalOpen(false);   // Fecha o modal.
          setSelectedOrder(null);  // Reseta qualquer estado de edição pendente.
        }}
        onSuccess={refetch} // Caso salve uma modificação/criação, atualiza a lista automaticamente.
        initialData={selectedOrder} // Envia dados preenchidos se for edição, ou nulo se for criação.
      />
    </div>
  );
};
