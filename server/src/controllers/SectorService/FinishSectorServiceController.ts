import type { FastifyRequest, FastifyReply } from "fastify";
import { FinishSectorServiceService } from "../../services/SectorService/FinishSectorServiceService.js";

interface FinishSectorServiceProps {
  solucaoTecnico: string;
  tipoCausa: string;
  usedPartIds: { partId: string; quantity: number }[];
  usedToolIds: string[];
}

export class FinishSectorServiceController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id: sectorServiceId } = request.params as { id: string };

        const { solucaoTecnico, tipoCausa, usedPartIds, usedToolIds } = request.body as FinishSectorServiceProps;

        const tecnicoId = request.userId;

        if (!tecnicoId) {
            return reply.status(401).send({ error: "Não autorizado. Técnico não identificado." });
        }

        const finishService = new FinishSectorServiceService();

        try {
            const result = await finishService.execute({
                sectorServiceId,
                solucaoTecnico,
                tipoCausa,
                tecnicoId,
                usedPartIds,
                usedToolIds
            });

            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}
