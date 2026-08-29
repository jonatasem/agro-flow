
import type { FastifyRequest, FastifyReply } from "fastify";
import { FinishSectorServiceService } from "../../services/SectorService/FinishSectorServiceService.js";

interface FinishSectorServiceBody {
  solucaoTecnico: string;
  tipoCausa: string;
}

export class FinishSectorServiceController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: sectorServiceId } = request.params as { id: string };

    if (!sectorServiceId) {
      return reply
        .status(400)
        .send({ error: "O ID do serviço é obrigatório." });
    }

    const { solucaoTecnico, tipoCausa } = request.body as FinishSectorServiceBody;

    if (!solucaoTecnico || !tipoCausa) {
      return reply
      .status(400)
      .send({ error: "A solução do técnico e o tipo de causa são necessários para finalizar o serviço."});
    }

    const tecnicoId = request.userId;

    if (!tecnicoId) {
      return reply
        .status(401)
        .send({ error: "Não autorizado. Técnico não identificado." });
    }

    const finishService = new FinishSectorServiceService();

    try {
      const result = await finishService.execute({
        sectorServiceId,
        solucaoTecnico,
        tipoCausa,
        tecnicoId,
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
