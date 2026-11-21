import type { FastifyRequest, FastifyReply } from "fastify";
import { StartSectorServiceService } from "../../services/SectorService/StartSectorServiceService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class StartSectorServiceController {
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
      const result = await new StartSectorServiceService().execute({
        sectorServiceId,
        tecnicoId: request.userId,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao iniciar manutenção.");
    }
  }
}