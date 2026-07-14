import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteEquipmentService } from "../../services/Equipment/DeleteEquipmentService.js";

export class DeleteEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.query as {
      id: string;
    };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do equipamento é obrigatório." });
    }

    const equipmentService = new DeleteEquipmentService();

    const equipment = await equipmentService.execute({ id });

    reply.status(200).send(equipment);
  }
}
