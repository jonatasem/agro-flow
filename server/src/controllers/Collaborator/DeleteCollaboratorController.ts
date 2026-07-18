import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteCollaboratorService } from "../../services/Collaborator/DeleteCollaboratorService.js";

export class DeleteCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Busca o id pela query
    const { id } = request.query as {
      id: string;
    };

    // Se o id nao for encontrado, avise
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do funcionario é obrigatório." });
    }

    // Cria um novo servico para deletar um colaborador
    const collaboratorService = new DeleteCollaboratorService();

    // Aguarda o service executar 
    const collaborator = await collaboratorService.execute({ id });

    // Retorna o colaborador excluido
    reply.status(200).send(collaborator);
  }
}
