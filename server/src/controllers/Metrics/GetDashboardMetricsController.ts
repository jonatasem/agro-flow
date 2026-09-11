import type { FastifyRequest, FastifyReply } from "fastify";
import { GetDashboardMetricsService } from "../../services/Metrics/GetDashboardMetricsService.js";

export class GetDashboardMetricsController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const getDashboardMetricsService = new GetDashboardMetricsService();

    // Executa a lógica de cálculo
    const metrics = await getDashboardMetricsService.execute();

    // Retorna a resposta HTTP com status 200 (OK)
    return reply.status(200).send(metrics);
  }
}