import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateEquipmentService } from "../../services/Equipment/UpdateEquipmentService.js";

export interface UpdateEquipmentBody {
  name?: string;
  fleet?: string;
}

export class UpdateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id: string };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do equipamento é obrigatório para atualização." });
    }

    const { name, fleet } = request.body as UpdateEquipmentBody;

    // Garante que ao menos um campo foi enviado para atualização
    if (name === undefined && fleet === undefined) {
      return reply
        .status(400)
        .send({ error: "Informe ao menos um campo para atualização." });
    }

    const updateEquipmentService = new UpdateEquipmentService();

    try {
      const updatedEquipment = await updateEquipmentService.execute({
        id,
        name,
        fleet,
        userRole,
      });

      return reply.status(200).send(updatedEquipment);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}
