import React from "react";
import Chart from "react-apexcharts";
import type { DashboardData } from "../../types/metrics";

interface MetricsDashboardProps {
  data: DashboardData;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
  const { volumeOperacional, indicadoresDeTempo, analiseDeOfensores } = data;

  // 1. Configuração do Gráfico Donut (Principais Causas)
  const causasLabels = analiseDeOfensores.principaisCausas.map((item) => item.causa);
  const causasValues = analiseDeOfensores.principaisCausas.map((item) => item.quantidade);

  const causasChartOptions = {
    labels: causasLabels,
    legend: { position: "bottom" as const },
  };

  // 2. Configuração do Gráfico de Barras (MTTR por Setor)
  const setoresLabels = indicadoresDeTempo.mttrPorSetor.map((item) => item.setor);
  const mttrValues = indicadoresDeTempo.mttrPorSetor.map((item) => item.mttrMinutos);

  const mttrChartOptions = {
    xaxis: { categories: setoresLabels },
    plotOptions: { bar: { borderRadius: 4 } },
  };

  const mttrChartSeries = [
    { name: "MTTR (minutos)", data: mttrValues }
  ];

  // 3. Configuração do Gráfico de Equipamentos com mais quebras
  const equipamentosLabels = analiseDeOfensores.equipamentosComMaisQuebras.map(
    (e) => `${e.frota} - ${e.nome}`
  );
  const equipamentosValues = analiseDeOfensores.equipamentosComMaisQuebras.map(
    (e) => e.totalOrdens
  );

  const equipamentosChartOptions = {
    xaxis: { categories: equipamentosLabels },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
  };

  const equipamentosChartSeries = [
    { name: "Total de Ordens", data: equipamentosValues }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Total de O.S.</span>
          <p className="text-2xl font-bold text-gray-800">{volumeOperacional.totalOrdens}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">MTTR Global</span>
          <p className="text-2xl font-bold text-emerald-600">
            {indicadoresDeTempo.global.mttrMinutos} min
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Tempo de Parada</span>
          <p className="text-2xl font-bold text-amber-600">
            {indicadoresDeTempo.global.tempoTotalParadaMinutos} min
          </p>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donut Chart: Principais Causas */}
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Principais Causas</h3>
          <Chart options={causasChartOptions} series={causasValues} type="donut" height={280} />
        </div>

        {/* Bar Chart: MTTR por Setor */}
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">MTTR por Setor (Minutos)</h3>
          <Chart options={mttrChartOptions} series={mttrChartSeries} type="bar" height={280} />
        </div>
      </div>

      {/* Bar Chart Horizontal: Equipamentos Críticos */}
      <div className="p-4 bg-white rounded-xl border shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Equipamentos com Mais Quebras</h3>
        <Chart
          options={equipamentosChartOptions}
          series={equipamentosChartSeries}
          type="bar"
          height={280}
        />
      </div>
    </div>
  );
};