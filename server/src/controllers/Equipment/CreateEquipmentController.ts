import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateEquipmentService } from "../../services/Equipment/CreateEquipmentService.js";

export class CreateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca do dados no corpo da requisicao
    const { name, fleet } = request.body as {
      name: string;
      fleet: string;
    };

    // Cria um servico para criar o equipamento
    const equipmentService = new CreateEquipmentService();

    // Executa o metodo execute do service
    const equipment = await equipmentService.execute({
      name,
      fleet,
    });

    // Retorna o equipamento criado
    return reply.status(201).send(equipment);
  }
}
