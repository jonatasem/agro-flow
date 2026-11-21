import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateOperatorService } from "../../services/Operator/UpdateOperatorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class UpdateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = (request.params ?? {}) as { id?: string };
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do operador é obrigatório." });
    }

    const { name, registration, city, status } = (request.body ?? {}) as {
      name?: string;
      registration?: string;
      city?: string;
      status?: boolean;
    };

    if (
      name === undefined &&
      registration === undefined &&
      city === undefined &&
      status === undefined
    ) {
      return reply
        .status(400)
        .send({ error: "Informe ao menos um campo para atualização." });
    }

    try {
      const updated = await new UpdateOperatorService().execute({
        id,
        name,
        registration,
        city,
        status,
        userRole: request.userRole,
      });
      return reply.status(200).send(updated);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao atualizar operador.");
    }
  }
}