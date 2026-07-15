import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateCollaboratorService } from "../../services/Collaborator/CreateCollaboratorService.js";

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, role, registration, password, city } = request.body as {
      name: string;
      role: string;
      registration: string;
      password: string;
      city: string;
    };

    const authorizedService = new CreateCollaboratorService();
    const authorized = await authorizedService.execute({
      name,
      role,
      registration,
      password,
      city,
    });

    return reply.status(201).send(authorized);
  }
}
