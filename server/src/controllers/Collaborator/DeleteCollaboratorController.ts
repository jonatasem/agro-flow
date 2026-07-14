import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteCollaboratorService } from "../../services/Collaborator/DeleteCollaboratorService.js";

export class DeleteCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.query as {
      id: string;
    };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do funcionario é obrigatório." });
    }

    const collaboratorService = new DeleteCollaboratorService();

    const collaborator = await collaboratorService.execute({ id });

    reply.status(200).send(collaborator);
  }
}
