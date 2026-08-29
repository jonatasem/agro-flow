import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateCollaboratorService } from "../../services/Collaborator/CreateCollaboratorService.js";

export interface CreateCollaboratorProps {
  name: string;
  role: string;
  sector: string;
  registration: string;
  password: string;
  city: string;
}

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    if (!userRole) {
      return reply
      .status(401)
      .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { name, role, sector, registration, password, city } = request.body as CreateCollaboratorProps;

    if (!name || !role || !sector || !registration || !password || !city) {
      return reply
        .status(400)
        .send({ error: "Preencha todos os campos obrigatórios." });
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
