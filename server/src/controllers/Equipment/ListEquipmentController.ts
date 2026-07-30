import type { FastifyRequest, FastifyReply } from "fastify";
import { ListEquipmentService } from "../../services/Equipment/ListEquipmentService.js";

export class ListEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listEquipmentService = new ListEquipmentService();
    
    try {
      const result = await listEquipmentService.execute();
      reply.status(200).send(result);
    } catch(error: any){
      reply.status(400).send
    }
  }
}
