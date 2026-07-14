import type { FastifyRequest, FastifyReply } from "fastify";
import { ListEquipmentService } from "../../services/Equipment/ListEquipmentService.js";

export class ListEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listEquipmentService = new ListEquipmentService();
    const official = await listEquipmentService.execute();

    reply.status(200).send(official);
  }
}
