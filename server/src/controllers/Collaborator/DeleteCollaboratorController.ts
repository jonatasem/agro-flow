import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteCollaboratorService } from "../../services/Collaborator/DeleteCollaboratorService.js";

export class DeleteCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const collaboratorService = new DeleteCollaboratorService();

    try {
      const result = await collaboratorService.execute({ id });
      return reply.status(200).send(result);
    } catch(error : any) {
      return reply.status(400).send({error})
    }
  }
}
