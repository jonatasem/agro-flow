// Tipagens para garantir autocompletar e type-safety sem usar `any`
export interface SectorServiceMetricInput {
  id: string;
  status: string;
  setor?: string | null;
  city?: string | null;
  tipoCausa?: string | null;
  dataCriacao: Date | string;
  dataInicioManutencao?: Date | string | null;
  dataFimManutencao?: Date | string | null;
  operator?: { id: string; name: string; registration: string } | null;
  tecnicoResponsavel?: { id: string; name: string } | null;
  pauses?: Array<{ pausedAt: Date | string; resumedAt?: Date | string | null }> | null;
}

export interface WorkOrderMetricInput {
  id: string;
  status: string;
  equipment?: { id: string; fleet: string; name: string } | null;
  setores?: SectorServiceMetricInput[] | null;
}

// Helper para calcular diferença em minutos entre datas
export function getDiffInMinutes(start: Date | string, end: Date | string): number {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  return Math.max(0, Math.round((endDate - startDate) / (1000 * 60)));
}

// Helper para calcular total de minutos em que o serviço esteve pausado
export function calculateTotalPauseMinutes(pauses: SectorServiceMetricInput["pauses"] = []): number {
  if (!pauses || pauses.length === 0) return 0;
  return pauses.reduce((acc, p) => {
    if (!p.pausedAt || !p.resumedAt) return acc;
    return acc + getDiffInMinutes(p.pausedAt, p.resumedAt);
  }, 0);
}

// ----------------------------------------------------------------------------
// PILAR 1: VOLUME OPERACIONAL
// ----------------------------------------------------------------------------
export function calculateVolumeMetrics(workOrders: WorkOrderMetricInput[]) {
  const ordensPorStatus: Record<string, number> = {};
  const servicosPorStatus: Record<string, number> = {};
  const servicosPorCidade: Record<string, number> = {};
  let totalServicosSetoriais = 0;

  workOrders.forEach((order) => {
    ordensPorStatus[order.status] = (ordensPorStatus[order.status] || 0) + 1;

    (order.setores || []).forEach((setor) => {
      totalServicosSetoriais++;
      servicosPorStatus[setor.status] = (servicosPorStatus[setor.status] || 0) + 1;

      if (setor.city) {
        servicosPorCidade[setor.city] = (servicosPorCidade[setor.city] || 0) + 1;
      }
    });
  });

  return {
    totalOrdens: workOrders.length,
    ordensPorStatus,
    totalServicosSetoriais,
    servicosPorStatus,
    servicosPorCidade,
  };
}

// ----------------------------------------------------------------------------
// PILAR 2: INDICADORES DE TEMPO (SLA / MTTR)
// ----------------------------------------------------------------------------
export function calculateTimeMetrics(allSetores: SectorServiceMetricInput[]) {
  const finalizados = allSetores.filter(
    (s) => s.status === "FINALIZADO" && s.dataInicioManutencao && s.dataFimManutencao
  );

  // Tempo de manutenção descontando pausas ativas
  const totalMinutosManutencao = finalizados.reduce((acc, s) => {
    const tempoBruto = getDiffInMinutes(s.dataInicioManutencao!, s.dataFimManutencao!);
    const tempoPausas = calculateTotalPauseMinutes(s.pauses);
    return acc + Math.max(0, tempoBruto - tempoPausas);
  }, 0);

  const mttrMinutos = finalizados.length > 0 ? Math.round(totalMinutosManutencao / finalizados.length) : 0;

  // Tempo Médio de Espera (Abertura -> Início da Manutenção)
  const atendidos = allSetores.filter((s) => s.dataCriacao && s.dataInicioManutencao);
  const totalEsperaMinutos = atendidos.reduce(
    (acc, s) => acc + getDiffInMinutes(s.dataCriacao, s.dataInicioManutencao!),
    0
  );
  const tempoMedioEsperaMinutos = atendidos.length > 0 ? Math.round(totalEsperaMinutos / atendidos.length) : 0;

  // Agrupadores auxiliares
  const porTecnico: Record<string, { nome: string; totalTempo: number; count: number }> = {};
  const porSetor: Record<string, { totalTempo: number; count: number }> = {};
  const porCidade: Record<string, { totalTempo: number; count: number }> = {};

  finalizados.forEach((s) => {
    const tempoBruto = getDiffInMinutes(s.dataInicioManutencao!, s.dataFimManutencao!);
    const tempoPausas = calculateTotalPauseMinutes(s.pauses);
    const duracaoLiquida = Math.max(0, tempoBruto - tempoPausas);

    // Por Técnico
    if (s.tecnicoResponsavel) {
      const tecId = s.tecnicoResponsavel.id;
      if (!porTecnico[tecId]) {
        porTecnico[tecId] = { nome: s.tecnicoResponsavel.name, totalTempo: 0, count: 0 };
      }
      porTecnico[tecId].totalTempo += duracaoLiquida;
      porTecnico[tecId].count += 1;
    }

    // Por Setor
    if (s.setor) {
      const item = (porSetor[s.setor] ??= { totalTempo: 0, count: 0 });
      item.totalTempo += duracaoLiquida;
      item.count += 1;
    }

    // Por Cidade
    if (s.city) {
      const item = (porCidade[s.city] ??= { totalTempo: 0, count: 0 });
      item.totalTempo += duracaoLiquida;
      item.count += 1;
    }
  });

  return {
    global: {
      mttrMinutos,
      tempoMedioEsperaMinutos,
      tempoTotalParadaMinutos: totalMinutosManutencao,
    },
    mttrPorTecnico: Object.entries(porTecnico).map(([tecnicoId, data]) => ({
      tecnicoId,
      nome: data.nome,
      mttrMinutos: Math.round(data.totalTempo / data.count),
      totalAtendimentos: data.count,
    })),
    mttrPorSetor: Object.entries(porSetor).map(([setor, data]) => ({
      setor,
      mttrMinutos: Math.round(data.totalTempo / data.count),
      totalAtendimentos: data.count,
    })),
    mttrPorCidade: Object.entries(porCidade).map(([cidade, data]) => ({
      cidade,
      mttrMinutos: Math.round(data.totalTempo / data.count),
      totalAtendimentos: data.count,
    })),
  };
}

