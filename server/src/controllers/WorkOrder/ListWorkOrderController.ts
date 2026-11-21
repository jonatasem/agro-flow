import type { FastifyRequest, FastifyReply } from "fastify";
import { ListWorkOrderService } from "../../services/WorkOrder/ListWorkOrderService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class ListWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { status } = (request.query ?? {}) as { status?: string };

    try {
      const workOrders = await new ListWorkOrderService().execute({ status });
      return reply.status(200).send(workOrders);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao listar Ordens de Serviço.");
    }
  }
}