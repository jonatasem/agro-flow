// Importa os tipos do Fastify para manipulação de requisições e respostas
import type { FastifyRequest, FastifyReply } from "fastify";
// Importa o serviço de métricas do Dashboard
import { GetDashboardMetricsService, type DashboardFiltersProps } from "../../services/Metrics/GetDashboardMetricsService.js"

// Classe controladora responsável por receber as requisições HTTP do Dashboard
export class GetDashboardMetricsController {
  // Método que gerencia a requisição
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai todos os filtros passados via Query String da URL
    const {
      startDate,
      endDate,
      equipmentId,
      operatorId,
      tecnicoId,
      setor,
      tipoCausa,
    } = request.query as DashboardFiltersProps;

    // Instancia o serviço responsável pelos cálculos das métricas
    const getDashboardMetricsService = new GetDashboardMetricsService();

    try {
      // Executa o processamento passando o objeto com todos os filtros extraídos
      const metrics = await getDashboardMetricsService.execute({
        startDate,
        endDate,
        equipmentId,
        operatorId,
        tecnicoId,
        setor,
        tipoCausa,
      });

      // Retorna os dados consolidados com código HTTP 200 (OK)
      return reply.status(200).send(metrics);
    } catch (error: any) {
      // Retorna mensagem de erro com código HTTP 400 em caso de exceção
      return reply.status(400).send({ error: error.message });
    }
  }
}