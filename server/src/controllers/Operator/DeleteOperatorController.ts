import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteOperatorService } from "../../services/Operator/DeleteOfficialService.js";

export class DeleteOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca o id pela query
    const { id } = request.query as {
      id: string;
    };

    // Se o id nao existir, retorne um erro
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do funcionario é obrigatório." });
    }

    // Cria um servico para deletar o operador
    const operatorService = new DeleteOperatorService();

    // Exclui o operador pelo id
    const operator = await operatorService.execute({ id });

    // Retorna o operador excluido
    reply.status(200).send(operator);
  }
}
