import type { FastifyRequest, FastifyReply } from "fastify";
import { ListEquipmentService } from "../../services/Equipment/ListEquipmentService.js";

export class ListEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado injetado pelo middleware
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const listEquipmentService = new ListEquipmentService();

    try {
      const result = await listEquipmentService.execute();
      return reply.status(200).send(result);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}
