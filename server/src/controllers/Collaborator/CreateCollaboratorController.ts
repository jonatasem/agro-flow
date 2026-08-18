import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateCollaboratorService,
  type CreateCollaboratorProps,
} from "../../services/Collaborator/CreateCollaboratorService.js";

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Pega todos os campos do corpo da requisição.
    const { name, role, sector, registration, password, city } =
      request.body as CreateCollaboratorProps;

    // chama o serviço pra executar.
    const collaboratorService = new CreateCollaboratorService();

    // Cadastra no banco de dados.
    try {
      const collaborator = await collaboratorService.execute({
        name,
        role,
        sector,
        registration,
        password,
        city,
      });

      // Retorna o funcionario cadastrado.
      return reply.status(201).send(collaborator);
    } catch (error: any) {
      // Ou um erro
      return reply.status(400).send({ error: error.message });
    }
  }
}