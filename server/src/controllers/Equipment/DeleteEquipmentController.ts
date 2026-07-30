import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteEquipmentService } from "../../services/Equipment/DeleteEquipmentService.js";

export class DeleteEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id:string }

    const equipmentService = new DeleteEquipmentService();

    try {
      const result = await equipmentService.execute({ id });
      reply.status(200).send(result);
    } catch (error : any){
      reply.status(400).send({error});
    }
  }
}
