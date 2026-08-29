import type { FastifyRequest, FastifyReply } from "fastify";
import { GetWorkOrderByIdService } from "../../services/WorkOrder/GetWorkOrderByIdService.js";

export class GetWorkOrderByIdController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
      .status(401)
      .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id: workOrderId } = request.params as { id: string };

    if (!workOrderId) {
      return reply
      .status(400)
      .send({ error: "O ID da ordem é obrigatório." });
    }

    const getWorkOrderByIdService = new GetWorkOrderByIdService();

    try {
      const workOrder = await getWorkOrderByIdService.execute({ workOrderId, userRole });
      return reply.status(200).send(workOrder);
    } catch (error: any) {
      const statusCode = error.message === "Ordem de Serviço não encontrada." ? 404 : 400;
      return reply.status(statusCode).send({ error: error.message });
    }
  }
}