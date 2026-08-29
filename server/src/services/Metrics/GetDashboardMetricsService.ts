import prismaClient from "../../prisma/index.js";

/**
 * Interface que define os filtros opcionais aceitos pela requisição do dashboard.
 */
export interface DashboardFiltersProps {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

/**
 * Serviço responsável por recuperar e agregar métricas de ordens de serviço
 * para alimentação dos indicadores e gráficos do dashboard.
 */
export class GetDashboardMetricsService {
  /**
   * Orquestra a busca no banco de dados e a consolidação dos dados.
   * 
   * @param filters Filtros de busca recebidos na requisição HTTP.
   * @returns Objeto com KPIs gerais, distribuições, Top 10 e série temporal.
   */
  async execute(filters: DashboardFiltersProps) {
    // 1. Sanitiza e calcula o intervalo de datas válido (padrão: últimos 30 dias)
    const { start, end } = this.parseDateRange(filters.startDate, filters.endDate);

    // 2. Constrói dinamicamente a cláusula WHERE do Prisma via spread operator
    const where = {
      dataCriacao: { gte: start, lte: end },
      ...(filters.setor && { setor: filters.setor }),
      ...(filters.tipoCausa && { tipoCausa: filters.tipoCausa }),
      ...(filters.tecnicoId && { tecnicoResponsavelId: filters.tecnicoId }),
      ...(filters.operatorId && { operatorId: filters.operatorId }),
      ...(filters.equipmentId && { workOrder: { equipmentId: filters.equipmentId } }),
    };

    // 3. Busca registros no banco trazendo os relacionamentos necessários
    const sectorServices = await prismaClient.sectorService.findMany({
      where,
      include: {
        operator: true,
        workOrder: { include: { equipment: true } },
      },
      orderBy: { dataCriacao: "asc" },
    });

    // 4. Executa o agrupamento e a ordenação em memória das métricas obtidas
    return this.aggregateMetrics(sectorServices);
  }

  /**
   * Converte strings de data em instâncias de Date válidas e ajusta horários limites.
   */
  private parseDateRange(startDate?: string, endDate?: string) {
    // Define a data inicial (caso inválida ou ausente, assume 30 dias atrás)
    const start = startDate && !isNaN(Date.parse(startDate))
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Define a data final (caso inválida ou ausente, assume o momento atual)
    const end = endDate && !isNaN(Date.parse(endDate))
      ? new Date(endDate)
      : new Date();

    // Ajusta strings no formato "YYYY-MM-DD" para incluir todo o dia até 23:59:59.999
    if (endDate && !endDate.includes("T")) {
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  /**
   * Processa a lista de serviços em uma única iteração ($O(N)$) para gerar as agregações.
   */
  private aggregateMetrics(services: any[]) {
    let totalDowntimeMinutes = 0;
    let finishedOrdersCount = 0;

    // Estruturas do tipo Hash Map para acúmulo performático com acesso $O(1)$
    const causesDistribution: Record<string, number> = {};
    const equipmentMap: Record<string, any> = {};
    const operatorMap: Record<string, any> = {};
    const timelineMap: Record<string, number> = {};

    for (const service of services) {
      // Computa tempo total de parada e total de ordens finalizadas
      if (service.tempoManutencao > 0) {
        totalDowntimeMinutes += service.tempoManutencao;
        finishedOrdersCount++;
      }

      // Incrementa a contagem de tipos de causa
      const cause = service.tipoCausa || "NÃO_INFORMADO";
      causesDistribution[cause] = (causesDistribution[cause] || 0) + 1;

      // Agrupa ocorrências e minutos parados por equipamento
      const eq = service.workOrder?.equipment;
      if (eq) {
        equipmentMap[eq.id] = equipmentMap[eq.id] || { fleet: eq.fleet, name: eq.name, count: 0, totalMinutes: 0 };
        equipmentMap[eq.id].count++;
        equipmentMap[eq.id].totalMinutes += service.tempoManutencao || 0;
      }

      // Agrupa total de OSs e tipos de causas por operador
      const op = service.operator;
      if (op) {
        const opId = op.id || op.registration;
        const opName = op.name || op.nome || op.registration || "Operador";

        operatorMap[opId] = operatorMap[opId] || { name: opName, totalOS: 0, causes: {} };
        operatorMap[opId].totalOS++;
        operatorMap[opId].causes[cause] = (operatorMap[opId].causes[cause] || 0) + 1;
      }

      // Agrupa o volume de chamados por data no formato YYYY-MM-DD
      const dateKey = service.dataCriacao.toISOString().slice(0, 10);
      timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
    }

    return {
      // Indicadores Consolidados (KPIs)
      overview: {
        totalWorkOrders: services.length,
        totalDowntimeMinutes,
        totalDowntimeHours: Number((totalDowntimeMinutes / 60).toFixed(2)),
        averageRepairTimeMinutes: finishedOrdersCount > 0 ? Math.round(totalDowntimeMinutes / finishedOrdersCount) : 0,
      },
      causesDistribution,
      // Ordena e extrai o TOP 10 equipamentos com mais ocorrências
      topProblematicEquipments: Object.values(equipmentMap).sort((a, b) => b.count - a.count).slice(0, 10),
      // Ordena e extrai o TOP 10 operadores que mais abriram OSs
      topRequestingOperators: Object.values(operatorMap).sort((a, b) => b.totalOS - a.totalOS).slice(0, 10),
      // Ordena cronologicamente os pontos da linha do tempo
      timeline: Object.entries(timelineMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
    };
  }
}