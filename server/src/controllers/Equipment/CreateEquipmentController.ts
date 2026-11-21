import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateEquipmentService } from "../../services/Equipment/CreateEquipmentService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class CreateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { name, fleet } = (request.body ?? {}) as {
      name?: string;
      fleet?: string;
    };

    if (!name?.trim() || !fleet?.trim()) {
      return reply
        .status(400)
        .send({ error: "Nome e frota são obrigatórios." });
    }

    try {
      const created = await new CreateEquipmentService().execute({
        name: name.trim(),
        fleet: fleet.trim(),
        userRole: request.userRole,
      });
      return reply.status(201).send(created);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao cadastrar equipamento.");
    }
  }
}