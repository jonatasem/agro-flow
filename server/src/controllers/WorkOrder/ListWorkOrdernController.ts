import type { FastifyRequest, FastifyReply } from "fastify";
import { ListWorkOrderService } from "../../services/WorkOrder/ListWorkOrderService.js";

interface ListWorkOrderProps {
  status?: string | undefined;
}

export class ListWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Captura o status da os pela query
    const { status } = request.query as ListWorkOrderProps;

    // Cria um servico para buscar a lista de os
    const listWorkOrderService = new ListWorkOrderService();

    // Tenta listar as os que tenha um status
    try {
      const workOrders = await listWorkOrderService.execute({
        status: status as string,
      });

      // Retorna as os criadas
      return reply.status(200).send(workOrders);
    } catch (error: any) {

      // Retorna um erro se falhar
      return reply.status(400).send({ error: error.message });
    }
  }
}
