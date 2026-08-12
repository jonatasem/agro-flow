import type { FastifyRequest, FastifyReply } from "fastify";
import { ResumeSectorService } from "../../services/SectorService/ResumeSectorService.js";

export class ResumeSectorController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id: sectorServiceId } = request.params as { id: string };

        const resumeService = new ResumeSectorService();

        try {
            const result = await resumeService.execute({ sectorServiceId });
            return reply.status(200).send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}