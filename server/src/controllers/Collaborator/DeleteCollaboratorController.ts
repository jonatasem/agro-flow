import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteCollaboratorService } from "../../services/Collaborator/DeleteCollaboratorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class DeleteCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = (request.params ?? {}) as { id?: string };
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do colaborador é obrigatório." });
    }

    try {
      const result = await new DeleteCollaboratorService().execute({
        id,
        userRole: request.userRole,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao excluir colaborador.");
    }
  }
}