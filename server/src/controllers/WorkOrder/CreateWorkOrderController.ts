import type { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateWorkOrderService,
  type SectorPayload,
} from "../../services/WorkOrder/CreateWorkOrderService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class CreateWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole || !request.userId) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { equipmentId, setores } = (request.body ?? {}) as {
      equipmentId?: string;
      setores?: SectorPayload[];
    };

    if (!equipmentId?.trim() || !Array.isArray(setores) || setores.length === 0) {
      return reply
        .status(400)
        .send({ error: "Todos os campos são obrigatórios." });
    }

    const hasInvalidSector = setores.some(
      (s) =>
        !s.setor?.trim() ||
        !s.qth?.trim() ||
        !s.city?.trim() ||
        !s.qruDescricao?.trim(),
    );

    if (hasInvalidSector) {
      return reply
        .status(400)
        .send({ error: "Todos os campos são obrigatórios." });
    }

    try {
      const result = await new CreateWorkOrderService().execute({
        equipmentId: equipmentId.trim(),
        setores,
        criadoPor: request.userId,
        userRole: request.userRole,
      });

      return reply.status(201).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao criar Ordem de Serviço.");
    }
  }
}