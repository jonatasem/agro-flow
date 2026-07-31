import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWorkOrders } from "../hooks/useWorkOrders";
import { CreateWorkOrderModal } from "../components/CreateWorkOrderModal";
import { WorkOrderCard } from "../components/WorkOrderCard";
import { Equipments } from "./Equipments";
import { Operators } from "./Operators";
import { Collaborators } from "./Collaborators";

type TabType = "work-orders" | "equipments" | "operators" | "collaborators";

/**
 * Painel Principal com Navegação por Abas (Tabs) e Gestão de O.S.
 */
export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { workOrders, loading, error, refetch } = useWorkOrders();

  const [activeTab, setActiveTab] = useState<TabType>("work-orders");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6">
      {/* Cabeçalho */}
      <header className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">AgroFlow</h1>
          <p className="text-xs text-slate-400">
            Sessão iniciada como:{" "}
            <span className="font-semibold text-slate-200">{user?.name}</span> ({user?.role})
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            + Nova O.S.
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Navegação por Abas */}
      <nav className="max-w-5xl mx-auto flex gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
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
      </nav>

      {/* Conteúdo Dinâmico */}
      <main className="max-w-5xl mx-auto space-y-4">
        {activeTab === "work-orders" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Ordens de Serviço Ativas
              </h2>
              <button
                onClick={refetch}
                className="text-xs text-indigo-400 hover:underline"
              >
                Atualizar
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs animate-pulse">
                A carregar Ordens de Serviço...
              </div>
            ) : workOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-400 text-sm">
                Nenhuma Ordem de Serviço encontrada.
              </div>
            ) : (
              <div className="grid gap-4">
                {workOrders.map((order) => (
                  <WorkOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "equipments" && <Equipments />}
        {activeTab === "operators" && <Operators />}
        {activeTab === "collaborators" && <Collaborators />}
      </main>

      {/* Modal de Criação de O.S. */}
      <CreateWorkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};
