import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateCollaboratorService } from "../../services/Collaborator/CreateCollaboratorService.js";

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, role, sector, registration, password, city } = request.body as any;

    // Extrai o cargo autenticado
    const userRole = request.userRole || request.user?.role;

    // Se o middleware por algum motivo falhar ou não injetar o papel, barra antes da Service
    if (!userRole) {
      return reply.status(401).send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const collaboratorService = new CreateCollaboratorService();

    try {
      const collaborator = await collaboratorService.execute({
        name,
        role,
        sector,
        registration,
        password,
        city,
        userRole,
      });

      return reply.status(201).send(collaborator);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}