import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateSectorService } from "../../services/SectorService/UpdateSectorService.js";

interface UpdateSectorParams {
  id: string;
}

interface UpdateSectorBody {
  setor?: string | undefined;
  qruDescricao?: string | undefined;
  qth?: string | undefined;
  city?: string | undefined;
  solucaoTecnico?: string | undefined;
  tipoCausa?: string | undefined;
  status?: string | undefined;
  tecnicoResponsavelId?: string | undefined;
}

export class UpdateSectorController {
  async handle(req: FastifyRequest, res: FastifyReply) {
    const { id } = req.params as UpdateSectorParams;
    const { 
      setor, 
      qruDescricao, 
      qth, 
      city, 
      solucaoTecnico, 
      tipoCausa, 
      status, 
      tecnicoResponsavelId 
    } = (req.body || {}) as UpdateSectorBody;

    const updateSectorService = new UpdateSectorService();

    try {
      const updatedSector = await updateSectorService.execute({
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

      return res.status(200).send(updatedSector);
    } catch (error: any) {
      return res.status(400).send({ error: error.message });
    }
  }
}