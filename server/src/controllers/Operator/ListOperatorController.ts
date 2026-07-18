import type { FastifyRequest, FastifyReply } from "fastify";
import { ListOperatorService } from "../../services/Operator/ListOfficialService.js";

export class ListOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    
    // Cria um servico para listar o operadores
    const listOperatorService = new ListOperatorService();

    // Lista os operadores
    const operator = await listOperatorService.execute();

    // Retorna a lista de operadores
    reply.status(200).send(operator);
  }
}
