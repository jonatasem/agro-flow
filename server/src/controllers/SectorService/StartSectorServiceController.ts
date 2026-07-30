import type { FastifyRequest ,FastifyReply } from "fastify";
import { StartSectorServiceService } from "../../services/SectorService/StartSectorServiceService.js";

export class StartSectorServiceController {
    async handle (request: FastifyRequest, reply: FastifyReply) {
        const { id: sectorServiceId } = request.params as { id : string };
        const tecnicoId = ( request as any ).userId as string;

        if(!tecnicoId){
            return reply.status(401).send({error: "Não autorizado. Técnico não autorizado."})
        }

        const startService = new StartSectorServiceService();

        try {
            const result = await startService.execute({
                sectorServiceId,
                tecnicoId,
            });

            return reply.status(200).send(result);
        } catch(error: any) {
            return reply.status(400).send({error: error.message});
        }
    }
}