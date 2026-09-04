import prismaClient from "../../prisma/index.js";

export interface DashboardFiltersProps {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

export class GetDashboardMetricsService {
  async execute(filters: DashboardFiltersProps) {
    // Sanitiza e calcula o intervalo de datas válido (padrão: últimos 30 dias)
    const { start, end } = this.parseDateRange(filters.startDate, filters.endDate);

    // Constrói dinamicamente a cláusula WHERE do Prisma
    const where = {
      dataCriacao: { gte: start, lte: end },
      ...(filters.setor && { setor: filters.setor }),
      ...(filters.tipoCausa && { tipoCausa: filters.tipoCausa }),
      ...(filters.tecnicoId && { tecnicoResponsavelId: filters.tecnicoId }),
      ...(filters.operatorId && { operatorId: filters.operatorId }),
      ...(filters.equipmentId && { workOrder: { equipmentId: filters.equipmentId } }),
    };

    // Busca registros no banco trazendo os relacionamentos necessários
    const sectorServices = await prismaClient.sectorService.findMany({
      where,
      include: {
        operator: true,
        workOrder: { include: { equipment: true } },
      },
      orderBy: { dataCriacao: "asc" },
    });

    // Executa o agrupamento e a ordenação em memória das métricas obtidas
    return this.aggregateMetrics(sectorServices);
  }

  /**
   * Converte strings de data em instâncias de Date válidas e ajusta horários limites.
   */
  private parseDateRange(startDate?: string, endDate?: string) {
    const start =
      startDate && !isNaN(Date.parse(startDate))
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const end =
      endDate && !isNaN(Date.parse(endDate)) ? new Date(endDate) : new Date();

    if (endDate && !endDate.includes("T")) {
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  /**
   * Processa a lista de serviços em uma única iteração (O(N)) para gerar as agregações.
   */
  private aggregateMetrics(services: any[]) {
    let totalDowntimeMinutes = 0;
    let finishedOrdersCount = 0;

    const causesDistribution: Record<string, number> = {};
    const equipmentMap: Record<string, any> = {};
    const operatorMap: Record<string, any> = {};
    const timelineMap: Record<string, number> = {};

    for (const service of services) {
      /* =========================================================================
       * Usamos `Number(service.tempoManutencao) || 0` para garantir que o valor
       * seja estritamente numérico e evite operações com `NaN` ou falhas na checagem.
       * ========================================================================= */
      const maintenanceTime = Number(service.tempoManutencao) || 0;

      // Soma minutos de parada e incrementa contador de OSs com reparo concluído
      if (maintenanceTime > 0) {
        totalDowntimeMinutes += maintenanceTime;
        finishedOrdersCount++;
      }

      /* =========================================================================
       * Verificamos com `.trim()` o tamanho real da string.
       * ========================================================================= */
      const rawCause = service.tipoCausa?.trim();
      const cause = rawCause && rawCause.length > 0 ? rawCause : "NÃO_INFORMADO";
      causesDistribution[cause] = (causesDistribution[cause] || 0) + 1;

      /* =========================================================================
       * CORREÇÃO 3: Agrupamento por Equipamento usando tempo corrigido
       * ========================================================================= */
      const eq = service.workOrder?.equipment;
      if (eq) {
        equipmentMap[eq.id] = equipmentMap[eq.id] || {
          fleet: eq.fleet,
          name: eq.name,
          count: 0,
          totalMinutes: 0,
        };
        equipmentMap[eq.id].count++;
        equipmentMap[eq.id].totalMinutes += maintenanceTime;
      }

      /* =========================================================================
       * Agrupamento por Operador
       * ========================================================================= */
      const op = service.operator;
      if (op) {
        const opId = op.id || op.registration;
        const opName = op.name || op.nome || op.registration || "Operador";

        operatorMap[opId] = operatorMap[opId] || {
          name: opName,
          totalOS: 0,
          causes: {},
        };
        operatorMap[opId].totalOS++;
        operatorMap[opId].causes[cause] = (operatorMap[opId].causes[cause] || 0) + 1;
      }

      /* =========================================================================
       * Garante conversão segura para Date antes de extrair YYYY-MM-DD para evitar
       * crash caso `dataCriacao` venha como string do banco.
       * ========================================================================= */
      if (service.dataCriacao) {
        const dateKey = new Date(service.dataCriacao).toISOString().slice(0, 10);
        timelineMap[dateKey] = (timelineMap[dateKey] || 0) + 1;
      }
    }

    /* =========================================================================
     * Cálculo dos KPIs Consolidados (MTTR e Totais)
     * ========================================================================= */
    return {
      overview: {
        totalWorkOrders: services.length,
        totalDowntimeMinutes,
        totalDowntimeHours: Number((totalDowntimeMinutes / 60).toFixed(2)),
        // MTTR: Divide o tempo total pelo número de ordens com reparo efetuado
        averageRepairTimeMinutes:
          finishedOrdersCount > 0
            ? Math.round(totalDowntimeMinutes / finishedOrdersCount)
            : 0,
      },
      causesDistribution,
      topProblematicEquipments: Object.values(equipmentMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topRequestingOperators: Object.values(operatorMap)
        .sort((a, b) => b.totalOS - a.totalOS)
        .slice(0, 10),
      timeline: Object.entries(timelineMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    };
  }
}