// ----------------------------------------------------------------------------
// PILAR 3: ANÁLISE DE OFENSORES
// ----------------------------------------------------------------------------
export function calculateOffenderMetrics(
  workOrders: WorkOrderMetricInput[],
  allSetores: SectorServiceMetricInput[]
) {
  const operadoresMap: Record<string, { nome: string; matricula: string; count: number }> = {};
  const setoresMap: Record<string, number> = {};
  const causasMap: Record<string, number> = {};
  const tecnicosMap: Record<string, { nome: string; count: number }> = {};
  const equipamentosMap: Record<string, { frota: string; nome: string; count: number }> = {};

  // Equipamentos com mais quebras
  workOrders.forEach((order) => {
    if (order.equipment) {
      const eqId = order.equipment.id;
      if (!equipamentosMap[eqId]) {
        equipamentosMap[eqId] = { frota: order.equipment.fleet, nome: order.equipment.name, count: 0 };
      }
      equipamentosMap[eqId].count += 1;
    }
  });

  // Análise por Setor, Operador, Causa e Técnico
  allSetores.forEach((s) => {
    if (s.operator) {
      const opId = s.operator.id;
      if (!operadoresMap[opId]) {
        operadoresMap[opId] = { nome: s.operator.name, matricula: s.operator.registration, count: 0 };
      }
      operadoresMap[opId].count += 1;
    }

    if (s.setor) {
      setoresMap[s.setor] = (setoresMap[s.setor] || 0) + 1;
    }

    if (s.tipoCausa) {
      causasMap[s.tipoCausa] = (causasMap[s.tipoCausa] || 0) + 1;
    }

    if (s.tecnicoResponsavel && s.status === "FINALIZADO") {
      const tecId = s.tecnicoResponsavel.id;
      if (!tecnicosMap[tecId]) {
        tecnicosMap[tecId] = { nome: s.tecnicoResponsavel.name, count: 0 };
      }
      tecnicosMap[tecId].count += 1;
    }
  });

  return {
    operadoresComMaisQuebras: Object.entries(operadoresMap)
      .map(([operadorId, data]) => ({
        operadorId,
        nome: data.nome,
        matricula: data.matricula,
        totalOcorrencias: data.count,
      }))
      .sort((a, b) => b.totalOcorrencias - a.totalOcorrencias),

    equipamentosComMaisQuebras: Object.entries(equipamentosMap)
      .map(([equipamentoId, data]) => ({
        equipamentoId,
        frota: data.frota,
        nome: data.nome,
        totalOrdens: data.count,
      }))
      .sort((a, b) => b.totalOrdens - a.totalOrdens),

    setoresComMaisProblemas: Object.entries(setoresMap)
      .map(([setor, totalOcorrencias]) => ({ setor, totalOcorrencias }))
      .sort((a, b) => b.totalOcorrencias - a.totalOcorrencias),

    principaisCausas: Object.entries(causasMap)
      .map(([causa, quantidade]) => ({ causa, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),

    tecnicosMaisAtivos: Object.entries(tecnicosMap)
      .map(([tecnicoId, data]) => ({
        tecnicoId,
        nome: data.nome,
        totalFinalizados: data.count,
      }))
      .sort((a, b) => b.totalFinalizados - a.totalFinalizados),
  };
}