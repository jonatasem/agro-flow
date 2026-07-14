import type { FastifyRequest, FastifyReply } from "fastify";
import { ListOperatorService } from "../../services/Operator/ListOfficialService.js";

export class ListOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listOperatorService = new ListOperatorService();
    const operator = await listOperatorService.execute();

    reply.status(200).send(operator);
  }
}
