import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateEquipmentService } from "../../services/Equipment/UpdateEquipmentService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class UpdateEquipmentController {
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
        .send({ error: "O ID do equipamento é obrigatório." });
    }

    const { name, fleet } = (request.body ?? {}) as {
      name?: string;
      fleet?: string;
    };

    if (name === undefined && fleet === undefined) {
      return reply
        .status(400)
        .send({ error: "Informe ao menos um campo para atualização." });
    }

    try {
      const updated = await new UpdateEquipmentService().execute({
        id,
        name,
        fleet,
        userRole: request.userRole,
      });
      return reply.status(200).send(updated);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao atualizar equipamento.");
    }
  }
}