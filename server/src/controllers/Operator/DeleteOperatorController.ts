import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteOperatorService } from "../../services/Operator/DeleteOfficialService.js";

export class DeleteOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.query as {
      id: string;
    };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do funcionario é obrigatório." });
    }

    const operatorService = new DeleteOperatorService();

    const operator = await operatorService.execute({ id });

    reply.status(200).send(operator);
  }
}

