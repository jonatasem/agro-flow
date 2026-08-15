import type { FastifyRequest, FastifyReply } from "fastify";
import { PauseSectorService } from "../../services/SectorService/PauseSectorService.js";

interface PauseSectorControllerProps { 
    reason: "PAUSADO_PECA" | "PAUSADO_OUTRO_SETOR";
    description: string;
}

export class PauseSectorController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id: sectorServiceId } = request.params as { id: string };
        
        // O (request.body || {}) impede o crash se o body vier undefined
        const { reason, description } = (request.body || {}) as PauseSectorControllerProps;

        const pauseService = new PauseSectorService();

        try {
            const result = await pauseService.execute({
                sectorServiceId,
                reason,
                description
            });

            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}