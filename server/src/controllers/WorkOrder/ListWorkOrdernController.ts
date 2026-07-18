import type { FastifyRequest, FastifyReply } from "fastify";
import { ListWorkOrderService } from "../../services/WorkOrder/ListWorkOrderService.js";

interface ListWorkOrderProps {
  status?: string | undefined;
}

export class ListWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Captura o status da query string.
    // /work-order?status=ABERTA
    const { status } = request.query as ListWorkOrderProps;

    const listWorkOrderService = new ListWorkOrderService();

    try {
      const workOrders = await listWorkOrderService.execute({
        status: status as string,
      });
      return reply.status(200).send(workOrders);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
