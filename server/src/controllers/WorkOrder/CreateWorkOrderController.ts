import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateWorkOrderService } from "../../services/WorkOrder/CreateWorkOrderService.js";

export class CreateWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca os dados no corpo da requisicao
    const { fleet, setor, qruDescricao, qth, city } = request.body as {
      fleet: string;
      setor: string;
      qruDescricao: string;
      qth: string;
      city: string;
    };

    // Busca o id pelo userId.
    const criadoPor = request.userId;

    // Cria um servico para criar a os
    const workOrderService = new CreateWorkOrderService();

    // Tenta salvar no banco de dados
    try {
      const result = await workOrderService.execute({
        fleet,
        setor,
        qruDescricao,
        qth,
        city,
        criadoPor,
      });

      // Retorna a os criada
      return reply.status(201).send(result);
    } catch (error: any) {

      // Retorna um erro se falhar
      return reply.status(400).send({ error: error.message });
    }
  }
}
