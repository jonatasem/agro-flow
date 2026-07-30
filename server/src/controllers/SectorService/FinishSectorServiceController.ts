import type { FastifyRequest, FastifyReply } from "fastify";
import { FinishSectorServiceService } from "../../services/SectorService/FinishSectorServiceService.js";

interface FinishSectorServiceProps {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string;
    tecnicoId: string;
}

export class FinishSectorServiceController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: sectorServiceId } = request.params as { id: string };

    const { solucaoTecnico, tipoCausa } = request.body as {
      solucaoTecnico: string;
      tipoCausa?: string;
    };

    const tecnicoId = request.userId;

    if (!tecnicoId) {
      return reply.status(401).send({ error: "Não autorizado. Técnico não identificado." });
    }

    const finishService = new FinishSectorServiceService();

    try {
      const dadosParaFinalizar: FinishSectorServiceProps = {
        sectorServiceId,
        solucaoTecnico,
        tecnicoId,
      };

      if (tipoCausa) {
        dadosParaFinalizar.tipoCausa = tipoCausa;
      }

      const result = await finishService.execute(dadosParaFinalizar);

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}