import type { FastifyRequest, FastifyReply } from "fastify";
import { DeleteSectorService } from "../../services/SectorService/DeleteSectorService.js";

interface DeleteSectorProps {
  id: string;
}

export class DeleteSectorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as DeleteSectorProps;

    if (!id) {
      return reply.status(400).send({ error: "O ID do setor é obrigatório." });
    }

    const deleteSectorService = new DeleteSectorService();

    try {
      const result = await deleteSectorService.execute({ id, userRole });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
