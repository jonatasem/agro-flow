import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateCollaboratorService } from "../../services/Collaborator/CreateCollaboratorService.js";

interface CreateCollaboratorProps {
  name: string;
  role: string;
  registration: string;
  password: string;
  city: string;
}

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca os dados no corpo da requicao
    const { name, role, registration, password, city } =
      request.body as CreateCollaboratorProps;

    // Cria um novo service para criar um colaborador
    const collaboratorService = new CreateCollaboratorService();

    // Tenta cadastrar
    try {
      const collaborator = await collaboratorService.execute({
        name,
        role,
        registration,
        password,
        city,
      });

      // Retorna o colaborador cadastrados
      return reply.status(201).send(collaborator);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
