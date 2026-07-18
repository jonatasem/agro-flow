import type { FastifyRequest, FastifyReply } from "fastify";
import { ListCollaboratorService } from "../../services/Collaborator/ListCollaboratorService.js";

export class ListCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Cria um service para listar os colaboradores
    const listcollaboratorService = new ListCollaboratorService();

    // Aguarda o service executar
    const collaborator = await listcollaboratorService.execute();

    // Retorna a lista de colaboradores
    reply.status(200).send(collaborator);
  }
}
