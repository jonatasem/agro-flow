import type { FastifyRequest, FastifyReply } from "fastify";
import { ListEquipmentService } from "../../services/Equipment/ListEquipmentService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class ListEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    try {
      const list = await new ListEquipmentService().execute();
      return reply.status(200).send(list);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao listar equipamentos.");
    }
  }
}