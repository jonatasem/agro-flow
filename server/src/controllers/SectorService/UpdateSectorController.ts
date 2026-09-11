import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateSectorService } from "../../services/SectorService/UpdateSectorService.js";

interface UpdateSectorProps {
  setor?: string;
  qruDescricao?: string;
  qth?: string;
  city?: string;
  solucaoTecnico?: string;
  tipoCausa?: string;
  status?: string;
  tecnicoResponsavelId?: string;
  operatorId?: string;
}

export class UpdateSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id: string };

    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do setor da ordem de serviço é obrigatório." });
    }

    const {
      setor,
      qruDescricao,
      qth,
      city,
      solucaoTecnico,
      tipoCausa,
      status,
      tecnicoResponsavelId,
      operatorId,
    } = request.body as UpdateSectorProps;

    const updateSectorService = new UpdateSectorService();

    try {
      const updatedSector = await updateSectorService.execute(
        {
          id,
          setor,
          qruDescricao,
          qth,
          city,
          solucaoTecnico,
          tipoCausa,
          status,
          tecnicoResponsavelId,
          operatorId,
        },
        userRole,
      );

      return reply.status(200).send(updatedSector);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
