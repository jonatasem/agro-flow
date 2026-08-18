import type { FastifyRequest, FastifyReply } from "fastify";
import { GetDashboardMetricsService, type DashboardFiltersProps } from "../../services/Metrics/GetDashboardMetricsService.js";

export class GetDashboardMetricsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const {
      startDate,
      endDate,
      equipmentId,
      operatorId,
      tecnicoId,
      setor,
      tipoCausa,
    } = request.query as DashboardFiltersProps;

    const getDashboardMetricsService = new GetDashboardMetricsService();

    try {
      const metrics = await getDashboardMetricsService.execute({
        startDate,
        endDate,
        equipmentId,
        operatorId,
        tecnicoId,
        setor,
        tipoCausa,
      });

      return reply.status(200).send(metrics);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}