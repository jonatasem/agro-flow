import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateOperatorService } from "../../services/Operator/CreateOficialService.js";

export class CreateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, registration } = request.body as {
      name: string;
      registration: string;
    };

    const operatorService = new CreateOperatorService();
    const operator = await operatorService.execute({
      name,
      registration
    });

    return reply.status(201).send(operator);
  }
}
