import type { FastifyRequest, FastifyReply } from "fastify";
import { GetWorkOrderByIdService } from "../../services/WorkOrder/GetWorkOrderByIdService.js";

export class GetWorkOrderByIdController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: workOrderId } = request.params as { id: string };

    const getWorkOrderByIdService = new GetWorkOrderByIdService();

    try {
      const workOrder = await getWorkOrderByIdService.execute({ workOrderId });
      return reply.status(200).send(workOrder);
    } catch (error: any) {
      const statusCode = error.message === "Ordem de Serviço não encontrada." ? 404 : 400;
      return reply.status(statusCode).send({ error: error.message });
    }
  }
}