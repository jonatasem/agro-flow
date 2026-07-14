import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateWorkOrderService } from "../../services/WorkOrder/CreateWorkOrderService.js";

export class CreateWorkOrderController {
     async handle(request:FastifyRequest, reply:FastifyReply) {
        const { fleet, setor, qruDescricao, qth, city, criadoPor } = request.body as {
            fleet: string;
            setor: string;
            qruDescricao: string,
            qth: string;
            city: string;
            criadoPor: string;
        };

        const workOrderService = new CreateWorkOrderService();

        try {
            const result = await workOrderService.execute({
                fleet,
                setor,
                qruDescricao,
                qth,
                city,
                criadoPor
            });
            return reply.status(201).send(result);
        } catch (error: any){
            return reply.status(400).send({ error: error.message });
        }
     }
}