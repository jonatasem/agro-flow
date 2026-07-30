import type { FastifyRequest, FastifyReply } from "fastify";
import { ListCollaboratorService } from "../../services/Collaborator/ListCollaboratorService.js";

export class ListCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listcollaboratorService = new ListCollaboratorService();

    try {
      const result = await listcollaboratorService.execute();
      reply.status(200).send(result);
    } catch(error : any){
      return reply.status(400).send({error})
    }
  }
}
