import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteEquipmentService } from "../../services/Equipment/DeleteEquipmentService.js";

export class DeleteEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca o id do equipamento pelo query
    const { id } = request.query as {
      id: string;
    };

    // Se nao existir o id, retorna um erro
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do equipamento é obrigatório." });
    }

    // Cria o servico de delete
    const equipmentService = new DeleteEquipmentService();

    // Executa o delete no servico
    const equipment = await equipmentService.execute({ id });

    // Retorna o equipamento excluido
    reply.status(200).send(equipment);
  }
}
