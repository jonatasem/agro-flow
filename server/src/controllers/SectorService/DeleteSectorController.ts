import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteSectorService } from "../../services/SectorService/DeleteSectorService.js";

interface DeleteSectorParams {
  id: string;
}

export class DeleteSectorController {
  async handle(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as DeleteSectorParams;

    const deleteSectorService = new DeleteSectorService();

    try {
      const result = await deleteSectorService.execute({ id });

      return res.send(result);
    } catch (error: any) {
      return res.status(400).send({ error: error.message });
    }
  }
}