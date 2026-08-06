import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWorkOrders } from "../hooks/useWorkOrders";
import { CreateWorkOrderModal } from "../components/CreateWorkOrderModal";
import { EquipmentsPage } from "./EquipmentsPage";
import { CollaboratorsPage } from "./CollaboratorsPage";
import { OperatorsPage } from "./OperatorsPage";
import { type SectorService } from "../services/workOrderService";
import { Header } from "../components/Header";
import { HistoryPage } from "./HistoryPage";
import { ActiveWorkOrdersPage } from "./ActiveWorkOrdersPage";

type TabType = "work-orders" | "history" | "equipments" | "operators" | "collaborators";

export const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { workOrders, loading, error, refetch } = useWorkOrders();
  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorService | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<string>("");

  // Normalização do cargo para validação flexível de regras
  const normalizedRole = user?.role?.toLowerCase().trim() || "";

  // 🚀 Permissão restrita: Admin, Líder, Gerente e Supervisor
  const canManageAndCreate = [
    "admin",
    "líder",
    "lider",
    "gerente",
    "supervisor"
  ].some((role) => normalizedRole.includes(role));

  const handleCreateOpen = () => {
    if (!canManageAndCreate) return;
    setSelectedSector(null);
    setSelectedFleet("");
    setIsModalOpen(true);  
  };

  const handleEditSectorOpen = (sector: SectorService, fleet: string) => {
    setSelectedSector(sector);
    setSelectedFleet(fleet);
    setIsModalOpen(true);   
  };

  // Separação lógica de Ordens Ativas e Histórico Concluído
  const activeWorkOrders = (workOrders || []).filter((order) => {
    if (order.status === "FINALIZADA") return false;
    if (order.setores && order.setores.length > 0) {
      return order.setores.some((sector) => sector.status !== "FINALIZADO");
    }
    return true;
  });

  const completedWorkOrders = (workOrders || []).filter((order) => {
    if (order.status === "FINALIZADA") return true;
    if (order.setores && order.setores.length > 0) {
      return order.setores.every((sector) => sector.status === "FINALIZADO");
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 space-y-6">
      {/* Topo do Sistema */}
      <Header 
        user={user} 
        handleCreateOpen={handleCreateOpen} 
        signOut={signOut}
        canCreate={canManageAndCreate}
      />

      {/* KPI Cards Informativos da Operação Zilor */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ativas em Campo</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{activeWorkOrders.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordens Concluídas</span>
          <span className="text-2xl font-black text-slate-700 mt-1 block">{completedWorkOrders.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Polo / Unidade</span>
          <span className="text-sm font-bold text-emerald-800 mt-2 block truncate">📍 {user?.city || "Zilor Principal"}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status do Servidor</span>
          <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronizado
          </span>
        </div>
      </div>

      {/* Navegação por Abas */}
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

        {/* Exibição condicional da aba de Colaboradores */}
        {canManageAndCreate && (
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
      </nav>

      {/* Conteúdo Renderizado da Aba */}
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
        
        {activeTab === "collaborators" && canManageAndCreate && <CollaboratorsPage />}
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
