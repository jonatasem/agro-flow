import type { FastifyRequest, FastifyReply } from "fastify";
import { PauseSectorService } from "../../services/SectorService/PauseSectorService.js";

interface PauseSectorControllerProps { 
  reason: "FALTA_DE_PECA" | "AGUARDANDO_OUTRO_SETOR" | "OUTRO_MOTIVO";
  description: string;
}

export class PauseSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id: sectorServiceId } = request.params as { id: string };
    const { reason, description } = request.body as PauseSectorControllerProps;

    const tecnicoId = request.userId;

    if (!tecnicoId) {
      return reply
        .status(401)
        .send({ error: "Não autorizado. Técnico não identificado." });
    }

    if (!sectorServiceId) {
      return reply
        .status(400)
        .send({ error: "ID do serviço é obrigatório." });
    }
    
    if(!reason || !description){
      return reply
      .status(400)
      .send({ error: "O motivo e a descrição são obrigatórios para pausar uma O.S." });
    }

    const pauseService = new PauseSectorService();

    try {
      const result = await pauseService.execute({
        sectorServiceId,
        pauseReason: reason,
        observation: description,
        tecnicoId
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}