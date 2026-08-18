import prismaClient from "../../prisma/index.js";

export interface DashboardFiltersProps {
  startDate?: string | undefined;
  endDate?: string | undefined;
  equipmentId?: string | undefined;
  operatorId?: string | undefined;
  tecnicoId?: string | undefined;
  setor?: string | undefined;
  tipoCausa?: string | undefined;
}

interface EquipmentBreakdownItem {
  fleet: string;
  name: string;
  count: number;
  totalMinutes: number;
}

interface OperatorBreakdownItem {
  name: string;
  totalOS: number;
  causes: Record<string, number>;
}

export class GetDashboardMetricsService {
  async execute(filters: DashboardFiltersProps) {
    let start = filters.startDate ? new Date(filters.startDate) : null;
    if (!start || isNaN(start.getTime())) {
      start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    let end = filters.endDate ? new Date(filters.endDate) : new Date();
    if (isNaN(end.getTime())) {
      end = new Date();
    } else if (filters.endDate && !filters.endDate.includes("T")) {
      end.setHours(23, 59, 59, 999);
    }

    const sectorWhereClause: any = {
      dataCriacao: {
        gte: start,
        lte: end,
      },
    };

    if (filters.setor) sectorWhereClause.setor = filters.setor;
    if (filters.tipoCausa) sectorWhereClause.tipoCausa = filters.tipoCausa;
    if (filters.tecnicoId) sectorWhereClause.tecnicoResponsavelId = filters.tecnicoId;
    if (filters.operatorId) sectorWhereClause.operatorId = filters.operatorId;

    const workOrderWhereClause: any = {};
    if (filters.equipmentId) workOrderWhereClause.equipmentId = filters.equipmentId;

    if (Object.keys(workOrderWhereClause).length > 0) {
      sectorWhereClause.workOrder = workOrderWhereClause;
    }

    const sectorServices = await prismaClient.sectorService.findMany({
      where: sectorWhereClause,
      include: {
        operator: true,
        workOrder: {
          include: {
            equipment: true,
          },
        },
        pauses: true,
        tecnicoResponsavel: { select: { id: true, name: true } },
      },
      orderBy: { dataCriacao: "asc" },
    });

    const totalOrders = sectorServices.length;
    let totalDowntimeMinutes = 0;
    let finishedOrdersCount = 0;

    const causesBreakdown: Record<string, number> = {};
    const equipmentBreakdown: Record<string, EquipmentBreakdownItem> = {};
    const operatorBreakdown: Record<string, OperatorBreakdownItem> = {};
    const timelineBreakdown: Record<string, number> = {};

    for (const service of sectorServices) {
      if (service.tempoManutencao && service.tempoManutencao > 0) {
        totalDowntimeMinutes += service.tempoManutencao;
        finishedOrdersCount += 1;
      }

      const causeKey = service.tipoCausa || "NÃO_INFORMADO";
      causesBreakdown[causeKey] = (causesBreakdown[causeKey] || 0) + 1;

      const eq = service.workOrder?.equipment as any;
      if (eq) {
        const eqId = String(eq.id);
        const currentEq: EquipmentBreakdownItem = equipmentBreakdown[eqId] ?? {
          fleet: eq.fleet,
          name: eq.name,
          count: 0,
          totalMinutes: 0,
        };

        currentEq.count += 1;
        currentEq.totalMinutes += service.tempoManutencao || 0;
        equipmentBreakdown[eqId] = currentEq;
      }

      const op = service.operator as any;
      if (op) {
        const opId = String(op.id || op.registration || "");
        const opName = String(op.name || op.nome || op.registration || "Operador");

        const currentOp: OperatorBreakdownItem = operatorBreakdown[opId] ?? {
          name: opName,
          totalOS: 0,
          causes: {},
        };

        currentOp.totalOS += 1;
        currentOp.causes[causeKey] = (currentOp.causes[causeKey] || 0) + 1;
        operatorBreakdown[opId] = currentOp;
      }

      const dayDate = service.dataCriacao.toISOString().slice(0, 10);
      timelineBreakdown[dayDate] = (timelineBreakdown[dayDate] || 0) + 1;
    }

    const topEquipments = Object.values(equipmentBreakdown)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topOperators = Object.values(operatorBreakdown)
      .sort((a, b) => b.totalOS - a.totalOS)
      .slice(0, 10);

    const timeline = Object.entries(timelineBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      overview: {
        totalWorkOrders: totalOrders,
        totalDowntimeMinutes,
        totalDowntimeHours: Number((totalDowntimeMinutes / 60).toFixed(2)),
        averageRepairTimeMinutes:
          finishedOrdersCount > 0 ? Math.round(totalDowntimeMinutes / finishedOrdersCount) : 0,
      },
      causesDistribution: causesBreakdown,
      topProblematicEquipments: topEquipments,
      topRequestingOperators: topOperators,
      timeline,
    };
  }
}