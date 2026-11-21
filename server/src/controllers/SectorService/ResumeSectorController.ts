import type { FastifyRequest, FastifyReply } from "fastify";
import { ResumeSectorService } from "../../services/SectorService/ResumeSectorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class ResumeSectorController {
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

    try {
      const result = await new ResumeSectorService().execute({
        sectorServiceId,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao retomar atendimento.");
    }
  }
}