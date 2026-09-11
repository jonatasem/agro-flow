import type { FastifyRequest, FastifyReply } from "fastify";
import { ListWorkOrderService } from "../../services/WorkOrder/ListWorkOrderService.js";

interface ListWorkOrderProps {
  status?: string | undefined;
}

export class ListWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { status } = request.query as ListWorkOrderProps;

    if (!status) {
      return reply
        .status(400)
        .send({ error: "Forneça um status para buscar." });
    }

    const listWorkOrderService = new ListWorkOrderService();

    try {
      const workOrders = await listWorkOrderService.execute({
        status: status as string,
      });

      return reply.status(200).send(workOrders);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
