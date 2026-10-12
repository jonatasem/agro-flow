'use client';

import { useAuth } from "@/hooks/useAuth";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { Header } from "@/components/Header";
import { MetricsDashboard } from "@/components/MetricsDashboard";

export default function MetricsPage() {
  const { user, signOut } = useAuth();
  const { data, loading, error } = useDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-6 space-y-6">
      <Header
        user={user}
        handleCreateOpen={() => {}}
        signOut={signOut}
        canCreate={false}
      />

      <main className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-800">Indicadores Operacionais</h2>
          <p className="text-xs text-slate-500">Métricas analíticas de MTTR, ofensores e volume de atendimento.</p>
        </div>

        {loading && (
          <div className="text-center py-16 text-slate-500 font-medium text-sm">
            A calcular métricas do servidor...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {!loading && !error && data && <MetricsDashboard data={data} />}
      </main>
    </div>
  );
}