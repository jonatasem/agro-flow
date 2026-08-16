import type { FastifyRequest, FastifyReply } from "fastify";
import { RemoveUsedPartService } from "../../services/PartService/RemoveUsedPartService.js";

export class RemoveUsedPartController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { usedPartId } = request.params as { usedPartId: string };

    const removeUsedPartService = new RemoveUsedPartService();

    try {
      const result = await removeUsedPartService.execute(usedPartId);
      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}