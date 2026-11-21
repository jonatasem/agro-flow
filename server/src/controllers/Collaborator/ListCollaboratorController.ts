import type { FastifyRequest, FastifyReply } from "fastify";
import { ListCollaboratorService } from "../../services/Collaborator/ListCollaboratorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class ListCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    try {
      const list = await new ListCollaboratorService().execute({
        userRole: request.userRole,
      });
      return reply.status(200).send(list);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao listar colaboradores.");
    }
  }
}