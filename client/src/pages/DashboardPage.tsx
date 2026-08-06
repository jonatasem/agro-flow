import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWorkOrders } from "../hooks/useWorkOrders";
import { CreateWorkOrderModal } from "../components/CreateWorkOrderModal";
import { EquipmentsPage } from "./EquipmentsPage";
import { CollaboratorsPage } from "./CollaboratorsPage";
import { OperatorsPage } from "./OperatorsPage";
import { type SectorService } from "../services/workOrderService";
import { Header } from "../Header";
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

  const handleCreateOpen = () => {
    setSelectedSector(null);
    setSelectedFleet("");
    setIsModalOpen(true);  
  };

  const handleEditSectorOpen = (sector: SectorService, fleet: string) => {
    setSelectedSector(sector);
    setSelectedFleet(fleet);
    setIsModalOpen(true);   
  };

  // Helper para verificar se o utilizador é Líder ou Admin
  const isLeaderOrAdmin = 
    user?.role === "Líder" || 
    user?.role === "Admin";

  // Filtro: Ordens de Serviço Ativas
  const activeWorkOrders = workOrders.filter((order) => {
    if (order.status === "FINALIZADA") return false;
    
    if (order.setores && order.setores.length > 0) {
      return order.setores.some(
        (sector) => sector.status !== "FINALIZADO"
      );
    }

    return true;
  });

  // Filtro: Ordens de Serviço Concluídas
  const completedWorkOrders = workOrders.filter((order) => {
    if (order.status === "FINALIZADA") return true;

    if (order.setores && order.setores.length > 0) {
      return order.setores.every(
        (sector) => sector.status === "FINALIZADO"
      );
    }

    return false;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6">
      <Header 
        user={user} 
        handleCreateOpen={handleCreateOpen} 
        signOut={signOut} 
      />

      <nav className="max-w-5xl mx-auto flex gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("work-orders")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "work-orders"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Ordens Ativas
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "history"
              ? "bg-indigo-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Histórico de Ordens
        </button>
        
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

        {/* 🚀 BOTÃO ADICIONADO: Visível para Líderes e Administradores */}
        {isLeaderOrAdmin && (
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

      <main className="max-w-5xl mx-auto space-y-4">
        {/* ABA: Ordens Ativas */}
        {activeTab === "work-orders" && (
          <ActiveWorkOrdersPage 
            refetch={refetch}
            loading={loading}
            error={error}
            activeWorkOrders={activeWorkOrders}
            onEditSector={handleEditSectorOpen}
          />
        )}

        {/* ABA: Histórico */}
        {activeTab === "history" && (
          <HistoryPage 
            refetch={refetch} 
            loading={loading} 
            completedWorkOrders={completedWorkOrders} 
            onEditSector={handleEditSectorOpen}
          />
        )}

        {activeTab === "equipments" && <EquipmentsPage />}
        {activeTab === "operators" && user?.role !== "TECNICO" && <OperatorsPage />}
        
        {/* 🚀 Renderiza a aba apenas se for Líder/Admin */}
        {activeTab === "collaborators" && isLeaderOrAdmin && <CollaboratorsPage />}
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