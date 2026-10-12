// Estrutura principal dos dados analíticos do Dashboard
export interface DashboardData {
  volumeOperacional: {
    totalOrdens: number;
    ordensPorStatus: Record<string, number>;
    totalServicosSetoriais: number;
    servicosPorStatus: Record<string, number>;
    servicosPorCidade: Record<string, number>;
  };
  indicadoresDeTempo: {
    global: {
      mttrMinutos: number;
      tempoMedioEsperaMinutos: number;
      tempoTotalParadaMinutos: number;
    };
    mttrPorTecnico: Array<{
      tecnicoId: string;
      nome: string;
      mttrMinutos: number;
      totalAtendimentos: number;
    }>;
    mttrPorSetor: Array<{
      setor: string;
      mttrMinutos: number;
      totalAtendimentos: number;
    }>;
    mttrPorCidade: Array<{
      cidade: string;
      mttrMinutos: number;
      totalAtendimentos: number;
    }>;
  };
  analiseDeOfensores: {
    operadoresComMaisQuebras: Array<{
      operadorId: string;
      nome: string;
      matricula: string;
      totalOcorrencias: number;
    }>;
    equipamentosComMaisQuebras: Array<{
      equipamentoId: string;
      frota: string;
      nome: string;
      totalOrdens: number;
    }>;
    setoresComMaisProblemas: Array<{
      setor: string;
      totalOcorrencias: number;
    }>;
    principaisCausas: Array<{
      causa: string;
      quantidade: number;
    }>;
    tecnicosMaisAtivos: Array<{
      tecnicoId: string;
      nome: string;
      totalFinalizados: number;
    }>;
  };
}

// Filtros opcionais aplicáveis à consulta do dashboard
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

// Métricas individuais de um equipamento
export interface EquipmentMetric {
  fleet: string;
  name: string;
  count: number;
  totalMinutes: number;
}

// Métricas de solicitações de um operador
export interface OperatorMetric {
  name: string;
  totalOS: number;
  causes?: Record<string, number>;
}

// Resumo geral das métricas do sistema
export interface DashboardMetrics {
  overview: {
    totalWorkOrders: number;
    totalDowntimeMinutes: number;
    totalDowntimeHours: number;
    averageRepairTimeMinutes: number;
  };
  causesDistribution: Record<string, number>;
  topProblematicEquipments: EquipmentMetric[];
  topRequestingOperators: OperatorMetric[];
  timeline: Array<{ date: string; count: number }>;
}