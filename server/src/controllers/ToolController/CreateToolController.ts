import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateToolService } from "../../services/ToolService/CreateToolService.js";

interface CreateToolBody {
  name: string;
  sector: string;
}

export class CreateToolController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, sector } = (request.body || {}) as CreateToolBody;

    const createToolService = new CreateToolService();

    try {
      const tool = await createToolService.execute({
        name,
        sector,
      });

      return reply.status(201).send(tool);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}