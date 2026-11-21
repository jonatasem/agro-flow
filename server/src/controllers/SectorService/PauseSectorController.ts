import type { FastifyRequest, FastifyReply } from "fastify";
import {
  PauseSectorService,
  type PauseReason,
} from "../../services/SectorService/PauseSectorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class PauseSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userId) {
      return reply
        .status(401)
        .send({ error: "Não autorizado. Técnico não identificado." });
    }

    const { id: sectorServiceId } = (request.params ?? {}) as { id?: string };
    if (!sectorServiceId) {
      return reply
        .status(400)
        .send({ error: "O ID do serviço é obrigatório." });
    }

    const { reason, description } = (request.body ?? {}) as {
      reason?: PauseReason;
      description?: string;
    };

    if (!reason || !description?.trim()) {
      return reply.status(400).send({
        error: "O motivo e a descrição são obrigatórios para pausar uma O.S.",
      });
    }

    try {
      const result = await new PauseSectorService().execute({
        sectorServiceId,
        pauseReason: reason,
        observation: description.trim(),
        tecnicoId: request.userId,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao pausar atendimento.");
    }
  }
}