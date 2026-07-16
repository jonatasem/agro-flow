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

    const { name, role, registration, password, city } = request.body as CreateCollaboratorProps;

    const collaboratorService = new CreateCollaboratorService();
   
    try {
      const collaborator = await collaboratorService.execute({
        name,
        role,
        registration,
        password,
        city,
      });

      return reply.status(201).send(collaborator);
    } catch (error: any){
      return reply.status(400).send({error: error.message});
    }
  }
}
