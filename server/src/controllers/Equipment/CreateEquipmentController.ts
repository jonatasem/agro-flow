import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateEquipmentService, type CreateEquipmentProps } from "../../services/Equipment/CreateEquipmentService.js";

export class CreateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply.status(401).send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { name, fleet } = request.body as CreateEquipmentProps;
        
    if (!name || !fleet) {
      throw new Error("Todos os campos são obrigatórios.");
    }

    const equipmentService = new CreateEquipmentService();

    try {
      const result = await equipmentService.execute({
        name,
        fleet,
        userRole,
      });

      return reply.status(201).send(result);
    } catch(error: any){
      return reply.status(400).send({error});
    }
  }
}
