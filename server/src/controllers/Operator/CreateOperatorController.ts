import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateOperatorService } from "../../services/Operator/CreateOperatorService.js";

interface CreateOperatorProps {
    name: string;
    registration: string;
    city: string;
}

export class CreateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    const { name, registration, city } = request.body as CreateOperatorProps;

    const operatorService = new CreateOperatorService();

    try {
      const result = await operatorService.execute({
        name,
        registration,
        city
      });

      return reply.status(201).send(result);    
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
