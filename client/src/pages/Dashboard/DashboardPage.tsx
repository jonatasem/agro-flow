import React, { useState } from "react";

// Hooks
import { useAuth } from "../../hooks/useAuth";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { useHistory } from "../../hooks/useHistory";
import { usePermission } from "../../hooks/usePermission";

// Utilitários e Permissões
import { PERMISSIONS } from "../../utils/permission";

// Componentes Globais e Modais
import { Header } from "../../components/Header";
import { CreateWorkOrderModal } from "../../components/workOrder/CreateWorkOrderModal";

// Subpáginas da Aba de Navegação
import { ActiveWorkOrdersPage } from "../WorkOrders/ActiveWorkOrdersPage";
import { HistoryPage } from "../History/HistoryPage";
import { EquipmentsPage } from "../Equipments/EquipmentsPage";
import { OperatorsPage } from "../Operators/OperatorsPage";
import { CollaboratorsPage } from "../Collaborators/CollaboratorsPage";
import { MetricsPage } from "../Metrics/MetricsPage";

// Tipos
import { type WorkOrder, type SectorService } from "../../services/workOrderService";

// Tipagem das abas de navegação
type TabType =
  | "work-orders"
  | "history"
  | "equipments"
  | "operators"
  | "collaborators"
  | "metrics";

// Normaliza texto para comparações sem acentos e minúsculo
function normalizeText(text?: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Verifica se a ordem de serviço foi totalmente concluída
function isOrderCompleted(order: WorkOrder): boolean {
  if (order.status === "FINALIZADA") return true;

  if (order.setores && order.setores.length > 0) {
    return order.setores.every((sector) => sector.status === "FINALIZADO");
  }

  return false;
}

// Página principal do Dashboard com navegação por abas
export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { workOrders, loading, error, refetch } = useWorkOrders();
  const { completedWorkOrders: historyWorkOrders } = useHistory();
  const { hasPermission, hasAnyPermission } = usePermission();

  // Estados de navegação e controle de modais
  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorService | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<string>("");

  // Permissões do usuário logado
  const canCreateWorkOrder = hasPermission(PERMISSIONS.WORK_ORDER_CREATE);
  const canManageCollaborators = hasPermission(PERMISSIONS.COLLABORATOR_MANAGE);
  const canViewMetrics = hasPermission(PERMISSIONS.METRICS_VIEW);
  const canAccessAdminTabs = hasAnyPermission([
    PERMISSIONS.COLLABORATOR_MANAGE,
    PERMISSIONS.METRICS_VIEW,
  ]);

  const userSector = user?.sector;

  // Abertura do modal para criação de OS
  const handleCreateOpen = () => {
    if (!canCreateWorkOrder) return;
    setSelectedSector(null);
    setSelectedFleet("");
    setIsModalOpen(true);
  };

  // Abertura do modal para edição de setor
  const handleEditSectorOpen = (sector: SectorService, fleet: string) => {
    setSelectedSector(sector);
    setSelectedFleet(fleet);
    setIsModalOpen(true);
  };

  // Filtragem de ordens de serviço ativas conforme permissão e setor
  const activeWorkOrders = (workOrders || []).filter((order) => {
    if (isOrderCompleted(order)) return false;

    if (canAccessAdminTabs || !userSector) {
      return true;
    }

    if (order.setores && order.setores.length > 0) {
      return order.setores.some((sector) => {
        const isNotFinished = sector.status !== "FINALIZADO";
        const matchesUserSector =
          normalizeText(sector.setor) === normalizeText(userSector);
        return isNotFinished && matchesUserSector;
      });
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 space-y-6">
      {/* Cabeçalho principal */}
      <Header
        user={user}
        handleCreateOpen={handleCreateOpen}
        signOut={signOut}
        canCreate={canCreateWorkOrder}
      />

      {/* Cards de resumo estatístico */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Ativas em Campo
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {activeWorkOrders.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Ordens Concluídas
          </span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">
            {historyWorkOrders.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Polo / Unidade
          </span>
          <span className="text-sm font-bold text-emerald-800 mt-2 block truncate">
            📍 {user?.city || "Zilor Principal"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Status do Servidor
          </span>
          <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sincronizado
          </span>
        </div>
      </div>

      {/* Barra de abas para navegação */}
      <nav className="max-w-6xl mx-auto flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "work-orders"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
          }`}
        >
          📋 Ordens Ativas ({activeWorkOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
          }`}
        >
          📜 Histórico ({historyWorkOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("equipments")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "equipments"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
          }`}
        >
          🚜 Equipamentos
        </button>

        <button
          onClick={() => setActiveTab("operators")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "operators"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
          }`}
        >
          👨‍🌾 Operadores
        </button>

        {canManageCollaborators && (
          <button
            onClick={() => setActiveTab("collaborators")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "collaborators"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
            }`}
          >
            👥 Colaboradores
          </button>
        )}

        {canViewMetrics && (
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "metrics"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200"
            }`}
          >
            📊 Métricas
          </button>
        )}
      </nav>

      {/* Conteúdo dinâmico da aba selecionada */}
      <main className="max-w-6xl mx-auto space-y-4">
        {activeTab === "work-orders" && (
          <ActiveWorkOrdersPage
            refetch={refetch}
            loading={loading}
            error={error}
            activeWorkOrders={activeWorkOrders}
            onEditSector={handleEditSectorOpen}
          />
        )}

        {activeTab === "history" && (
          <HistoryPage onEditSector={handleEditSectorOpen} />
        )}

        {activeTab === "equipments" && <EquipmentsPage />}
        {activeTab === "operators" && <OperatorsPage />}
        {activeTab === "collaborators" && canManageCollaborators && (
          <CollaboratorsPage />
        )}
        {activeTab === "metrics" && canViewMetrics && <MetricsPage />}
      </main>

      {/* Modal global de criação e edição de Ordens de Serviço */}
      <CreateWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSector(null);
          setSelectedFleet("");
        }}
        onSuccess={refetch}
        initialSectorData={selectedSector}
        initialFleet={selectedFleet}
      />
    </div>
  );
};