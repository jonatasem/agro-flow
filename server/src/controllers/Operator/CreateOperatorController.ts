import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateOperatorService } from "../../services/Operator/CreateOficialService.js";

export class CreateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca os dados no corpo da requicao
    const { name, registration } = request.body as {
      name: string;
      registration: string;
    };

        // Cria um novo service para criar um operador
    const operatorService = new CreateOperatorService();
    const operator = await operatorService.execute({
      name,
      registration,
    });

       // Retorna os dados cadastrados
    return reply.status(201).send(operator);
  }
}
