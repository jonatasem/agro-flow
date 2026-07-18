import type { FastifyRequest, FastifyReply } from "fastify";
import { ListEquipmentService } from "../../services/Equipment/ListEquipmentService.js";

export class ListEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Cria o servico pra listar os equipamentos
    const listEquipmentService = new ListEquipmentService();
    
    // Executa o metoto para buscar
    const official = await listEquipmentService.execute();

    // Retorna a lista de equipamentos cadastrados
    reply.status(200).send(official);
  }
}
