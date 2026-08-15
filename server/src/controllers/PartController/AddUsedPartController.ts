import type { FastifyRequest, FastifyReply } from "fastify";
import { AddUsedPartService } from "../../services/PartService/AddUsedPartService.js";

interface AddUsedPartBody {
  partId: string;
  quantity: number;
}

export class AddUsedPartController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Captura o ID do serviço nos parâmetros da URL (/sector-service/:id/parts)
    const { id: sectorServiceId } = request.params as { id: string };

    // Captura a peça e a quantidade do corpo da requisição
    const { partId, quantity } = (request.body || {}) as AddUsedPartBody;

    const addUsedPartService = new AddUsedPartService();

    try {
      const result = await addUsedPartService.execute({
        sectorServiceId,
        partId,
        quantity,
      });

      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}