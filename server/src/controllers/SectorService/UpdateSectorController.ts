import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateSectorService } from "../../services/SectorService/UpdateSectorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class UpdateSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = (request.params ?? {}) as { id?: string };
    if (!id) {
      return reply
        .status(400)
        .send({ error: "O ID do setor da ordem de serviço é obrigatório." });
    }

    const body = (request.body ?? {}) as {
      setor?: string;
      qruDescricao?: string;
      qth?: string;
      city?: string;
      solucaoTecnico?: string;
      tipoCausa?: string;
      status?: string;
      tecnicoResponsavelId?: string;
      operatorId?: string;
    };

    try {
      const updated = await new UpdateSectorService().execute(
        { id, ...body },
        request.userRole,
      );
      return reply.status(200).send(updated);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao atualizar setor.");
    }
  }
}