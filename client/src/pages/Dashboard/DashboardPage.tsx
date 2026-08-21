import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useWorkOrders } from "../../hooks/useWorkOrders";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../utils/permission";

import { CreateWorkOrderModal } from "../../components/workOrder/CreateWorkOrderModal";
import { EquipmentsPage } from "../Equipments/EquipmentsPage";
import { CollaboratorsPage } from "../Collaborators/CollaboratorsPage";
import { OperatorsPage } from "../Operators/OperatorsPage";
import { ActiveWorkOrdersPage } from "../WorkOrders/ActiveWorkOrdersPage";
import { HistoryPage } from "../History/HistoryPage";
import { MetricsPage } from "../Metrics/MetricsPage";
import { Header } from "../../components/Header";
import { type SectorService } from "../../services/workOrderService";

type TabType = "work-orders" | "history" | "equipments" | "operators" | "collaborators" | "metrics";

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { workOrders, loading, error, refetch } = useWorkOrders();
  const { hasPermission, hasAnyPermission } = usePermission();

  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorService | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<string>("");

  // Permissões derivadas do RBAC centralizado
  const canCreateWorkOrder = hasPermission(PERMISSIONS.WORK_ORDER_CREATE);
  const canManageCollaborators = hasPermission(PERMISSIONS.COLLABORATOR_MANAGE);
  const canViewMetrics = hasPermission(PERMISSIONS.METRICS_VIEW);
  const canAccessAdminTabs = hasAnyPermission([PERMISSIONS.COLLABORATOR_MANAGE, PERMISSIONS.METRICS_VIEW]);

  const handleCreateOpen = () => {
    if (!canCreateWorkOrder) return;
    setSelectedSector(null);
    setSelectedFleet("");
    setIsModalOpen(true);
  };

  const handleEditSectorOpen = (sector: SectorService, fleet: string) => {
    setSelectedSector(sector);
    setSelectedFleet(fleet);
    setIsModalOpen(true);
  };

  // Filtragem das Ordens Ativas levando em consideração setor do usuário e permissões
  const activeWorkOrders = (workOrders || []).filter((order) => {
    if (order.status === "FINALIZADA") return false;

    if (order.setores && order.setores.length > 0) {
      return order.setores.some((sector) => {
        const isNotFinished = sector.status !== "FINALIZADO";

        const matchesSector =
          canAccessAdminTabs ||
          !user?.sector ||
          sector.setor?.toLowerCase().trim() === user.sector?.toLowerCase().trim();

        return isNotFinished && matchesSector;
      });
    }
    return true;
  });

  // Filtragem do Histórico (Ordens Concluídas)
  const completedWorkOrders = (workOrders || []).filter((order) => {
    if (order.status === "FINALIZADA") return true;
    if (order.setores && order.setores.length > 0) {
      return order.setores.every((sector) => sector.status === "FINALIZADO");
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 space-y-6">
      <Header
        user={user}
        handleCreateOpen={handleCreateOpen}
        signOut={signOut}
        canCreate={canCreateWorkOrder}
      />

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
            {completedWorkOrders.length}
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
          📜 Histórico ({completedWorkOrders.length})
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
          <HistoryPage
            refetch={refetch}
            loading={loading}
            completedWorkOrders={completedWorkOrders}
            onEditSector={handleEditSectorOpen}
          />
        )}

        {activeTab === "equipments" && <EquipmentsPage />}
        {activeTab === "operators" && <OperatorsPage />}
        {activeTab === "collaborators" && canManageCollaborators && <CollaboratorsPage />}
        {activeTab === "metrics" && canViewMetrics && <MetricsPage />}
      </main>

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