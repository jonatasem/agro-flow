import prisma from "../../prisma/index.js";

import {
  calculateVolumeMetrics,
  calculateTimeMetrics,
  calculateOffenderMetrics,
} from "../../utility/metricsUtils.js";

export class GetDashboardMetricsService {
  async execute() {
    // Busca os dados incluindo as relações necessárias
    const workOrders = await prisma.workOrder.findMany({
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            tecnicoResponsavel: true,
            criador: true,
            pauses: true,
          },
        },
      },
    });

    // Achata o array de setores para facilitar as análises individuais
    const todosSetores = workOrders.flatMap((order) => order.setores);

    return {
      volumeOperacional: calculateVolumeMetrics(workOrders),
      indicadoresDeTempo: calculateTimeMetrics(todosSetores),
      analiseDeOfensores: calculateOffenderMetrics(workOrders, todosSetores),
    };
  }
}