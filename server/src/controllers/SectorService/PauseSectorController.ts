import type { FastifyRequest, FastifyReply } from "fastify";
import { PauseSectorService } from "../../services/SectorService/PauseSectorService.js";

interface PauseSectorControllerProps { 
  reason: "FALTA_DE_PECA" | "AGUARDANDO_OUTRO_SETOR" | "OUTRO_MOTIVO";
  description: string;
}

export class PauseSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: sectorServiceId } = request.params as { id: string };
    
    const { reason, description } = (request.body || {}) as PauseSectorControllerProps;

    const pauseService = new PauseSectorService();

    try {
      const result = await pauseService.execute({
        sectorServiceId,
        pauseReason: reason,       // Mapeado para o nome esperado pelo Service
        observation: description,  // Mapeado para o nome esperado pelo Service
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}