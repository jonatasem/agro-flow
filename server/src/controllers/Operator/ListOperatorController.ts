import type { FastifyRequest, FastifyReply } from "fastify";
import { ListOperatorService } from "../../services/Operator/ListOperatorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class ListOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    try {
      const list = await new ListOperatorService().execute();
      return reply.status(200).send(list);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao listar operadores.");
    }
  }
}