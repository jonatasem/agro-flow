import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteOperatorService } from "../../services/Operator/DeleteOperatorService.js";

export class DeleteOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id: string };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do funcionario é obrigatório." });
    }

    const operatorService = new DeleteOperatorService();

    const operator = await operatorService.execute({ id, userRole });

    reply.status(200).send(operator);
  }
}
