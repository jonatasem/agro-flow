import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateEquipmentService } from "../../services/Equipment/CreateEquipmentService.js";

export class CreateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, fleet } = request.body as {
      name: string;
      fleet: string;
    };

    const equipmentService = new CreateEquipmentService();
    const equipment = await equipmentService.execute({
      name,
      fleet,
    });

    return reply.status(201).send(equipment);
  }
}
