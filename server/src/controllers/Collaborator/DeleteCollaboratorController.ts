import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteCollaboratorService } from "../../services/Collaborator/DeleteCollaboratorService.js";

export class DeleteCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado injetado pelo middleware
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id: string };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "Id do funcionário não informado." });
    }

    const collaboratorService = new DeleteCollaboratorService();

    try {
      const result = await collaboratorService.execute({ id, userRole });
      return reply.status(200).send(result);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}