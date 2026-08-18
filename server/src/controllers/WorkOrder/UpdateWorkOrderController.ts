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
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const {
      setor,
      qruDescricao,
      qth,
      city,
      solucaoTecnico,
      tipoCausa,
      status,
      tecnicoResponsavelId,
    } = (request.body || {}) as UpdateWorkOrderBody;

    const updateWorkOrderService = new UpdateWorkOrderService();

    try {
      const updatedSector = await updateWorkOrderService.execute({
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

      return reply.status(200).send(updatedSector);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}