import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { formatRepairTime } from "../../utils/formatRepairTime";

interface MetricsProps {
  metrics: {
    overview: {
      totalWorkOrders: number;
      totalDowntimeMinutes: number;
      totalDowntimeHours: number;
      averageRepairTimeMinutes: number;
    };
    causesDistribution: Record<string, number>;
    topProblematicEquipments: Array<{
      fleet: string;
      name: string;
      count: number;
      totalMinutes: number;
    }>;
    topRequestingOperators: Array<{
      name: string;
      totalOS: number;
    }>;
    timeline: Array<{ date: string; count: number }>;
  };
}

export const MetricsDashboardApex: React.FC<MetricsProps> = ({ metrics }) => {
  const { overview, causesDistribution, topProblematicEquipments, timeline } = metrics;

  // 1. Configuração do Gráfico de Linha do Tempo (Area Chart)
  const timelineChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Inter, sans-serif",
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    colors: ["#10b981"],
    xaxis: {
      categories: timeline.map((t) => t.date),
      labels: { style: { colors: "#64748b", fontSize: "11px" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748b", fontSize: "11px" } },
    },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
  }), [timeline]);

  const timelineSeries = useMemo(() => [{
    name: "Ordens Abertas",
    data: timeline.map((t) => t.count),
  }], [timeline]);

  // 2. Configuração do Gráfico de Causas (Donut Chart)
  const causeLabels = Object.keys(causesDistribution);
  const causeValues = Object.values(causesDistribution);

  const causesChartOptions: ApexOptions = useMemo(() => ({
    chart: { type: "donut" },
    labels: causeLabels.length ? causeLabels : ["Sem Dados"],
    colors: ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"],
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: true },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Causas",
              color: "#64748b",
              formatter: () => `${causeValues.reduce((a, b) => a + b, 0)}`,
            },
          },
        },
      },
    },
  }), [causeLabels, causeValues]);

  // 3. Configuração de Top Equipamentos (Bar Horizontal)
  const equipmentOptions: ApexOptions = useMemo(() => ({
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        barHeight: "50%",
      },
    },
    colors: ["#6366f1"],
    dataLabels: { enabled: true, style: { fontSize: "10px" } },
    xaxis: {
      categories: topProblematicEquipments.map((e) => `${e.fleet} - ${e.name}`),
      labels: { style: { colors: "#64748b", fontSize: "11px" } },
    },
    yaxis: {
      labels: { style: { colors: "#64748b", fontSize: "11px" } },
    },
    tooltip: { theme: "dark" },
  }), [topProblematicEquipments]);

  const equipmentSeries = useMemo(() => [{
    name: "Quantidade de O.S.",
    data: topProblematicEquipments.map((e) => e.count),
  }], [topProblematicEquipments]);

  return (
    <div className="space-y-6">
      {/* 1. KPIs Consolidados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total de O.S. Abertas
          </span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">
            {overview.totalWorkOrders}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tempo Total de Parada
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {formatRepairTime(overview.totalDowntimeMinutes)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            MTTR (Tempo Médio de Reparo)
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatRepairTime(overview.averageRepairTimeMinutes)}
          </span>
        </div>
      </div>

      {/* 2. Gráficos Principais (Linha do Tempo + Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            📈 Tendência de Chamados no Tempo
          </h3>
          <Chart
            options={timelineChartOptions}
            series={timelineSeries}
            type="area"
            height={260}
          />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            🍩 Agrupamento por Causa
          </h3>
          <Chart
            options={causesChartOptions}
            series={causeValues.length ? causeValues : [1]}
            type="donut"
            height={260}
          />
        </div>
      </div>

      {/* 3. Equipamentos Críticos */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
          🚜 TOP 10 Equipamentos com Mais Quebras
        </h3>
        <Chart
          options={equipmentOptions}
          series={equipmentSeries}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};