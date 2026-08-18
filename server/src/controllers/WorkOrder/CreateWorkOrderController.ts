import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateWorkOrderService } from "../../services/WorkOrder/CreateWorkOrderService.js";

interface CreateWorkServiceProps {
  fleet: string;
  operatorId: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

export class CreateWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { fleet, operatorId, setor, qruDescricao, qth, city } = request.body as CreateWorkServiceProps;

    const criadoPor = (request as any).userId as string;

    if (!criadoPor) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const workOrderService = new CreateWorkOrderService();

    try {
      const result = await workOrderService.execute({
        fleet,
        operatorId,
        setor,
        qruDescricao,
        qth,
        city,
        criadoPor,
      });

      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}