import type { FastifyRequest, FastifyReply } from "fastify";
import { FinishSectorServiceService } from "../../services/SectorService/FinishSectorServiceService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class FinishSectorServiceController {
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

    const { solucaoTecnico, tipoCausa } = (request.body ?? {}) as {
      solucaoTecnico?: string;
      tipoCausa?: string;
    };

    if (!solucaoTecnico?.trim()) {
      return reply
        .status(400)
        .send({ error: "A solução do técnico é obrigatória para finalizar." });
    }

    try {
      const result = await new FinishSectorServiceService().execute({
        sectorServiceId,
        solucaoTecnico: solucaoTecnico.trim(),
        tipoCausa: tipoCausa?.trim() || undefined,
        tecnicoId: request.userId,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao finalizar atendimento.");
    }
  }
}