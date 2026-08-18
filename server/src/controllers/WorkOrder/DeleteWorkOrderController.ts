import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteWorkOrderService } from "../../services/WorkOrder/DeleteWorkOrderService.js";

interface DeleteWorkOrderParams {
  id: string;
}

export class DeleteWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as DeleteWorkOrderParams;

    const deleteWorkOrderService = new DeleteWorkOrderService();

    try {
      const result = await deleteWorkOrderService.execute({ id });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}