import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateEquipmentService } from "../../services/Equipment/UpdateEquipmentService.js";

interface UpdateEquipmentBody {
  name?: string | undefined;
  fleet?: string | undefined;
}

export class UpdateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { name, fleet } = (request.body || {}) as UpdateEquipmentBody;

    const updateEquipmentService = new UpdateEquipmentService();

    try {
      const updatedEquipment = await updateEquipmentService.execute({
        id,
        name,
        fleet,
      });

      return reply.status(200).send(updatedEquipment);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}