import type { FastifyRequest, FastifyReply } from "fastify";
import { ListCollaboratorService } from "../../services/Collaborator/ListCollaboratorService.js";

export class ListCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const listService = new ListCollaboratorService();

    try {
      const result = await listService.execute({ userRole });
      return reply.status(200).send(result);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}
