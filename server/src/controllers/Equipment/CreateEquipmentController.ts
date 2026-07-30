import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateEquipmentService } from "../../services/Equipment/CreateEquipmentService.js";

interface CreateEquipmentProps {
  name: string;
  fleet: string;
}

export class CreateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, fleet } = request.body as CreateEquipmentProps;

    const equipmentService = new CreateEquipmentService();

    try {
      const result = await equipmentService.execute({
        name,
        fleet,
      });

      return reply.status(201).send(result);
    } catch(error: any){
      return reply.status(400).send({error});
    }
  }
}
