import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteWorkOrderService } from "../../services/WorkOrder/DeleteWorkOrderService.js";

interface DeleteWorkOrderParams {
  id: string;
}

export class DeleteWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
      .status(401)
      .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as DeleteWorkOrderParams;

    if (!id) {
      return reply
      .status(400)
      .send({ error: "O ID da ordem é obrigatório." });
    }

    const deleteWorkOrderService = new DeleteWorkOrderService();

    try {
      const result = await deleteWorkOrderService.execute({ id, userRole });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}