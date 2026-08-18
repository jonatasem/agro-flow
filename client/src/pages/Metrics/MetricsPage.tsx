import React, { useMemo } from "react";
import { useDashboardMetrics } from "../../hooks/useDashboardMetrics";

export const MetricsPage: React.FC = () => {
  const initialFilters = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      startDate: thirtyDaysAgo.toISOString().slice(0, 10),
      endDate: now.toISOString().slice(0, 10),
    };
  }, []);

  const { metrics, loading, error, filters, setFilters, refetch } = useDashboardMetrics(initialFilters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Carregando métricas e indicadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-center space-y-3">
        <p className="text-sm font-bold">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-red-700 transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const overview = metrics?.overview;
  const topEquipments = metrics?.topProblematicEquipments || [];
  const topOperators = metrics?.topRequestingOperators || [];
  const causes = Object.entries(metrics?.causesDistribution || {});
  const timeline = metrics?.timeline || [];

  const maxEqCount = Math.max(...topEquipments.map((e) => e.count), 1);
  const maxOpCount = Math.max(...topOperators.map((o) => o.totalOS), 1);

  return (
    <div className="space-y-6">
      {/* PAINEL DE FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            🔍 Filtros de Indicadores
          </h3>
          <button
            onClick={refetch}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-all"
          >
            🔄 Atualizar Dados
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Data Inicial</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate || ""}
              onChange={handleFilterChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Data Final</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate || ""}
              onChange={handleFilterChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Setor</label>
            <input
              type="text"
              name="setor"
              placeholder="Ex: Mecânica, Elétrica"
              value={filters.setor || ""}
              onChange={handleFilterChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Causa</label>
            <input
              type="text"
              name="tipoCausa"
              placeholder="Ex: desgaste, operacional"
              value={filters.tipoCausa || ""}
              onChange={handleFilterChange}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* KPIS DE VISÃO GERAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Chamados</span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">{overview?.totalWorkOrders || 0}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horas Indisponíveis</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {overview?.totalDowntimeHours || 0} h
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Minutos Indisponíveis</span>
          <span className="text-2xl font-black text-orange-600 mt-1 block">
            {overview?.totalDowntimeMinutes || 0} min
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MTTR (Tempo Médio Reparo)</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {overview?.averageRepairTimeMinutes || 0} min
          </span>
        </div>
      </div>

      {/* BLOCOS PRINCIPAIS DE ANÁLISE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* TOP EQUIPAMENTOS PROBLEMÁTICOS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            🚜 Top Equipamentos Ofensores
          </h3>

          {topEquipments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum equipamento registrado no período.</p>
          ) : (
            <div className="space-y-3">
              {topEquipments.map((eq, index) => {
                const percentage = Math.round((eq.count / maxEqCount) * 100);
                return (
                  <div key={`${eq.fleet}-${index}`} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">
                        #{eq.fleet} - {eq.name}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {eq.count} OS ({eq.totalMinutes} min)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DISTRIBUIÇÃO DE CAUSAS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            🛠️ Distribuição por Tipo de Causa
          </h3>

          {causes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhuma causa informada no período.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {causes.map(([cause, count]) => (
                <div
                  key={cause}
                  className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 min-w-[140px] flex-1"
                >
                  <span className="text-xs font-bold text-slate-700 capitalize">{cause}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP OPERADORES SOLICITANTES */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            👨‍🌾 Operadores com Mais Aberturas
          </h3>

          {topOperators.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum registro de operador no período.</p>
          ) : (
            <div className="space-y-3">
              {topOperators.map((op, index) => {
                const percentage = Math.round((op.totalOS / maxOpCount) * 100);
                return (
                  <div key={`${op.name}-${index}`} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{op.name}</span>
                      <span className="text-slate-500 font-semibold">{op.totalOS} chamados</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* LINHA DO TEMPO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            📅 Volume Diário de Chamados
          </h3>

          {timeline.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Sem eventos registrados no período.</p>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {timeline.map((item) => (
                <div
                  key={item.date}
                  className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                >
                  <span className="font-mono text-slate-600 font-bold">{item.date}</span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] rounded-md">
                    {item.count} OS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};