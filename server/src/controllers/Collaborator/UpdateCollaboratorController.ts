import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateCollaboratorService, type UpdateCollaboratorProps } from "../../services/Collaborator/UpdateCollaboratorService.js";

export class UpdateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const { name, registration, city, status } = request.body as UpdateCollaboratorProps;

    const updateCollaboratorService = new UpdateCollaboratorService();

    try {
      const result = await updateCollaboratorService.execute({
        id,
        name,
        registration,
        city,
        status,
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}