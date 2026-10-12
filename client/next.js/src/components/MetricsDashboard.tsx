'use client';

import React from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { DashboardData } from "@/types/metrics";

// Importação dinâmica do ApexCharts para evitar erros de SSR (Server-Side Rendering) no Next.js
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MetricsDashboardProps {
  data: DashboardData;
}

// Painel analítico de métricas operacionais com gráficos interativos.
export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ data }) => {
  const { volumeOperacional, indicadoresDeTempo, analiseDeOfensores } = data;

  const causasLabels = analiseDeOfensores.principaisCausas.map((item) => item.causa);
  const causasValues = analiseDeOfensores.principaisCausas.map((item) => item.quantidade);

  const causasChartOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: causasLabels,
    legend: { position: "bottom" },
    colors: ["#0082F6", "#00BBA7", "#F59E0B", "#EF4444", "#8B5CF6"],
    dataLabels: { enabled: true },
  };

  const cidadesLabels = Object.keys(volumeOperacional.servicosPorCidade);
  const cidadesValues = Object.values(volumeOperacional.servicosPorCidade);

  const cidadesChartOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: cidadesLabels,
    legend: { position: "bottom" },
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EC4899"],
    dataLabels: { enabled: true },
  };

  const setoresLabels = indicadoresDeTempo.mttrPorSetor.map((item) => item.setor);
  const mttrSetorValues = indicadoresDeTempo.mttrPorSetor.map((item) => item.mttrMinutos);
  const atendimentosSetorValues = indicadoresDeTempo.mttrPorSetor.map((item) => item.totalAtendimentos);

  const mttrSetorChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: setoresLabels },
    colors: ["#00BBA7", "#6366F1"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%", dataLabels: { position: "top" } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: "11px", colors: ["#374151"] } },
  };

  const mttrSetorChartSeries = [
    { name: "MTTR (minutos)", data: mttrSetorValues },
    { name: "Total Atendimentos", data: atendimentosSetorValues },
  ];

  const tecnicosLabels = indicadoresDeTempo.mttrPorTecnico.map((item) => item.nome);
  const mttrTecnicoValues = indicadoresDeTempo.mttrPorTecnico.map((item) => item.mttrMinutos);
  const atendimentosTecnicoValues = indicadoresDeTempo.mttrPorTecnico.map((item) => item.totalAtendimentos);

  const mttrTecnicoChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: tecnicosLabels },
    colors: ["#0082F6", "#F59E0B"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "50%", dataLabels: { position: "top" } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: "11px", colors: ["#374151"] } },
  };

  const mttrTecnicoChartSeries = [
    { name: "MTTR (minutos)", data: mttrTecnicoValues },
    { name: "Total Atendimentos", data: atendimentosTecnicoValues },
  ];

  const equipamentosLabels = analiseDeOfensores.equipamentosComMaisQuebras.map((e) => `${e.frota} - ${e.nome}`);
  const equipamentosValues = analiseDeOfensores.equipamentosComMaisQuebras.map((e) => e.totalOrdens);

  const equipamentosChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: equipamentosLabels, tickAmount: 1 },
    colors: ["#0082F6"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "50%" } },
    dataLabels: { enabled: true },
  };

  const setoresProblemasLabels = analiseDeOfensores.setoresComMaisProblemas.map((s) => s.setor);
  const setoresProblemasValues = analiseDeOfensores.setoresComMaisProblemas.map((s) => s.totalOcorrencias);

  const setoresProblemasChartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: { categories: setoresProblemasLabels },
    colors: ["#EF4444"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "50%" } },
    dataLabels: { enabled: true },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Total de O.S.</span>
          <p className="text-2xl font-bold text-gray-800">{volumeOperacional.totalOrdens}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Serviços Setoriais</span>
          <p className="text-2xl font-bold text-blue-600">{volumeOperacional.totalServicosSetoriais}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">MTTR Global</span>
          <p className="text-2xl font-bold text-emerald-600">{indicadoresDeTempo.global.mttrMinutos} min</p>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Tempo Médio Espera</span>
          <p className="text-2xl font-bold text-purple-600">{indicadoresDeTempo.global.tempoMedioEsperaMinutos} min</p>
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase">Tempo de Parada</span>
          <p className="text-2xl font-bold text-amber-600">{indicadoresDeTempo.global.tempoTotalParadaMinutos} min</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Principais Causas</h3>
          <Chart options={causasChartOptions} series={causasValues} type="donut" height={280} />
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Serviços por Cidade</h3>
          <Chart options={cidadesChartOptions} series={cidadesValues} type="donut" height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">MTTR e Atendimentos por Setor</h3>
          <Chart options={mttrSetorChartOptions} series={mttrSetorChartSeries} type="bar" height={280} />
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">MTTR e Atendimentos por Técnico</h3>
          <Chart options={mttrTecnicoChartOptions} series={mttrTecnicoChartSeries} type="bar" height={280} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Equipamentos com Mais Quebras</h3>
          <Chart options={equipamentosChartOptions} series={[{ name: "Total O.S.", data: equipamentosValues }]} type="bar" height={280} />
        </div>
        <div className="p-4 bg-white rounded-xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Setores com Mais Ocorrências</h3>
          <Chart options={setoresProblemasChartOptions} series={[{ name: "Ocorrências", data: setoresProblemasValues }]} type="bar" height={280} />
        </div>
      </div>
    </div>
  );
};