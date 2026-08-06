import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteWorkOrderService } from "../../services/WorkOrder/DeleteWorkOrderService.js";

interface DeleteWorkOrderParams {
  id: string;
}

export class DeleteWorkOrderController {
  async handle(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as DeleteWorkOrderParams;

    const deleteWorkOrderService = new DeleteWorkOrderService();

    try {
      const result = await deleteWorkOrderService.execute({ id });

      return res.send(result);
    } catch (error: any) {
      return res.status(400).send({ error: error.message });
    }
  }
}