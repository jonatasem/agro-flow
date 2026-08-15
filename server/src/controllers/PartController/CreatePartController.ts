import type { FastifyRequest, FastifyReply } from "fastify";
import { CreatePartService } from "../../services/PartService/CreatePartService.js";

interface CreatePartBody {
    name: string; // nome da ferramenta / material
    sector: string; // setor da ferramenta
    stockQuantity: number; // quantidade a ser inserida
}

export class CreatePartController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { name, sector, stockQuantity } = request.body as CreatePartBody;

        const createPartService = new CreatePartService();

        try {
            const part = await createPartService.execute({
                name,
                sector,
                stockQuantity,
            });

            return reply.status(201).send(part);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}