import type { FastifyRequest ,FastifyReply } from "fastify";
import { StartSectorServiceService } from "../../services/SectorService/StartSectorServiceService.js";

export class StartSectorServiceController {
    async handle (request: FastifyRequest, reply: FastifyReply) {
        
        // Pegamos o id do servico
        const { id: sectorServiceId } = request.params as { id: string };

        // Pega o id do usuario logado
        const tecnicoId = request.userId;

        // Inicia o servico
        const startService = new StartSectorServiceService();

        try {
            // Tenta iniciar o servico
            const result = await startService.execute({
                sectorServiceId,
                tecnicoId,
            });

            // Retorna o servico em manutencao
            return reply.status(200).send(result);
        } catch(error: any) {

            // Se falhar, retorna um erro
            return reply.status(400).send({error: error.message});
        }
    }
}