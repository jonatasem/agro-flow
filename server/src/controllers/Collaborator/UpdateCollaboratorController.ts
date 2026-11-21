import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { UpdateCollaboratorService } from "../../services/Collaborator/UpdateCollaboratorService.js";
import { sendError } from "../../utils/handleControllerError.js";

const updateCollaboratorSchema = z
  .object({
    name: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    sector: z.string().min(1).optional(),
    registration: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    status: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Informe ao menos um campo para atualização.",
  });

export class UpdateCollaboratorController {
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
        .send({ error: "O ID do colaborador é obrigatório." });
    }

    const parsed = updateCollaboratorSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Dados de atualização inválidos.",
        details: z.flattenError(parsed.error).fieldErrors,
      });
    }

    try {
      const updated = await new UpdateCollaboratorService().execute({
        id,
        ...parsed.data,
        userRole: request.userRole,
      });
      return reply.status(200).send(updated);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao atualizar colaborador.");
    }
  }
}