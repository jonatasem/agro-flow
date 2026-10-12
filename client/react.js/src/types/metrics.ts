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