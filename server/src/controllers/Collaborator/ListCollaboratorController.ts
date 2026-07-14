import type { FastifyRequest, FastifyReply } from "fastify";
import { ListCollaboratorService } from "../../services/Collaborator/ListCollaboratorService.js";

export class ListCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listcollaboratorService = new ListCollaboratorService();
    const collaborator = await listcollaboratorService.execute();

    reply.status(200).send(collaborator);
  }
}
