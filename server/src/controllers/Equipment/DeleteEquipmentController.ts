import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteEquipmentService } from "../../services/Equipment/DeleteEquipmentService.js";

export class DeleteEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado injetado pelo middleware
    const userRole = request.userRole;

    if (!userRole) {
      return reply.status(401).send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id:string }

    if (!id) {
      throw new Error("Id do equipamento não encontrado.");
    }

    const equipmentService = new DeleteEquipmentService();

    try {
      const result = await equipmentService.execute({ id, userRole });
      reply.status(200).send(result);
    } catch (error : any){
      reply.status(400).send({error});
    }
  }
}
