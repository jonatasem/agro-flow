import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateWorkOrderService } from "../../services/WorkOrder/UpdateWorkOrderService.js";

interface UpdateWorkOrderBody {
  setor?: string | undefined;
  qruDescricao?: string | undefined;
  qth?: string | undefined;
  city?: string | undefined;
  solucaoTecnico?: string | undefined;
  tipoCausa?: string | undefined;
  status?: string | undefined;
  tecnicoResponsavelId?: string | undefined;
}

export class UpdateWorkOrderController {
  async handle(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as { id: string };
    const { 
      setor, 
      qruDescricao, 
      qth, 
      city, 
      solucaoTecnico, 
      tipoCausa, 
      status, 
      tecnicoResponsavelId 
    } = (req.body as UpdateWorkOrderBody);

    const updateWorkOrderService = new UpdateWorkOrderService();

    try {
      const updatedWorkOrder = await updateWorkOrderService.execute({
        id,
        setor,
        qruDescricao,
        qth,
        city,
        solucaoTecnico,
        tipoCausa,
        status,
        tecnicoResponsavelId,
      });

      return res.status(200).send(updatedWorkOrder);
    } catch (error: any) {
      return res.status(400).send({ error: error.message });
    }
  }
}