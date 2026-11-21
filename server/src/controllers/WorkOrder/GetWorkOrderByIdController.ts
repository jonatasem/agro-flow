import type { FastifyRequest, FastifyReply } from "fastify";
import { GetWorkOrderByIdService } from "../../services/WorkOrder/GetWorkOrderByIdService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class GetWorkOrderByIdController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id: workOrderId } = (request.params ?? {}) as { id?: string };
    if (!workOrderId) {
      return reply
        .status(400)
        .send({ error: "O ID da ordem é obrigatório." });
    }

    try {
      const workOrder = await new GetWorkOrderByIdService().execute({
        workOrderId,
        userRole: request.userRole,
      });
      return reply.status(200).send(workOrder);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao buscar Ordem de Serviço.");
    }
  }
}